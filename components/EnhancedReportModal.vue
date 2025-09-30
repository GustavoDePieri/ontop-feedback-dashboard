<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full max-h-[95vh] flex flex-col"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">
                  📊 Weekly Executive Report
                </h3>
                <p class="text-purple-100 text-sm mt-1">
                  Ready to share with leadership and departments
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <!-- Week Selector -->
            <div class="flex items-center gap-3">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Week:</label>
              <select 
                v-model="selectedWeekOffset"
                @change="generateReport"
                class="px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option :value="0">Current Week ({{ getWeekLabel(0) }})</option>
                <option :value="-1">Last Week ({{ getWeekLabel(-1) }})</option>
                <option :value="-2">2 Weeks Ago ({{ getWeekLabel(-2) }})</option>
                <option :value="-3">3 Weeks Ago ({{ getWeekLabel(-3) }})</option>
                <option :value="-4">4 Weeks Ago ({{ getWeekLabel(-4) }})</option>
                <option :value="-8">8 Weeks Ago ({{ getWeekLabel(-8) }})</option>
                <option :value="-12">12 Weeks Ago ({{ getWeekLabel(-12) }})</option>
              </select>
            </div>
            
            <!-- Export Buttons -->
            <div class="flex items-center gap-2 flex-wrap">
              <button
                @click="downloadHTML('executive')"
                class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Executive Report (HTML)
              </button>
              
              <button
                @click="copyToClipboard"
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy HTML
              </button>
            </div>
            
            
            <div class="border-l border-gray-300 dark:border-gray-600 h-8"></div>
            
            <!-- AI Generate Button -->
            <button
              @click="generateWithAI"
              :disabled="isGeneratingAI"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg v-if="!isGeneratingAI" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ isGeneratingAI ? 'Generating with AI...' : 'Enhance with AI' }}
            </button>
            
            <div class="border-l border-gray-300 dark:border-gray-600 h-8"></div>
            
            <!-- Department-Specific Reports -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Dept Reports:</span>
              <button
                @click="downloadHTML('product')"
                class="px-3 py-1.5 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-500 transition-colors"
              >
                Product
              </button>
              <button
                @click="downloadHTML('support')"
                class="px-3 py-1.5 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-500 transition-colors"
              >
                Support
              </button>
              <button
                @click="downloadHTML('operations')"
                class="px-3 py-1.5 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-500 transition-colors"
              >
                Operations
              </button>
              <button
                @click="downloadHTML('sales')"
                class="px-3 py-1.5 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-500 transition-colors"
              >
                Sales
              </button>
            </div>
          </div>
        </div>

        <!-- Report Preview (iframe showing HTML) -->
        <div class="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div class="max-w-5xl mx-auto">
            <iframe
              v-if="reportHTML"
              :srcdoc="reportHTML"
              class="w-full rounded-lg shadow-2xl border-4 border-white dark:border-gray-700"
              style="height: 800px; background: white;"
            ></iframe>
            <div v-else class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-400">Generating report...</p>
            </div>
          </div>
        </div>

        <!-- Success Toast -->
        <div v-if="showSuccess" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-60 flex items-center animate-bounce">
          <svg class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackItem } from '~/types/feedback'

const props = defineProps<{
  isOpen: boolean
  feedbackData: FeedbackItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { generateWeeklyReport } = useReportGenerator()
const { generateExecutiveHTML, generateDepartmentHTML } = useReportTemplates()
const { generateRecommendations } = useAIRecommendations()

const reportHTML = ref<string>('')
const reportData = ref<any>(null)
const showSuccess = ref(false)
const successMessage = ref('')
const selectedWeekOffset = ref(0)
const isGeneratingAI = ref(false)

// Generate report when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.feedbackData) {
    selectedWeekOffset.value = 0
    generateReport()
  }
})

const generateReport = () => {
  try {
    // Generate report data with week offset
    reportData.value = generateWeeklyReport(props.feedbackData, selectedWeekOffset.value)
    
    // Generate HTML
    reportHTML.value = generateExecutiveHTML(reportData.value)
  } catch (error) {
    console.error('Failed to generate report:', error)
  }
}

const getWeekLabel = (offset: number): string => {
  const now = new Date()
  const currentDay = now.getDay()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - currentDay + (offset * 7))
  
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
}

const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

const generateWithAI = async () => {
  if (!reportData.value || isGeneratingAI.value) return
  
  isGeneratingAI.value = true
  
  try {
    // Get the feedback for the selected week
    const now = new Date()
    const currentDay = now.getDay()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - currentDay + (selectedWeekOffset.value * 7))
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    
    const weekFeedback = props.feedbackData.filter((item: any) => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    if (weekFeedback.length === 0) {
      showSuccessMessage('No feedback found for this week')
      return
    }
    
    // Generate AI recommendations
    const aiResult: any = await generateRecommendations(weekFeedback, {
      segmentType: 'all',
      focusArea: 'Weekly report action items'
    })
    
    // Replace action items with AI-generated recommendations
    if (aiResult && reportData.value) {
      const aiActionItems = (aiResult.topRecurringRequests || []).map((req: any, index: number) => ({
        priority: index < 2 ? 'immediate' : index < 5 ? 'this-week' : 'next-week',
        action: req.recommendedAction || req.request,
        owner: req.crossFunctionalOwner || req.department || 'General',
        impact: req.revenueImpact || req.evidence || 'See details'
      }))
      
      // Merge AI recommendations with existing action items
      reportData.value.actionItems = [...aiActionItems, ...reportData.value.actionItems].slice(0, 10)
      
      // Regenerate HTML with AI-enhanced data
      reportHTML.value = generateExecutiveHTML(reportData.value)
      
      showSuccessMessage('✨ Report enhanced with AI recommendations!')
    }
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error)
    showSuccessMessage('Failed to enhance with AI. Try again.')
  } finally {
    isGeneratingAI.value = false
  }
}

const closeModal = () => {
  emit('close')
}

const downloadHTML = (type: string) => {
  if (!reportData.value) return
  
  try {
    let html: string
    let filename: string
    
    if (type === 'executive') {
      html = generateExecutiveHTML(reportData.value)
      filename = `executive-report-week-${reportData.value.period.weekNumber}-${reportData.value.period.year}.html`
    } else {
      html = generateDepartmentHTML(reportData.value, type.charAt(0).toUpperCase() + type.slice(1))
      filename = `${type}-report-week-${reportData.value.period.weekNumber}-${reportData.value.period.year}.html`
    }
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    showSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`)
  } catch (error) {
    console.error('Failed to download report:', error)
  }
}

const copyToClipboard = async () => {
  if (!reportHTML.value) return
  
  try {
    await navigator.clipboard.writeText(reportHTML.value)
    showSuccessMessage('HTML copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
    showSuccessMessage('Failed to copy to clipboard')
  }
}

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>
