/**
 * POST /api/diio/analyze-transcript
 * 
 * AI-powered sentiment analysis for a single transcript
 * Analyzes customer feedback, identifies churn risk, and provides actionable insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

interface AnalysisRequest {
  transcriptId: string  // UUID of transcript in database
}

interface AnalysisResult {
  success: boolean
  transcriptId: string
  analysis: {
    overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    sentimentScore: number  // -1 to 1 scale
    customerSatisfaction: 'satisfied' | 'neutral' | 'frustrated' | 'at_risk'
    churnRisk: 'low' | 'medium' | 'high' | 'critical'
    churnSignals: string[]
    keyThemes: Array<{
      theme: string
      sentiment: string
      mentions: number
      urgency: 'low' | 'medium' | 'high' | 'critical'
    }>
    painPoints: string[]
    positiveHighlights: string[]
    actionableInsights: Array<{
      insight: string
      priority: 'low' | 'medium' | 'high' | 'critical'
      owner: string
      estimatedImpact: string
    }>
    summary: string
  }
  metadata: {
    analyzedAt: string
    sourceName: string
    occurredAt: string | null
    attendees: any
    participantEmails: string[]
  }
}

export default defineEventHandler(async (event): Promise<AnalysisResult> => {
  const config = useRuntimeConfig()
  
  try {
    // Parse request body
    const body = await readBody<AnalysisRequest>(event)
    const { transcriptId } = body
    
    if (!transcriptId) {
      throw createError({
        statusCode: 400,
        message: 'Transcript ID is required'
      })
    }
    
    // Initialize Supabase
    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        message: 'Supabase configuration is missing'
      })
    }
    
    const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
    
    // Fetch transcript from database
    const { data: transcript, error: fetchError } = await supabase
      .from('diio_transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single()
    
    if (fetchError || !transcript) {
      throw createError({
        statusCode: 404,
        message: 'Transcript not found'
      })
    }
    
    // Initialize Gemini AI
    if (!config.geminiApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Gemini API key not configured'
      })
    }
    
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    // Extract participant emails from attendees
    const participantEmails: string[] = []
    if (transcript.attendees) {
      if (transcript.attendees.sellers) {
        transcript.attendees.sellers.forEach((s: any) => {
          if (s.email) participantEmails.push(s.email)
        })
      }
      if (transcript.attendees.customers) {
        transcript.attendees.customers.forEach((c: any) => {
          if (c.email) participantEmails.push(c.email)
        })
      }
    }
    
    // Format transcript text
    let transcriptText = transcript.transcript_text
    if (typeof transcriptText !== 'string') {
      try {
        if (Array.isArray(transcriptText)) {
          transcriptText = transcriptText.map((s: any) => {
            if (typeof s === 'string') return s
            return s.text || s.content || JSON.stringify(s)
          }).join('\n')
        } else {
          transcriptText = JSON.stringify(transcriptText)
        }
      } catch {
        transcriptText = String(transcriptText)
      }
    }
    
    // Create AI prompt for sentiment analysis
    const prompt = createAnalysisPrompt(
      transcriptText,
      transcript.source_name,
      transcript.transcript_type,
      transcript.attendees,
      transcript.occurred_at
    )
    
    console.log(`🤖 Analyzing transcript ${transcriptId} with AI...`)
    
    // Generate analysis
    const result = await model.generateContent(prompt)
    const response = result.response
    const aiText = response.text()
    
    // Parse AI response
    const analysis = parseAnalysisResponse(aiText)
    
    // Store analysis result in database (optional - can add an ai_analysis JSONB column)
    await supabase
      .from('diio_transcripts')
      .update({
        analyzed_status: 'finished',
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)
    
    console.log(`✅ Successfully analyzed transcript ${transcriptId}`)
    
    return {
      success: true,
      transcriptId,
      analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sourceName: transcript.source_name || 'Unknown',
        occurredAt: transcript.occurred_at,
        attendees: transcript.attendees,
        participantEmails
      }
    }
    
  } catch (error: any) {
    console.error('Transcript analysis error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to analyze transcript'
    })
  }
})

/**
 * Create AI prompt for transcript sentiment analysis
 */
