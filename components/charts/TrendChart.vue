<template>
  <div class="relative h-64">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: Array<{
    name: string
    count: number
    percentage: number
  }>
  title?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Trends',
  color: '#3B82F6'
})

const chartRef = ref<HTMLCanvasElement>()
let chart: ChartJS | null = null

const createChart = () => {
  if (!chartRef.value || !props.data.length) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: props.data.map(item => item.name),
      datasets: [
        {
          label: 'Count',
          data: props.data.map(item => item.count),
          backgroundColor: props.color + '20',
          borderColor: props.color,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = props.data[context.dataIndex]
              return `${item.name}: ${item.count} (${item.percentage}%)`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
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
