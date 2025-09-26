<template>
  <div class="relative h-80 p-4">
    <div v-if="data.length > 0" class="h-full flex flex-col">
      <!-- Chart Title -->
      <h4 class="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">{{ title }}</h4>
      
      <!-- Chart Area -->
      <div class="flex-1 relative">
        <svg width="100%" height="100%" class="overflow-visible">
          <!-- Grid lines -->
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#E5E7EB" stroke-width="1" class="dark:stroke-slate-600"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- Data lines -->
          <g v-for="(series, seriesIndex) in chartSeries" :key="series.label">
            <polyline
              :points="series.points"
              fill="none"
              :stroke="series.color"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Data points -->
            <circle
              v-for="(point, pointIndex) in series.pointsArray"
              :key="`${seriesIndex}-${pointIndex}`"
              :cx="point.x"
              :cy="point.y"
              r="4"
              :fill="series.color"
              class="cursor-pointer"
              :title="`${series.label}: ${point.value} on ${point.date}`"
            />
          </g>
        </svg>
        
        <!-- X-axis labels -->
        <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-2">
          <span v-for="(item, index) in data.slice(0, 5)" :key="index">
            {{ formatDate(item.date) }}
          </span>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="mt-6 flex flex-wrap gap-4 justify-center">
        <div 
          v-for="series in chartSeries" 
          :key="series.label"
          class="flex items-center text-xs"
        >
          <div 
            class="w-4 h-4 rounded-full mr-2"
            :style="{ backgroundColor: series.color }"
          ></div>
          <span class="text-gray-600 dark:text-slate-400">{{ series.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p class="text-sm">No trend data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: Array<{
    date: string
    positive: number
    neutral: number
    negative: number
  }>
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Trends Over Time'
})

// Calculate max value for scaling
const maxValue = computed(() => {
  let max = 0
  props.data.forEach(item => {
    max = Math.max(max, item.positive, item.neutral, item.negative)
  })
  return max || 1
})

// Chart dimensions (approximate)
const chartWidth = 400
const chartHeight = 200

// Generate chart series
const chartSeries = computed(() => {
  if (!props.data.length) return []
  
  const series = [
    { label: 'Positive', color: '#10B981', data: props.data.map(d => d.positive) },
    { label: 'Neutral', color: '#F59E0B', data: props.data.map(d => d.neutral) },
    { label: 'Negative', color: '#EF4444', data: props.data.map(d => d.negative) }
  ]
  
  return series.map(s => {
    const points = s.data.map((value, index) => {
      const x = (index / (props.data.length - 1)) * chartWidth
      const y = chartHeight - ((value / maxValue.value) * chartHeight)
      return { x, y, value, date: props.data[index].date }
    })
    
    return {
      ...s,
      points: points.map(p => `${p.x},${p.y}`).join(' '),
      pointsArray: points
    }
  })
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
