<template>
  <div 
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Center modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

      <div 
        class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ title }}
              </h3>
              <p class="text-sm text-blue-100 mt-1">{{ feedbackItems.length }} feedback item{{ feedbackItems.length !== 1 ? 's' : '' }}</p>
            </div>
            <button 
              @click="$emit('close')"
              class="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div class="space-y-4">
            <div 
              v-for="(item, index) in feedbackItems" 
              :key="item.id"
              class="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <!-- Feedback Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {{ item.accountName }}
                  </h4>
                  <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-slate-400">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ item.accountOwner }}
                    </span>
                    <span class="text-gray-400 dark:text-slate-600">•</span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(item.createdDate) }}
                    </span>
                    <span v-if="item.platformClientId" class="text-gray-400 dark:text-slate-600">•</span>
                    <span v-if="item.platformClientId" class="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                      ID: {{ item.platformClientId }}
                    </span>
                  </div>
                </div>
                
                <!-- Sentiment Badge -->
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': item.sentiment === 'Positive',
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': item.sentiment === 'Neutral',
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': item.sentiment === 'Negative'
                  }"
                >
                  {{ item.sentiment || 'Unknown' }}
                </span>
              </div>

              <!-- Feedback Content -->
              <div class="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 mb-3">
                <p class="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {{ item.feedback }}
                </p>
              </div>

              <!-- Metadata Tags -->
              <div class="flex flex-wrap gap-2">
                <span 
                  v-if="item.categoryFormulaText || item.subcategory"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {{ item.categoryFormulaText || item.subcategory }}
                </span>
                <span 
                  v-if="item.feedbackDirectedTo"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Directed To: {{ item.feedbackDirectedTo }}
                </span>
                <span 
                  v-if="item.customerSatisfaction"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ item.customerSatisfaction }}
                </span>
                <span 
                  v-if="item.realMrrLastMonth"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  MRR: ${{ item.realMrrLastMonth.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 dark:bg-slate-900/50 px-6 py-4 flex justify-between items-center">
          <div class="text-sm text-gray-600 dark:text-slate-400">
            <span class="font-semibold">{{ feedbackItems.length }}</span> feedback item{{ feedbackItems.length !== 1 ? 's' : '' }} shown
          </div>
          <button
            @click="$emit('close')"
            class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackItem } from '~/types/feedback'

interface Props {
  show: boolean
  title: string
  feedbackItems: FeedbackItem[]
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

