export interface CompanyAction {
  area: string
  action: string
  rationale: string
  priority: 'high' | 'medium' | 'low'
  timeline: 'immediate' | 'short-term' | 'long-term'
  expectedImpact: string
  supportingEvidence: string[]
}

export interface TranscriptData {
  id: string
  transcript_text: string
  source_name?: string
  occurred_at?: string
  attendees?: any
  account_name?: string
  client_platform_id?: string
  ai_analysis?: any
}

export interface AIReport {
  summary: string
  companyActions: CompanyAction[]
  metadata: {
    transcriptsAnalyzed: number
    generatedAt: string
    modelUsed: string
  }
}

// Legacy interfaces for backwards compatibility
export interface RecurringRequest {
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
  feedbackIds?: string[]
  relatedFeedback?: Array<{
    id: string
    accountName: string
    feedback: string
  }>
}

export interface AIRecommendation {
  summary: string
  topRecurringRequests: RecurringRequest[]
  emergingPatterns: string[]
  criticalRisks: string[]
  quickWins: string[]
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  area: string
  action: string
  rationale: string
  impact: string
  timeline: string
  affectedAccounts?: string[]
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
  const aiReport = ref<AIReport | null>(null)
  const metadata = ref<AIReport['metadata'] | null>(null)

  const generateRecommendations = async (
    transcripts: TranscriptData[],
    options: {
      maxTranscripts?: number
      focusAreas?: string[]
    } = {}
  ) => {
    loading.value = true
    error.value = null

    try {
      // Limit transcripts if specified
      const transcriptsToAnalyze = options.maxTranscripts
        ? transcripts.slice(0, options.maxTranscripts)
        : transcripts

      if (transcriptsToAnalyze.length === 0) {
        throw new Error('No transcripts available for analysis')
      }

      const response = await $fetch('/api/ai/recommendations', {
        method: 'POST',
        body: {
          transcripts: transcriptsToAnalyze
        }
      })

      if (response.success) {
        aiReport.value = response.data
        metadata.value = response.metadata
      } else {
        throw new Error('Failed to generate AI report')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to generate AI recommendations'
      console.error('AI Report Generation Error:', err)
    } finally {
      loading.value = false
    }
  }

  const getActionsByArea = (areaName?: string) => {
    if (!aiReport.value?.companyActions) return []

    if (areaName) {
      return aiReport.value.companyActions.filter(action =>
        action.area.toLowerCase() === areaName.toLowerCase()
      )
    }

    return aiReport.value.companyActions
  }

  const getActionsByPriority = (priority: 'high' | 'medium' | 'low') => {
    if (!aiReport.value?.companyActions) return []

    return aiReport.value.companyActions.filter(action => action.priority === priority)
  }

  const getActionsByTimeline = (timeline: 'immediate' | 'short-term' | 'long-term') => {
    if (!aiReport.value?.companyActions) return []

    return aiReport.value.companyActions.filter(action => action.timeline === timeline)
  }

  const clearReport = () => {
    aiReport.value = null
    metadata.value = null
    error.value = null
  }

  // Legacy compatibility methods
  const recommendations = computed(() => {
    if (!aiReport.value) return null

    // Convert new format to legacy format for backwards compatibility
    return {
      summary: aiReport.value.summary,
      topRecurringRequests: aiReport.value.companyActions.map(action => ({
        request: action.action,
        frequency: action.supportingEvidence.length,
        priority: action.priority,
        evidence: action.rationale,
        revenueImpact: action.expectedImpact,
        sentiment: 'Based on transcript analysis',
        urgency: action.priority === 'high' ? 'High' : action.priority === 'medium' ? 'Medium' : 'Low',
        recommendedAction: action.action,
        quickWinPotential: action.timeline === 'immediate' ? 'High' : 'Medium',
        crossFunctionalOwner: action.area,
        feedbackIds: [],
        relatedFeedback: []
      })),
      emergingPatterns: [],
      criticalRisks: [],
      quickWins: []
    }
  })

  return {
    // New AI Report API
    loading,
    error,
    aiReport,
    metadata,
    generateRecommendations,
    getActionsByArea,
    getActionsByPriority,
    getActionsByTimeline,
    clearReport,

    // Legacy compatibility
    recommendations
  }
}
