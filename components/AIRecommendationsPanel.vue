<template>
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-indigo-600 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">📊 Priority Stack: What Clients Want Most</h3>
            <p class="text-sm text-white">Evidence-based ranking powered by AI</p>
          </div>
        </div>
        <button 
          v-if="recommendations"
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="mt-4 text-white font-medium">Analyzing recurring patterns...</p>
        <p class="text-sm text-gray-500 dark:text-slate-500 mt-1">This may take 10-20 seconds</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-red-800 dark:text-red-300 font-semibold">Error Generating Analysis</h4>
            <p class="text-red-700 dark:text-red-400 text-sm mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Recommendations Display -->
      <div v-else-if="recommendations" class="space-y-6">
        <!-- Metadata -->
        <div v-if="metadata" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between text-sm">
          <div class="flex items-center space-x-4 text-blue-800 dark:text-blue-300">
            <span><strong>{{ metadata.itemsAnalyzed }}</strong> feedbacks analyzed</span>
            <span v-if="metadata.segmentValue">• <strong>{{ metadata.segmentType }}</strong>: {{ metadata.segmentValue }}</span>
          </div>
          <span class="text-blue-600 dark:text-blue-400 text-xs">{{ new Date(metadata.generatedAt).toLocaleString() }}</span>
        </div>

        <!-- Executive Summary -->
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-l-4 border-indigo-600 rounded-lg p-5">
          <h4 class="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Leadership Summary
          </h4>
          <p class="text-white leading-relaxed text-base">{{ recommendations.summary }}</p>
        </div>

        <!-- Top Recurring Requests (Priority Stack) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Priority Stack: Most Requested Features
            </h4>
            <span class="text-sm text-gray-500 dark:text-slate-400">Sorted by frequency + revenue impact</span>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(request, index) in recommendations.topRecurringRequests" 
              :key="index"
              @click="request.relatedFeedback && request.relatedFeedback.length > 0 ? openDetailModal(request) : null"
              class="border-l-4 rounded-lg p-5 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
              :class="{
                'border-red-500 bg-red-50 dark:bg-red-900/20': request.priority === 'high',
                'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20': request.priority === 'medium',
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20': request.priority === 'low',
                'cursor-pointer': request.relatedFeedback && request.relatedFeedback.length > 0
              }"
            >
              <!-- Priority Rank Badge -->
              <div class="absolute top-3 right-3 flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-white border border-gray-300 dark:border-slate-600">
                  #{{ index + 1 }}
                </span>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  :class="{
                    'bg-red-600 text-white': request.priority === 'high',
                    'bg-yellow-600 text-white': request.priority === 'medium',
                    'bg-blue-600 text-white': request.priority === 'low'
                  }"
                >
                  {{ request.priority }}
                </span>
              </div>

              <!-- Request Title -->
              <h5 class="text-lg font-bold text-white mb-3 pr-24">
                {{ request.request }}
              </h5>

              <!-- Key Metrics Row -->
              <div class="flex items-center space-x-4 mb-3 text-sm">
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span class="font-bold text-indigo-900 dark:text-indigo-300">{{ request.frequency }} mentions</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-semibold text-green-900 dark:text-green-300">{{ request.revenueImpact }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4" :class="{
                    'text-red-600': request.sentiment === 'Negative',
                    'text-yellow-600': request.sentiment === 'Mixed',
                    'text-green-600': request.sentiment === 'Positive'
                  }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-white">{{ request.sentiment }}</span>
                </div>
              </div>

              <!-- Evidence -->
              <div class="bg-white dark:bg-slate-800/50 rounded-lg p-3 mb-3">
                <p class="text-sm text-white mb-1 font-semibold">📊 Evidence:</p>
                <p class="text-sm text-white">{{ request.evidence }}</p>
              </div>

              <!-- Recommended Action -->
              <div class="bg-white dark:bg-slate-800/50 rounded-lg p-3 mb-3">
                <p class="text-sm text-white mb-1 font-semibold">✅ Recommended Action:</p>
                <p class="text-sm text-white font-medium">{{ request.recommendedAction }}</p>
              </div>

              <!-- Bottom Row: Quick Win + Owner -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                <div class="flex items-center space-x-3">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': request.quickWinPotential.toLowerCase().includes('yes'),
                      'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300': !request.quickWinPotential.toLowerCase().includes('yes')
                    }"
                  >
                    {{ request.quickWinPotential.toLowerCase().includes('yes') ? '⚡ Quick Win' : '🔧 Complex' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-slate-400">{{ request.quickWinPotential }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                    👤 {{ request.crossFunctionalOwner }}
                  </span>
                  <span 
                    v-if="request.relatedFeedback && request.relatedFeedback.length > 0"
                    class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full flex items-center"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View {{ request.relatedFeedback.length }} Details
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Insights Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <!-- Quick Wins -->
          <div v-if="recommendations.quickWins.length > 0" class="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 rounded-lg p-4">
            <h5 class="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ⚡ Quick Wins
            </h5>
            <ul class="space-y-2 text-sm text-white">
              <li v-for="(win, index) in recommendations.quickWins" :key="index" class="flex items-start">
                <span class="mr-2 text-green-600 font-bold">•</span>
                <span>{{ win }}</span>
              </li>
            </ul>
          </div>

          <!-- Emerging Patterns -->
          <div v-if="recommendations.emergingPatterns.length > 0" class="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-lg p-4">
            <h5 class="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              📈 Emerging Patterns
            </h5>
            <ul class="space-y-2 text-sm text-white">
              <li v-for="(pattern, index) in recommendations.emergingPatterns" :key="index" class="flex items-start">
                <span class="mr-2 text-blue-600 font-bold">•</span>
                <span>{{ pattern }}</span>
              </li>
            </ul>
          </div>

          <!-- Critical Risks -->
          <div v-if="recommendations.criticalRisks.length > 0" class="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-lg p-4">
            <h5 class="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center text-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              ⚠️ Critical Risks
            </h5>
            <ul class="space-y-2 text-sm text-white">
              <li v-for="(risk, index) in recommendations.criticalRisks" :key="index" class="flex items-start">
                <span class="mr-2 text-red-600 font-bold">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Empty State (no recommendations yet) -->
      <div v-else class="text-center py-12">
        <div class="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h4 class="text-lg font-semibold text-white mb-2">Ready to analyze recurring requests</h4>
        <p class="text-white text-sm">Click "Generate AI Analysis" to discover what clients are asking for most</p>
      </div>
    </div>

    <!-- Feedback Detail Modal -->
    <FeedbackDetailModal
      :show="showDetailModal"
      :title="selectedRequest ? selectedRequest.request : ''"
      :feedbackItems="detailModalFeedback"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { AIRecommendation, AIRecommendationMetadata, RecurringRequest } from '~/composables/useAIRecommendations'
import type { FeedbackItem } from '~/types/feedback'

interface Props {
  loading: boolean
  error: string | null
  recommendations: AIRecommendation | null
  metadata: AIRecommendationMetadata | null
  allFeedbackItems?: FeedbackItem[]
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

// Modal state
const showDetailModal = ref(false)
const selectedRequest = ref<RecurringRequest | null>(null)
const detailModalFeedback = ref<FeedbackItem[]>([])

const openDetailModal = (request: RecurringRequest) => {
  selectedRequest.value = request
  
  // If we have related feedback in the request, use it
  if (request.relatedFeedback && request.relatedFeedback.length > 0) {
    // Convert the simplified feedback back to full FeedbackItem format if we have allFeedbackItems
    if (props.allFeedbackItems) {
      const feedbackIds = new Set(request.feedbackIds || [])
      detailModalFeedback.value = props.allFeedbackItems.filter(item => feedbackIds.has(item.id))
    } else {
      // Fallback: create minimal FeedbackItem objects from relatedFeedback
      detailModalFeedback.value = request.relatedFeedback.map(rf => ({
        id: rf.id,
        accountName: rf.accountName,
        feedback: rf.feedback,
        sentiment: rf.sentiment as 'Positive' | 'Neutral' | 'Negative',
        accountOwner: '',
        platformClientId: '',
        createdDate: new Date()
      })) as FeedbackItem[]
    }
  } else {
    detailModalFeedback.value = []
  }
  
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedRequest.value = null
  detailModalFeedback.value = []
}
</script>