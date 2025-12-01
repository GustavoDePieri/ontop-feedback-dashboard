/**
 * POST /api/diio/analyze-transcript
 *
 * Sentiment analysis for a single transcript using HuggingFace model
 * Provides basic sentiment classification and simplified insights
 */

import { HfInference } from '@huggingface/inference'
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
    cached?: boolean
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
      .select('id, diio_transcript_id, transcript_text, transcript_type, source_id, source_name, occurred_at, duration, attendees, ai_analysis, ai_analysis_date, analyzed_status, client_platform_id, account_name, account_status, sentiment, sentiment_score, created_at, updated_at')
      .eq('id', transcriptId)
      .single()

    if (fetchError || !transcript) {
      throw createError({
        statusCode: 404,
        message: 'Transcript not found'
      })
    }

    // Check if we have a cached AI analysis
    if (transcript.ai_analysis) {
      console.log(`✅ Returning cached sentiment analysis for transcript ${transcriptId}`)
      return {
        success: true,
        transcriptId,
        analysis: transcript.ai_analysis,
        metadata: {
          analyzedAt: transcript.ai_analysis_date || transcript.updated_at,
          sourceName: transcript.source_name || 'Unknown',
          occurredAt: transcript.occurred_at,
          attendees: transcript.attendees,
          participantEmails: extractParticipantEmails(transcript.attendees),
          cached: true
        }
      }
    }

    // Initialize HuggingFace client
    if (!config.huggingfaceApiKey) {
      throw createError({
        statusCode: 500,
        message: 'HuggingFace API key not configured'
      })
    }

    const hf = new HfInference(config.huggingfaceApiKey)

    // Extract participant emails from attendees
    const participantEmails = extractParticipantEmails(transcript.attendees)

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

    console.log(`🤖 Analyzing transcript ${transcriptId} with HuggingFace sentiment analysis...`)

    // Perform sentiment analysis on the transcript
    const sentiment = await hf.textClassification({
      model: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
      inputs: transcriptText
    })

    const topSentiment = Array.isArray(sentiment) ? sentiment[0] : sentiment

    // Generate simplified analysis based on sentiment
    const analysis = generateSentimentAnalysis(
      topSentiment,
      transcriptText,
      transcript.source_name,
      transcript.transcript_type
    )

    // Cache the analysis result in database
    const { error: updateError } = await supabase
      .from('diio_transcripts')
      .update({
        ai_analysis: analysis,
        ai_analysis_date: new Date().toISOString(),
        analyzed_status: 'finished',
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptId)

    if (updateError) {
      console.error('Failed to cache sentiment analysis:', updateError)
      // Continue anyway - analysis still worked
    }

    console.log(`✅ Successfully analyzed and cached transcript ${transcriptId}`)

    return {
      success: true,
      transcriptId,
      analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sourceName: transcript.source_name || 'Unknown',
        occurredAt: transcript.occurred_at,
        attendees: transcript.attendees,
        participantEmails,
        cached: false
      }
    }

  } catch (error: any) {
    console.error('Transcript analysis error:', error)
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    })

    // Check if it's a HuggingFace API error
    if (error.message && error.message.includes('HuggingFace')) {
      throw createError({
        statusCode: 500,
        message: 'HuggingFace API error: Please check your API key configuration'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to analyze transcript'
    })
  }
})

/**
 * Extract participant emails from attendees JSONB
 */
function extractParticipantEmails(attendees: any): string[] {
  const emails: string[] = []

  if (!attendees) return emails

  if (attendees.sellers && Array.isArray(attendees.sellers)) {
    attendees.sellers.forEach((s: any) => {
      if (s.email) emails.push(s.email)
    })
  }

  if (attendees.customers && Array.isArray(attendees.customers)) {
    attendees.customers.forEach((c: any) => {
      if (c.email) emails.push(c.email)
    })
  }

  return emails
}

/**
 * Generate simplified sentiment analysis from HuggingFace results
 */
function generateSentimentAnalysis(
  sentiment: { label: string; score: number },
  transcriptText: string,
  sourceName: string,
  transcriptType: string
): any {
  const { label, score } = sentiment

  // Map HuggingFace labels to our format
  const sentimentMapping = {
    'Positive': 'positive',
    'Neutral': 'neutral',
    'Negative': 'negative'
  }

  const overallSentiment = sentimentMapping[label as keyof typeof sentimentMapping] || 'neutral'

  // Convert to -1 to 1 scale
  const sentimentScore = label === 'Positive' ? score : label === 'Negative' ? -score : 0

  // Determine customer satisfaction based on sentiment
  let customerSatisfaction: 'satisfied' | 'neutral' | 'frustrated' | 'at_risk'
  if (overallSentiment === 'positive') {
    customerSatisfaction = 'satisfied'
  } else if (overallSentiment === 'negative') {
    customerSatisfaction = score > 0.7 ? 'at_risk' : 'frustrated'
  } else {
    customerSatisfaction = 'neutral'
  }

  // Determine churn risk
  let churnRisk: 'low' | 'medium' | 'high' | 'critical'
  if (overallSentiment === 'positive') {
    churnRisk = 'low'
  } else if (overallSentiment === 'negative') {
    churnRisk = score > 0.8 ? 'critical' : score > 0.6 ? 'high' : 'medium'
  } else {
    churnRisk = 'low'
  }

  // Generate basic churn signals based on sentiment
  const churnSignals: string[] = []
  if (churnRisk === 'high' || churnRisk === 'critical') {
    churnSignals.push('Negative sentiment detected in conversation')
    if (transcriptText.toLowerCase().includes('competitor') || transcriptText.toLowerCase().includes('alternative')) {
      churnSignals.push('Mention of competitors or alternatives')
    }
  }

  // Generate basic themes
  const keyThemes = [
    {
      theme: overallSentiment === 'positive' ? 'General satisfaction' : 'General concerns',
      sentiment: overallSentiment,
      mentions: 1,
      urgency: overallSentiment === 'negative' ? (churnRisk === 'critical' ? 'critical' : 'medium') : 'low'
    }
  ]

  // Basic pain points and highlights
  const painPoints: string[] = []
  const positiveHighlights: string[] = []

  if (overallSentiment === 'negative') {
    painPoints.push('Customer expressed dissatisfaction during the conversation')
  } else if (overallSentiment === 'positive') {
    positiveHighlights.push('Customer showed positive sentiment during the conversation')
  }

  // Basic actionable insights
  const actionableInsights = []
  if (churnRisk === 'high' || churnRisk === 'critical') {
    actionableInsights.push({
      insight: 'Schedule follow-up call to address concerns and prevent potential churn',
      priority: churnRisk === 'critical' ? 'critical' : 'high',
      owner: 'Customer Success',
      estimatedImpact: 'Improve customer satisfaction and reduce churn risk'
    })
  } else if (overallSentiment === 'positive') {
    actionableInsights.push({
      insight: 'Continue providing excellent service to maintain customer satisfaction',
      priority: 'low',
      owner: 'Account Management',
      estimatedImpact: 'Maintain strong customer relationship'
    })
  }

  // Generate summary
  const summary = `This ${transcriptType} showed ${overallSentiment} sentiment with a ${customerSatisfaction} customer satisfaction level. ${
    churnRisk !== 'low' ? `Churn risk is ${churnRisk} - follow-up recommended.` : 'Customer appears satisfied with current service.'
  }`

  return {
    overallSentiment,
    sentimentScore,
    customerSatisfaction,
    churnRisk,
    churnSignals,
    keyThemes,
    painPoints,
    positiveHighlights,
    actionableInsights,
    summary
  }
}