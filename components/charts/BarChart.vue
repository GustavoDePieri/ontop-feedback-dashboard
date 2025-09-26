<template>
  <div class="relative h-80">
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
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Distribution',
  colors: () => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
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
      labels: props.data.map(item => {
        // Truncate long labels
        return item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
      }),
      datasets: [
        {
          label: 'Count',
          data: props.data.map(item => item.count),
          backgroundColor: props.data.map((_, index) => props.colors[index % props.colors.length] + '80'),
          borderColor: props.data.map((_, index) => props.colors[index % props.colors.length]),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
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
            title: (context) => {
              const index = context[0].dataIndex
              return props.data[index].name
            },
            label: (context) => {
              const index = context.dataIndex
              const item = props.data[index]
              return `${item.count} items (${item.percentage}%)`
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
            minRotation: 0,
            font: {
              size: 11
            }
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 11
            }
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
