<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">
          Zendesk Tickets
        </h1>
            <p class="text-gray-400">Browse and analyze support tickets grouped by client</p>
            <div class="mt-2 flex items-center gap-2 text-sm flex-wrap">
              <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                External Tickets Only
              </span>
              <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Last 3 Months
              </span>
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Has Client ID
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-white/80">Supabase Connected</span>
            </div>

            <button
              @click="loadTickets"
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
              {{ loading ? 'Loading...' : 'Refresh Tickets' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Total Tickets</p>
              <p class="text-3xl font-bold text-white">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Unique Clients</p>
              <p class="text-3xl font-bold text-white">{{ stats.uniqueClients }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Positive</p>
              <p class="text-3xl font-bold text-green-400">{{ stats.positive }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0 }}%</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Neutral</p>
              <p class="text-3xl font-bold text-yellow-400">{{ stats.neutral }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.neutral / stats.total) * 100) : 0 }}%</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Negative</p>
              <p class="text-3xl font-bold text-red-400">{{ stats.negative }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.negative / stats.total) * 100) : 0 }}%</p>
            </div>
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-red-400 font-semibold mb-1">{{ error.title || 'Error' }}</h3>
            <p class="text-red-300 text-sm">{{ error.message }}</p>
          </div>
          <button
            @click="clearError"
            class="text-red-400 hover:text-red-300"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="relative">
            <label class="block text-sm text-gray-400 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search tickets, client ID..."
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <svg class="absolute right-3 top-10 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Sentiment Filter -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Sentiment</label>
            <select
              v-model="filters.sentiment"
              class="w-full px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <!-- External/Internal Filter -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Ticket Type</label>
            <select
              v-model="filters.isExternal"
              class="w-full px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm"
            >
              <option value="">All Tickets</option>
              <option value="true">External</option>
              <option value="false">Internal</option>
            </select>
          </div>

          <!-- Group By -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Group By</label>
            <select
              v-model="groupBy"
              class="w-full px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm"
            >
              <option value="none">No Grouping</option>
              <option value="client">By Client</option>
              <option value="sentiment">By Sentiment</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Date Range</label>
            <select
              v-model="filters.dateRange"
              class="w-full px-4 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-400">
            Showing {{ filteredTickets.length }} of {{ tickets.length }} loaded tickets ({{ totalTickets }} total)
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Tickets List -->
      <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Tickets {{ groupBy !== 'none' ? `(Grouped by ${groupBy})` : '' }} ({{ filteredTickets.length }})
          </h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          <p class="text-gray-400 mt-2">Loading tickets...</p>
          <p v-if="tickets.length > 0" class="text-gray-500 text-sm mt-1">Loaded {{ tickets.length }} tickets so far...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTickets.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-gray-400 mb-2">{{ tickets.length === 0 ? 'No tickets found' : 'No tickets match your filters' }}</p>
          <p class="text-gray-500 text-sm">{{ tickets.length === 0 ? 'Tickets will appear here once they are synced to Supabase' : 'Try adjusting your search criteria' }}</p>
        </div>

        <!-- Tickets Grid (No Grouping) -->
        <div v-else-if="groupBy === 'none'" class="space-y-4">
          <div
            v-for="ticket in paginatedTickets"
            :key="ticket.ticket_id"
            class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer"
            @click="viewTicket(ticket)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <span class="text-lg font-semibold text-white">
                    Ticket #{{ ticket.ticket_id }}
                  </span>
                  
                  <!-- Sentiment Badge -->
                  <span 
                    v-if="ticket.overall_sentiment"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getSentimentClass(ticket.overall_sentiment)"
                  >
                    {{ getSentimentIcon(ticket.overall_sentiment) }} {{ ticket.overall_sentiment }}
                  </span>
                  
                  <!-- External/Internal Badge -->
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="ticket.is_external ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-700 text-gray-300'"
                  >
                    {{ ticket.is_external ? '🌐 External' : '🏠 Internal' }}
                  </span>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client: {{ ticket.client_id || 'N/A' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {{ ticket.conversation?.length || 0 }} messages
                  </span>
                  <span v-if="ticket.created_at" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(ticket.created_at) }}
                  </span>
                </div>
                
                <div v-if="ticket.sentiment_score !== null && ticket.sentiment_score !== undefined" class="flex items-center gap-2 text-sm">
                  <span class="text-gray-400">Score:</span>
                  <div class="flex-1 max-w-xs">
                    <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full transition-all duration-300"
                        :class="getSentimentScoreColor(ticket.sentiment_score)"
                        :style="{ width: `${Math.abs(ticket.sentiment_score) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <span class="text-gray-300 font-medium">{{ (ticket.sentiment_score * 100).toFixed(0) }}%</span>
              </div>
              </div>

              <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="filteredTickets.length > itemsPerPage" class="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
            <div class="text-sm text-gray-400">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTickets.length) }} of {{ filteredTickets.length }}
            </div>
            <div class="flex gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage * itemsPerPage >= filteredTickets.length"
                class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreTickets && !hasActiveFilters" class="flex flex-col items-center gap-3 mt-6 pt-6 border-t border-gray-700">
            <div class="text-sm text-gray-400">
              Loaded {{ tickets.length }} of {{ totalTickets }} total tickets
            </div>
            <button
              @click="loadMoreTickets"
              :disabled="loadingMore"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <svg v-if="loadingMore" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loadingMore ? 'Loading...' : 'Load More Tickets' }}</span>
            </button>
          </div>
        </div>

        <!-- Tickets Grid (Grouped) -->
        <div v-else class="space-y-6">
          <div
            v-for="(group, groupKey) in groupedTickets"
            :key="groupKey"
            class="bg-gray-800/30 rounded-lg p-6 border border-gray-700"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ groupKey }}
              </h3>
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                {{ group.length }} tickets
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="ticket in group"
                :key="ticket.ticket_id"
                class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer"
                @click="viewTicket(ticket)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2 flex-wrap">
                      <span class="text-lg font-semibold text-white">
                        Ticket #{{ ticket.ticket_id }}
                      </span>
                      
                      <!-- Sentiment Badge -->
                      <span
                        v-if="ticket.overall_sentiment"
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getSentimentClass(ticket.overall_sentiment)"
                      >
                        {{ getSentimentIcon(ticket.overall_sentiment) }} {{ ticket.overall_sentiment }}
                      </span>
                      
                      <!-- External/Internal Badge -->
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="ticket.is_external ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-700 text-gray-300'"
                      >
                        {{ ticket.is_external ? '🌐 External' : '🏠 Internal' }}
                      </span>
                    </div>

                    <div class="flex items-center gap-4 text-sm text-gray-400">
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {{ ticket.conversation?.length || 0 }} messages
                      </span>
                      <span v-if="ticket.created_at">
                        {{ formatDate(ticket.created_at) }}
                      </span>
                    </div>
                  </div>

                  <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Ticket Detail Modal -->
      <div
        v-if="selectedTicket"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="selectedTicket = null"
      >
      <div class="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-ontop-coral-600/20 to-ontop-pink-600/20 border-b border-gray-700 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="bg-gradient-cta rounded-lg p-3">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            <div>
              <h2 class="text-2xl font-bold text-white">Ticket #{{ selectedTicket.ticket_id }}</h2>
                <p class="text-gray-400 text-sm">Client: {{ selectedTicket.client_id || 'N/A' }}</p>
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

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <!-- Metadata Section -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Sentiment</p>
              <p class="text-white font-semibold flex items-center gap-2">
                <span
                  v-if="selectedTicket.overall_sentiment"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getSentimentClass(selectedTicket.overall_sentiment)"
                >
                  {{ getSentimentIcon(selectedTicket.overall_sentiment) }} {{ selectedTicket.overall_sentiment }}
                </span>
                <span v-else class="text-gray-500">Not analyzed</span>
              </p>
            </div>

            <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Sentiment Score</p>
              <p class="text-white font-semibold">
                {{ selectedTicket.sentiment_score !== null && selectedTicket.sentiment_score !== undefined 
                  ? (selectedTicket.sentiment_score * 100).toFixed(0) + '%' 
                  : 'N/A' }}
              </p>
            </div>

            <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Type</p>
              <p class="text-white font-semibold">
                {{ selectedTicket.is_external ? '🌐 External' : '🏠 Internal' }}
              </p>
            </div>

            <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-sm mb-1">Created</p>
              <p class="text-white font-semibold">
                {{ selectedTicket.created_at ? formatDate(selectedTicket.created_at) : 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Issue Category -->
          <div v-if="selectedTicket.issue_category" class="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
            <p class="text-gray-400 text-sm mb-1">Issue Category</p>
            <p class="text-white font-semibold capitalize">{{ selectedTicket.issue_category }}</p>
          </div>

          <!-- Conversation -->
          <div v-if="selectedTicket.conversation && selectedTicket.conversation.length > 0" class="mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Conversation ({{ selectedTicket.conversation.length }} messages)
            </h3>
            <div class="space-y-3">
              <div
                v-for="(message, index) in selectedTicket.conversation"
                :key="index"
                class="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <span class="text-white font-medium">{{ message.author_name || 'Unknown' }}</span>
                    <span 
                      class="ml-2 px-2 py-1 text-xs rounded-full"
                      :class="message.author_type === 'end-user' ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-700 text-gray-300'"
                    >
                      {{ message.author_type || 'unknown' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-400">
                    {{ message.timestamp ? formatDate(message.timestamp) : '' }}
                  </span>
                </div>
                <p class="text-gray-300 text-sm whitespace-pre-wrap">{{ message.message_text || message.body }}</p>
              </div>
            </div>
          </div>

          <!-- Sentiment Scores (per message) -->
          <div v-if="selectedTicket.sentiment_scores && selectedTicket.sentiment_scores.length > 0" class="mb-6">
            <h3 class="text-lg font-bold text-white mb-4">Message Sentiment Analysis</h3>
            <div class="space-y-2">
              <div
                v-for="(score, index) in selectedTicket.sentiment_scores"
                :key="index"
                class="bg-gray-800/30 rounded-lg p-3 border border-gray-700"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-400">{{ score.author_name || 'Unknown' }}</span>
                  <span
                    v-if="score.sentiment && score.sentiment.label"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getSentimentClass(score.sentiment.label)"
                  >
                    {{ score.sentiment.label }}
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-400">
                    N/A
                  </span>
              </div>
                <p class="text-xs text-gray-500 mt-1 truncate">{{ score.message_text }}</p>
            </div>
          </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-800/50 border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            @click="selectedTicket = null"
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
// Page metadata
useHead({
  title: 'Zendesk Tickets - Ontop Analytics',
  meta: [
    { name: 'description', content: 'Browse and analyze support tickets grouped by client with sentiment insights' }
  ]
})

definePageMeta({
  ssr: false // Disable SSR to prevent slow builds and allow client-side data fetching
})

const { supabase } = useSupabase()

// State
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<{ title: string; message: string } | null>(null)
const tickets = ref<any[]>([])
const selectedTicket = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = 20
const groupBy = ref('none') // 'none', 'client', 'sentiment'
const currentOffset = ref(0)
const hasMoreTickets = ref(true)
const totalTickets = ref(0)
const statsData = ref({
  uniqueClients: 0,
  positive: 0,
  neutral: 0,
  negative: 0
})

// Filters
const filters = ref({
  search: '',
  sentiment: '',
  isExternal: '',
  dateRange: 'all'
})

// Computed
const stats = computed(() => {
  const total = totalTickets.value // Use database total
  const uniqueClients = statsData.value.uniqueClients // Use database count
  const positive = statsData.value.positive // Use database count
  const neutral = statsData.value.neutral // Use database count
  const negative = statsData.value.negative // Use database count

  return { total, uniqueClients, positive, neutral, negative }
})

const filteredTickets = computed(() => {
  let result = tickets.value

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(ticket =>
      ticket.ticket_id?.toString().includes(search) ||
      ticket.client_id?.toLowerCase().includes(search) ||
      ticket.issue_category?.toLowerCase().includes(search)
    )
  }

  // Sentiment filter
  if (filters.value.sentiment) {
    result = result.filter(ticket => ticket.overall_sentiment === filters.value.sentiment)
  }

  // External/Internal filter
  if (filters.value.isExternal !== '') {
    const isExternal = filters.value.isExternal === 'true'
    result = result.filter(ticket => ticket.is_external === isExternal)
  }

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    const days = parseInt(filters.value.dateRange)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    result = result.filter(ticket => {
      if (!ticket.created_at) return false
      return new Date(ticket.created_at) >= cutoff
    })
  }

  return result
})

const groupedTickets = computed(() => {
  if (groupBy.value === 'none') return {}

  const groups: Record<string, any[]> = {}
  
  filteredTickets.value.forEach(ticket => {
    let key = ''
    if (groupBy.value === 'client') {
      key = ticket.client_id || 'No Client ID'
    } else if (groupBy.value === 'sentiment') {
      key = ticket.overall_sentiment || 'Not Analyzed'
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(ticket)
  })

  return groups
})

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTickets.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
    filters.value.sentiment !== '' ||
    filters.value.isExternal !== '' ||
    filters.value.dateRange !== 'all'
})

// Methods
const loadTickets = async () => {
  loading.value = true
  error.value = null
  currentOffset.value = 0
  hasMoreTickets.value = true

  try {
    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    // Fetch first batch of tickets (50 at a time for faster initial load)
    // Filters: External only (is_external = true), last 3 months, with client_id
    const pageSize = 50
    const { data, error: fetchError } = await supabase
      .from('zendesk_conversations')
      .select('*')
      .eq('is_external', true)
      .not('client_id', 'is', null)
      .gte('created_at', threeMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .range(0, pageSize - 1)

    if (fetchError) throw fetchError

    tickets.value = data || []
    currentOffset.value = data?.length || 0
    hasMoreTickets.value = (data?.length || 0) >= pageSize

    console.log(`✅ Loaded ${tickets.value.length} tickets from database (external, last 3 months, with client_id)`)
    
    // Load total count for stats
    await loadTotalCount()
  } catch (err: any) {
    console.error('Error loading tickets:', err)
    error.value = {
      title: 'Failed to load tickets',
      message: err.message || 'An unknown error occurred'
    }
  } finally {
    loading.value = false
  }
}

const loadMoreTickets = async () => {
  if (!hasMoreTickets.value || loadingMore.value) return
  
  loadingMore.value = true
  
  try {
    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const pageSize = 50
    const { data, error: fetchError } = await supabase
      .from('zendesk_conversations')
      .select('*')
      .eq('is_external', true)
      .not('client_id', 'is', null)
      .gte('created_at', threeMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
      .range(currentOffset.value, currentOffset.value + pageSize - 1)

    if (fetchError) throw fetchError

    if (data && data.length > 0) {
      tickets.value.push(...data)
      currentOffset.value += data.length
      hasMoreTickets.value = data.length >= pageSize
      console.log(`✅ Loaded ${data.length} more tickets. Total: ${tickets.value.length}`)
    } else {
      hasMoreTickets.value = false
    }
  } catch (err: any) {
    console.error('Error loading more tickets:', err)
    error.value = {
      title: 'Failed to load more tickets',
      message: err.message || 'An unknown error occurred'
    }
  } finally {
    loadingMore.value = false
  }
}

const loadTotalCount = async () => {
  try {
    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('zendesk_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('is_external', true)
      .not('client_id', 'is', null)
      .gte('created_at', threeMonthsAgo.toISOString())

    if (countError) throw countError
    totalTickets.value = count || 0
    
    // Get all tickets with sentiment data for stats (we need client_id and sentiment)
    const { data: allTickets, error: statsError } = await supabase
      .from('zendesk_conversations')
      .select('client_id, overall_sentiment')
      .eq('is_external', true)
      .not('client_id', 'is', null)
      .gte('created_at', threeMonthsAgo.toISOString())

    if (statsError) throw statsError
    
    // Calculate stats from all tickets
    const uniqueClients = new Set(allTickets?.map(t => t.client_id).filter(Boolean)).size
    const positive = allTickets?.filter(t => t.overall_sentiment === 'positive').length || 0
    const neutral = allTickets?.filter(t => t.overall_sentiment === 'neutral').length || 0
    const negative = allTickets?.filter(t => t.overall_sentiment === 'negative').length || 0
    
    statsData.value = {
      uniqueClients,
      positive,
      neutral,
      negative
    }
    
    console.log(`✅ Zendesk Stats loaded:`, {
      totalTickets: totalTickets.value,
      uniqueClients,
      positive,
      neutral,
      negative,
      allTicketsCount: allTickets?.length || 0
    })
  } catch (err) {
    console.error('Error loading total count:', err)
  }
}

const viewTicket = (ticket: any) => {
  selectedTicket.value = ticket
}

const clearError = () => {
  error.value = null
}

const clearFilters = () => {
  filters.value = {
    search: '',
    sentiment: '',
    isExternal: '',
    dateRange: 'all'
  }
  currentPage.value = 1
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getSentimentClass = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return 'bg-green-900/30 text-green-300'
    case 'negative':
      return 'bg-red-900/30 text-red-300'
    case 'neutral':
      return 'bg-yellow-900/30 text-yellow-300'
    case 'mixed':
      return 'bg-purple-900/30 text-purple-300'
    default:
      return 'bg-gray-700 text-gray-300'
  }
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return '😊'
    case 'negative':
      return '😞'
    case 'neutral':
      return '😐'
    case 'mixed':
      return '🤔'
    default:
      return '❓'
  }
}

const getSentimentScoreColor = (score: number) => {
  if (score > 0.5) return 'bg-green-500'
  if (score > 0) return 'bg-green-400'
  if (score > -0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Watchers
watch([filters, groupBy], () => {
  currentPage.value = 1
}, { deep: true })

// Load tickets on mount
onMounted(() => {
  loadTickets()
})
</script>
