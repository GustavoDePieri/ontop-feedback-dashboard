<template>
  <div class="relative h-80 p-4">
    <div v-if="data.totalItems > 0" class="h-full flex flex-col items-center justify-center">
      <!-- SVG Doughnut Chart -->
      <div class="relative">
        <svg width="200" height="200" class="transform -rotate-90">
          <!-- Background circle -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="20"
            class="dark:stroke-slate-700"
          />
          
          <!-- Positive arc -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#10B981"
            stroke-width="20"
            :stroke-dasharray="`${positiveCircumference} ${totalCircumference - positiveCircumference}`"
            :stroke-dashoffset="0"
            stroke-linecap="round"
          />
          
          <!-- Neutral arc -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#F59E0B"
            stroke-width="20"
            :stroke-dasharray="`${neutralCircumference} ${totalCircumference - neutralCircumference}`"
            :stroke-dashoffset="-positiveCircumference"
            stroke-linecap="round"
          />
          
          <!-- Negative arc -->
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#EF4444"
            stroke-width="20"
            :stroke-dasharray="`${negativeCircumference} ${totalCircumference - negativeCircumference}`"
            :stroke-dashoffset="-(positiveCircumference + neutralCircumference)"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- Center text -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-slate-100">{{ data.totalItems }}</div>
          <div class="text-sm text-gray-500 dark:text-slate-400">Total</div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="mt-6 flex flex-col space-y-2">
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
          <span class="text-sm text-gray-700 dark:text-slate-300">
            Positive: {{ data.positive }} ({{ positivePercent }}%)
          </span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
          <span class="text-sm text-gray-700 dark:text-slate-300">
            Neutral: {{ data.neutral }} ({{ neutralPercent }}%)
          </span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
          <span class="text-sm text-gray-700 dark:text-slate-300">
            Negative: {{ data.negative }} ({{ negativePercent }}%)
          </span>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">No sentiment data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SentimentAnalysis } from '~/types/feedback'

interface Props {
  data: SentimentAnalysis
}

const props = defineProps<Props>()

// Calculate percentages
const positivePercent = computed(() => {
  return props.data.totalItems > 0 ? Math.round((props.data.positive / props.data.totalItems) * 100) : 0
})

const neutralPercent = computed(() => {
  return props.data.totalItems > 0 ? Math.round((props.data.neutral / props.data.totalItems) * 100) : 0
})

const negativePercent = computed(() => {
  return props.data.totalItems > 0 ? Math.round((props.data.negative / props.data.totalItems) * 100) : 0
})

// Calculate circumferences for the doughnut chart
const totalCircumference = 2 * Math.PI * 80 // radius = 80

const positiveCircumference = computed(() => {
  return (props.data.positive / props.data.totalItems) * totalCircumference
})

const neutralCircumference = computed(() => {
  return (props.data.neutral / props.data.totalItems) * totalCircumference
})

const negativeCircumference = computed(() => {
  return (props.data.negative / props.data.totalItems) * totalCircumference
})
</script>
