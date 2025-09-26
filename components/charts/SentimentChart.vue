<template>
  <div class="relative h-64">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { SentimentAnalysis } from '~/types/feedback'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: SentimentAnalysis
}

const props = defineProps<Props>()
const chartRef = ref<HTMLCanvasElement>()
let chart: ChartJS | null = null

const createChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [
        {
          data: [props.data.positive, props.data.neutral, props.data.negative],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          hoverBackgroundColor: ['#059669', '#D97706', '#DC2626']
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed
              const total = props.data.totalItems
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

watch(() => props.data, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
