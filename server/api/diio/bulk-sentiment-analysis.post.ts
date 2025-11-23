/**
 * POST /api/diio/bulk-sentiment-analysis
 *
 * Bulk sentiment analysis for transcripts from specific accounts
 * Supports the 117 target accounts and churn risk correlation
 */

import { HfInference } from '@huggingface/inference'
import { createClient } from '@supabase/supabase-js'

interface BulkAnalysisRequest {
  accountIds?: string[]  // Array of client_platform_id values (your 117 accounts)
  limit?: number         // Maximum transcripts to analyze
  skipAnalyzed?: boolean // Skip already analyzed transcripts
  forceReanalysis?: boolean // Re-analyze even if cached
}

interface BulkAnalysisResult {
  success: boolean
  summary: {
    totalAccounts: number
    accountsWithTranscripts: number
    totalTranscripts: number
    transcriptsAnalyzed: number
    transcriptsSkipped: number
    analysisErrors: number
  }
  results: Array<{
    accountId: string
    accountName?: string
    transcriptCount: number
    analyzedCount: number
    averageSentiment: number
    churnRisk: 'low' | 'medium' | 'high' | 'critical'
    sentimentDistribution: {
      positive: number
      neutral: number
      negative: number
    }
    transcripts: Array<{
      id: string
      sourceName: string
      occurredAt: string | null
      sentiment: {
        overall: 'positive' | 'neutral' | 'negative'
        score: number
        churnRisk: 'low' | 'medium' | 'high' | 'critical'
        customerSatisfaction: 'satisfied' | 'neutral' | 'frustrated' | 'at_risk'
      }
      cached: boolean
    }>
  }>
  errors: Array<{
    accountId: string
    error: string
    transcriptIds?: string[]
  }>
}

