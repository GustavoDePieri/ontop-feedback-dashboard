<template>
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-gradient-to-br from-ontop-navy-dark to-ontop-navy rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl animate-slide-up">
      <!-- Modal Header - Compact -->
      <div class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10 p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-ontop rounded-lg flex items-center justify-center shadow-lg">
              <span class="text-lg font-bold text-white">{{ getInitials(client.client_name) }}</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white mb-0.5">{{ client.client_name }}</h2>
              <p class="text-gray-400 text-sm">{{ client.client_id }}</p>
              <div v-if="enrichment?.overall_sentiment" class="flex items-center gap-2 mt-1">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="getSentimentClass(enrichment.overall_sentiment)"
                >
                  {{ getSentimentIcon(enrichment.overall_sentiment) }} {{ enrichment.overall_sentiment }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Quick Stats - Compact -->
        <div class="grid grid-cols-4 gap-2 mt-3">
          <div class="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
            <p class="text-gray-400 text-xs mb-0.5">Tickets</p>
            <p class="text-lg font-bold text-white">{{ details?.tickets?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
            <p class="text-gray-400 text-xs mb-0.5">Transcripts</p>
            <p class="text-lg font-bold text-white">{{ details?.transcripts?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
            <p class="text-gray-400 text-xs mb-0.5">Pain Points</p>
            <p class="text-lg font-bold text-white">{{ enrichment?.pain_points?.length || 0 }}</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20">
            <p class="text-gray-400 text-xs mb-0.5">Churn Signals</p>
            <p class="text-lg font-bold text-white">{{ enrichment?.churn_signals?.length || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Modal Body - Compact -->
      <div class="overflow-y-auto max-h-[calc(90vh-200px)] p-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <p class="text-gray-400 mt-4">Loading client details...</p>
        </div>

        <template v-else>
          <!-- AI Enrichment Section - Compact -->
          <div v-if="enrichment && enrichment.enrichment_status === 'completed'" class="mb-4">
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded p-1.5">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                AI Insights
              </h3>
              <div class="flex items-center gap-2">
                <span v-if="isEnrichmentOutdated" class="px-2 py-0.5 text-xs font-medium rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {{ newItemsCount }} new item{{ newItemsCount > 1 ? 's' : '' }}
                </span>
                <span class="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-300 border border-green-500/30">
                  ✓ {{ formatDate(enrichment.enriched_at) }}
                </span>
                <button
                  v-if="isEnrichmentOutdated"
                  @click="reEnrichClient"
                  :disabled="enriching"
                  class="px-3 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 transition-all flex items-center gap-1"
                  title="Re-analyze with new data"
                >
                  <svg v-if="!enriching" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <svg v-else class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ enriching ? 'Re-enriching...' : 'Re-enrich' }}
                </button>
              </div>
            </div>
            
            <!-- Enrichment Data Info -->
            <div v-if="isEnrichmentOutdated" class="mb-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-200">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold">Enrichment was based on:</p>
                  <p>{{ enrichment.total_tickets || 0 }} tickets, {{ enrichment.total_transcripts || 0 }} transcripts</p>
                  <p class="mt-1">Currently: {{ details?.tickets?.length || 0 }} tickets (+{{ newTickets }}), {{ details?.transcripts?.length || 0 }} transcripts (+{{ newTranscripts }})</p>
                </div>
              </div>
            </div>

            <!-- Conclusion - Compact -->
            <div class="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/30 rounded-lg p-3 mb-3">
              <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Overall Analysis
              </h4>
              <p class="text-gray-300 text-sm leading-relaxed">{{ enrichment.conclusion }}</p>
            </div>

            <!-- Recommended Actions - Compact -->
            <div class="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border border-blue-500/30 rounded-lg p-3 mb-3">
              <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Recommended Actions
              </h4>
              <p class="text-gray-300 text-sm leading-relaxed">{{ enrichment.recommended_action }}</p>
            </div>

            <!-- Payment Issues Section - NEW -->
            <div v-if="details?.payment_issues && details.payment_issues.count > 0" class="mb-3">
              <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Problems
                <span class="ml-auto px-2 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-300">
                  {{ details.payment_issues.negative_count }} negative
                </span>
              </h4>
              <div class="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                <div class="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div>
                    <p class="text-xs text-gray-400 mb-1">Total Issues</p>
                    <p class="text-lg font-bold text-white">{{ details.payment_issues.count }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 mb-1">Negative</p>
                    <p class="text-lg font-bold text-red-300">{{ details.payment_issues.negative_count }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 mb-1">Avg Sentiment</p>
                    <p class="text-lg font-bold" :class="details.payment_issues.avg_sentiment < -0.1 ? 'text-red-300' : 'text-yellow-300'">
                      {{ details.payment_issues.avg_sentiment.toFixed(2) }}
                    </p>
                  </div>
                </div>
                
                <div v-if="details.payment_issues.main_complaints && details.payment_issues.main_complaints.length > 0">
                  <p class="text-xs font-semibold text-white mb-2">Main Complaints (click to view):</p>
                  <div class="space-y-2">
                    <button
                      v-for="(complaint, index) in details.payment_issues.main_complaints"
                      :key="index"
                      @click="scrollToItem(complaint)"
                      class="w-full bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 rounded p-2 transition-all cursor-pointer text-left group"
                    >
                      <div class="flex items-start justify-between gap-2 mb-1">
                        <p class="text-xs font-medium text-white flex-1 group-hover:text-emerald-300 transition-colors">{{ complaint.subject }}</p>
                        <span
                          class="px-1.5 py-0.5 text-xs font-bold rounded flex-shrink-0"
                          :class="complaint.sentiment < -0.3 ? 'bg-red-500/30 text-red-300' : 'bg-yellow-500/30 text-yellow-300'"
                        >
                          {{ complaint.sentiment.toFixed(2) }}
                        </span>
                      </div>
                      <p v-if="complaint.preview" class="text-xs text-gray-400 mb-1 line-clamp-2">{{ complaint.preview }}...</p>
                      <div class="flex items-center gap-2 text-xs text-gray-400">
                        <span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">{{ complaint.type }}</span>
                        <span v-if="complaint.issue_category" class="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">{{ complaint.issue_category }}</span>
                        <span class="ml-auto">{{ formatDate(complaint.date) }}</span>
                        <svg class="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pain Points - Compact -->
            <div v-if="enrichment.pain_points && enrichment.pain_points.length > 0" class="mb-3">
              <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Pain Points
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  v-for="(pain, index) in enrichment.pain_points"
                  :key="index"
                  class="bg-gradient-to-br from-red-500/10 to-red-700/10 border border-red-500/30 rounded p-2"
                >
                  <div class="flex items-start justify-between mb-1 gap-2">
                    <span class="px-1.5 py-0.5 text-xs font-medium rounded bg-red-500/20 text-red-300">
                      {{ pain.category }}
                    </span>
                    <span
                      class="px-1.5 py-0.5 text-xs font-medium rounded"
                      :class="{
                        'bg-red-600/30 text-red-300': pain.severity === 'high',
                        'bg-orange-600/30 text-orange-300': pain.severity === 'medium',
                        'bg-yellow-600/30 text-yellow-300': pain.severity === 'low'
                      }"
                    >
                      {{ pain.severity }}
                    </span>
                  </div>
                  <p class="text-gray-300 text-xs mb-1">{{ pain.description }}</p>
                  <p class="text-xs text-gray-500">×{{ pain.frequency }}</p>
                </div>
              </div>
            </div>

            <!-- Churn Signals - Compact -->
            <div v-if="enrichment.churn_signals && enrichment.churn_signals.length > 0" class="mb-3">
              <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Churn Signals
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(signal, index) in enrichment.churn_signals"
                  :key="index"
                  class="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded p-2 flex items-start gap-2"
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="{
                      'bg-red-600/30': signal.risk_level === 'high',
                      'bg-orange-600/30': signal.risk_level === 'medium',
                      'bg-yellow-600/30': signal.risk_level === 'low'
                    }"
                  >
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="font-semibold text-white text-sm">{{ signal.signal }}</span>
                      <span
                        class="px-1.5 py-0.5 text-xs font-medium rounded"
                        :class="{
                          'bg-red-600/30 text-red-300': signal.risk_level === 'high',
                          'bg-orange-600/30 text-orange-300': signal.risk_level === 'medium',
                          'bg-yellow-600/30 text-yellow-300': signal.risk_level === 'low'
                        }"
                      >
                        {{ signal.risk_level }}
                      </span>
                    </div>
                    <p class="text-gray-300 text-xs">{{ signal.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Enrichment - Compact -->
          <div v-else-if="!enrichment || enrichment.enrichment_status === 'pending'" class="mb-4">
            <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
              <div class="w-12 h-12 bg-gradient-ontop rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white mb-2">AI Enrichment Available</h3>
              <p class="text-gray-400 text-sm mb-4">
                Generate AI insights: pain points, churn signals, and recommendations.
              </p>
              <button
                @click="enrichClient"
                :disabled="enriching"
                class="px-4 py-2 bg-gradient-cta text-white rounded-lg font-medium hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 mx-auto text-sm"
              >
                <svg v-if="!enriching" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ enriching ? 'Analyzing...' : 'Enrich with AI' }}
              </button>
            </div>
          </div>

          <!-- Tabs - Compact -->
          <div class="mb-3">
            <div class="border-b border-white/10">
              <nav class="flex gap-2">
                <button
                  @click="activeTab = 'tickets'"
                  class="pb-2 px-3 text-sm font-medium transition-colors"
                  :class="activeTab === 'tickets' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'"
                >
                  Tickets ({{ details?.tickets?.length || 0 }})
                </button>
                <button
                  @click="activeTab = 'transcripts'"
                  class="pb-2 px-3 text-sm font-medium transition-colors"
                  :class="activeTab === 'transcripts' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'"
                >
                  Transcripts ({{ details?.transcripts?.length || 0 }})
                </button>
              </nav>
            </div>
          </div>

          <!-- Tickets Tab - Compact -->
          <div v-if="activeTab === 'tickets'" class="space-y-2">
            <div
              v-for="ticket in details?.tickets"
              :key="ticket.ticket_id"
              :id="`ticket-${ticket.ticket_id}`"
              class="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer"
              @click="selectTicket(ticket)"
            >
              <div class="flex items-start justify-between mb-1.5">
                <div>
                  <span class="text-sm font-semibold text-white">Ticket #{{ ticket.ticket_id }}</span>
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
              
              <!-- Click to view indicator -->
              <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-center text-xs text-emerald-400">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Click to view full conversation
              </div>
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
              :id="`transcript-${transcript.id}`"
              class="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer"
              @click="selectTranscript(transcript)"
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
              
              <!-- Click to view indicator -->
              <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-center text-xs text-emerald-400">
                <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Click to view full transcript
              </div>
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

    <!-- Ticket Detail Modal (nested) -->
    <div
      v-if="selectedTicket"
      class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
      @click.self="selectedTicket = null"
    >
      <div class="bg-gradient-to-br from-ontop-navy-dark to-ontop-navy rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl animate-slide-up">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-white/10 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">Ticket #{{ selectedTicket.ticket_id }}</h3>
              <div class="flex items-center gap-3">
                <span
                  v-if="selectedTicket.overall_sentiment"
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="getSentimentClass(selectedTicket.overall_sentiment)"
                >
                  {{ getSentimentIcon(selectedTicket.overall_sentiment) }} {{ selectedTicket.overall_sentiment }}
                </span>
                <span class="text-sm text-gray-400">{{ formatDate(selectedTicket.created_at) }}</span>
                <span v-if="selectedTicket.issue_category" class="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">
                  {{ selectedTicket.issue_category }}
                </span>
              </div>
            </div>
            <button
              @click="selectedTicket = null"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Conversation -->
        <div class="overflow-y-auto max-h-[calc(80vh-180px)] p-6">

          <!-- If conversation is an array -->
          <div v-if="selectedTicket.conversation && Array.isArray(selectedTicket.conversation) && selectedTicket.conversation.length > 0" class="space-y-4">
            <div
              v-for="(message, index) in selectedTicket.conversation"
              :key="index"
              class="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <div class="flex items-start justify-between mb-2">
                <span class="font-semibold text-emerald-400">
                  {{ getMessageAuthor(message) }}
                </span>
                <span class="text-xs text-gray-500">{{ getMessageDate(message) }}</span>
              </div>
              <p class="text-gray-300 whitespace-pre-wrap">{{ getMessageContent(message) }}</p>
            </div>
          </div>


          <!-- No conversation -->
          <div v-else class="text-center py-8 text-gray-500">
            <p>No conversation messages available</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-ontop-navy-light/50 border-t border-white/10 p-4 flex justify-end">
          <button
            @click="selectedTicket = null"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Transcript Detail Modal (nested) -->
    <div
      v-if="selectedTranscript"
      class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
      @click.self="selectedTranscript = null"
    >
      <div class="bg-gradient-to-br from-ontop-navy-dark to-ontop-navy rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-white/10 shadow-2xl animate-slide-up">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">{{ selectedTranscript.source_name || 'Transcript' }}</h3>
              <div class="flex items-center gap-3">
                <span
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="selectedTranscript.transcript_type === 'meeting' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'"
                >
                  {{ selectedTranscript.transcript_type === 'meeting' ? '📅 Meeting' : '📞 Call' }}
                </span>
                <span class="text-sm text-gray-400">{{ formatDate(selectedTranscript.occurred_at) }}</span>
                <span v-if="selectedTranscript.sentiment" class="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">
                  {{ selectedTranscript.sentiment }}
                </span>
              </div>
            </div>
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Transcript Content -->
        <div class="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
          <!-- AI Analysis (if available) -->
          <div v-if="selectedTranscript.ai_analysis" class="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analysis
            </h4>
            <p class="text-gray-300 text-sm whitespace-pre-wrap">{{ selectedTranscript.ai_analysis }}</p>
          </div>

          <!-- Full Transcript -->
          <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h4 class="text-sm font-semibold text-gray-400 mb-4">Full Transcript</h4>
            <div class="prose prose-invert max-w-none">
              <p class="text-gray-300 whitespace-pre-wrap leading-relaxed">{{ selectedTranscript.transcript_text || 'No transcript text available' }}</p>
            </div>
          </div>

          <!-- Metadata -->
          <div v-if="selectedTranscript.duration_seconds || selectedTranscript.participant_count" class="mt-4 grid grid-cols-2 gap-4">
            <div v-if="selectedTranscript.duration_seconds" class="bg-white/5 rounded-lg p-3 border border-white/10">
              <p class="text-xs text-gray-500 mb-1">Duration</p>
              <p class="text-white font-semibold">{{ Math.floor(selectedTranscript.duration_seconds / 60) }} min {{ selectedTranscript.duration_seconds % 60 }} sec</p>
            </div>
            <div v-if="selectedTranscript.participant_count" class="bg-white/5 rounded-lg p-3 border border-white/10">
              <p class="text-xs text-gray-500 mb-1">Participants</p>
              <p class="text-white font-semibold">{{ selectedTranscript.participant_count }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-ontop-navy-light/50 border-t border-white/10 p-4 flex justify-end">
          <button
            @click="selectedTranscript = null"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
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
const selectedTicket = ref<any>(null)
const selectedTranscript = ref<any>(null)

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

const reEnrichClient = async () => {
  if (!confirm('Re-enrich this client with current data? This will update the AI analysis with new tickets and transcripts.')) {
    return
  }
  
  enriching.value = true
  try {
    const response = await fetch(`/api/clients/${props.client.client_id}/enrich?force=true`, {
      method: 'POST'
    })
    const data = await response.json()
    
    if (data.success) {
      enrichment.value = data.enrichment
      emit('enriched')
      alert('Client re-enriched successfully!')
    } else {
      alert('Failed to re-enrich client: ' + data.message)
    }
  } catch (error: any) {
    console.error('Error re-enriching client:', error)
    alert('Failed to re-enrich client: ' + error.message)
  } finally {
    enriching.value = false
  }
}

// Computed properties to check if enrichment is outdated
const newTickets = computed(() => {
  if (!enrichment.value || !details.value) return 0
  const current = details.value.tickets?.length || 0
  const atEnrichment = enrichment.value.total_tickets || 0
  return Math.max(0, current - atEnrichment)
})

const newTranscripts = computed(() => {
  if (!enrichment.value || !details.value) return 0
  const current = details.value.transcripts?.length || 0
  const atEnrichment = enrichment.value.total_transcripts || 0
  return Math.max(0, current - atEnrichment)
})

const newItemsCount = computed(() => {
  return newTickets.value + newTranscripts.value
})

const isEnrichmentOutdated = computed(() => {
  return newItemsCount.value > 0
})

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

const scrollToItem = (complaint: any) => {
  // Switch to the appropriate tab
  if (complaint.type === 'ticket') {
    activeTab.value = 'tickets'
  } else if (complaint.type === 'transcript') {
    activeTab.value = 'transcripts'
  }
  
  // Wait for tab to render, then scroll to the item
  nextTick(() => {
    const itemId = complaint.type === 'ticket' ? `ticket-${complaint.id}` : `transcript-${complaint.id}`
    const element = document.getElementById(itemId)
    
    if (element) {
      // Scroll into view with smooth behavior
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Highlight the item briefly
      element.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-500/10')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-500/10')
      }, 2000)
    } else {
      console.warn(`Item ${itemId} not found in DOM`)
    }
  })
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

const selectTicket = (ticket: any) => {
  selectedTicket.value = ticket
}

const selectTranscript = (transcript: any) => {
  selectedTranscript.value = transcript
}

// Helper functions to extract message data
const getMessageAuthor = (message: any) => {
  if (!message) return 'Unknown'
  return message.author || message.author_name || message.from || message.sender || message.user || 'Unknown'
}

const getMessageContent = (message: any) => {
  if (!message) return 'No content'
  
  // Try different possible field names for message content
  const content = message.message_text ||  // ← This is the correct field!
                  message.body || 
                  message.value || 
                  message.content || 
                  message.text || 
                  message.message || 
                  message.plain_body ||
                  message.html_body
  
  // If content is an object, try to extract text from it
  if (typeof content === 'object' && content !== null) {
    return content.text || content.body || content.value || JSON.stringify(content, null, 2)
  }
  
  return content || 'No content'
}

const getMessageDate = (message: any) => {
  if (!message) return ''
  const dateField = message.created_at || message.timestamp || message.date || message.sent_at
  return dateField ? formatDate(dateField) : ''
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
