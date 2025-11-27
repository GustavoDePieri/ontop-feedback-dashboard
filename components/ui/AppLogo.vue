<template>
  <div class="flex items-center space-x-3">
    <img 
      :src="logoSrc" 
      :alt="altText" 
      :class="logoClasses"
      class="object-contain rounded-lg transition-all duration-200"
    />
    <div v-if="showText" class="flex flex-col">
      <h1 :class="titleClasses" class="font-bold text-white leading-tight">
        {{ title }}
      </h1>
      <p v-if="subtitle" :class="subtitleClasses" class="text-white/70 font-medium">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  title?: string
  subtitle?: string
  logoSrc?: string
  altText?: string
  shadow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  title: 'Ontop',
  subtitle: 'Analytics AI',
  logoSrc: '/ontop-logo-ai.jpg',
  altText: 'Ontop Logo',
  shadow: true
})

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20'
}

const titleSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
}

const subtitleSizeMap = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base'
}

const logoClasses = computed(() => {
  return [
    sizeMap[props.size],
    props.shadow ? 'shadow-lg' : ''
  ].filter(Boolean).join(' ')
})

const titleClasses = computed(() => titleSizeMap[props.size])
const subtitleClasses = computed(() => subtitleSizeMap[props.size])
</script>

