<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div class="bg-gradient-ontop-hero rounded-xl p-3 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Unified Client View
            </h1>
            <p class="text-gray-400">Comprehensive client analysis with AI-powered insights</p>
          </div>
          
          <button
            @click="loadClients"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg v-if="!loading" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-purple-500/10 to-purple-700/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Total Clients</p>
              <p class="text-3xl font-bold text-white">{{ clients.length }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500/10 to-green-700/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">AI Enriched</p>
              <p class="text-3xl font-bold text-white">{{ enrichedCount }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ enrichmentPercentage }}% complete</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-500/10 to-orange-700/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Pending Enrichment</p>
              <p class="text-3xl font-bold text-white">{{ pendingCount }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-500/10 to-blue-700/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Avg Interactions</p>
              <p class="text-3xl font-bold text-white">{{ avgInteractions }}</p>
              <p class="text-xs text-gray-500 mt-1">per client</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="mb-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search clients..."
              class="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            v-model="filterEnrichment"
            class="px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400"
          >
            <option value="all">All Clients</option>
            <option value="completed">Enriched</option>
            <option value="pending">Pending Enrichment</option>
          </select>

          <select
            v-model="sortBy"
            class="px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400"
          >
            <option value="interactions">Most Interactions</option>
            <option value="name">Client Name</option>
            <option value="recent">Recently Enriched</option>
          </select>
        </div>
      </div>

      <!-- Clients Grid -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        <p class="text-gray-400 mt-4">Loading clients...</p>
      </div>

      <div v-else-if="filteredClients.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p class="text-gray-400">No clients found</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="client in filteredClients"
          :key="client.client_id"
          @click="selectClient(client)"
          class="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
        >
          <!-- Enrichment Status Badge -->
          <div class="absolute top-4 right-4">
            <span
              v-if="client.enrichment_status === 'completed'"
              class="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
            >
              ✓ Enriched
            </span>
            <span
              v-else-if="client.enrichment_status === 'processing'"
              class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1"
            >
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
            <span
              v-else
              class="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300"
            >
              Pending
            </span>
          </div>

          <!-- Client Icon -->
          <div class="flex items-start gap-4 mb-4">
            <div class="w-16 h-16 bg-gradient-ontop rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span class="text-2xl font-bold text-white">{{ getInitials(client.client_name) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-white mb-1 truncate">{{ client.client_name }}</h3>
              <p class="text-sm text-gray-400">{{ client.client_id }}</p>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-white/5 rounded-lg p-3 border border-white/10">
              <p class="text-xs text-gray-400 mb-1">Tickets</p>
              <p class="text-2xl font-bold text-white">{{ client.ticket_count }}</p>
            </div>
            <div class="bg-white/5 rounded-lg p-3 border border-white/10">
              <p class="text-xs text-gray-400 mb-1">Transcripts</p>
              <p class="text-2xl font-bold text-white">{{ client.transcript_count }}</p>
            </div>
          </div>

          <!-- Sentiment Badge -->
          <div v-if="client.overall_sentiment" class="flex items-center gap-2 mb-4">
            <span
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="getSentimentClass(client.overall_sentiment)"
            >
              {{ getSentimentIcon(client.overall_sentiment) }} {{ client.overall_sentiment }}
            </span>
            <div v-if="client.sentiment_score !== null" class="flex-1">
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300"
                  :class="getSentimentScoreColor(client.sentiment_score)"
                  :style="{ width: `${Math.abs(client.sentiment_score) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button class="w-full bg-gradient-cta text-white rounded-lg px-4 py-2 font-medium hover:bg-gradient-cta-hover transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      </div>

      <!-- Client Detail Modal -->
      <ClientDetailModal
        v-if="selectedClient"
        :client="selectedClient"
        @close="selectedClient = null"
        @enriched="handleEnriched"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ClientDetailModal from '~/components/ClientDetailModal.vue'

// State
const loading = ref(false)
const clients = ref<any[]>([])
const selectedClient = ref<any>(null)
const searchQuery = ref('')
const filterEnrichment = ref('all')
const sortBy = ref('interactions')

// Computed
const filteredClients = computed(() => {
  let filtered = clients.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c =>
      c.client_name.toLowerCase().includes(query) ||
      c.client_id.toLowerCase().includes(query)
    )
  }

  // Enrichment filter
  if (filterEnrichment.value !== 'all') {
    filtered = filtered.filter(c => c.enrichment_status === filterEnrichment.value)
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy.value === 'interactions') {
      const totalA = a.ticket_count + a.transcript_count
      const totalB = b.ticket_count + b.transcript_count
      return totalB - totalA
    } else if (sortBy.value === 'name') {
      return a.client_name.localeCompare(b.client_name)
    } else if (sortBy.value === 'recent') {
      if (!a.enriched_at) return 1
      if (!b.enriched_at) return -1
      return new Date(b.enriched_at).getTime() - new Date(a.enriched_at).getTime()
    }
    return 0
  })

  return filtered
})

const enrichedCount = computed(() => {
  return clients.value.filter(c => c.enrichment_status === 'completed').length
})

const pendingCount = computed(() => {
  return clients.value.filter(c => c.enrichment_status === 'pending').length
})

const enrichmentPercentage = computed(() => {
  if (clients.value.length === 0) return 0
  return Math.round((enrichedCount.value / clients.value.length) * 100)
})

const avgInteractions = computed(() => {
  if (clients.value.length === 0) return 0
  const total = clients.value.reduce((sum, c) => sum + c.ticket_count + c.transcript_count, 0)
  return Math.round(total / clients.value.length)
})

// Methods
const loadClients = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/clients/list')
    const data = await response.json()
    
    if (data.success) {
      clients.value = data.clients
    } else {
      console.error('Failed to load clients:', data.error)
    }
  } catch (error) {
    console.error('Error loading clients:', error)
  } finally {
    loading.value = false
  }
}

const selectClient = (client: any) => {
  selectedClient.value = client
}

const handleEnriched = () => {
  // Reload clients to get updated enrichment status
  loadClients()
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
      return 'bg-green-900/30 text-green-300 border border-green-500/30'
    case 'negative':
      return 'bg-red-900/30 text-red-300 border border-red-500/30'
    default:
      return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
  }
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return '😊'
    case 'negative': return '😞'
    default: return '😐'
  }
}

const getSentimentScoreColor = (score: number) => {
  if (score > 0.5) return 'bg-green-500'
  if (score > 0) return 'bg-green-400'
  if (score > -0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Load on mount
onMounted(() => {
  loadClients()
})
</script>
