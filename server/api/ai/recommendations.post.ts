import { HfInference } from '@huggingface/inference'
import type { FeedbackItem } from '~/types/feedback'

interface TranscriptFeedback {
  id: string
  source: 'diio_call'
  type: 'phone_call' | 'meeting'
  date: string
  accountName: string
  callName: string
  participants: string[]
  feedbackText: string
  stats: any
}

interface RecommendationRequest {
  feedbackItems: FeedbackItem[]
  segmentType?: 'all' | 'year' | 'sentiment' | 'category' | 'account_manager'
  segmentValue?: string
  focusArea?: string
  includeTranscripts?: boolean
  transcriptFeedback?: TranscriptFeedback[]
}

interface SentimentAnalysis {
  label: 'Positive' | 'Neutral' | 'Negative'
  score: number
  confidence: number
}

interface FeedbackSentiment {
  id: string
  text: string
  sentiment: SentimentAnalysis
  accountName: string
  mrr?: number
  tpv?: number
  source: 'written' | 'transcript'
}

interface RecurringRequest {
  request: string
  frequency: number
  priority: 'high' | 'medium' | 'low'
  evidence: string
  revenueImpact: string
  sentiment: string
  urgency: string
  recommendedAction: string
  quickWinPotential: string
  crossFunctionalOwner: string
  sources?: {
    written: number
    calls: number
    total: number
  }
  feedbackIds?: string[]
  relatedFeedback?: Array<{
    id: string
    accountName: string
    feedback: string
    source?: 'written' | 'call'
  }>
}

interface AIRecommendation {
  summary: string
  topRecurringRequests: RecurringRequest[]
  emergingPatterns: string[]
  criticalRisks: string[]
  quickWins: string[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const body = await readBody<RecommendationRequest>(event)
    const { 
      feedbackItems, 
      segmentType = 'all', 
      segmentValue, 
      focusArea,
      includeTranscripts = false,
      transcriptFeedback = []
    } = body

    if (!feedbackItems || feedbackItems.length === 0) {
      throw new Error('No feedback items provided')
    }

    // Initialize HuggingFace client
    const hf = new HfInference(config.huggingFaceApiKey)

    // Perform sentiment analysis on all feedback items
    const sentimentResults = await analyzeSentimentBatch(hf, feedbackItems, transcriptFeedback)

    // Generate simplified report based on sentiment analysis
    const recommendations = generateSentimentReport(sentimentResults, feedbackItems, transcriptFeedback)

    return {
      success: true,
      data: recommendations,
      metadata: {
        itemsAnalyzed: feedbackItems.length,
        transcriptsAnalyzed: transcriptFeedback.length,
        segmentType,
        segmentValue,
        focusArea,
        modelUsed: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('AI Recommendations Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to analyze sentiment: ${error.message}`
    })
  }
})

// Sentiment analysis functions
async function analyzeSentimentBatch(
  hf: HfInference,
  feedbackItems: FeedbackItem[],
  transcriptFeedback: TranscriptFeedback[] = []
): Promise<FeedbackSentiment[]> {
  const results: FeedbackSentiment[] = []

  // Analyze written feedback
  for (const item of feedbackItems.slice(0, 50)) { // Limit to 50 for API limits
    try {
      const sentiment = await hf.textClassification({
        model: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
        inputs: item.feedback
      })

      // The model returns an array of sentiment results
      const topSentiment = Array.isArray(sentiment) ? sentiment[0] : sentiment

      results.push({
        id: item.id,
        text: item.feedback,
        sentiment: {
          label: topSentiment.label as 'Positive' | 'Neutral' | 'Negative',
          score: topSentiment.score,
          confidence: topSentiment.score
        },
        accountName: item.accountName || 'Unknown',
        mrr: item.realMrrLastMonth,
        tpv: item.lastInvoicedTpv,
        source: 'written'
      })
    } catch (error) {
      console.warn(`Failed to analyze sentiment for feedback ${item.id}:`, error)
      // Add default neutral sentiment
      results.push({
        id: item.id,
        text: item.feedback,
        sentiment: {
          label: 'Neutral',
          score: 0.5,
          confidence: 0.5
        },
        accountName: item.accountName || 'Unknown',
        mrr: item.realMrrLastMonth,
        tpv: item.lastInvoicedTpv,
        source: 'written'
      })
    }
  }

  // Analyze transcript feedback if included
  for (const transcript of transcriptFeedback.slice(0, 20)) { // Limit transcripts too
    try {
      const sentiment = await hf.textClassification({
        model: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
        inputs: transcript.feedbackText
      })

      const topSentiment = Array.isArray(sentiment) ? sentiment[0] : sentiment

      results.push({
        id: transcript.id,
        text: transcript.feedbackText,
        sentiment: {
          label: topSentiment.label as 'Positive' | 'Neutral' | 'Negative',
          score: topSentiment.score,
          confidence: topSentiment.score
        },
        accountName: transcript.accountName,
        source: 'transcript'
      })
    } catch (error) {
      console.warn(`Failed to analyze sentiment for transcript ${transcript.id}:`, error)
      results.push({
        id: transcript.id,
        text: transcript.feedbackText,
        sentiment: {
          label: 'Neutral',
          score: 0.5,
          confidence: 0.5
        },
        accountName: transcript.accountName,
        source: 'transcript'
      })
    }
  }

  return results
}

