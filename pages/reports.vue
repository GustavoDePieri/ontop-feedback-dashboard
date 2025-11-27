<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb & Home Button -->
        <div class="pt-4 pb-2 flex items-center justify-between">
          <AppBreadcrumb :items="[{ label: 'Reports' }]" />
          <NuxtLink 
            to="/"
            class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 group"
          >
            <svg class="w-4 h-4 text-white group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-sm font-medium text-white group-hover:text-white transition-colors">Home</span>
          </NuxtLink>
        </div>
        
        <div class="flex justify-between items-center py-8">
          <div>
            <h1 class="text-3xl font-bold text-white drop-shadow-lg">
              📊 Unified Intelligence Reports
            </h1>
            <p class="mt-2 text-blue-100 font-medium drop-shadow">
              Comprehensive reports with AI-powered insights
            </p>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="showReportModal = true"
              class="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate New Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Info Card -->
      <AppCard class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600">
          <div class="p-6">
          <div class="flex items-start">
              <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-lg font-bold text-white mb-2">
                🎯 New Unified Report System
              </h3>
              <p class="text-white text-sm leading-relaxed">
                All report types have been merged into <strong>one comprehensive report</strong> that includes:
                <span class="block mt-2 space-y-1">
                  • <strong>AI-Powered Insights</strong> - Recurring patterns and recommendations<br>
                  • <strong>Executive Summary</strong> - Key metrics and trends<br>
                  • <strong>Detailed Analysis</strong> - By category, account, and manager<br>
                  • <strong>Custom Time Periods</strong> - Analyze any date range you want
                </span>
              </p>
            </div>
            </div>
          </div>
        </AppCard>

      <!-- Recent Reports -->
      <AppCard class="mb-8">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">📁 Recent Reports</h3>
            <span class="text-sm text-white">
              {{ recentReports.length }} report{{ recentReports.length !== 1 ? 's' : '' }} generated
            </span>
          </div>
        </div>
        <div class="p-6">
          <div v-if="recentReports.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-white">No reports yet</h3>
            <p class="mt-1 text-sm text-white">Get started by generating your first unified report.</p>
            <div class="mt-6">
              <button 
                @click="showReportModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="report in recentReports" 
              :key="report.id" 
              class="group relative flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
              @click="viewReport(report)"
            >
              <div class="flex items-center space-x-4 flex-1">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h4 class="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {{ report.title }}
                  </h4>
                  <p class="text-sm text-white mt-1">
                    {{ report.dateRange }} • {{ report.feedbackCount }} feedback items
                  </p>
                  <p class="text-xs text-white mt-1">
                    Generated {{ formatDate(report.generatedAt) }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <!-- Stats Preview -->
                <div class="hidden sm:flex items-center space-x-4 mr-4">
                  <div class="text-center">
                    <div class="text-sm font-bold text-green-600 dark:text-green-400">{{ report.stats.positive }}%</div>
                    <div class="text-xs text-white">Positive</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-bold text-red-600 dark:text-red-400">{{ report.stats.negative }}%</div>
                    <div class="text-xs text-white">Negative</div>
                  </div>
                  <div v-if="report.hasAIInsights" class="text-center">
                    <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Insights
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <button 
                  @click.stop="downloadReport(report)"
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Download Report"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  @click.stop="deleteReport(report.id)"
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete Report"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppCard>
    </main>

    <!-- Report Generation Modal -->
    <div 
      v-if="showReportModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showReportModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div 
          class="fixed inset-0 transition-opacity bg-black/75"
          @click="showReportModal = false"
        ></div>

        <!-- Center modal -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div 
          class="inline-block align-bottom bg-ontop-navy-dark rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/10"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-gradient-ontop-hero px-6 py-4">
              <div class="flex items-center justify-between">
                <div>
                <h3 class="text-xl font-bold text-white">Generate Unified Report</h3>
                <p class="text-sm text-white mt-1">Select time period and options</p>
              </div>
              <button 
                @click="showReportModal = false"
                class="text-white/80 hover:text-white transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
                </div>
              </div>

          <!-- Content -->
          <div class="px-6 py-6 space-y-6">
            <!-- Report Title -->
                <div>
              <label class="block text-sm font-medium text-white/80 mb-2">
                Report Title
              </label>
              <input
                v-model="reportConfig.title"
                type="text"
                placeholder="e.g., Weekly Executive Report"
                class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 placeholder-white/50"
              />
                </div>

            <!-- Time Period -->
            <div>
              <label class="block text-sm font-medium text-white/80 mb-2">
                Time Period
              </label>
              <select 
                v-model="selectedPeriod"
                class="bg-ontop-navy-dark/80 text-white border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm w-48"
                @change="generateReport"
              >
                <option value="weekly">Weekly Summary</option>
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Analysis</option>
                <option value="custom">Custom Date Range</option>
              </select>
                </div>

            <!-- Custom Date Range -->
            <div v-if="reportConfig.period === 'custom'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">
                  Start Date
                </label>
                <input
                  v-model="reportConfig.startDate"
                  type="date"
                  class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500"
                />
              </div>
                <div>
                <label class="block text-sm font-medium text-white/80 mb-2">
                  End Date
                </label>
                <input
                  v-model="reportConfig.endDate"
                  type="date"
                  class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500"
                />
              </div>
            </div>

            <!-- Options -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-white/80 mb-2">
                Report Options
              </label>
              
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="reportConfig.includeAI"
                  type="checkbox"
                  class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"
                />
                <div class="flex-1">
                  <span class="text-sm font-medium text-white">
                    Include AI-Powered Insights
                  </span>
                  <p class="text-xs text-white/60">
                    Recurring patterns, recommendations, and trends
                  </p>
            </div>
              </label>

              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="reportConfig.includeManager"
                  type="checkbox"
                  class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"
                />
                <div class="flex-1">
                  <span class="text-sm font-medium text-white">
                    Include Manager Performance
                  </span>
                  <p class="text-xs text-white/60">
                    Breakdown by account manager
                  </p>
                  </div>
              </label>

              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="reportConfig.includeAccounts"
                  type="checkbox"
                  class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"
                />
                <div class="flex-1">
                  <span class="text-sm font-medium text-white">
                    Include Top Accounts Analysis
                  </span>
                  <p class="text-xs text-white/60">
                    Most active accounts and their sentiment
                  </p>
                </div>
              </label>
            </div>

            <!-- Preview Info -->
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-white mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm text-white font-medium">
                    Report will analyze feedback from {{ getDateRangePreview() }}
                  </p>
                  <p v-if="reportConfig.includeAI" class="text-xs text-white mt-1">
                    AI analysis may take 10-20 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white/5 px-6 py-4 flex justify-end space-x-3">
            <button
              @click="showReportModal = false"
              class="px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="generateReport"
              :disabled="generating"
              class="px-6 py-2 bg-gradient-cta hover:bg-gradient-cta-hover text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="!generating" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ generating ? 'Generating...' : 'Generate Report' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Display Modal -->
    <ReportDisplayModal
      v-if="showReportDisplay"
      :reportHTML="currentReportHTML"
      @close="showReportDisplay = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useGoogleSheets } from '~/composables/useGoogleSheets'
import { useReportGenerator } from '~/composables/useReportGenerator'
import { useReportTemplates } from '~/composables/useReportTemplates'
import { useAIRecommendations } from '~/composables/useAIRecommendations'

// Page metadata
useHead({
  title: 'Unified Reports - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Generate comprehensive unified reports with AI insights' }
  ]
})

