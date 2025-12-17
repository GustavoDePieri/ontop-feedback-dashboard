import { createClient } from '@supabase/supabase-js'
import { validateClientId } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const rawClientId = getRouterParam(event, 'id')
  
  // Validate and sanitize client ID
  const clientId = validateClientId(rawClientId)

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Server configuration error. Please contact support.'
    })
  }

  try {
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseAnonKey
    )

    // Check query parameter for force re-enrichment (validate it's a boolean string)
    const query = getQuery(event)
    const forceReEnrich = query.force === 'true' || query.force === '1'

    // Check if already enriched
    const { data: existing } = await supabase
      .from('client_enrichment')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle()

    if (existing && existing.enrichment_status === 'completed' && !forceReEnrich) {
      return {
        success: true,
        message: 'Client already enriched (use force=true to re-enrich)',
        enrichment: existing,
        cached: true
      }
    }

    // Mark as processing
    const { error: updateError } = await supabase
      .from('client_enrichment')
      .upsert({
        client_id: clientId,
        enrichment_status: 'processing',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      })

    if (updateError) throw updateError

    // Get all tickets and transcripts
    const { data: tickets } = await supabase
      .from('zendesk_conversations')
      .select('conversation, overall_sentiment, sentiment_score, issue_category, created_at')
      .eq('client_id', clientId)
      .limit(50) // Limit to avoid token limits

    const { data: transcripts } = await supabase
      .from('diio_transcripts')
      .select('transcript_text, ai_analysis, sentiment, sentiment_score, occurred_at')
      .eq('client_platform_id', clientId)
      .limit(20) // Limit to avoid token limits

    // Prepare data for OpenAI
    const ticketsSummary = tickets?.map(t => ({
      sentiment: t.overall_sentiment,
      category: t.issue_category,
      messages: t.conversation?.slice(0, 3) // First 3 messages
    })) || []

    const transcriptsSummary = transcripts?.map(t => ({
      sentiment: t.sentiment,
      text_preview: t.transcript_text?.substring(0, 500), // First 500 chars
      ai_summary: t.ai_analysis
    })) || []

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY || config.openaiApiKey
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a customer success AI analyst. Analyze the client's tickets and call transcripts to identify:
1. Pain points (categorize by type, describe, rate severity high/medium/low, count frequency)
2. Churn signals (identify risk indicators, describe, rate risk level)
3. Overall conclusion (2-3 sentences)
4. Recommended actions (specific, actionable steps for account managers)

Respond ONLY with valid JSON in this exact format:
{
  "pain_points": [{"category": "string", "description": "string", "severity": "high|medium|low", "frequency": number}],
  "churn_signals": [{"signal": "string", "description": "string", "risk_level": "high|medium|low", "detected_at": "date"}],
  "conclusion": "string",
  "recommended_action": "string",
  "overall_sentiment": "positive|neutral|negative",
  "sentiment_score": number (between -1 and 1)
}`
          },
          {
            role: 'user',
            content: `Analyze this client data:

Client ID: ${clientId}
Total Tickets: ${tickets?.length || 0}
Total Transcripts: ${transcripts?.length || 0}

Recent Tickets Summary:
${JSON.stringify(ticketsSummary, null, 2)}

Recent Transcripts Summary:
${JSON.stringify(transcriptsSummary, null, 2)}

Provide comprehensive analysis in JSON format.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const openaiData = await openaiResponse.json()
    const analysis = JSON.parse(openaiData.choices[0].message.content)

    // Save enrichment to database
    const enrichmentData = {
      client_id: clientId,
      client_name: clientId, // Could be enhanced with actual name
      total_tickets: tickets?.length || 0,
      total_transcripts: transcripts?.length || 0,
      last_interaction_date: tickets?.[0]?.created_at || transcripts?.[0]?.occurred_at,
      pain_points: analysis.pain_points,
      churn_signals: analysis.churn_signals,
      conclusion: analysis.conclusion,
      recommended_action: analysis.recommended_action,
      overall_sentiment: analysis.overall_sentiment,
      sentiment_score: analysis.sentiment_score,
      enriched_at: new Date().toISOString(),
      enriched_by: 'openai-gpt4o-mini',
      enrichment_status: 'completed',
      updated_at: new Date().toISOString()
    }

    const { data: savedEnrichment, error: saveError } = await supabase
      .from('client_enrichment')
      .upsert(enrichmentData, {
        onConflict: 'client_id'
      })
      .select()
      .single()

    if (saveError) throw saveError

    return {
      success: true,
      message: 'Client enriched successfully',
      enrichment: savedEnrichment,
      cached: false
    }

  } catch (error: any) {
    console.error('Error enriching client:', error)
    
    // Update status to error
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseAnonKey!
    )
    
    await supabase
      .from('client_enrichment')
      .upsert({
        client_id: clientId,
        enrichment_status: 'error',
        enrichment_error: error.message,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      })

    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
