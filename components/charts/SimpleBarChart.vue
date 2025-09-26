<template>
  <div class="relative h-80 p-4">
    <div v-if="data.length > 0" class="h-full flex flex-col">
      <!-- Chart Title -->
      <h4 class="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">{{ title }}</h4>
      
      <!-- Chart Area -->
      <div class="flex-1 flex items-end space-x-2">
        <div 
          v-for="(item, index) in data.slice(0, 8)" 
          :key="item.name"
          class="flex-1 flex flex-col items-center"
        >
          <!-- Bar -->
          <div 
            class="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
            :style="{
              height: `${(item.count / maxCount) * 200}px`,
              backgroundColor: colors[index % colors.length],
              minHeight: '20px'
            }"
            :title="`${item.name}: ${item.count} (${item.percentage}%)`"
          ></div>
          
          <!-- Label -->
          <div class="mt-2 text-xs text-gray-600 dark:text-slate-400 text-center">
            <div class="font-medium truncate max-w-20" :title="item.name">
              {{ item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name }}
            </div>
            <div class="text-gray-500 dark:text-slate-500">{{ item.count }}</div>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="mt-4 flex flex-wrap gap-2 justify-center">
        <div 
          v-for="(item, index) in data.slice(0, 4)" 
          :key="`legend-${item.name}`"
          class="flex items-center text-xs"
        >
          <div 
            class="w-3 h-3 rounded-full mr-1"
            :style="{ backgroundColor: colors[index % colors.length] }"
          ></div>
          <span class="text-gray-600 dark:text-slate-400">{{ item.name }} ({{ item.percentage }}%)</span>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm">No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: Array<{
    name: string
    count: number
    percentage: number
  }>
  title?: string
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Distribution',
  colors: () => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
})

const maxCount = computed(() => {
  return Math.max(...props.data.map(item => item.count), 1)
})
</script>
