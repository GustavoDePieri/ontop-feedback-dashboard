<template>
  <!-- Modal Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black/75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-ontop-navy-dark rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full max-h-[95vh] flex flex-col border border-white/10"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-gradient-ontop-hero px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gradient-cta rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ reportData.title }}
                </h3>
                <p class="text-white/70 text-sm">
                  {{ reportData.dateRange }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Copy Report Button -->
              <button
                @click="copyReport"
                class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Copy report to clipboard"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <!-- Download as PDF Button -->
              <button
                @click="downloadPDF"
                class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Download as PDF"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <!-- Download as Text Button -->
              <button
                @click="downloadReport"
                class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Download as text file"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <!-- Close Button -->
              <button
                @click="closeModal"
                class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Report Content -->
        <div class="flex-1 overflow-y-auto p-4 bg-ontop-navy-light/30">
          <!-- Executive Summary -->
          <div class="mb-4">
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center mr-2">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-white">Executive Summary</h4>
            </div>
            <div class="grid grid-cols-4 gap-3 mb-4">
              <div class="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/30">
                <div class="text-2xl font-bold text-blue-400">{{ reportData.summary.total }}</div>
                <div class="text-xs font-medium text-white">Total Feedback</div>
              </div>
              <div class="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/30">
                <div class="text-2xl font-bold text-green-400">{{ reportData.summary.positive }}</div>
                <div class="text-xs font-medium text-white">Positive ({{ reportData.summary.positivePercent }}%)</div>
              </div>
              <div class="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/30">
                <div class="text-2xl font-bold text-yellow-400">{{ reportData.summary.neutral }}</div>
                <div class="text-xs font-medium text-white">Neutral ({{ reportData.summary.neutralPercent }}%)</div>
              </div>
              <div class="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/30">
                <div class="text-2xl font-bold text-red-400">{{ reportData.summary.negative }}</div>
                <div class="text-xs font-medium text-white">Negative ({{ reportData.summary.negativePercent }}%)</div>
              </div>
            </div>
          </div>

          <!-- Account Manager Performance -->
          <div class="mb-4" v-if="reportData.managers && reportData.managers.length > 0">
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 bg-purple-500 rounded flex items-center justify-center mr-2">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-white">Account Manager Performance</h4>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div v-for="manager in reportData.managers" :key="manager.name" class="bg-white/5 rounded-lg p-3 border border-white/10">
                <div class="flex items-center justify-between mb-2">
                  <h5 class="text-sm font-semibold text-white truncate">{{ manager.name }}</h5>
                  <span class="text-xs font-medium px-2 py-1 rounded-full"
                        :class="{
                          'bg-green-500/20 text-green-300': manager.positiveRate >= 70,
                          'bg-yellow-500/20 text-yellow-300': manager.positiveRate >= 50 && manager.positiveRate < 70,
                          'bg-red-500/20 text-red-300': manager.positiveRate < 50
                        }">
                    {{ manager.positiveRate }}%
                  </span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-xs">
                  <div class="bg-white/10 rounded p-1 text-center">
                    <div class="font-bold text-white">{{ manager.total }}</div>
                    <div class="text-white/70 text-xs">Total</div>
                  </div>
                  <div class="bg-green-500/20 rounded p-1 text-center">
                    <div class="font-bold text-green-400">{{ manager.positive }}</div>
                    <div class="text-green-300 text-xs">+</div>
                  </div>
                  <div class="bg-yellow-500/20 rounded p-1 text-center">
                    <div class="font-bold text-yellow-400">{{ manager.neutral }}</div>
                    <div class="text-yellow-300 text-xs">~</div>
                  </div>
                  <div class="bg-red-500/20 rounded p-1 text-center">
                    <div class="font-bold text-red-400">{{ manager.negative }}</div>
                    <div class="text-red-300 text-xs">-</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Accounts -->
          <div class="mb-4" v-if="reportData.topAccounts && reportData.topAccounts.length > 0">
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center mr-2">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-white">Top Accounts by Feedback Volume</h4>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div v-for="(account, index) in reportData.topAccounts.slice(0, 12)" :key="account.name" 
                   class="flex items-center bg-white/5 rounded-lg p-2 border border-white/10">
                <span class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
                  {{ index + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-white text-xs truncate">{{ account.name }}</div>
                  <div class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{{ account.count }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Insights -->
          <div class="mb-4">
            <div class="flex items-center mb-2">
              <div class="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-white">Key Insights & Recommendations</h4>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div v-for="insight in reportData.insights" :key="insight" 
                   class="flex items-start bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{{ insight }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-white/5 px-4 py-3">
          <div class="flex items-center justify-between">
            <p class="text-sm text-white">
              Generated on {{ new Date().toLocaleString() }}
            </p>
            <div class="flex space-x-3">
              <button
                @click="downloadPDF"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                @click="copyReport"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Report
              </button>
              <button
                @click="closeModal"
                class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <!-- Success Toast -->
        <div v-if="showCopySuccess" class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-60 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Report copied to clipboard!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  reportData: Object
})

const emit = defineEmits(['close'])

// PDF Generator composable
const { downloadReportPDF } = usePDFGenerator()

// Reactive data
const showCopySuccess = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

const copyReport = async () => {
  if (!props.reportData) return
  
  // Generate text version of the report for copying
  const textReport = generateTextReport(props.reportData)
  
  try {
    await navigator.clipboard.writeText(textReport)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy report:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = textReport
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 3000)
  }
}

const downloadPDF = () => {
  if (!props.reportData) return
  
  try {
    downloadReportPDF(props.reportData)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
  }
}

const downloadReport = () => {
  if (!props.reportData) return
  
  const textReport = generateTextReport(props.reportData)
  const blob = new Blob([textReport], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.reportData.type}-report-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const generateTextReport = (data) => {
  let report = `
═══════════════════════════════════════════════════════
${data.title}
═══════════════════════════════════════════════════════
Generated on: ${new Date().toLocaleString()}
Report Period: ${data.dateRange}

📊 EXECUTIVE SUMMARY
───────────────────────────────────────────────────────
Total Feedback Collected: ${data.summary.total}
Positive Sentiment: ${data.summary.positive} (${data.summary.positivePercent}%)
Neutral Sentiment: ${data.summary.neutral} (${data.summary.neutralPercent}%)
Negative Sentiment: ${data.summary.negative} (${data.summary.negativePercent}%)

👥 ACCOUNT MANAGER PERFORMANCE
───────────────────────────────────────────────────────`

  if (data.managers) {
    data.managers.forEach(manager => {
      report += `
${manager.name}: ${manager.total} feedback (${manager.positiveRate}% positive)
  • Positive: ${manager.positive}  • Neutral: ${manager.neutral}  • Negative: ${manager.negative}`
    })
  }

  report += `

🏢 TOP ACCOUNTS BY FEEDBACK VOLUME
───────────────────────────────────────────────────────`

  if (data.topAccounts) {
    data.topAccounts.forEach((account, index) => {
      report += `
${index + 1}. ${account.name}: ${account.count} feedback${account.count !== 1 ? 's' : ''}`
    })
  }

  report += `

📈 KEY INSIGHTS & RECOMMENDATIONS
───────────────────────────────────────────────────────`

  if (data.insights) {
    data.insights.forEach(insight => {
      report += `
• ${insight}`
    })
  }

  report += `

═══════════════════════════════════════════════════════
End of Report
═══════════════════════════════════════════════════════
`

  return report
}
</script>
