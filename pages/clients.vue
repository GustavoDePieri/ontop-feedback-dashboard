<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Home Button (Top Left) -->
      <div class="mb-6">
        <NuxtLink 
          to="/"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 group"
        >
          <svg class="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Home</span>
        </NuxtLink>
      </div>

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
              Clients (Tickets + Transcripts)
            </h1>
            <p class="text-gray-400">Comprehensive client analysis with AI-powered insights</p>
            <div class="mt-2 flex items-center gap-2 text-sm">
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
          
          <button
            @click="loadClients"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            aria-label="Refresh client list"
          >
            <svg v-if="!loading" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Stats Cards - Compact -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-purple-500/10 to-purple-700/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-xs mb-1 font-medium">Total Clients</p>
              <p class="text-2xl font-bold text-white">{{ formatNumber(totalClients || clients.length) }}</p>
              <p class="text-xs text-gray-500 mt-1" v-if="totalClients > clients.length">Showing {{ formatNumber(clients.length) }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Total clients icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500/10 to-green-700/10 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-xs mb-1 font-medium">AI Enriched</p>
              <p class="text-2xl font-bold text-white">{{ formatNumber(enrichedCount) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ enrichmentPercentage }}% complete</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="AI enriched icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-orange-500/10 to-orange-700/10 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-xs mb-1 font-medium">Pending Enrichment</p>
              <p class="text-2xl font-bold text-white">{{ formatNumber(pendingCount) }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Pending enrichment icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-500/10 to-blue-700/10 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-xs mb-1 font-medium">Avg Interactions</p>
              <p class="text-2xl font-bold text-white">{{ formatNumber(avgInteractions) }}</p>
              <p class="text-xs text-gray-500 mt-1">per client</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Average interactions icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentiment Scale Legend - Compact -->
      <div class="mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1 flex items-center gap-4 text-xs">
            <span class="text-white font-semibold">Scale:</span>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-red-500 rounded"></div>
              <span class="text-gray-300">-1 to -0.3 = <span class="font-semibold text-red-300">Negative</span></span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-yellow-500 rounded"></div>
              <span class="text-gray-300">-0.3 to +0.3 = <span class="font-semibold text-yellow-300">Neutral</span></span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded"></div>
              <span class="text-gray-300">+0.3 to +1 = <span class="font-semibold text-green-300">Positive</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="mb-4 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search clients..."
              class="w-full px-3 py-2 pl-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              aria-label="Search clients by name or ID"
            />
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            v-model="filterEnrichment"
            class="px-3 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400/50 transition-all cursor-pointer"
            aria-label="Filter by enrichment status"
          >
            <option value="all">All Clients</option>
            <option value="completed">Enriched</option>
            <option value="pending">Pending Enrichment</option>
          </select>

          <select
            v-model="sortBy"
            class="px-3 py-2 bg-ontop-navy-dark/80 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-ontop-pink-400/50 transition-all cursor-pointer"
            aria-label="Sort clients by"
          >
            <option value="interactions">Most Interactions</option>
            <option value="sentiment-desc">Sentiment: Positive First</option>
            <option value="sentiment-asc">Sentiment: Negative First</option>
            <option value="name">Client Name</option>
            <option value="recent">Recently Enriched</option>
          </select>
        </div>

        <!-- Active Filters Display - Compact -->
        <div v-if="searchQuery || filterEnrichment !== 'all' || sortBy !== 'interactions'" class="mt-3 p-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg border border-emerald-500/20">
          <div class="flex flex-wrap gap-2 items-center text-sm">
            <span class="text-xs font-semibold text-white flex items-center gap-1">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Active:
            </span>
            
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded text-xs border border-emerald-400/40 hover:bg-emerald-500/40 transition-all"
              aria-label="Remove search filter"
            >
              <span>Search: "{{ searchQuery }}"</span>
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              v-if="filterEnrichment !== 'all'"
              @click="filterEnrichment = 'all'"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs border border-blue-400/40 hover:bg-blue-500/40 transition-all"
              aria-label="Remove enrichment filter"
            >
              <span>{{ filterEnrichment === 'completed' ? 'Enriched Only' : 'Pending Only' }}</span>
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              v-if="sortBy !== 'interactions'"
              @click="sortBy = 'interactions'"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-xs border border-purple-400/40 hover:bg-purple-500/40 transition-all"
              aria-label="Remove sort filter"
            >
              <span>{{ getSortLabel(sortBy) }}</span>
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              @click="clearAllFilters"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/30 text-red-200 rounded text-xs border border-red-400/40 hover:bg-red-500/40 transition-all ml-auto"
              aria-label="Clear all filters"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent"></div>
        <p class="text-white font-medium mt-6 text-lg">Loading clients...</p>
        <p class="text-gray-400 mt-2 text-sm">Fetching data from database</p>
      </div>

      <!-- Empty State - No Clients Found -->
      <div v-else-if="filteredClients.length === 0 && !loading" class="text-center py-20">
        <div class="max-w-md mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
          <div class="w-24 h-24 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-white text-xl font-bold mb-3">No Clients Found</h3>
          <p class="text-gray-400 mb-6">
            <span v-if="searchQuery || filterEnrichment !== 'all'">
              No clients match your current filters. Try adjusting your search or filters.
            </span>
            <span v-else>
              There are no clients in the system yet. Clients will appear here once data is synced.
            </span>
          </p>
          <button
            v-if="searchQuery || filterEnrichment !== 'all'"
            @click="clearAllFilters"
            class="px-6 py-3 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover transition-all duration-200 font-medium min-h-[44px]"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <button
          v-for="client in filteredClients"
          :key="client.client_id"
          @click="selectClient(client)"
          class="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-xl text-left w-full"
          :aria-label="`View details for ${client.client_name}`"
        >
          <!-- Status Badge (Top Right) - Compact -->
          <div class="absolute top-2 right-2">
            <span
              v-if="client.enrichment_status === 'completed'"
              class="px-2 py-0.5 text-xs font-medium rounded-md bg-green-500/20 text-green-300 border border-green-500/30"
            >
              ✓
            </span>
            <span
              v-else-if="client.enrichment_status === 'processing'"
              class="px-2 py-0.5 text-xs font-medium rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1"
            >
              <svg class="w-2 h-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </div>

          <!-- Client Header - Compact -->
          <div class="mb-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-10 h-10 bg-gradient-ontop rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                <span class="text-sm font-bold text-white">{{ getInitials(client.client_name) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                  {{ client.client_name }}
                </h3>
                <p class="text-xs text-gray-500 font-mono truncate">{{ client.client_id }}</p>
              </div>
            </div>
            
            <!-- Real Sentiment Tag - Compact (from client_sentiment_summary) -->
            <div v-if="client.real_sentiment_category" class="mb-2">
              <span
                class="px-2 py-1 text-xs font-bold rounded-lg shadow flex items-center gap-1.5 w-full justify-center"
                :class="getRealSentimentClass(client.real_sentiment_category)"
                :title="`Sentiment score: ${client.real_sentiment_score?.toFixed(2) || 'N/A'} | Based on ${formatNumber(client.sentiment_stats?.total_analyzed || 0)} analyzed interactions`"
              >
                <span class="text-sm">{{ getSentimentIcon(client.real_sentiment_category) }}</span>
                <span>{{ client.real_sentiment_category }}</span>
                <span class="text-xs opacity-75">({{ client.real_sentiment_score?.toFixed(2) }})</span>
              </span>
            </div>
            <div v-else class="mb-2">
              <span class="px-2 py-1 text-xs font-medium rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/30 inline-flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                No data
              </span>
            </div>
          </div>

          <!-- Payment Issues Warning (if negative payment sentiment) -->
          <div v-if="client.payment_issues && client.payment_issues.negative_count > 0" class="mb-2">
            <div class="px-2 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/40 rounded-lg">
              <div class="flex items-center gap-1.5 text-xs">
                <svg class="w-4 h-4 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="font-bold text-red-200">
                    {{ client.payment_issues.negative_count }} Payment Issue{{ client.payment_issues.negative_count > 1 ? 's' : '' }}
                  </p>
                  <p class="text-xs text-red-300/80">
                    Avg: {{ client.payment_issues.avg_sentiment.toFixed(2) }} | Total: {{ client.payment_issues.count }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Source Badges - Compact -->
          <div class="flex flex-wrap gap-1.5 mb-2 text-xs">
            <span
              v-if="client.ticket_count > 0"
              class="px-2 py-1 font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1"
              :title="`${formatNumber(client.ticket_count)} Zendesk support tickets from last 3 months`"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Zendesk tickets icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>{{ formatNumber(client.ticket_count) }}</span>
            </span>
            <span
              v-if="client.transcript_count > 0"
              class="px-2 py-1 font-medium rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1"
              :title="`${formatNumber(client.transcript_count)} DIIO call transcripts from last 3 months`"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="DIIO transcripts icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>{{ formatNumber(client.transcript_count) }}</span>
            </span>
            <span
              v-if="client.ticket_count > 0 && client.transcript_count > 0"
              class="px-2 py-1 font-medium rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
              title="This client has both support tickets and call transcripts - complete data coverage"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Multi-source data icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>

          <!-- Stats - Compact -->
          <div class="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div class="bg-white/5 rounded-lg p-2 border border-white/10">
              <p class="text-gray-400 mb-0.5">Total</p>
              <p class="text-xl font-bold text-white">{{ formatNumber(client.ticket_count + client.transcript_count) }}</p>
            </div>
            <div class="bg-white/5 rounded-lg p-2 border border-white/10">
              <p class="text-gray-400 mb-0.5">Period</p>
              <p class="text-xs font-semibold text-white">3 Months</p>
            </div>
          </div>

          <!-- Sentiment Breakdown - Compact -->
          <div v-if="client.sentiment_stats" class="mb-2">
            <div class="grid grid-cols-3 gap-1 text-center text-xs">
              <div>
                <div class="font-bold text-green-300">{{ client.sentiment_stats.positive_percentage?.toFixed(0) || 0 }}%</div>
                <div class="h-1.5 bg-gray-700 rounded overflow-hidden">
                  <div class="h-full bg-green-500" :style="{ width: `${client.sentiment_stats.positive_percentage || 0}%` }"></div>
                </div>
              </div>
              <div>
                <div class="font-bold text-yellow-300">{{ client.sentiment_stats.neutral_percentage?.toFixed(0) || 0 }}%</div>
                <div class="h-1.5 bg-gray-700 rounded overflow-hidden">
                  <div class="h-full bg-yellow-500" :style="{ width: `${client.sentiment_stats.neutral_percentage || 0}%` }"></div>
                </div>
              </div>
              <div>
                <div class="font-bold text-red-300">{{ client.sentiment_stats.negative_percentage?.toFixed(0) || 0 }}%</div>
                <div class="h-1.5 bg-gray-700 rounded overflow-hidden">
                  <div class="h-full bg-red-500" :style="{ width: `${client.sentiment_stats.negative_percentage || 0}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Click Indicator -->
          <div class="flex items-center justify-center gap-1 text-emerald-400 group-hover:text-emerald-300 transition-colors text-xs">
            <span>View details</span>
            <svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Load More Button - Compact -->
      <div v-if="!loading && filteredClients.length > 0 && hasMore" class="mt-6 text-center">
        <button
          @click="loadMoreClients"
          :disabled="loadingMore"
          class="px-6 py-2.5 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          :aria-label="loadingMore ? 'Loading more clients' : `Load ${formatNumber(totalClients - clients.length)} more clients`"
        >
          <svg v-if="!loadingMore" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="!loadingMore">Load More ({{ formatNumber(totalClients - clients.length) }})</span>
          <span v-else>Loading...</span>
        </button>
        <p class="text-gray-500 mt-2 text-xs">
          {{ formatNumber(clients.length) }} of {{ formatNumber(totalClients) }} total
        </p>
      </div>

      <!-- End of Results Message -->
      <div v-if="!loading && !hasMore && filteredClients.length > 0" class="mt-6 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
          <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-green-300 text-sm font-medium">All {{ formatNumber(clients.length) }} clients loaded</p>
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

// Page metadata
useHead({
  title: 'Clients - Ontop Analytics',
  meta: [
    { name: 'description', content: 'Comprehensive client analysis with AI-powered insights, pain points, and churn risk analysis' }
  ]
})

// Disable SSR for this page to improve build performance
definePageMeta({
  ssr: false
})

// State
const loading = ref(false)
const loadingMore = ref(false)
const clients = ref<any[]>([])
const selectedClient = ref<any>(null)
const searchQuery = ref('')
const filterEnrichment = ref('all')
const sortBy = ref('interactions')
const hasMore = ref(true)
const currentOffset = ref(0)
const totalClients = ref(0)
const limit = 50
const statsData = ref({
  totalEnriched: 0,
  totalPending: 0,
  totalInteractions: 0
})

// Computed
const filteredClients = computed(() => {
  let filtered = clients.value

  // Only apply client-side enrichment filter (search and sort now handled server-side)
  if (filterEnrichment.value !== 'all') {
    filtered = filtered.filter(c => c.enrichment_status === filterEnrichment.value)
  }

  return filtered
})

const enrichedCount = computed(() => {
  return statsData.value.totalEnriched // Use database total
})

const pendingCount = computed(() => {
  return statsData.value.totalPending // Use database total
})

const enrichmentPercentage = computed(() => {
  if (totalClients.value === 0) return 0
  return Math.round((enrichedCount.value / totalClients.value) * 100)
})

const avgInteractions = computed(() => {
  if (totalClients.value === 0) return 0
  return Math.round(statsData.value.totalInteractions / totalClients.value)
})

// Methods
const loadClients = async (reset = true) => {
  if (reset) {
    loading.value = true
    currentOffset.value = 0
    clients.value = []
  } else {
    loadingMore.value = true
  }
  
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: currentOffset.value.toString(),
      search: searchQuery.value,
      sortBy: sortBy.value
    })
    
    const response = await fetch(`/api/clients/list?${params}`)
    const data = await response.json()
    
    if (data.success) {
      if (reset) {
        clients.value = data.clients
      } else {
        clients.value = [...clients.value, ...data.clients]
      }
      
      hasMore.value = data.hasMore
      // Don't update totalClients here - it comes from loadStats() which has the accurate database total
      currentOffset.value = currentOffset.value + data.returned
      
      console.log(`Loaded ${data.returned} clients. Currently loaded: ${clients.value.length}, Database total: ${totalClients.value}`)
      
      // Load stats on first load
      if (reset) {
        await loadStats()
      }
    } else {
      console.error('Failed to load clients:', data.error)
    }
  } catch (error) {
    console.error('Error loading clients:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadStats = async () => {
  try {
    console.log('🔄 Loading client stats from API...')
    // Fetch stats directly from API
    const response = await fetch('/api/clients/stats')
    const data = await response.json()
    
    console.log('📊 API Response:', data)
    
    if (data.success) {
      // Update totalClients with the database value
      totalClients.value = data.stats.totalClients
      
      statsData.value = {
        totalEnriched: data.stats.enriched,
        totalPending: data.stats.pending,
        totalInteractions: data.stats.totalInteractions
      }
      console.log(`✅ Stats loaded successfully:`, {
        totalClients: data.stats.totalClients,
        enriched: data.stats.enriched,
        pending: data.stats.pending,
        totalInteractions: data.stats.totalInteractions,
        avgInteractions: Math.round(data.stats.totalInteractions / data.stats.totalClients)
      })
    } else {
      console.error('❌ Stats API returned error:', data.error)
    }
  } catch (error) {
    console.error('❌ Error loading stats:', error)
  }
}

const loadMoreClients = () => {
  loadClients(false)
}

// Debounced search
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadClients(true)
  }, 500) // Wait 500ms after user stops typing
})

