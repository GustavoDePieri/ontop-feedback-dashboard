/**
 * POST /api/diio/bulk-sentiment-analysis
 *
 * Bulk sentiment analysis for transcripts from specific accounts
 * NOW WITH BART SUMMARIZATION (FREE!)
 * Supports the 117 target accounts and churn risk correlation
 */

import { HfInference } from '@huggingface/inference'
import { createClient } from '@supabase/supabase-js'
import { 
  generateBARTSummary, 
  generateSentimentExplanation, 
  extractKeyQuotes, 
  extractKeywords 
} from '~/server/utils/bartSummarizer'
import { validateStringArray, validateNumericParam } from '~/server/utils/validation'

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
    
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        message: 'Request body is required'
      })
    }

    // Validate inputs
    const accountIds = body.accountIds ? validateStringArray(body.accountIds, {
      maxLength: 100,
      maxItems: 1000,
      itemValidator: (id) => {
        // Validate account ID format (alphanumeric, hyphens, underscores)
        if (!/^[a-zA-Z0-9._-]+$/.test(id)) {
          throw createError({
            statusCode: 400,
            message: `Invalid account ID format: ${id}`
          })
        }
        return id
      }
    }) : []
    
    const limit = validateNumericParam(body.limit, {
      min: 1,
      max: 10000,
      defaultValue: 100,
      paramName: 'limit'
    })
    
    const skipAnalyzed = body.skipAnalyzed !== undefined ? Boolean(body.skipAnalyzed) : true
    const forceReanalysis = body.forceReanalysis !== undefined ? Boolean(body.forceReanalysis) : false

    logger.info('Starting bulk sentiment analysis', { accountCount: accountIds.length, limit })

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
          .select('id, diio_transcript_id, transcript_text, transcript_type, source_name, occurred_at, attendees, client_platform_id, account_name, account_status, ai_analysis, ai_analysis_date, sentiment, sentiment_score')
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
              analysisResult = await generateSentimentAnalysis(
                topSentiment,
                transcript.transcript_text,
                transcript.source_name,
                transcript.transcript_type,
                config.huggingfaceApiKey // Pass API key for BART
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
 * Generate enhanced sentiment analysis from HuggingFace results
 * NOW WITH BART SUMMARIES & EXPLANATIONS (FREE!)
 */
async function generateSentimentAnalysis(
  sentiment: { label: string; score: number },
  transcriptText: string,
  sourceName: string,
  transcriptType: string,
  huggingfaceApiKey: string
): Promise<any> {
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

  // ==========================================
  // NEW: BART-POWERED SUMMARIES & EXPLANATIONS
  // ==========================================
  
  let meetingSummary = ''
  let sentimentExplanation = ''
  let keyQuotes = { positive: [] as string[], negative: [] as string[], neutral: [] as string[] }
  let keywords: string[] = []
  
  try {
    // 1. Generate meeting summary using BART (FREE!)
    console.log('🤖 Generating BART summary...')
    meetingSummary = await generateBARTSummary(
      transcriptText, 
      huggingfaceApiKey,
      { maxLength: 150, minLength: 50 }
    )
    
    // 2. Generate sentiment explanation using BART (FREE!)
    console.log('🤖 Generating sentiment explanation...')
    sentimentExplanation = await generateSentimentExplanation(
      transcriptText,
      overallSentiment,
      sentimentScore,
      huggingfaceApiKey
    )
    
    // 3. Extract key quotes that support the sentiment
    console.log('📝 Extracting key quotes...')
    keyQuotes = extractKeyQuotes(transcriptText, overallSentiment, 3)
    
    // 4. Extract keywords from transcript
    console.log('🔑 Extracting keywords...')
    keywords = extractKeywords(transcriptText, 10)
    
  } catch (error: any) {
    console.error('⚠️ Error generating enhanced analysis:', error.message)
    // Fallback to basic summary
    meetingSummary = `This ${transcriptType} with ${sourceName} showed ${overallSentiment} sentiment.`
    sentimentExplanation = `The meeting was classified as ${overallSentiment} based on the overall tone and content of the conversation.`
    keyQuotes = extractKeyQuotes(transcriptText, overallSentiment, 3)
    keywords = extractKeywords(transcriptText, 10)
  }

  // Generate enhanced themes based on keywords
  const keyThemes = generateThemesFromKeywords(keywords, overallSentiment, churnRisk)

  // Enhanced pain points and highlights from quotes
  const painPoints: string[] = keyQuotes.negative.length > 0 
    ? keyQuotes.negative 
    : overallSentiment === 'negative' 
      ? ['Customer expressed concerns during the conversation']
      : []
      
  const positiveHighlights: string[] = keyQuotes.positive.length > 0
    ? keyQuotes.positive
    : overallSentiment === 'positive'
      ? ['Customer showed positive sentiment during the conversation']
      : []

  // Enhanced actionable insights
  const actionableInsights = generateActionableInsights(
    overallSentiment,
    churnRisk,
    painPoints,
    positiveHighlights
  )

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
    summary: meetingSummary, // BART-generated summary!
    sentimentExplanation,    // NEW: Why this sentiment?
    keyQuotes,               // NEW: Supporting quotes
    keywords,                // NEW: Extracted keywords
    enhancedWithAI: true,    // Flag to indicate AI enhancement
    generatedAt: new Date().toISOString()
  }
}