function generateSentimentReport(
  sentimentResults: FeedbackSentiment[],
  feedbackItems: FeedbackItem[],
  transcriptFeedback: TranscriptFeedback[]
): AIRecommendation {
  // Calculate sentiment statistics
  const totalItems = sentimentResults.length
  const positiveCount = sentimentResults.filter(r => r.sentiment.label === 'Positive').length
  const neutralCount = sentimentResults.filter(r => r.sentiment.label === 'Neutral').length
  const negativeCount = sentimentResults.filter(r => r.sentiment.label === 'Negative').length

  const positivePercent = Math.round((positiveCount / totalItems) * 100)
  const neutralPercent = Math.round((neutralCount / totalItems) * 100)
  const negativePercent = Math.round((negativeCount / totalItems) * 100)

  // Calculate average sentiment score (-1 to 1 scale)
  const avgSentimentScore = sentimentResults.reduce((sum, r) => {
    const score = r.sentiment.label === 'Positive' ? r.sentiment.score :
                  r.sentiment.label === 'Negative' ? -r.sentiment.score : 0
    return sum + score
  }, 0) / totalItems

  // Find high-value accounts with negative sentiment
  const highValueNegative = sentimentResults.filter(r =>
    r.sentiment.label === 'Negative' &&
    (r.mrr && r.mrr > 5000) || (r.tpv && r.tpv > 10000)
  )

  // Generate summary
  const summary = `Sentiment analysis of ${totalItems} feedback items shows ${positivePercent}% positive, ${neutralPercent}% neutral, and ${negativePercent}% negative sentiment. ${
    highValueNegative.length > 0
      ? `${highValueNegative.length} high-value accounts expressed negative sentiment requiring attention.`
      : 'Overall sentiment is stable with no critical high-value account concerns.'
  }`

  // Generate top recurring requests (simplified based on sentiment patterns)
  const topRecurringRequests: RecurringRequest[] = []

  if (negativeCount > totalItems * 0.3) { // If >30% negative
    topRecurringRequests.push({
      request: 'Address customer dissatisfaction',
      frequency: negativeCount,
      priority: negativeCount > totalItems * 0.5 ? 'high' : 'medium',
      evidence: `${negativeCount} negative feedback items (${negativePercent}%) indicate significant dissatisfaction`,
      revenueImpact: highValueNegative.length > 0 ? `Affects ${highValueNegative.length} high-value accounts` : 'Unknown',
      sentiment: 'Negative',
      urgency: negativePercent > 50 ? 'Critical' : 'High',
      recommendedAction: 'Review negative feedback and identify common themes for immediate improvement',
      quickWinPotential: 'Review top negative feedback items for quick fixes',
      crossFunctionalOwner: 'Customer Success',
      sources: {
        written: sentimentResults.filter(r => r.source === 'written' && r.sentiment.label === 'Negative').length,
        calls: sentimentResults.filter(r => r.source === 'transcript' && r.sentiment.label === 'Negative').length,
        total: negativeCount
      }
    })
  }

  // Generate insights based on sentiment patterns
  const emergingPatterns: string[] = []
  const criticalRisks: string[] = []
  const quickWins: string[] = []

  // Emerging patterns
  if (avgSentimentScore < -0.2) {
    emergingPatterns.push('Overall sentiment trending negative - monitor closely for emerging issues')
  }
  if (highValueNegative.length > 0) {
    emergingPatterns.push(`${highValueNegative.length} high-value accounts showing dissatisfaction - investigate specific concerns`)
  }
  if (transcriptFeedback.length > 0 && sentimentResults.filter(r => r.source === 'transcript').length > 0) {
    const transcriptSentiment = sentimentResults.filter(r => r.source === 'transcript')
    const transcriptNegative = transcriptSentiment.filter(r => r.sentiment.label === 'Negative').length
    if (transcriptNegative > transcriptSentiment.length * 0.4) {
      emergingPatterns.push('Call transcripts show higher dissatisfaction than written feedback - verbal concerns may be under-addressed')
    }
  }

  // Critical risks
  if (negativePercent > 60) {
    criticalRisks.push('Critical: Over 60% negative sentiment - immediate intervention required')
  }
  if (highValueNegative.length >= 3) {
    criticalRisks.push(`Critical: ${highValueNegative.length} high-value accounts at risk - schedule urgent follow-up calls`)
  }

  // Quick wins
  if (positivePercent > 50) {
    quickWins.push('Continue successful practices - analyze positive feedback for scalable improvements')
  }
  if (neutralCount > positiveCount && neutralCount > negativeCount) {
    quickWins.push('Convert neutral feedback to positive - focus on feature requests from neutral items')
  }

  // Ensure minimum 2 items per category
  while (emergingPatterns.length < 2) {
    emergingPatterns.push('Monitor sentiment trends weekly to identify emerging patterns early')
  }
  while (criticalRisks.length < 2) {
    criticalRisks.push('Regular sentiment analysis helps identify risks before they escalate')
  }
  while (quickWins.length < 2) {
    quickWins.push('Implement customer feedback loops to continuously improve satisfaction')
    }

    return {
    summary,
      topRecurringRequests,
      emergingPatterns,
      criticalRisks,
      quickWins
    }
}