// Watch for sort changes
watch(sortBy, () => {
  loadClients(true) // Reload with new sort order
})

const selectClient = (client: any) => {
  selectedClient.value = client
}

const handleEnriched = () => {
  // Reload clients to get updated enrichment status
  loadClients()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  filterEnrichment.value = 'all'
  sortBy.value = 'interactions'
}

const getInitials = (name: string) => {
  if (!name) return '??'
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getRealSentimentClass = (sentiment: string) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return 'bg-gradient-to-br from-green-500/30 to-green-600/20 text-green-200 border-2 border-green-400/40 shadow-green-500/20'
    case 'negative':
      return 'bg-gradient-to-br from-red-500/30 to-red-600/20 text-red-200 border-2 border-red-400/40 shadow-red-500/20'
    default:
      return 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 text-yellow-200 border-2 border-yellow-400/40 shadow-yellow-500/20'
  }
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
  // Score ranges from -1 to +1
  if (score > 0.3) return 'bg-green-500'
  if (score > 0) return 'bg-green-400'
  if (score > -0.3) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getSortLabel = (sort: string) => {
  switch (sort) {
    case 'name': return 'Name'
    case 'recent': return 'Recently Enriched'
    case 'sentiment-desc': return 'Positive First'
    case 'sentiment-asc': return 'Negative First'
    default: return sort
  }
}

const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('en-US')
}

// Load on mount
onMounted(() => {
  loadClients()
})
</script>
