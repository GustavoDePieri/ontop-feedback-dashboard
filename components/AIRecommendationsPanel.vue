<template>
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-purple-600 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-slate-100">🤖 AI-Powered Recommendations</h3>
            <p class="text-sm text-gray-600 dark:text-slate-400">Intelligent insights powered by Google Gemini</p>
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
          <div class="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p class="mt-4 text-gray-600 dark:text-slate-400 font-medium">Analyzing feedback with AI...</p>
        <p class="text-sm text-gray-500 dark:text-slate-500 mt-1">This may take 10-20 seconds</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-red-800 dark:text-red-300 font-semibold">Error Generating Recommendations</h4>
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
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
          <h4 class="text-lg font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Executive Summary
          </h4>
          <p class="text-gray-700 dark:text-slate-300 leading-relaxed">{{ recommendations.summary }}</p>
        </div>

        <!-- Action Items -->
        <div>
          <h4 class="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recommended Actions ({{ recommendations.actionItems.length }})
          </h4>
          <div class="space-y-3">
            <div 
              v-for="(item, index) in recommendations.actionItems" 
              :key="index"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              :class="{
                'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10': item.priority === 'high',
                'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10': item.priority === 'medium',
                'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/20': item.priority === 'low'
              }"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-bold uppercase"
                    :class="{
                      'bg-red-600 text-white': item.priority === 'high',
                      'bg-yellow-600 text-white': item.priority === 'medium',
                      'bg-gray-600 text-white': item.priority === 'low'
                    }"
                  >
                    {{ item.priority }}
                  </span>
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full">
                    {{ item.area }}
                  </span>
                </div>
                <span class="text-xs text-gray-500 dark:text-slate-400">{{ item.timeline }}</span>
              </div>
              <h5 class="font-semibold text-gray-900 dark:text-slate-100 mb-2">{{ item.action }}</h5>
              <p class="text-sm text-gray-700 dark:text-slate-300 mb-2"><strong>Why:</strong> {{ item.rationale }}</p>
              <p class="text-sm text-gray-700 dark:text-slate-300"><strong>Impact:</strong> {{ item.impact }}</p>
              <div v-if="item.affectedAccounts && item.affectedAccounts.length > 0" class="mt-2 flex items-center flex-wrap gap-1">
                <span class="text-xs text-gray-600 dark:text-slate-400">Affected:</span>
                <span 
                  v-for="account in item.affectedAccounts.slice(0, 3)" 
                  :key="account"
                  class="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded"
                >
                  {{ account }}
                </span>
                <span v-if="item.affectedAccounts.length > 3" class="text-xs text-gray-500 dark:text-slate-400">
                  +{{ item.affectedAccounts.length - 3 }} more
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Insights -->
        <div v-if="recommendations.keyInsights.length > 0">
          <h4 class="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Insights
          </h4>
          <ul class="space-y-2">
            <li 
              v-for="(insight, index) in recommendations.keyInsights" 
              :key="index"
              class="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-700 dark:text-slate-300 text-sm">{{ insight }}</span>
            </li>
          </ul>
        </div>

        <!-- Trends, Risks, Opportunities Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Trends -->
          <div v-if="recommendations.trends.length > 0" class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h5 class="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trends
            </h5>
            <ul class="space-y-1 text-sm text-gray-700 dark:text-slate-300">
              <li v-for="(trend, index) in recommendations.trends" :key="index" class="flex items-start">
                <span class="mr-1">•</span>
                <span>{{ trend }}</span>
              </li>
            </ul>
          </div>

          <!-- Risks -->
          <div v-if="recommendations.risks.length > 0" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h5 class="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Risks
            </h5>
            <ul class="space-y-1 text-sm text-gray-700 dark:text-slate-300">
              <li v-for="(risk, index) in recommendations.risks" :key="index" class="flex items-start">
                <span class="mr-1">•</span>
                <span>{{ risk }}</span>
              </li>
            </ul>
          </div>

          <!-- Opportunities -->
          <div v-if="recommendations.opportunities.length > 0" class="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h5 class="font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Opportunities
            </h5>
            <ul class="space-y-1 text-sm text-gray-700 dark:text-slate-300">
              <li v-for="(opportunity, index) in recommendations.opportunities" :key="index" class="flex items-start">
                <span class="mr-1">•</span>
                <span>{{ opportunity }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Empty State (no recommendations yet) -->
      <div v-else class="text-center py-12">
        <div class="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Ready to analyze your feedback</h4>
        <p class="text-gray-600 dark:text-slate-400 text-sm">Configure your filters and click "Generate AI Recommendations" to get started</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIRecommendation, AIRecommendationMetadata } from '~/composables/useAIRecommendations'

interface Props {
  loading: boolean
  error: string | null
  recommendations: AIRecommendation | null
  metadata: AIRecommendationMetadata | null
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>
