<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-white/10">
      <div class="text-white">
        <slot name="header" />
      </div>
    </div>
    
    <div :class="contentClasses">
      <div class="text-white">
        <slot />
      </div>
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-white/10 bg-white/5">
      <div class="text-white/80">
        <slot name="footer" />
      </div>
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
  const baseClasses = 'bg-ontop-navy-light/30 backdrop-blur-sm rounded-xl shadow-xl border border-white/5 transition-all duration-300'
  const hoverClasses = props.hover ? 'hover:border-white/10 hover:shadow-2xl transition-all duration-200' : ''
  
  return `${baseClasses} ${hoverClasses}`
})

const contentClasses = computed(() => {
  return props.padding ? 'p-6' : ''
})
</script>