export default defineEventHandler(async (event): Promise<BulkAnalysisResult> => {
  const config = useRuntimeConfig()
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await readBody<BulkAnalysisRequest>(event)
    const { accountIds = [], limit = 100, skipAnalyzed = true, forceReanalysis = false } = body

    console.log(`🚀 Starting bulk sentiment analysis for ${accountIds.length} accounts, limit: ${limit}`)

    // Initialize Supabase
    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        message: 'Supabase configuration is missing'
      })
    }

    const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

    // Initialize HuggingFace client
    if (!config.huggingfaceApiKey) {
      throw createError({
        statusCode: 500,
        message: 'HuggingFace API key not configured'
      })
    }

    const hf = new HfInference(config.huggingfaceApiKey)

    const results: BulkAnalysisResult['results'] = []
    const errors: BulkAnalysisResult['errors'] = []

    let totalTranscriptsAnalyzed = 0
    let totalTranscriptsSkipped = 0
    let totalAnalysisErrors = 0

    // Process each account
    for (const accountId of accountIds) {
      try {
        console.log(`📊 Processing account: ${accountId}`)

        // Get transcripts for this account
        let query = supabase
          .from('diio_transcripts')
          .select('id, diio_transcript_id, transcript_text, source_name, occurred_at, attendees, client_platform_id, account_name, ai_analysis, ai_analysis_date, account_status')
          .eq('client_platform_id', accountId)

        if (skipAnalyzed && !forceReanalysis) {
          query = query.is('ai_analysis', null)
        }

        if (limit > 0) {
          query = query.limit(limit)
        }

        const { data: transcripts, error: fetchError } = await query

        if (fetchError) {
          console.error(`Error fetching transcripts for ${accountId}:`, fetchError)
          errors.push({
            accountId,
            error: `Failed to fetch transcripts: ${fetchError.message}`
          })
          continue
        }

        if (!transcripts || transcripts.length === 0) {
          console.log(`ℹ️ No transcripts found for account ${accountId}`)
          results.push({
            accountId,
            transcriptCount: 0,
            analyzedCount: 0,
            averageSentiment: 0,
            churnRisk: 'low',
            sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
            transcripts: []
          })
          continue
        }

        console.log(`📝 Found ${transcripts.length} transcripts for ${accountId}`)

        const accountResults: BulkAnalysisResult['results'][0]['transcripts'] = []
        const sentimentScores: number[] = []
        const sentimentDistribution = { positive: 0, neutral: 0, negative: 0 }
        let analyzedCount = 0

        // Analyze each transcript
        for (const transcript of transcripts) {
          try {
            let analysisResult = null
            let isCached = false

            // Check if we have cached analysis and can use it
            if (transcript.ai_analysis && !forceReanalysis) {
              analysisResult = transcript.ai_analysis
              isCached = true
              console.log(`⚡ Using cached analysis for transcript ${transcript.id}`)
            } else {
              // Perform fresh sentiment analysis
              const sentiment = await hf.textClassification({
                model: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
                inputs: transcript.transcript_text
              })

              const topSentiment = Array.isArray(sentiment) ? sentiment[0] : sentiment
              analysisResult = generateSentimentAnalysis(
                topSentiment,
                transcript.transcript_text,
                transcript.source_name,
                transcript.transcript_type
              )

              // Cache the result
              const { error: updateError } = await supabase
                .from('diio_transcripts')
                .update({
                  ai_analysis: analysisResult,
                  ai_analysis_date: new Date().toISOString(),
                  analyzed_status: 'finished'
                })
                .eq('id', transcript.id)

              if (updateError) {
                console.warn(`Failed to cache analysis for ${transcript.id}:`, updateError)
              }

              console.log(`✅ Analyzed transcript ${transcript.id} (${topSentiment.label}: ${topSentiment.score.toFixed(3)})`)
              analyzedCount++
            }

            // Track sentiment data
            sentimentScores.push(analysisResult.sentimentScore)

            // Update distribution
            if (analysisResult.overallSentiment === 'positive') {
              sentimentDistribution.positive++
            } else if (analysisResult.overallSentiment === 'negative') {
              sentimentDistribution.negative++
            } else {
              sentimentDistribution.neutral++
            }

            accountResults.push({
              id: transcript.id,
              sourceName: transcript.source_name || 'Unknown',
              occurredAt: transcript.occurred_at,
              sentiment: {
                overall: analysisResult.overallSentiment,
                score: analysisResult.sentimentScore,
                churnRisk: analysisResult.churnRisk,
                customerSatisfaction: analysisResult.customerSatisfaction
              },
              cached: isCached
            })

          } catch (analysisError: any) {
            console.error(`❌ Analysis failed for transcript ${transcript.id}:`, analysisError)
            totalAnalysisErrors++
            // Continue with other transcripts
          }
        }

        // Calculate account-level metrics
        const averageSentiment = sentimentScores.length > 0
          ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
          : 0

        // Determine account-level churn risk based on sentiment patterns
        let accountChurnRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
        const negativeRatio = sentimentDistribution.negative / (sentimentDistribution.positive + sentimentDistribution.neutral + sentimentDistribution.negative || 1)

        if (negativeRatio > 0.5) {
          accountChurnRisk = 'critical'
        } else if (negativeRatio > 0.3 || averageSentiment < -0.3) {
          accountChurnRisk = 'high'
        } else if (negativeRatio > 0.15 || averageSentiment < -0.1) {
          accountChurnRisk = 'medium'
        }

        results.push({
          accountId,
          accountName: transcripts[0]?.account_name,
          transcriptCount: transcripts.length,
          analyzedCount,
          averageSentiment,
          churnRisk: accountChurnRisk,
          sentimentDistribution,
          transcripts: accountResults
        })

        totalTranscriptsAnalyzed += analyzedCount
        totalTranscriptsSkipped += transcripts.length - analyzedCount

        console.log(`✅ Completed account ${accountId}: ${analyzedCount} analyzed, avg sentiment: ${averageSentiment.toFixed(3)}, churn risk: ${accountChurnRisk}`)

      } catch (accountError: any) {
        console.error(`❌ Error processing account ${accountId}:`, accountError)
        errors.push({
          accountId,
          error: accountError.message
        })
      }
    }

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log(`🎉 Bulk sentiment analysis completed in ${duration.toFixed(1)}s`)
    console.log(`📊 Total: ${totalTranscriptsAnalyzed} analyzed, ${totalTranscriptsSkipped} skipped, ${totalAnalysisErrors} errors`)

    return {
      success: true,
      summary: {
        totalAccounts: accountIds.length,
        accountsWithTranscripts: results.filter(r => r.transcriptCount > 0).length,
        totalTranscripts: results.reduce((sum, r) => sum + r.transcriptCount, 0),
        transcriptsAnalyzed: totalTranscriptsAnalyzed,
        transcriptsSkipped: totalTranscriptsSkipped,
        analysisErrors: totalAnalysisErrors
      },
      results,
      errors
    }

  } catch (error: any) {
    console.error('Bulk sentiment analysis error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to perform bulk sentiment analysis'
    })
  }
})

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