/**
 * Generate themes from extracted keywords
 */
function generateThemesFromKeywords(
  keywords: string[],
  sentiment: string,
  churnRisk: string
): Array<{ theme: string; sentiment: string; mentions: number; urgency: string }> {
  const themes: Array<{ theme: string; sentiment: string; mentions: number; urgency: string }> = []
  
  // Categorize keywords into themes
  const serviceKeywords = ['support', 'service', 'help', 'team', 'response']
  const productKeywords = ['feature', 'product', 'platform', 'system', 'tool']
  const pricingKeywords = ['price', 'cost', 'billing', 'payment', 'plan']
  const performanceKeywords = ['performance', 'speed', 'slow', 'fast', 'downtime', 'outage']
  
  const hasServiceMention = keywords.some(kw => serviceKeywords.includes(kw))
  const hasProductMention = keywords.some(kw => productKeywords.includes(kw))
  const hasPricingMention = keywords.some(kw => pricingKeywords.includes(kw))
  const hasPerformanceMention = keywords.some(kw => performanceKeywords.includes(kw))
  
  if (hasServiceMention) {
    themes.push({
      theme: 'Customer Support',
      sentiment: sentiment,
      mentions: keywords.filter(kw => serviceKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'high' : 'medium'
    })
  }
  
  if (hasProductMention) {
    themes.push({
      theme: 'Product & Features',
      sentiment: sentiment,
      mentions: keywords.filter(kw => productKeywords.includes(kw)).length,
      urgency: 'medium'
    })
  }
  
  if (hasPricingMention) {
    themes.push({
      theme: 'Pricing & Billing',
      sentiment: sentiment,
      mentions: keywords.filter(kw => pricingKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' ? 'high' : 'medium'
    })
  }
  
  if (hasPerformanceMention) {
    themes.push({
      theme: 'Performance & Reliability',
      sentiment: sentiment,
      mentions: keywords.filter(kw => performanceKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'critical' : 'high'
    })
  }
  
  // Default theme if no specific categories found
  if (themes.length === 0) {
    themes.push({
      theme: sentiment === 'positive' ? 'General Satisfaction' : 'General Discussion',
      sentiment: sentiment,
      mentions: 1,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'high' : 'low'
    })
  }
  
  return themes
}

/**
 * Generate actionable insights based on sentiment and quotes
 */
function generateActionableInsights(
  sentiment: string,
  churnRisk: string,
  painPoints: string[],
  positiveHighlights: string[]
): Array<{ insight: string; priority: string; owner: string; estimatedImpact: string }> {
  const insights: Array<{ insight: string; priority: string; owner: string; estimatedImpact: string }> = []
  
  if (churnRisk === 'critical') {
    insights.push({
      insight: 'URGENT: Schedule immediate follow-up call within 24 hours to address critical concerns',
      priority: 'critical',
      owner: 'Customer Success Manager',
      estimatedImpact: 'Prevent potential churn and rebuild customer confidence'
    })
  } else if (churnRisk === 'high') {
    insights.push({
      insight: 'Schedule follow-up call within 48 hours to address customer concerns and prevent escalation',
      priority: 'high',
      owner: 'Customer Success',
      estimatedImpact: 'Reduce churn risk and improve customer satisfaction'
    })
  }
  
  if (painPoints.length > 0 && sentiment === 'negative') {
    insights.push({
      insight: `Address specific pain points mentioned: ${painPoints.length} key concerns identified`,
      priority: churnRisk === 'critical' || churnRisk === 'high' ? 'high' : 'medium',
      owner: 'Account Management',
      estimatedImpact: 'Resolve customer issues and improve satisfaction'
    })
  }
  
  if (sentiment === 'positive' && positiveHighlights.length > 0) {
    insights.push({
      insight: 'Leverage positive feedback for testimonial or case study opportunity',
      priority: 'low',
      owner: 'Marketing',
      estimatedImpact: 'Build brand advocacy and attract new customers'
    })
    
    insights.push({
      insight: 'Continue providing excellent service to maintain high satisfaction levels',
      priority: 'low',
      owner: 'Account Management',
      estimatedImpact: 'Maintain strong customer relationship and prevent churn'
    })
  }
  
  if (sentiment === 'neutral') {
    insights.push({
      insight: 'Proactively engage to identify upsell opportunities or hidden concerns',
      priority: 'medium',
      owner: 'Account Management',
      estimatedImpact: 'Deepen relationship and uncover growth opportunities'
    })
  }
  
  return insights
}
