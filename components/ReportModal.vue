<template>
  <!-- Modal Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">
            Generate Report
          </h3>
          <p class="text-gray-600 mb-6">
            Create comprehensive analytics reports for your team meetings and presentations
          </p>
        </div>

        <!-- Report Options -->
        <div class="space-y-4 mb-6">
          <!-- Weekly Report Option -->
          <div
            @click="selectReportType('weekly')"
            class="relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
            :class="{
              'border-blue-500 bg-blue-50': selectedType === 'weekly',
              'border-gray-200 hover:border-blue-300': selectedType !== 'weekly'
            }"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                     :class="selectedType === 'weekly' ? 'bg-blue-500' : 'bg-gray-100'">
                  <svg class="w-6 h-6" :class="selectedType === 'weekly' ? 'text-white' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h4 class="text-lg font-semibold text-gray-900">Weekly Report</h4>
                <p class="text-sm text-gray-600">{{ weeklyDateRange }}</p>
                <p class="text-xs text-gray-500 mt-1">Perfect for weekly team meetings</p>
              </div>
              <div v-if="selectedType === 'weekly'" class="flex-shrink-0">
                <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Report Option -->
          <div
            @click="selectReportType('monthly')"
            class="relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg"
            :class="{
              'border-purple-500 bg-purple-50': selectedType === 'monthly',
              'border-gray-200 hover:border-purple-300': selectedType !== 'monthly'
            }"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                     :class="selectedType === 'monthly' ? 'bg-purple-500' : 'bg-gray-100'">
                  <svg class="w-6 h-6" :class="selectedType === 'monthly' ? 'text-white' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h4 class="text-lg font-semibold text-gray-900">Monthly Report</h4>
                <p class="text-sm text-gray-600">{{ monthlyDateRange }}</p>
                <p class="text-xs text-gray-500 mt-1">Comprehensive monthly analysis</p>
              </div>
              <div v-if="selectedType === 'monthly'" class="flex-shrink-0">
                <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Preview -->
        <div v-if="selectedType" class="bg-gray-50 rounded-xl p-4 mb-6">
          <h5 class="font-medium text-gray-900 mb-2">Report will include:</h5>
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Executive Summary
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Sentiment Analysis
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Manager Performance
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Top Accounts
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Action Items
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Key Insights
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="closeModal"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="generateReport"
            :disabled="!selectedType || isGenerating"
            class="flex-1 font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg': selectedType === 'weekly',
              'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg': selectedType === 'monthly',
              'bg-gray-300 text-gray-500': !selectedType
            }"
          >
            <span v-if="!isGenerating" class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate & Download
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="showSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-green-800 font-medium">Report generated successfully!</span>
          </div>
          <p class="text-green-700 text-sm mt-1">Your {{ selectedType }} report has been downloaded.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  feedbackData: Array
})

const emit = defineEmits(['close', 'generate'])

// Reactive data
const selectedType = ref(null)
const isGenerating = ref(false)
const showSuccess = ref(false)

// Computed properties
const weeklyDateRange = computed(() => {
  const now = new Date()
  const currentDay = now.getDay()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - currentDay)
  
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
})

const monthlyDateRange = computed(() => {
  const now = new Date()
  return now.toLocaleString('default', { month: 'long', year: 'numeric' })
})

// Methods
const selectReportType = (type) => {
  selectedType.value = type
  showSuccess.value = false
}

const closeModal = () => {
  selectedType.value = null
  isGenerating.value = false
  showSuccess.value = false
  emit('close')
}

const generateReport = async () => {
  if (!selectedType.value) return
  
  isGenerating.value = true
  showSuccess.value = false
  
  try {
    // Emit to parent component to handle the actual generation
    await emit('generate', selectedType.value)
    
    // Show success message
    showSuccess.value = true
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeModal()
    }, 3000)
    
  } catch (error) {
    console.error('Report generation failed:', error)
  } finally {
    isGenerating.value = false
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Watch for modal open/close to reset state
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    selectedType.value = null
    isGenerating.value = false
    showSuccess.value = false
  }
})
</script>