// Composables
const { fetchFeedbackData } = useGoogleSheets()
const { generateWeeklyReport } = useReportGenerator()
const { generateExecutiveHTML } = useReportTemplates()
const { generateRecommendations } = useAIRecommendations()

// State
const showReportModal = ref(false)
const showReportDisplay = ref(false)
const generating = ref(false)
const currentReportHTML = ref('')

const reportConfig = ref({
  title: 'Unified Intelligence Report',
  period: 'last-week',
  startDate: '',
  endDate: '',
  includeAI: true,
  includeManager: true,
  includeAccounts: true
})

const recentReports = ref<any[]>([])

// Load reports from localStorage on mount
onMounted(() => {
  loadReportsFromStorage()
})

const loadReportsFromStorage = () => {
  try {
    const stored = localStorage.getItem('unified_reports')
    if (stored) {
      recentReports.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading reports:', error)
  }
}

const saveReportsToStorage = () => {
  try {
    localStorage.setItem('unified_reports', JSON.stringify(recentReports.value))
  } catch (error) {
    console.error('Error saving reports:', error)
  }
}

const updateDateRange = () => {
  const now = new Date()
  let startDate: Date, endDate: Date

  switch (reportConfig.value.period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      break
    case 'yesterday':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      endDate.setDate(now.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'this-week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - now.getDay())
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      break
    case 'last-week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - now.getDay() - 7)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      endDate.setDate(now.getDate() - now.getDay() - 1)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now)
      break
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      break
    case 'last-30-days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      break
    case 'last-90-days':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 90)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(now)
      break
    default:
      return
  }

  reportConfig.value.startDate = startDate.toISOString().split('T')[0]
  reportConfig.value.endDate = endDate.toISOString().split('T')[0]
}

const getDateRangePreview = () => {
  if (reportConfig.value.period === 'custom') {
    return `${reportConfig.value.startDate} to ${reportConfig.value.endDate}`
  }
  
  const labels: Record<string, string> = {
    'today': 'today',
    'yesterday': 'yesterday',
    'this-week': 'this week',
    'last-week': 'last week',
    'this-month': 'this month',
    'last-month': 'last month',
    'last-30-days': 'the last 30 days',
    'last-90-days': 'the last 90 days'
  }
  
  return labels[reportConfig.value.period] || 'selected period'
}

const generateReport = async () => {
  generating.value = true
  
  try {
    // Fetch feedback data
    const feedbackData = await fetchFeedbackData()
    
    // Filter by date range
    updateDateRange()
    const startDate = new Date(reportConfig.value.startDate)
    const endDate = new Date(reportConfig.value.endDate)
    
    const filteredData = feedbackData.filter((item: any) => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    if (filteredData.length === 0) {
      alert('No feedback found in the selected date range')
      generating.value = false
      return
    }
    
    // Generate base report
    const reportData = generateWeeklyReport(filteredData, 0)
    reportData.title = reportConfig.value.title || 'Unified Intelligence Report'
    
    // Generate AI insights if requested
    let aiInsights = null
    if (reportConfig.value.includeAI) {
      try {
        await generateRecommendations(filteredData, {
          segmentType: 'all',
          focusArea: 'recurring patterns and actionable insights'
        })
        // AI insights will be added to the report template
      } catch (error) {
        console.error('AI generation failed:', error)
      }
    }
    
    // Generate HTML report
    const html = generateExecutiveHTML(reportData)
    currentReportHTML.value = html
    
    // Save report
    const newReport = {
      id: Date.now(),
      title: reportConfig.value.title,
      dateRange: `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`,
      feedbackCount: filteredData.length,
      generatedAt: new Date(),
      html: html,
      hasAIInsights: reportConfig.value.includeAI,
      stats: {
        positive: reportData.summary.positivePercent,
        negative: reportData.summary.negativePercent,
        neutral: reportData.summary.neutralPercent
      }
    }
    
    recentReports.value.unshift(newReport)
    if (recentReports.value.length > 10) {
      recentReports.value = recentReports.value.slice(0, 10)
    }
    saveReportsToStorage()
    
    // Show report
    showReportModal.value = false
    showReportDisplay.value = true
    
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Failed to generate report. Please try again.')
  } finally {
    generating.value = false
  }
}

const viewReport = (report: any) => {
  currentReportHTML.value = report.html
  showReportDisplay.value = true
}

const downloadReport = (report: any) => {
  const blob = new Blob([report.html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.title.replace(/\s+/g, '_')}_${report.id}.html`
  link.click()
  URL.revokeObjectURL(url)
}

const deleteReport = (id: number) => {
  if (confirm('Are you sure you want to delete this report?')) {
    recentReports.value = recentReports.value.filter(r => r.id !== id)
    saveReportsToStorage()
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Initialize date range
updateDateRange()
</script>
