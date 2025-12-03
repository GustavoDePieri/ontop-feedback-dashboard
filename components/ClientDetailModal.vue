<template>
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-gradient-to-br from-ontop-navy-dark to-ontop-navy rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl animate-slide-up">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10 p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-ontop rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-2xl font-bold text-white">{{ getInitials(client.client_name) }}</span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-white mb-1">{{ client.client_name }}</h2>
              <p class="text-gray-400">{{ client.client_id }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-if="enrichment?.overall_sentiment"
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="getSentimentClass(enrichment.overall_sentiment)"
                >
                  {{ getSentimentIcon(enrichment.overall_sentiment) }} {{ enrichment.overall_sentiment }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-4 gap-4 mt-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p class="text-gray-400 text-xs mb-1">Total Tickets</p>
            <p class="text-2xl font-bold text-white">{{ details?.tickets?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p class="text-gray-400 text-xs mb-1">Total Transcripts</p>
            <p class="text-2xl font-bold text-white">{{ details?.transcripts?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p class="text-gray-400 text-xs mb-1">Pain Points</p>
            <p class="text-2xl font-bold text-white">{{ enrichment?.pain_points?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p class="text-gray-400 text-xs mb-1">Churn Signals</p>
            <p class="text-2xl font-bold text-white">{{ enrichment?.churn_signals?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p class="text-gray-400 mt-4">Loading client details...</p>
        </div>

        <template v-else>
          <!-- AI Enrichment Section -->
          <div v-if="enrichment && enrichment.enrichment_status === 'completed'" class="mb-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                AI-Powered Insights
              </h3>
              <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                ✓ Enriched {{ formatDate(enrichment.enriched_at) }}
              </span>
            </div>

            <!-- Conclusion -->
            <div class="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/30 rounded-xl p-6 mb-6">
              <h4 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Overall Analysis
              </h4>
              <p class="text-gray-300 leading-relaxed">{{ enrichment.conclusion }}</p>
            </div>

            <!-- Recommended Actions -->
            <div class="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <h4 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Recommended Actions
              </h4>
              <p class="text-gray-300 leading-relaxed">{{ enrichment.recommended_action }}</p>
            </div>

            <!-- Pain Points -->
            <div v-if="enrichment.pain_points && enrichment.pain_points.length > 0" class="mb-6">
              <h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Pain Points
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(pain, index) in enrichment.pain_points"
                  :key="index"
                  class="bg-gradient-to-br from-red-500/10 to-red-700/10 border border-red-500/30 rounded-lg p-4"
                >
                  <div class="flex items-start justify-between mb-2">
                    <span class="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-300">
                      {{ pain.category }}
                    </span>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded"
                      :class="{
                        'bg-red-600/30 text-red-300': pain.severity === 'high',
                        'bg-orange-600/30 text-orange-300': pain.severity === 'medium',
                        'bg-yellow-600/30 text-yellow-300': pain.severity === 'low'
                      }"
                    >
                      {{ pain.severity }} severity
                    </span>
                  </div>
                  <p class="text-gray-300 text-sm mb-2">{{ pain.description }}</p>
                  <p class="text-xs text-gray-500">Frequency: {{ pain.frequency }} times</p>
                </div>
              </div>
            </div>

            <!-- Churn Signals -->
            <div v-if="enrichment.churn_signals && enrichment.churn_signals.length > 0" class="mb-6">
              <h4 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Churn Risk Signals
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(signal, index) in enrichment.churn_signals"
                  :key="index"
                  class="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 flex items-start gap-4"
                >
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="{
                      'bg-red-600/30': signal.risk_level === 'high',
                      'bg-orange-600/30': signal.risk_level === 'medium',
                      'bg-yellow-600/30': signal.risk_level === 'low'
                    }"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="font-semibold text-white">{{ signal.signal }}</span>
                      <span
                        class="px-2 py-1 text-xs font-medium rounded"
                        :class="{
                          'bg-red-600/30 text-red-300': signal.risk_level === 'high',
                          'bg-orange-600/30 text-orange-300': signal.risk_level === 'medium',
                          'bg-yellow-600/30 text-yellow-300': signal.risk_level === 'low'
                        }"
                      >
                        {{ signal.risk_level }} risk
                      </span>
                    </div>
                    <p class="text-gray-300 text-sm">{{ signal.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Enrichment - Show Enrich Button -->
          <div v-else-if="!enrichment || enrichment.enrichment_status === 'pending'" class="mb-8">
            <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8 text-center">
              <div class="w-20 h-20 bg-gradient-ontop rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-2">AI Enrichment Available</h3>
              <p class="text-gray-400 mb-6">
                Generate AI-powered insights including pain points, churn signals, and recommended actions for this client.
              </p>
              <button
                @click="enrichClient"
                :disabled="enriching"
                class="px-6 py-3 bg-gradient-cta text-white rounded-lg font-semibold hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <svg v-if="!enriching" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ enriching ? 'Analyzing with AI...' : 'Enrich with AI' }}
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6">
            <div class="border-b border-white/10">
              <nav class="flex gap-4">
                <button
                  @click="activeTab = 'tickets'"
                  class="pb-3 px-4 font-medium transition-colors"
                  :class="activeTab === 'tickets' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'"
                >
                  Tickets ({{ details?.tickets?.length || 0 }})
                </button>
                <button
                  @click="activeTab = 'transcripts'"
                  class="pb-3 px-4 font-medium transition-colors"
                  :class="activeTab === 'transcripts' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'"
                >
                  Transcripts ({{ details?.transcripts?.length || 0 }})
                </button>
              </nav>
            </div>
          </div>

          <!-- Tickets Tab -->
          <div v-if="activeTab === 'tickets'" class="space-y-4">
            <div
              v-for="ticket in details?.tickets"
              :key="ticket.ticket_id"
              class="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-emerald-500/50 transition-colors"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <span class="text-lg font-semibold text-white">Ticket #{{ ticket.ticket_id }}</span>
                  <span
                    v-if="ticket.overall_sentiment"
                    class="ml-3 px-2 py-1 text-xs font-medium rounded-full"
                    :class="getSentimentClass(ticket.overall_sentiment)"
                  >
                    {{ getSentimentIcon(ticket.overall_sentiment) }} {{ ticket.overall_sentiment }}
                  </span>
                </div>
                <span class="text-sm text-gray-400">{{ formatDate(ticket.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-400 mb-2">{{ ticket.conversation?.length || 0 }} messages</p>
              <p v-if="ticket.issue_category" class="text-sm text-gray-500">Category: {{ ticket.issue_category }}</p>
            </div>
            <div v-if="!details?.tickets || details.tickets.length === 0" class="text-center py-8 text-gray-500">
              No tickets found for this client
            </div>
          </div>

          <!-- Transcripts Tab -->
          <div v-if="activeTab === 'transcripts'" class="space-y-4">
            <div
              v-for="transcript in details?.transcripts"
              :key="transcript.id"
              class="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-emerald-500/50 transition-colors"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <span class="text-lg font-semibold text-white">{{ transcript.source_name || 'Transcript' }}</span>
                  <span
                    class="ml-3 px-2 py-1 text-xs font-medium rounded-full"
                    :class="transcript.transcript_type === 'meeting' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'"
                  >
                    {{ transcript.transcript_type === 'meeting' ? '📅 Meeting' : '📞 Call' }}
                  </span>
                </div>
                <span class="text-sm text-gray-400">{{ formatDate(transcript.occurred_at) }}</span>
              </div>
              <p class="text-sm text-gray-400">
                {{ transcript.transcript_text?.substring(0, 200) }}{{ transcript.transcript_text?.length > 200 ? '...' : '' }}
              </p>
            </div>
            <div v-if="!details?.transcripts || details.transcripts.length === 0" class="text-center py-8 text-gray-500">
              No transcripts found for this client
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Footer -->
      <div class="bg-ontop-navy-light/50 border-t border-white/10 p-4 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  client: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'enriched'): void
}>()

// State
const loading = ref(true)
const enriching = ref(false)
const details = ref<any>(null)
const enrichment = ref<any>(null)
const activeTab = ref('tickets')

// Methods
const loadDetails = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/clients/${props.client.client_id}/details`)
    const data = await response.json()
    
    if (data.success) {
      details.value = data
      enrichment.value = data.enrichment
    }
  } catch (error) {
    console.error('Error loading client details:', error)
  } finally {
    loading.value = false
  }
}

const enrichClient = async () => {
  enriching.value = true
  try {
    const response = await fetch(`/api/clients/${props.client.client_id}/enrich`, {
      method: 'POST'
    })
    const data = await response.json()
    
    if (data.success) {
      enrichment.value = data.enrichment
      emit('enriched')
    } else {
      alert('Failed to enrich client: ' + data.message)
    }
  } catch (error: any) {
    console.error('Error enriching client:', error)
    alert('Failed to enrich client: ' + error.message)
  } finally {
    enriching.value = false
  }
}

const getInitials = (name: string) => {
  if (!name) return '??'
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getSentimentClass = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return 'bg-green-900/30 text-green-300'
    case 'negative':
      return 'bg-red-900/30 text-red-300'
    default:
      return 'bg-yellow-900/30 text-yellow-300'
  }
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return '😊'
    case 'negative': return '😞'
    default: return '😐'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load details on mount
onMounted(() => {
  loadDetails()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
