<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
      <slot name="header" />
    </div>
    
    <div :class="contentClasses">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = 'bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/10 border border-gray-200 dark:border-slate-700 transition-colors duration-300'
  const hoverClasses = props.hover ? 'hover:shadow-md dark:hover:shadow-slate-900/20 transition-shadow duration-200' : ''
  
  return `${baseClasses} ${hoverClasses}`
})

const contentClasses = computed(() => {
  return props.padding ? 'p-6' : ''
})
</script>