function createAnalysisPrompt(
  transcriptText: string,
  sourceName: string,
  transcriptType: string,
  attendees: any,
  occurredAt: string | null
): string {
  const attendeeList = formatAttendees(attendees)
  const date = occurredAt ? new Date(occurredAt).toLocaleDateString() : 'Unknown date'
  
  return `You are an expert customer success analyst specializing in sentiment analysis and churn risk detection for B2B SaaS companies.

TRANSCRIPT DETAILS:
- Source: ${sourceName}
- Type: ${transcriptType}
- Date: ${date}
- Participants: ${attendeeList}

TRANSCRIPT TEXT:
${transcriptText}

ANALYSIS INSTRUCTIONS:
Analyze this call/meeting transcript and provide a comprehensive sentiment and risk analysis. Focus on:

1. **Overall Sentiment**: Determine if the customer is satisfied, neutral, frustrated, or at risk of churning
2. **Churn Risk Assessment**: Evaluate churn risk based on language, tone, and specific signals
3. **Key Themes**: Identify recurring topics, concerns, and requests mentioned
4. **Pain Points**: Extract specific problems or frustrations the customer expressed
5. **Positive Highlights**: Note any praise, satisfaction, or positive feedback
6. **Actionable Insights**: Provide specific recommendations with priority and ownership

CHURN SIGNALS TO DETECT:
- Competitor mentions or comparisons
- Price negotiation or cost concerns
- Escalation language ("need to talk to my boss", "considering alternatives")
- Repeated unresolved issues
- Frustration with support or service
- Contract renewal hesitation
- Feature gaps blocking adoption
- Integration or technical blockers

Please return your analysis in the following JSON format:

{
  "overallSentiment": "positive|neutral|negative|mixed",
  "sentimentScore": 0.5,
  "customerSatisfaction": "satisfied|neutral|frustrated|at_risk",
  "churnRisk": "low|medium|high|critical",
  "churnSignals": [
    "Specific phrases or behaviors indicating churn risk"
  ],
  "keyThemes": [
    {
      "theme": "Brief description of the theme (e.g., 'Payment processing speed', 'API documentation')",
      "sentiment": "positive|neutral|negative",
      "mentions": 3,
      "urgency": "low|medium|high|critical"
    }
  ],
  "painPoints": [
    "Specific pain point #1 with context",
    "Specific pain point #2 with context"
  ],
  "positiveHighlights": [
    "Specific positive feedback #1",
    "Specific positive feedback #2"
  ],
  "actionableInsights": [
    {
      "insight": "Specific action to take (e.g., 'Schedule follow-up call to address API integration concerns within 48 hours')",
      "priority": "low|medium|high|critical",
      "owner": "Team or person responsible (e.g., 'Customer Success', 'Product Team', 'Support')",
      "estimatedImpact": "Expected outcome (e.g., 'Prevent churn, increase adoption, improve satisfaction')"
    }
  ],
  "summary": "2-3 sentence executive summary of the call, highlighting key sentiment, main topics discussed, and immediate actions needed"
}

QUALITY GUIDELINES:
- Be specific and actionable - cite actual phrases from the transcript when possible
- Prioritize churn risk factors - this is critical for customer retention
- Identify the emotional tone (frustrated, enthusiastic, confused, etc.)
- Look for patterns across the conversation (improving, declining, stable sentiment)
- Consider both verbal content AND implied meaning (what they're not saying)
- Provide concrete next steps with clear ownership
- If churn risk is high or critical, make this very clear and urgent

Return ONLY the JSON object, no additional text.`
}

/**
 * Format attendees for display in prompt
 */
function formatAttendees(attendees: any): string {
  if (!attendees) return 'Unknown'
  
  const parts: string[] = []
  
  if (attendees.sellers && Array.isArray(attendees.sellers)) {
    const sellerNames = attendees.sellers.map((s: any) => s.name || s.email || 'Unknown').join(', ')
    if (sellerNames) parts.push(`Sellers: ${sellerNames}`)
  }
  
  if (attendees.customers && Array.isArray(attendees.customers)) {
    const customerNames = attendees.customers.map((c: any) => c.name || c.email || 'Unknown').join(', ')
    if (customerNames) parts.push(`Customers: ${customerNames}`)
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Unknown'
}

/**
 * Parse AI response JSON
 */
function parseAnalysisResponse(text: string): any {
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
    }
    
    const parsed = JSON.parse(jsonText)
    
    // Validate required fields
    if (!parsed.overallSentiment || !parsed.churnRisk || !parsed.summary) {
      throw new Error('Invalid AI response: missing required fields')
    }
    
    return {
      overallSentiment: parsed.overallSentiment || 'neutral',
      sentimentScore: parsed.sentimentScore || 0,
      customerSatisfaction: parsed.customerSatisfaction || 'neutral',
      churnRisk: parsed.churnRisk || 'low',
      churnSignals: Array.isArray(parsed.churnSignals) ? parsed.churnSignals : [],
      keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : [],
      painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
      positiveHighlights: Array.isArray(parsed.positiveHighlights) ? parsed.positiveHighlights : [],
      actionableInsights: Array.isArray(parsed.actionableInsights) ? parsed.actionableInsights : [],
      summary: parsed.summary || 'No summary available'
    }
  } catch (error: any) {
    console.error('Failed to parse AI response:', error)
    console.error('Raw AI response:', text)
    throw new Error(`Failed to parse AI analysis: ${error.message}`)
  }
}

