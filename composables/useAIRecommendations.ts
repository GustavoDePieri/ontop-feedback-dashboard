import type { FeedbackItem } from '~/types/feedback'

export interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  area: string
  action: string
  rationale: string
  impact: string
  timeline: string
  affectedAccounts?: string[]
}

export interface AIRecommendation {
  summary: string
  keyInsights: string[]
  actionItems: ActionItem[]
  trends: string[]
  risks: string[]
  opportunities: string[]
}

export interface AIRecommendationMetadata {
  itemsAnalyzed: number
  segmentType: string
  segmentValue?: string
  focusArea?: string
  generatedAt: string
}

export const useAIRecommendations = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const recommendations = ref<AIRecommendation | null>(null)
  const metadata = ref<AIRecommendationMetadata | null>(null)

  const generateRecommendations = async (
    feedbackItems: FeedbackItem[],
    options: {
      segmentType?: 'all' | 'year' | 'sentiment' | 'category' | 'account_manager'
      segmentValue?: string
      focusArea?: string
    } = {}
  ) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/ai/recommendations', {
        method: 'POST',
        body: {
          feedbackItems,
          segmentType: options.segmentType || 'all',
          segmentValue: options.segmentValue,
          focusArea: options.focusArea
        }
      })

      if (response.success) {
        recommendations.value = response.data
        metadata.value = response.metadata
      } else {
        throw new Error('Failed to generate recommendations')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to generate AI recommendations'
      console.error('AI Recommendations Error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearRecommendations = () => {
    recommendations.value = null
    metadata.value = null
    error.value = null
  }

  return {
    loading,
    error,
    recommendations,
    metadata,
    generateRecommendations,
    clearRecommendations
  }
}
