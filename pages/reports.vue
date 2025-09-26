<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Reports & Insights
            </h1>
            <p class="mt-2 text-gray-600">
              Weekly and monthly reports with actionable insights
            </p>
          </div>
          
          <div class="flex space-x-3">
            <button class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Generate Report
            </button>
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Schedule Report
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Report Types -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Weekly Report -->
        <AppCard :hover="true" class="cursor-pointer" @click="generateWeeklyReport">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Weekly Report</h3>
                <p class="text-sm text-gray-500">Last 7 days analysis</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600">Comprehensive weekly insights including sentiment trends, top accounts, and key metrics.</p>
            </div>
          </div>
        </AppCard>

        <!-- Monthly Report -->
        <AppCard :hover="true" class="cursor-pointer" @click="generateMonthlyReport">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Monthly Report</h3>
                <p class="text-sm text-gray-500">Last 30 days analysis</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600">In-depth monthly analysis with trend comparisons, account performance, and strategic recommendations.</p>
            </div>
          </div>
        </AppCard>

        <!-- Custom Report -->
        <AppCard :hover="true" class="cursor-pointer" @click="openCustomReportModal">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Custom Report</h3>
                <p class="text-sm text-gray-500">Choose your parameters</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600">Create custom reports with specific date ranges, accounts, and metrics tailored to your needs.</p>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Recent Reports -->
      <AppCard class="mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="report in recentReports" :key="report.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="{
                    'bg-blue-100': report.type === 'weekly',
                    'bg-purple-100': report.type === 'monthly',
                    'bg-green-100': report.type === 'custom'
                  }">
                    <svg class="w-5 h-5" :class="{
                      'text-blue-600': report.type === 'weekly',
                      'text-purple-600': report.type === 'monthly',
                      'text-green-600': report.type === 'custom'
                    }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">{{ report.title }}</h4>
                  <p class="text-sm text-gray-500">{{ report.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">Generated {{ formatDate(report.createdAt) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="{
                  'bg-green-100 text-green-800': report.status === 'completed',
                  'bg-yellow-100 text-yellow-800': report.status === 'processing',
                  'bg-red-100 text-red-800': report.status === 'failed'
                }">
                  {{ report.status }}
                </span>
                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download
                </button>
                <button class="text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Report Insights Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Key Metrics Summary -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">This Week's Key Metrics</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Total Feedback</p>
                  <p class="text-xs text-gray-500">vs. last week</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">324</p>
                  <p class="text-xs text-green-600">+12.5%</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Positive Sentiment</p>
                  <p class="text-xs text-gray-500">vs. last week</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">78%</p>
                  <p class="text-xs text-green-600">+3.2%</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Response Rate</p>
                  <p class="text-xs text-gray-500">vs. last week</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">89%</p>
                  <p class="text-xs text-red-600">-1.8%</p>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">At-Risk Accounts</p>
                  <p class="text-xs text-gray-500">requiring attention</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">3</p>
                  <p class="text-xs text-yellow-600">same</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Scheduled Reports -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Scheduled Reports</h3>
              <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Manage
              </button>
            </div>
            <div class="space-y-4">
              <div v-for="schedule in scheduledReports" :key="schedule.id" class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-green-400': schedule.active,
                      'bg-gray-400': !schedule.active
                    }"></div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ schedule.name }}</p>
                    <p class="text-xs text-gray-500">{{ schedule.frequency }} • Next: {{ schedule.nextRun }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                  <button class="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Reports - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Generate and manage feedback analytics reports' }
  ]
})

// Mock data for reports
const recentReports = ref([
  {
    id: 1,
    title: 'Weekly Feedback Report',
    description: 'Sep 19-26, 2025 • 324 feedback items analyzed',
    type: 'weekly',
    status: 'completed',
    createdAt: new Date('2025-09-26')
  },
  {
    id: 2,
    title: 'Monthly Customer Insights',
    description: 'September 2025 • Comprehensive analysis',
    type: 'monthly',
    status: 'processing',
    createdAt: new Date('2025-09-25')
  },
  {
    id: 3,
    title: 'Custom Account Analysis',
    description: 'Top 10 accounts • Q3 performance',
    type: 'custom',
    status: 'completed',
    createdAt: new Date('2025-09-24')
  }
])

const scheduledReports = ref([
  {
    id: 1,
    name: 'Weekly Executive Summary',
    frequency: 'Every Monday',
    nextRun: 'Sep 30, 9:00 AM',
    active: true
  },
  {
    id: 2,
    name: 'Monthly Department Report',
    frequency: 'First Monday of month',
    nextRun: 'Oct 7, 10:00 AM',
    active: true
  },
  {
    id: 3,
    name: 'Quarterly Business Review',
    frequency: 'Every 3 months',
    nextRun: 'Jan 1, 2026',
    active: false
  }
])

// Methods
const generateWeeklyReport = () => {
  // Implementation for weekly report generation
  console.log('Generating weekly report...')
}

const generateMonthlyReport = () => {
  // Implementation for monthly report generation
  console.log('Generating monthly report...')
}

const openCustomReportModal = () => {
  // Implementation for custom report modal
  console.log('Opening custom report modal...')
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
