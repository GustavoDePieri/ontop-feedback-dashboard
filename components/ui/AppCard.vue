<template>
  <div :class="cardClasses" @click="handleClick">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div :class="contentClasses">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: boolean
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false,
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const cardClasses = computed(() => {
  const baseClasses = 'card'
  const hoverClasses = props.hover || props.clickable ? 'card-hover' : ''
  const clickableClasses = props.clickable ? 'cursor-pointer' : ''
  
  return `${baseClasses} ${hoverClasses} ${clickableClasses}`
})

const contentClasses = computed(() => {
  return props.padding ? 'card-body' : ''
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>
