<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/10 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100 transition-colors duration-200">
              Dashboard Overview
            </h1>
            <p class="mt-2 text-gray-600 dark:text-slate-300 transition-colors duration-200">
              Real-time insights from Salesforce feedback data
            </p>
          </div>
          
          <div class="flex items-center space-x-3">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Toggle dark mode"
            >
              <svg v-if="!isDarkMode" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            
            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            
            <div class="border-l border-gray-300 dark:border-slate-600 h-6"></div>
            
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Loading...' : 'Refresh Data' }}
            </button>
                <button 
                  @click="testConnection"
                  class="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Test Connection
                </button>
                <button 
                  @click="debugDates"
                  class="bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-gray-900 dark:text-slate-100 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Debug Dates
                </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Advanced Filters -->
    <div class="bg-white dark:bg-slate-800/50 shadow-sm border-b border-gray-200 dark:border-slate-700/50 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-slate-100 transition-colors duration-200">Filters</h2>
          <button 
            @click="clearAllFilters"
            v-if="hasActiveFilters"
            class="text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Account Manager Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Account Manager</label>
            <select 
              v-model="filters.accountManager"
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Managers</option>
              <option v-for="manager in uniqueAccountManagers" :key="manager.name" :value="manager.name">
                {{ manager.name }} ({{ manager.count }} feedback{{ manager.count !== 1 ? 's' : '' }})
              </option>
            </select>
          </div>

          <!-- Date Period Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Date Period</label>
            <select 
              v-model="filters.datePeriod"
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-week">This Week</option>
              <option value="last-week">Last Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <!-- Custom Date Range (shown when custom is selected) -->
          <div v-if="filters.datePeriod === 'custom'" class="md:col-span-2 lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Custom Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="filters.startDate"
                type="date"
                class="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
              />
              <input
                v-model="filters.endDate"
                type="date"
                class="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>

          <!-- Feedback Directed To Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Feedback Directed To</label>
            <select 
              v-model="filters.feedbackDirectedTo"
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Teams</option>
              <option v-for="team in uniqueFeedbackDirections" :key="team.name" :value="team.name">
                {{ team.name }} ({{ team.count }} feedback{{ team.count !== 1 ? 's' : '' }})
              </option>
            </select>
          </div>

          <!-- Platform Client ID Search -->
          <div :class="filters.datePeriod === 'custom' ? '' : 'md:col-span-2'">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Platform Client ID</label>
            <div class="relative">
              <input
                v-model="filters.platformClientId"
                type="text"
                placeholder="Search by Platform Client ID..."
                class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span class="text-sm text-gray-500 dark:text-slate-400">Active filters:</span>
          <span 
            v-if="filters.accountManager"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
          >
            Manager: {{ filters.accountManager }}
            <button @click="filters.accountManager = ''" class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">×</button>
          </span>
          <span 
            v-if="filters.datePeriod"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
          >
            Period: {{ getDatePeriodLabel(filters.datePeriod) }}
            <button @click="clearDateFilter" class="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100">×</button>
          </span>
          <span 
            v-if="filters.feedbackDirectedTo"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
          >
            Directed To: {{ filters.feedbackDirectedTo }}
            <button @click="filters.feedbackDirectedTo = ''" class="ml-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100">×</button>
          </span>
          <span 
            v-if="filters.platformClientId"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
          >
            Client ID: {{ filters.platformClientId }}
            <button @click="filters.platformClientId = ''" class="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100">×</button>
          </span>
        </div>

        <!-- Results Count -->
        <div v-if="hasActiveFilters" class="mt-3 text-sm text-gray-600 dark:text-slate-300">
          Showing {{ filteredFeedbackData.length }} of {{ feedbackData.length }} feedback items
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 transition-colors duration-300">
      <!-- Status Message -->
      <div class="mb-6 p-4 rounded-lg transition-colors duration-200" :class="{
        'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800': loading,
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800': error,
        'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800': !loading && !error && feedbackData.length > 0,
        'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800': !loading && !error && feedbackData.length === 0
      }">
        <div v-if="loading" class="text-blue-800 dark:text-blue-200">
          🔄 Loading feedback data...
        </div>
        <div v-else-if="error" class="text-red-800 dark:text-red-200">
          ❌ Error: {{ error }}
        </div>
        <div v-else-if="feedbackData.length > 0" class="text-green-800 dark:text-green-200">
          ✅ Successfully loaded {{ feedbackData.length }} feedback items
          <span v-if="hasActiveFilters" class="block text-sm mt-1">
            📊 {{ filteredFeedbackData.length }} items match current filters
          </span>
        </div>
        <div v-else class="text-yellow-800 dark:text-yellow-200">
          ⚠️ No feedback data found. Click "Test Connection" to check your Google Sheets connection.
        </div>
      </div>

      <!-- Report Selection Modal -->
      <ReportModal 
        :is-open="showReportModal" 
        :feedback-data="feedbackData"
        @close="showReportModal = false"
        @show-report="handleShowReport"
      />

      <!-- Report Display Modal -->
      <ReportDisplayModal
        :is-open="showReportDisplay"
        :report-data="currentReportData"
        @close="showReportDisplay = false"
      />

      <!-- Executive Summary Dashboard -->
      <div v-if="feedbackData.length > 0" class="mb-8">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Executive Summary</h2>
          <p class="text-gray-600 dark:text-slate-300 text-sm mt-1">Key performance indicators and business metrics</p>
        </div>

        <!-- Primary KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Feedback -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total Feedback</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">{{ feedbackData.length }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                      <svg class="self-center flex-shrink-0 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="sr-only">Increased by</span>
                      {{ weeklyGrowth }}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Positive Sentiment -->
        <AppCard :hover="true" class="cursor-pointer transition-transform hover:scale-105" @click="showFeedbackBySentiment('Positive')">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Positive Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">{{ sentimentSummary.positive }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      ({{ sentimentPercentages.positive }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-xs text-green-600 font-medium">Click to view all positive feedback</p>
            </div>
          </div>
        </AppCard>

        <!-- Neutral Sentiment -->
        <AppCard :hover="true" class="cursor-pointer transition-transform hover:scale-105" @click="showFeedbackBySentiment('Neutral')">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Neutral Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">{{ sentimentSummary.neutral }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      ({{ sentimentPercentages.neutral }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-xs text-yellow-600 font-medium">Click to view all neutral feedback</p>
            </div>
          </div>
        </AppCard>

        <!-- Negative Sentiment -->
        <AppCard :hover="true" class="cursor-pointer transition-transform hover:scale-105" @click="showFeedbackBySentiment('Negative')">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 1.414 3 3 0 004.242 0 1 1 0 001.415-1.414 5 5 0 00-7.072 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Negative Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">{{ sentimentSummary.negative }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                      ({{ sentimentPercentages.negative }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="mt-2">
              <p class="text-xs text-red-600 font-medium">Click to view all negative feedback</p>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Interactive Calendar -->
      <div v-if="feedbackData.length > 0" class="mb-8">
        <AppCard>
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">Feedback Calendar</h3>
              <div class="flex items-center space-x-2">
                <button 
                  @click="previousMonth"
                  class="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-slate-100 min-w-[140px] text-center">
                  {{ currentCalendarMonth }}
                </h4>
                <button 
                  @click="nextMonth"
                  class="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-1">
              <!-- Day Headers -->
              <div 
                v-for="day in dayHeaders" 
                :key="day"
                class="p-3 text-center text-sm font-medium text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700"
              >
                {{ day }}
              </div>

              <!-- Calendar Days -->
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                @click="day.date && day.feedbackCount > 0 ? selectCalendarDay(day.date) : null"
                class="relative p-2 h-16 border border-gray-100 dark:border-slate-700 transition-all duration-200"
                :class="{
                  'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-600': !day.inCurrentMonth,
                  'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700': day.inCurrentMonth && day.feedbackCount === 0,
                  'bg-green-50 text-green-900 hover:bg-green-100 cursor-pointer ring-1 ring-green-200': day.feedbackCount > 0 && day.dominantSentiment === 'positive',
                  'bg-red-50 text-red-900 hover:bg-red-100 cursor-pointer ring-1 ring-red-200': day.feedbackCount > 0 && day.dominantSentiment === 'negative',
                  'bg-yellow-50 text-yellow-900 hover:bg-yellow-100 cursor-pointer ring-1 ring-yellow-200': day.feedbackCount > 0 && day.dominantSentiment === 'neutral',
                  'bg-blue-600 text-white': day.isSelected,
                  'ring-2 ring-blue-500': day.isToday && !day.isSelected
                }"
              >
                <div v-if="day.date" class="flex flex-col h-full">
                  <span class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ day.date.getDate() }}</span>
                  <div v-if="day.feedbackCount > 0" class="flex-1 flex items-end justify-center">
                    <div class="flex items-center space-x-1">
                      <div class="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span class="text-xs font-medium">{{ day.feedbackCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calendar Legend -->
            <div class="mt-4 flex items-center justify-center flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-300">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded bg-green-500"></div>
                <span>Positive feedback</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Neutral feedback</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded bg-red-500"></div>
                <span>Negative feedback</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded border-2 border-blue-500"></div>
                <span>Today</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded bg-gray-200"></div>
                <span>No feedback</span>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Selected Day Feedback -->
      <div v-if="selectedDate && selectedDateFeedback.length > 0" class="mb-8" data-selected-day-feedback>
        <AppCard>
          <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">
                Feedback for {{ formatSelectedDate(selectedDate) }}
                <span class="ml-2 text-sm text-gray-500 dark:text-slate-400">({{ selectedDateFeedback.length }} items)</span>
              </h3>
              <button 
                @click="clearSelectedDate"
                class="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-1 rounded-md transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="grid gap-4">
              <div 
                v-for="item in selectedDateFeedback" 
                :key="item.id"
                class="border rounded-lg p-4 hover:shadow-md transition-shadow"
                :class="{
                  'border-green-200 bg-green-50': item.sentiment === 'Positive',
                  'border-yellow-200 bg-yellow-50': item.sentiment === 'Neutral',
                  'border-red-200 bg-red-50': item.sentiment === 'Negative'
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 leading-relaxed">{{ item.feedback }}</p>
                    <div class="flex items-center space-x-4 mt-3 text-xs text-gray-600">
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                        {{ item.accountName }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ item.accountOwner || 'Unassigned' }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatTime(item.createdDate) }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ item.platformClientId }}
                      </span>
                      <span v-if="item.feedbackDirectedTo" class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Directed to: {{ item.feedbackDirectedTo }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button
                      @click="copyFeedback(item)"
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title="Copy feedback"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': item.sentiment === 'Positive',
                        'bg-yellow-100 text-yellow-800': item.sentiment === 'Neutral',
                        'bg-red-100 text-red-800': item.sentiment === 'Negative'
                      }"
                    >
                      {{ item.sentiment }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
        </div>

        <!-- Financial KPIs (if available) -->
        <div v-if="hasFinancialData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total MRR -->
          <AppCard>
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total MRR</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">${{ totalMrr.toLocaleString() }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Total TPV -->
          <AppCard>
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Total TPV</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">${{ totalTpv.toLocaleString() }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Average MRR per Account -->
          <AppCard>
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">Avg MRR/Account</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">${{ avgMrrPerAccount.toLocaleString() }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- High-Value Accounts -->
          <AppCard>
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">High-Value Accounts</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900 dark:text-slate-100">{{ highValueAccounts }}</div>
                      <div class="ml-2 text-sm text-gray-500 dark:text-slate-400">accounts</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Analytics & Categorization -->
      <div v-if="feedbackData.length > 0" class="mb-8">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100">Analytics & Categorization</h2>
          <p class="text-gray-600 dark:text-slate-300 text-sm mt-1">Detailed breakdown of feedback patterns and assignments</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
        <!-- Sentiment Analysis Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Sentiment Distribution
            </h3>
            <div v-if="sentimentSummary.totalItems > 0">
              <!-- Sentiment Chart -->
              <div class="space-y-4">
                <!-- Positive Bar -->
                  <div class="flex items-center group">
                  <div class="w-20 text-sm font-medium text-gray-700 dark:text-slate-300">Positive</div>
                  <div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden">
                    <div 
                      class="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-green-600"
                      :style="{ width: sentimentPercentages.positive + '%' }"
                    >
                      <span class="text-white text-xs font-medium">{{ sentimentSummary.positive }}</span>
                    </div>
                  </div>
                  <div class="w-12 text-sm text-gray-600 dark:text-slate-400 group-hover:text-green-600 transition-colors">{{ sentimentPercentages.positive }}%</div>
                </div>
                
                <!-- Neutral Bar -->
                <div class="flex items-center group">
                  <div class="w-20 text-sm font-medium text-gray-700 dark:text-slate-300">Neutral</div>
                  <div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden">
                    <div 
                      class="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-yellow-600"
                      :style="{ width: sentimentPercentages.neutral + '%' }"
                    >
                      <span class="text-white text-xs font-medium">{{ sentimentSummary.neutral }}</span>
                    </div>
                  </div>
                  <div class="w-12 text-sm text-gray-600 dark:text-slate-400 group-hover:text-yellow-600 transition-colors">{{ sentimentPercentages.neutral }}%</div>
                </div>
                
                <!-- Negative Bar -->
                <div class="flex items-center group">
                  <div class="w-20 text-sm font-medium text-gray-700 dark:text-slate-300">Negative</div>
                  <div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden">
                    <div 
                      class="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-red-600"
                      :style="{ width: Math.max(sentimentPercentages.negative, 5) + '%' }"
                    >
                      <span class="text-white text-xs font-medium">{{ sentimentSummary.negative }}</span>
                    </div>
                  </div>
                  <div class="w-12 text-sm text-gray-600 dark:text-slate-400 group-hover:text-red-600 transition-colors">{{ sentimentPercentages.negative }}%</div>
                </div>
                
                <!-- Total -->
                <div class="text-center pt-2 border-t border-gray-200 dark:border-slate-600">
                  <span class="text-lg font-bold text-gray-900 dark:text-slate-100">{{ sentimentSummary.totalItems }}</span>
                  <span class="text-sm text-gray-500 dark:text-slate-400 ml-1">Total Feedback</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p class="text-sm">No sentiment data available</p>
            </div>
          </div>
        </AppCard>

        <!-- Feedback Trends Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              Feedback Trends (Last 30 Days)
            </h3>
            <div v-if="feedbackTrendsData.length > 0">
              <!-- Trends Chart -->
              <div class="space-y-4">
                <!-- Recent Activity Summary -->
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 cursor-pointer">
                    <div class="text-lg font-bold text-green-600 dark:text-green-400">
                      {{ feedbackTrendsData.reduce((sum, day) => sum + day.positive, 0) }}
                    </div>
                    <div class="text-xs text-green-600 dark:text-green-400">Positive</div>
                  </div>
                  <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200 cursor-pointer">
                    <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {{ feedbackTrendsData.reduce((sum, day) => sum + day.neutral, 0) }}
                    </div>
                    <div class="text-xs text-yellow-600 dark:text-yellow-400">Neutral</div>
                  </div>
                  <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 cursor-pointer">
                    <div class="text-lg font-bold text-red-600 dark:text-red-400">
                      {{ feedbackTrendsData.reduce((sum, day) => sum + day.negative, 0) }}
                    </div>
                    <div class="text-xs text-red-600 dark:text-red-400">Negative</div>
                  </div>
                </div>
                
                <!-- Recent Days -->
                <div class="text-center">
                  <div class="text-sm text-gray-600 dark:text-slate-400 mb-2">Last 7 Days Activity</div>
                  <div class="flex justify-center space-x-1">
                    <div 
                      v-for="(day, index) in feedbackTrendsData.slice(-7)" 
                      :key="index"
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transform hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                      :class="{
                        'bg-green-500 text-white hover:bg-green-600': day.positive > day.neutral && day.positive > day.negative,
                        'bg-yellow-500 text-white hover:bg-yellow-600': day.neutral > day.positive && day.neutral > day.negative,
                        'bg-red-500 text-white hover:bg-red-600': day.negative > day.positive && day.negative > day.neutral,
                        'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-400 dark:hover:bg-slate-500': day.positive === 0 && day.neutral === 0 && day.negative === 0
                      }"
                      :title="`${new Date(day.date).toLocaleDateString()}: +${day.positive} ~${day.neutral} -${day.negative}`"
                    >
                      {{ day.positive + day.neutral + day.negative }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p class="text-sm">No trend data available</p>
            </div>
          </div>
        </AppCard>

        <!-- Subcategory Distribution -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              Feedback Subcategories
            </h3>
            <div v-if="topSubcategories.length > 0">
              <!-- Simple List View -->
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="(subcategory, index) in topSubcategories.slice(0, 8)" 
                  :key="subcategory.name"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                >
                  <div class="flex items-center">
                    <div 
                      class="w-3 h-3 rounded-full mr-3"
                      :style="{ backgroundColor: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#84CC16', '#F97316'][index % 8] }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                      {{ subcategory.name || 'Uncategorized' }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-bold text-gray-900 dark:text-slate-100">{{ subcategory.count }}</span>
                    <span class="text-xs text-gray-500 dark:text-slate-400">({{ subcategory.percentage }}%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p class="text-sm">No subcategory data available</p>
            </div>
          </div>
        </AppCard>

        <!-- Category Formula Distribution -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2" />
                </svg>
              </div>
              Category Classifications
            </h3>
            <div v-if="topCategoryFormulas.length > 0">
              <!-- Simple List View -->
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="(category, index) in topCategoryFormulas.slice(0, 6)" 
                  :key="category.name"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                >
                  <div class="flex items-center">
                    <div 
                      class="w-3 h-3 rounded-full mr-3"
                      :style="{ backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6] }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                      {{ category.name || 'Unclassified' }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-bold text-gray-900 dark:text-slate-100">{{ category.count }}</span>
                    <span class="text-xs text-gray-500 dark:text-slate-400">({{ category.percentage }}%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2" />
              </svg>
              <p class="text-sm">No category data available</p>
            </div>
          </div>
        </AppCard>

        <!-- Feedback Directed To -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 flex items-center">
              <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Feedback Directed To
            </h3>
            <div v-if="feedbackDirectedToAnalytics.length > 0">
              <!-- Simple List View -->
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div 
                  v-for="(item, index) in feedbackDirectedToAnalytics.slice(0, 6)" 
                  :key="item.name"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                >
                  <div class="flex items-center">
                    <div 
                      class="w-3 h-3 rounded-full mr-3"
                      :style="{ backgroundColor: ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 6] }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                      {{ item.name || 'Unspecified' }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-bold text-gray-900 dark:text-slate-100">{{ item.total }}</span>
                    <span class="text-xs text-gray-500 dark:text-slate-400">({{ item.percentage }}%)</span>
                    <span class="text-xs px-2 py-1 rounded-full"
                          :class="{
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400': item.positiveRate >= 70,
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': item.positiveRate >= 50 && item.positiveRate < 70,
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400': item.positiveRate < 50
                          }">
                      {{ item.positiveRate }}% +
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-sm">No feedback direction data available</p>
            </div>
          </div>
        </AppCard>
        </div>
      </div>

      <!-- Revenue Impact Analysis -->
      <div v-if="hasFinancialData" class="mb-8">
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Top Accounts by Revenue Impact</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-slate-700">
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-100">Account</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-900 dark:text-slate-100">Account Owner</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-900 dark:text-slate-100">MRR</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-900 dark:text-slate-100">TPV</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-900 dark:text-slate-100">Feedback Count</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-900 dark:text-slate-100">Sentiment</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
                  <tr v-for="account in topRevenueAccounts" :key="account.name" :class="{ 'bg-yellow-50 dark:bg-yellow-900/10': account.name === 'Gerardo Consulting CCL' }">
                    <td class="py-3 px-4">
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ account.name }}</span>
                        <span v-if="account.name === 'Gerardo Consulting CCL'" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          Testing Account
                        </span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-sm text-gray-600 dark:text-slate-300">{{ account.owner }}</td>
                    <td class="py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400">${{ account.mrr.toLocaleString() }}</td>
                    <td class="py-3 px-4 text-right text-sm font-medium text-blue-600 dark:text-blue-400">${{ account.tpv.toLocaleString() }}</td>
                    <td class="py-3 px-4 text-center text-sm text-gray-900 dark:text-slate-100">{{ account.feedbackCount }}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': account.dominantSentiment === 'Positive',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200': account.dominantSentiment === 'Neutral',
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200': account.dominantSentiment === 'Negative'
                      }">
                        {{ account.dominantSentiment }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Weekly Overview Section -->
      <div v-if="feedbackData.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100">This Week's Overview</h2>
          <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ currentWeekRange }}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- This Week's Summary -->
          <AppCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Summary</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-gray-600">Total Feedback This Week</span>
                    <p class="text-xs text-gray-400">vs. last week ({{ weeklyStats.lastWeekTotal }})</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-gray-900">{{ weeklyStats.totalFeedback }}</span>
                    <span 
                      v-if="weeklyStats.totalGrowth !== 0" 
                      class="text-xs px-2 py-1 rounded-full" 
                      :class="weeklyStats.totalGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ weeklyStats.totalGrowth >= 0 ? '+' : '' }}{{ weeklyStats.totalGrowth }}%
                    </span>
                    <span 
                      v-else 
                      class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                    >
                      No change
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Positive Sentiment</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-green-600">{{ weeklyStats.positiveCount }}</span>
                    <span class="text-xs text-gray-500">({{ weeklyStats.positivePercentage }}%)</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Most Active Day</span>
                  <span class="text-sm font-medium text-gray-900">{{ weeklyStats.mostActiveDay }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Top Account This Week</span>
                  <span class="text-sm font-medium text-gray-900">{{ weeklyStats.topAccount }}</span>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Account Manager Performance -->
          <AppCard>
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Account Manager Activity</h3>
              <div class="space-y-4">
                <div v-for="manager in accountManagerStats" :key="manager.name" class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-white">{{ manager.name.split(' ').map(n => n[0]).join('') }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ manager.name }}</p>
                      <p class="text-xs text-gray-500">{{ manager.accounts }} accounts</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="flex items-center space-x-2">
                      <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" :style="{ width: `${manager.percentage}%` }"></div>
                      </div>
                      <span class="text-sm font-semibold text-gray-900">{{ manager.feedbackCount }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ manager.weeklyGrowth >= 0 ? '+' : '' }}{{ manager.weeklyGrowth }}% vs last week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Weekly Feedback Timeline -->
        <AppCard class="mb-8">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Daily Feedback This Week</h3>
            <div class="flex items-end justify-between space-x-2 h-32">
              <div v-for="day in weeklyTimeline" :key="day.day" class="flex-1 flex flex-col items-center">
                <div class="w-full bg-gray-200 rounded-t-md flex-1 flex items-end">
                  <div 
                    class="w-full rounded-t-md transition-all duration-500 ease-out"
                    :class="day.isToday ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-gradient-to-t from-gray-400 to-gray-300'"
                    :style="{ height: `${day.percentage}%` }"
                  ></div>
                </div>
                <div class="mt-2 text-center">
                  <p class="text-xs font-medium text-gray-900">{{ day.count }}</p>
                  <p class="text-xs text-gray-500">{{ day.day }}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Meeting-Ready Insights -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">🎯 Meeting Ready - Key Points</h3>
              <button class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors">
                Copy for Meeting
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Wins This Week -->
              <div>
                <h4 class="text-sm font-semibold text-green-700 mb-3">✅ This Week's Wins</h4>
                <ul class="space-y-2">
                  <li v-for="win in weeklyInsights.wins" :key="win" class="text-sm text-gray-700 flex items-start">
                    <span class="text-green-500 mr-2">•</span>
                    {{ win }}
                  </li>
                </ul>
              </div>
              
              <!-- Action Items -->
              <div>
                <h4 class="text-sm font-semibold text-orange-700 mb-3">⚡ Action Items</h4>
                <ul class="space-y-2">
                  <li v-for="action in weeklyInsights.actions" :key="action" class="text-sm text-gray-700 flex items-start">
                    <span class="text-orange-500 mr-2">•</span>
                    {{ action }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Additional Analytics Row -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Top Keywords -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Top Keywords</h3>
            <div class="space-y-3">
              <div v-for="keyword in topKeywords" :key="keyword.word" class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ keyword.word }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${keyword.percentage}%` }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ keyword.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Account Activity -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Most Active Accounts</h3>
            <div class="space-y-3">
              <div v-for="account in topAccounts" :key="account.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">{{ account.name.charAt(0) }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ account.name }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ account.count }} feedback</span>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Recent Insights -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">Positive sentiment increased by {{ weeklyGrowth }}% this week</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">Most discussed topic: {{ topKeywords[0]?.word || 'Platform usability' }}</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">{{ topAccounts[0]?.name || 'Top account' }} is most active this period</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Filtered Feedback Section -->
      <div v-if="selectedSentiment && filteredFeedback.length > 0" class="mb-8" data-sentiment-filter>
        <AppCard>
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                {{ selectedSentiment }} Feedback ({{ filteredFeedback.length }} items)
              </h3>
              <button 
                @click="clearFilter"
                class="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="grid gap-4">
              <div 
                v-for="item in paginatedFeedback" 
                :key="item.id"
                class="border rounded-lg p-4 hover:shadow-md transition-shadow"
                :class="{
                  'border-green-200 bg-green-50': item.sentiment === 'Positive',
                  'border-yellow-200 bg-yellow-50': item.sentiment === 'Neutral',
                  'border-red-200 bg-red-50': item.sentiment === 'Negative'
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 leading-relaxed">{{ item.feedback }}</p>
                    <div class="flex items-center space-x-4 mt-3 text-xs text-gray-600">
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                        {{ item.accountName }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ item.accountOwner || 'Unassigned' }}
                      </span>
                      <span class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(item.createdDate) }}
                      </span>
                      <span v-if="item.feedbackDirectedTo" class="flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Directed to: {{ item.feedbackDirectedTo }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': item.sentiment === 'Positive',
                        'bg-yellow-100 text-yellow-800': item.sentiment === 'Neutral',
                        'bg-red-100 text-red-800': item.sentiment === 'Negative'
                      }"
                    >
                      {{ item.sentiment }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pagination -->
            <div v-if="filteredFeedback.length > itemsPerPage" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
              <div class="flex flex-1 justify-between sm:hidden">
                <button 
                  @click="currentPage--" 
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  @click="currentPage++" 
                  :disabled="currentPage >= totalPages"
                  class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                    to
                    <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredFeedback.length) }}</span>
                    of
                    <span class="font-medium">{{ filteredFeedback.length }}</span>
                    results
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button 
                      @click="currentPage--" 
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Previous</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      v-for="page in visiblePages" 
                      :key="page"
                      @click="currentPage = page"
                      :class="page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-900 hover:bg-gray-50'"
                      class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0"
                    >
                      {{ page }}
                    </button>
                    <button 
                      @click="currentPage++" 
                      :disabled="currentPage >= totalPages"
                      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Next</span>
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
        </div>
        </div>
        </AppCard>
      </div>

      <!-- Today's Feedback -->
      <div v-if="todaysFeedback.length > 0 && !selectedSentiment && !hasActiveFilters" class="bg-white dark:bg-slate-800 rounded-lg shadow mb-8">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100">📅 Today's Feedback</h3>
            <span class="text-sm text-gray-500 dark:text-slate-400">
              {{ todaysFeedback.length }} item{{ todaysFeedback.length !== 1 ? 's' : '' }} today
            </span>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div 
            v-for="item in todaysFeedback.slice(0, 5)" 
            :key="item.id"
            class="p-4 border border-blue-200 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/10"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ item.accountName || 'Unknown Account' }}</span>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': item.sentiment === 'Positive',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': item.sentiment === 'Neutral',
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': item.sentiment === 'Negative'
                  }"
                >
                  {{ item.sentiment }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500 dark:text-slate-400">{{ formatTime(item.createdDate) }}</span>
                <button 
                  @click="copyFeedback(item.feedback)"
                  class="text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors duration-200"
                  title="Copy feedback"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-gray-700 dark:text-slate-300 text-sm">{{ item.feedback }}</p>
            <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
              <span>Account Manager: {{ item.accountOwner || 'Unassigned' }}</span>
              <span v-if="item.feedbackDirectedTo">Directed to: {{ item.feedbackDirectedTo }}</span>
            </div>
          </div>
          <div v-if="todaysFeedback.length > 5" class="text-center">
            <button 
              @click="showTodaysFilter" 
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              View all {{ todaysFeedback.length }} items from today →
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Feedback -->
      <div v-if="feedbackData.length > 0 && !selectedSentiment" class="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Recent Feedback</h3>
        </div>
        <div class="p-6 space-y-4">
          <div 
            v-for="item in recentFeedback" 
            :key="item.id"
            class="border-l-4 pl-4 py-2"
            :class="{
              'border-green-400': item.sentiment === 'Positive',
              'border-yellow-400': item.sentiment === 'Neutral',
              'border-red-400': item.sentiment === 'Negative'
            }"
          >
            <p class="text-sm text-gray-900">{{ item.feedback }}</p>
            <div class="flex items-center justify-between mt-1">
              <p class="text-xs text-gray-500">
              {{ item.accountName }} • {{ formatDate(item.createdDate) }} • 
              <span :class="{
                'text-green-600': item.sentiment === 'Positive',
                'text-yellow-600': item.sentiment === 'Neutral',
                'text-red-600': item.sentiment === 'Negative'
              }">{{ item.sentiment }}</span>
            </p>
              <button
                @click="copyFeedback(item)"
                class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Copy feedback"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Freshness -->
      <div v-if="lastUpdated" class="text-center text-sm text-gray-500 mt-6">
        Last updated: {{ formatDate(lastUpdated) }}
      </div>

      <!-- Report Generation -->
      <div v-if="!loading && !error && feedbackData.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl p-6 shadow-sm transition-colors duration-300">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-gray-900 dark:text-slate-100 font-bold text-lg flex items-center transition-colors duration-200">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Professional Reports
            </h3>
            <p class="text-gray-600 dark:text-slate-300 text-sm mt-1 ml-13 transition-colors duration-200">Generate comprehensive analytics reports perfect for presentations and meetings</p>
          </div>
          <button
            @click="showReportModal = true"
            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Report
          </button>
        </div>
      </div>

      <!-- ==================== AI RECOMMENDATIONS SECTION ==================== -->
      <div class="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
              <div class="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              AI-Powered Recommendations
            </h3>
            <p class="text-gray-600 dark:text-slate-300 text-sm mt-1 ml-13">Get intelligent insights and actionable recommendations powered by Google Gemini AI</p>
          </div>
        </div>

        <!-- AI Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Segment Type</label>
            <select 
              v-model="aiSegmentType"
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Feedback</option>
              <option value="year">By Year</option>
              <option value="sentiment">By Sentiment</option>
              <option value="category">By Category</option>
              <option value="account_manager">By Account Manager</option>
            </select>
          </div>

          <div v-if="aiSegmentType !== 'all'">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Segment Value</label>
            <select 
              v-model="aiSegmentValue"
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select...</option>
              <option v-if="aiSegmentType === 'year'" value="2025">2025</option>
              <option v-if="aiSegmentType === 'year'" value="2024">2024</option>
              <option v-if="aiSegmentType === 'sentiment'" value="Positive">Positive</option>
              <option v-if="aiSegmentType === 'sentiment'" value="Neutral">Neutral</option>
              <option v-if="aiSegmentType === 'sentiment'" value="Negative">Negative</option>
              <option v-if="aiSegmentType === 'category'" v-for="cat in topCategoryFormulas.slice(0, 10)" :key="cat.name" :value="cat.name">
                {{ cat.name }} ({{ cat.count }})
              </option>
              <option v-if="aiSegmentType === 'account_manager'" v-for="mgr in uniqueAccountManagers.slice(0, 20)" :key="mgr.name" :value="mgr.name">
                {{ mgr.name }} ({{ mgr.count }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Focus Area (Optional)</label>
            <input 
              v-model="aiFocusArea"
              type="text"
              placeholder="e.g., Product bugs, Support quality..."
              class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div class="flex items-end">
            <button
              @click="generateAIRecommendations"
              :disabled="aiLoading || !canGenerateAI"
              class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg v-if="!aiLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ aiLoading ? 'Analyzing...' : 'Generate AI Insights' }}
            </button>
          </div>
        </div>

        <!-- Selected Data Info -->
        <div v-if="aiSegmentType !== 'all' && aiSegmentValue" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <strong>{{ getAISegmentedData().length }}</strong> feedback items will be analyzed 
          ({{ aiSegmentType }}: {{ aiSegmentValue }})
        </div>

        <!-- AI Recommendations Panel -->
        <AIRecommendationsPanel
          v-if="aiRecommendations || aiLoading || aiError"
          :loading="aiLoading"
          :error="aiError"
          :recommendations="aiRecommendations"
          :metadata="aiMetadata"
          @close="clearAIRecommendations"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Dashboard - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Real-time feedback analytics dashboard powered by Salesforce data' }
  ]
})

// Reactive data
const feedbackData = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref(null)

// Dark mode and authentication
const { isDarkMode, toggleDarkMode, initializeDarkMode, watchSystemTheme } = useDarkMode()

// Report generation
const generatingReport = ref(false)
const showReportModal = ref(false)
const showReportDisplay = ref(false)
const currentReportData = ref(null)

// Filtering and pagination
const selectedSentiment = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Advanced filters
const filters = reactive({
  accountManager: '',
  datePeriod: '',
  startDate: '',
  endDate: '',
  feedbackDirectedTo: '',
  platformClientId: ''
})

// Calendar data
const calendarDate = ref(new Date())
const selectedDate = ref(null)

// AI Recommendations
const { 
  loading: aiLoading, 
  error: aiError, 
  recommendations: aiRecommendations, 
  metadata: aiMetadata,
  generateRecommendations,
  clearRecommendations: clearAIRecommendations
} = useAIRecommendations()

const aiSegmentType = ref('all')
const aiSegmentValue = ref('')
const aiFocusArea = ref('')

// Computed data
// Filter helper computed properties
const uniqueAccountManagers = computed(() => {
  const managerCounts = new Map()
  feedbackData.value.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    managerCounts.set(manager, (managerCounts.get(manager) || 0) + 1)
  })
  
  return Array.from(managerCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([manager, count]) => ({ name: manager, count }))
})

const uniqueFeedbackDirections = computed(() => {
  const directionCounts = new Map()
  feedbackData.value.forEach(item => {
    const direction = item.feedbackDirectedTo || 'Unspecified'
    directionCounts.set(direction, (directionCounts.get(direction) || 0) + 1)
  })
  
  return Array.from(directionCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([direction, count]) => ({ name: direction, count }))
})

const hasActiveFilters = computed(() => {
  return filters.accountManager || filters.datePeriod || filters.feedbackDirectedTo || filters.platformClientId
})

const filteredFeedbackData = computed(() => {
  let filtered = feedbackData.value

  // Filter by account manager
  if (filters.accountManager) {
    filtered = filtered.filter(item => {
      const manager = item.accountOwner || 'Unassigned'
      return manager === filters.accountManager
    })
  }

  // Filter by date period
  if (filters.datePeriod) {
    const now = new Date()
    let startDate, endDate

    switch (filters.datePeriod) {
      case 'today':
        // Create dates in local timezone for better comparison
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        console.log(`🔍 Today filter - Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`)
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
        endDate.setHours(23, 59, 59, 999)
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
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        break
      case 'last-30-days':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'last-90-days':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 90)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'custom':
        if (filters.startDate) {
          startDate = new Date(filters.startDate)
          startDate.setHours(0, 0, 0, 0)
        }
        if (filters.endDate) {
          endDate = new Date(filters.endDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
    }

    if (startDate || endDate) {
      console.log(`🔍 Filtering ${filtered.length} items by date range`)
      filtered = filtered.filter((item, index) => {
        const itemDate = new Date(item.createdDate)
        const isInRange = (() => {
          if (startDate && endDate) {
            return itemDate >= startDate && itemDate <= endDate
          } else if (startDate) {
            return itemDate >= startDate
          } else if (endDate) {
            return itemDate <= endDate
          }
          return true
        })()
        
        // Debug first few items when filtering for today
        if (filters.datePeriod === 'today' && index < 5) {
          console.log(`🔍 Item ${index}: ${itemDate.toISOString()} (${itemDate.toLocaleDateString()}) - In range: ${isInRange}`)
        }
        
        return isInRange
      })
      console.log(`🔍 After date filtering: ${filtered.length} items`)
    }
  }

  // Filter by feedback directed to
  if (filters.feedbackDirectedTo) {
    filtered = filtered.filter(item => {
      const direction = item.feedbackDirectedTo || 'Unspecified'
      return direction === filters.feedbackDirectedTo
    })
  }

  // Filter by Platform Client ID
  if (filters.platformClientId) {
    const searchTerm = filters.platformClientId.toLowerCase()
    filtered = filtered.filter(item => {
      return item.platformClientId.toLowerCase().includes(searchTerm)
    })
  }

  return filtered
})

const sentimentSummary = computed(() => {
  const data = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  
  if (!data.length) {
    return { positive: 0, neutral: 0, negative: 0, totalItems: 0 }
  }
  
  const positive = data.filter(item => item.sentiment === 'Positive').length
  const neutral = data.filter(item => item.sentiment === 'Neutral').length
  const negative = data.filter(item => item.sentiment === 'Negative').length
  
  return {
    positive,
    neutral,
    negative,
    totalItems: data.length
  }
})

const sentimentPercentages = computed(() => {
  const total = feedbackData.value.length
  if (total === 0) return { positive: 0, neutral: 0, negative: 0 }
  
  return {
    positive: Math.round((sentimentSummary.value.positive / total) * 100),
    neutral: Math.round((sentimentSummary.value.neutral / total) * 100),
    negative: Math.round((sentimentSummary.value.negative / total) * 100)
  }
})

const weeklyGrowth = computed(() => {
  // Mock weekly growth calculation
  return Math.floor(Math.random() * 15) + 5
})

const topKeywords = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  if (!sourceData.length) return []
  
  const wordCount = new Map()
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'])
  
  sourceData.forEach(item => {
    const words = item.feedback.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })
  })
  
  const sortedWords = Array.from(wordCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.min(100, (count / sourceData.length) * 100 * 5)
    }))
  
  return sortedWords
})

const topAccounts = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  if (!sourceData.length) return []
  
  const accountCount = new Map()
  sourceData.forEach(item => {
    const name = item.accountName
    accountCount.set(name, (accountCount.get(name) || 0) + 1)
  })
  
  return Array.from(accountCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
})

// Calendar computed properties
const dayHeaders = computed(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

const currentCalendarMonth = computed(() => {
  return calendarDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const feedbackByDate = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  const dateMap = new Map()
  
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  
  console.log(`🗓️ Processing ${sourceData.length} items for calendar. Today key: ${todayKey}`)
  
  sourceData.forEach((item, index) => {
    const date = new Date(item.createdDate)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    
    // Debug today's entries
    if (dateKey === todayKey) {
      console.log(`✅ FOUND TODAY ITEM #${index}: Account="${item.accountName}", Date="${date.toLocaleDateString()}", Key="${dateKey}"`)
    }
    
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        feedback: [],
        sentimentCounts: { positive: 0, neutral: 0, negative: 0 }
      })
    }
    
    const dayData = dateMap.get(dateKey)
    dayData.feedback.push(item)
    
    // Count sentiments
    if (item.sentiment === 'Positive') {
      dayData.sentimentCounts.positive++
    } else if (item.sentiment === 'Neutral') {
      dayData.sentimentCounts.neutral++
    } else if (item.sentiment === 'Negative') {
      dayData.sentimentCounts.negative++
    }
  })
  
  const todayData = dateMap.get(todayKey)
  if (todayData) {
    console.log(`✅ Today's calendar data (${todayKey}): ${todayData.feedback.length} items`)
  } else {
    console.log(`❌ No data found for today (${todayKey})`)
    console.log(`📋 Available date keys:`, Array.from(dateMap.keys()).slice(0, 10))
  }
  
  return dateMap
})

const calendarDays = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()
  const today = new Date()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from the beginning of the week containing the first day
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  // End at the end of the week containing the last day
  const endDate = new Date(lastDay)
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
  
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`
    const dayData = feedbackByDate.value.get(dateKey)
    const feedbackCount = dayData ? dayData.feedback.length : 0
    
    // Determine dominant sentiment for the day
    let dominantSentiment = 'neutral'
    if (dayData && feedbackCount > 0) {
      const { positive, negative, neutral } = dayData.sentimentCounts
      if (positive > negative && positive > neutral) {
        dominantSentiment = 'positive'
      } else if (negative > positive && negative > neutral) {
        dominantSentiment = 'negative'
      } else {
        dominantSentiment = 'neutral'
      }
    }
    
    days.push({
      date: new Date(currentDate),
      inCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === today.toDateString(),
      isSelected: selectedDate.value && currentDate.toDateString() === selectedDate.value.toDateString(),
      feedbackCount,
      dominantSentiment,
      sentimentCounts: dayData ? dayData.sentimentCounts : { positive: 0, neutral: 0, negative: 0 }
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
})

const selectedDateFeedback = computed(() => {
  if (!selectedDate.value) return []
  
  const dateKey = `${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth()}-${selectedDate.value.getDate()}`
  const dayData = feedbackByDate.value.get(dateKey)
  return dayData ? dayData.feedback : []
})

// Weekly Analytics
const currentWeekRange = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}, ${now.getFullYear()}`
})

const thisWeekFeedback = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  if (!sourceData.length) return []
  
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  return sourceData.filter(item => {
    const itemDate = new Date(item.createdDate)
    return itemDate >= startOfWeek
  })
})

const lastWeekFeedback = computed(() => {
  if (!feedbackData.value.length) return []
  
  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)
  
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)
  
  return feedbackData.value.filter(item => {
    const itemDate = new Date(item.createdDate)
    return itemDate >= startOfLastWeek && itemDate < startOfThisWeek
  })
})

const weeklyStats = computed(() => {
  const thisWeek = thisWeekFeedback.value
  const lastWeek = lastWeekFeedback.value
  
  const totalFeedback = thisWeek.length
  const lastWeekTotal = lastWeek.length
  const positiveCount = thisWeek.filter(item => item.sentiment === 'Positive').length
  const positivePercentage = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0
  
  // Calculate actual weekly growth
  let totalGrowth = 0
  if (lastWeekTotal > 0) {
    totalGrowth = Math.round(((totalFeedback - lastWeekTotal) / lastWeekTotal) * 100)
  } else if (totalFeedback > 0) {
    totalGrowth = 100 // If no feedback last week but some this week, it's 100% growth
  }
  
  // Find most active day this week
  const dayCount = new Map()
  thisWeek.forEach(item => {
    const day = new Date(item.createdDate).toLocaleDateString('en-US', { weekday: 'long' })
    dayCount.set(day, (dayCount.get(day) || 0) + 1)
  })
  const mostActiveDay = Array.from(dayCount.entries()).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No activity'
  
  // Find top account this week
  const weeklyAccountCount = new Map()
  thisWeek.forEach(item => {
    weeklyAccountCount.set(item.accountName, (weeklyAccountCount.get(item.accountName) || 0) + 1)
  })
  const topAccount = Array.from(weeklyAccountCount.entries()).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No feedback'
  
  return {
    totalFeedback,
    lastWeekTotal,
    positiveCount,
    positivePercentage,
    totalGrowth,
    mostActiveDay,
    topAccount
  }
})

const accountManagerStats = computed(() => {
  if (!thisWeekFeedback.value.length) return []
  
  // Group THIS WEEK's feedback by account owner (account manager)
  const thisWeekManagerCount = new Map()
  const lastWeekManagerCount = new Map()
  const managerAccounts = new Map()
  
  // Count this week's feedback
  thisWeekFeedback.value.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    thisWeekManagerCount.set(manager, (thisWeekManagerCount.get(manager) || 0) + 1)
    
    if (!managerAccounts.has(manager)) {
      managerAccounts.set(manager, new Set())
    }
    managerAccounts.get(manager).add(item.accountName)
  })
  
  // Count last week's feedback for comparison
  lastWeekFeedback.value.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    lastWeekManagerCount.set(manager, (lastWeekManagerCount.get(manager) || 0) + 1)
  })
  
  const maxCount = Math.max(...thisWeekManagerCount.values(), 1)
  
  return Array.from(thisWeekManagerCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, feedbackCount]) => {
      const lastWeekCount = lastWeekManagerCount.get(name) || 0
      let weeklyGrowth = 0
      
      if (lastWeekCount > 0) {
        weeklyGrowth = Math.round(((feedbackCount - lastWeekCount) / lastWeekCount) * 100)
      } else if (feedbackCount > 0) {
        weeklyGrowth = 100 // New activity this week
      }
      
      return {
        name: name || 'Unassigned',
        feedbackCount,
        accounts: managerAccounts.get(name)?.size || 0,
        percentage: (feedbackCount / maxCount) * 100,
        weeklyGrowth
      }
    })
})

const weeklyTimeline = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const timeline = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    const dayFeedback = feedbackData.value.filter(item => {
      const itemDate = new Date(item.createdDate)
      return itemDate.toDateString() === date.toDateString()
    })
    
    timeline.push({
      day: days[i],
      count: dayFeedback.length,
      percentage: 0,
      isToday: date.toDateString() === now.toDateString()
    })
  }
  
  // Calculate percentages
  const maxCount = Math.max(...timeline.map(d => d.count), 1)
  timeline.forEach(day => {
    day.percentage = (day.count / maxCount) * 100
  })
  
  return timeline
})

const weeklyInsights = computed(() => {
  const thisWeek = thisWeekFeedback.value
  const lastWeek = lastWeekFeedback.value
  const positiveCount = thisWeek.filter(item => item.sentiment === 'Positive').length
  const totalCount = thisWeek.length
  const lastWeekCount = lastWeek.length
  const positiveRate = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0
  
  const wins = []
  const actions = []
  
  // Handle case when no feedback this week
  if (totalCount === 0) {
    if (lastWeekCount === 0) {
      actions.push('No feedback received this week or last week')
      actions.push('Consider reaching out to clients for feedback')
      actions.push('Review feedback collection processes')
    } else {
      actions.push(`Feedback dropped from ${lastWeekCount} last week to 0 this week`)
      actions.push('Urgent: Investigate why feedback collection stopped')
      actions.push('Contact account managers about client engagement')
    }
    
    wins.push('Opportunity to improve feedback collection strategy')
    return { wins: wins.slice(0, 4), actions: actions.slice(0, 4) }
  }
  
  // Generate insights when there is feedback
  if (positiveRate > 80) {
    wins.push(`Excellent sentiment this week: ${positiveRate}% positive feedback`)
  }
  
  if (totalCount > lastWeekCount && lastWeekCount > 0) {
    wins.push(`Feedback increased by ${totalCount - lastWeekCount} items vs last week`)
  }
  
  if (totalCount >= 10) {
    wins.push(`Good engagement: ${totalCount} feedback items collected this week`)
  }
  
  // Top performing account manager
  const topManager = accountManagerStats.value[0]
  if (topManager && topManager.feedbackCount > 0) {
    wins.push(`${topManager.name} leading with ${topManager.feedbackCount} feedback entries this week`)
  }
  
  // Generate action items
  if (totalCount < lastWeekCount && lastWeekCount > 0) {
    actions.push(`Feedback decreased from ${lastWeekCount} to ${totalCount} this week`)
  }
  
  if (positiveRate < 70 && totalCount > 0) {
    actions.push(`Address sentiment concerns - only ${positiveRate}% positive feedback`)
  }
  
  const negativeItems = thisWeek.filter(item => item.sentiment === 'Negative')
  if (negativeItems.length > 0) {
    actions.push(`Follow up on ${negativeItems.length} negative feedback items`)
  }
  
  // Check if no account managers have activity
  if (accountManagerStats.value.length === 0) {
    actions.push('No account manager activity detected this week')
  }
  
  // Fallback content when we have feedback but no specific insights
  if (wins.length === 0) {
    wins.push(`Collected ${totalCount} feedback items this week`)
    if (positiveRate >= 50) {
      wins.push(`${positiveRate}% positive sentiment maintained`)
    }
  }
  
  if (actions.length === 0) {
    actions.push('Continue monitoring sentiment trends')
    actions.push('Maintain current engagement levels')
  }
  
  return { wins: wins.slice(0, 4), actions: actions.slice(0, 4) }
})

const recentFeedback = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  return sourceData
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5)
})

const todaysFeedback = computed(() => {
  if (!feedbackData.value.length) return []
  
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()
  
  console.log(`📅 Looking for today: ${todayYear}-${todayMonth + 1}-${todayDay} (${today.toLocaleDateString()})`)
  
  const todaysItems = feedbackData.value.filter((item, index) => {
    const itemDate = new Date(item.createdDate)
    const itemYear = itemDate.getFullYear()
    const itemMonth = itemDate.getMonth()
    const itemDay = itemDate.getDate()
    
    // Simple date comparison: same year, month, and day
    const isToday = (itemYear === todayYear && itemMonth === todayMonth && itemDay === todayDay)
    
    // Debug ALL items that match today or are close
    const daysDiff = Math.abs(itemDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff < 2 || index < 3) {
      console.log(`🔍 Item ${index}: Date="${itemDate.toLocaleDateString()}" (Y:${itemYear} M:${itemMonth} D:${itemDay}) IsToday=${isToday}`)
    }
    
    return isToday
  })
  
  console.log(`✅ Today's feedback: ${todaysItems.length} items found`)
  if (todaysItems.length > 0) {
    console.log(`📋 Today's items:`, todaysItems.map(i => ({ 
      account: i.accountName, 
      date: new Date(i.createdDate).toLocaleString() 
    })))
  }
  
  return todaysItems.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
})

// Filtering computed properties
const filteredFeedback = computed(() => {
  if (!selectedSentiment.value) return []
  
  // Use filtered data if filters are active, otherwise use all data
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  
  return sourceData
    .filter(item => item.sentiment === selectedSentiment.value)
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
})

const totalPages = computed(() => {
  return Math.ceil(filteredFeedback.value.length / itemsPerPage.value)
})

const paginatedFeedback = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFeedback.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    rangeWithDots.push(total)
  }

  return rangeWithDots.filter(page => page !== '...' && page <= total)
})

// Methods
const refreshData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/sheets/data')
    feedbackData.value = response.data || []
    lastUpdated.value = new Date()
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch data'
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const testConnection = async () => {
  try {
    const result = await $fetch('/api/sheets/test')
    if (result.success) {
      alert('✅ Google Sheets connection successful!')
    } else {
      alert(`❌ Connection failed: ${result.message}`)
    }
  } catch (err: any) {
    alert(`❌ Connection test failed: ${err.message}`)
  }
}

const debugDates = async () => {
  try {
    const result = await $fetch('/api/debug/dates')
    if (result.success) {
      console.log('📅 Date Debug Results:', result)
      
      const info = [
        `Server Time: ${result.serverLocalTime}`,
        `Total Rows: ${result.totalRows}`,
        `Today's Count: ${result.todayCount}`,
        `Date Column: ${result.dateColumnHeader}`,
        `Recent Dates: ${result.recentDates.join(', ')}`
      ].join('\n')
      
      alert(`📅 Date Debug Info:\n\n${info}\n\nCheck console for detailed analysis`)
    } else {
      alert('❌ Debug failed')
    }
  } catch (err: any) {
    alert(`❌ Debug failed: ${err.message}`)
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Filtering methods
const showFeedbackBySentiment = (sentiment: 'Positive' | 'Neutral' | 'Negative') => {
  selectedSentiment.value = sentiment
  currentPage.value = 1
  // Scroll to filtered feedback section
  nextTick(() => {
    const element = document.querySelector('[data-sentiment-filter]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const clearFilter = () => {
  selectedSentiment.value = null
  currentPage.value = 1
}

// Advanced filter methods
const clearAllFilters = () => {
  filters.accountManager = ''
  filters.datePeriod = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.feedbackDirectedTo = ''
  filters.platformClientId = ''
  selectedSentiment.value = null
  currentPage.value = 1
}

const clearDateFilter = () => {
  filters.datePeriod = ''
  filters.startDate = ''
  filters.endDate = ''
}

const getDatePeriodLabel = (period) => {
  const labels = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    'this-week': 'This Week',
    'last-week': 'Last Week',
    'this-month': 'This Month',
    'last-month': 'Last Month',
    'last-30-days': 'Last 30 Days',
    'last-90-days': 'Last 90 Days',
    'custom': 'Custom Range'
  }
  return labels[period] || period
}

const showTodaysFilter = () => {
  filters.datePeriod = 'today'
  selectedSentiment.value = null
  currentPage.value = 1
  // Scroll to filtered feedback section
  nextTick(() => {
    const element = document.querySelector('[data-sentiment-filter]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// Calendar methods
const previousMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  calendarDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  calendarDate.value = newDate
}

const selectCalendarDay = (date) => {
  selectedDate.value = new Date(date)
  // Scroll to selected day feedback section
  nextTick(() => {
    const element = document.querySelector('[data-selected-day-feedback]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const clearSelectedDate = () => {
  selectedDate.value = null
}

const formatSelectedDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Copy feedback method
const copyFeedback = async (feedback) => {
  const textToCopy = `Feedback: ${feedback.feedback}\nAccount: ${feedback.accountName}\nManager: ${feedback.accountOwner || 'Unassigned'}\nClient ID: ${feedback.platformClientId}\nDate: ${formatDate(feedback.createdDate)}\nSentiment: ${feedback.sentiment}`
  
  try {
    await navigator.clipboard.writeText(textToCopy)
    // You could add a toast notification here
    console.log('Feedback copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Report generation method
const generateReport = async (type) => {
  generatingReport.value = true
  
  try {
    // Determine date range based on report type
    const now = new Date()
    let startDate, endDate, reportTitle
    
    if (type === 'weekly') {
      // Get current week (Sunday to Saturday)
      const currentDay = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - currentDay)
      startDate.setHours(0, 0, 0, 0)
      
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      
      reportTitle = `Weekly Feedback Report - Week of ${formatDate(startDate)}`
    } else if (type === 'monthly') {
      // Get current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      
      reportTitle = `Monthly Feedback Report - ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
    }
    
    // Filter data for the report period
    const reportData = feedbackData.value.filter(item => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    // Generate report content
    const reportContent = generateReportContent(reportData, type, reportTitle, startDate, endDate)
    
    // Download as text file
    downloadReport(reportContent, `${type}-report-${formatDateForFilename(now)}.txt`)
    
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`)
    
  } catch (err) {
    console.error('Failed to generate report:', err)
    error.value = `Failed to generate ${type} report. Please try again.`
  } finally {
    generatingReport.value = false
  }
}

// Generate report content
const generateReportContent = (data, type, title, startDate, endDate) => {
  const totalFeedback = data.length
  const sentimentCounts = {
    positive: data.filter(item => item.sentiment === 'Positive').length,
    neutral: data.filter(item => item.sentiment === 'Neutral').length,
    negative: data.filter(item => item.sentiment === 'Negative').length
  }
  
  // Account manager stats
  const managerStats = {}
  data.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    if (!managerStats[manager]) {
      managerStats[manager] = { total: 0, positive: 0, neutral: 0, negative: 0 }
    }
    managerStats[manager].total++
    managerStats[manager][item.sentiment.toLowerCase()]++
  })
  
  // Top accounts by feedback volume
  const accountStats = {}
  data.forEach(item => {
    const account = item.accountName || 'Unknown'
    accountStats[account] = (accountStats[account] || 0) + 1
  })
  const topAccounts = Object.entries(accountStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
  
  // Generate report text
  let report = `
═══════════════════════════════════════════════════════
${title}
═══════════════════════════════════════════════════════
Generated on: ${new Date().toLocaleString()}
Report Period: ${formatDate(startDate)} - ${formatDate(endDate)}

📊 EXECUTIVE SUMMARY
───────────────────────────────────────────────────────
Total Feedback Collected: ${totalFeedback}
Positive Sentiment: ${sentimentCounts.positive} (${totalFeedback > 0 ? Math.round((sentimentCounts.positive / totalFeedback) * 100) : 0}%)
Neutral Sentiment: ${sentimentCounts.neutral} (${totalFeedback > 0 ? Math.round((sentimentCounts.neutral / totalFeedback) * 100) : 0}%)
Negative Sentiment: ${sentimentCounts.negative} (${totalFeedback > 0 ? Math.round((sentimentCounts.negative / totalFeedback) * 100) : 0}%)

👥 ACCOUNT MANAGER PERFORMANCE
───────────────────────────────────────────────────────`

  Object.entries(managerStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .forEach(([manager, stats]) => {
      const positiveRate = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0
      report += `
${manager}: ${stats.total} feedback (${positiveRate}% positive)
  • Positive: ${stats.positive}  • Neutral: ${stats.neutral}  • Negative: ${stats.negative}`
    })

  report += `

🏢 TOP ACCOUNTS BY FEEDBACK VOLUME
───────────────────────────────────────────────────────`

  topAccounts.forEach(([account, count], index) => {
    report += `
${index + 1}. ${account}: ${count} feedback${count !== 1 ? 's' : ''}`
  })

  if (sentimentCounts.negative > 0) {
    const negativeFeedback = data.filter(item => item.sentiment === 'Negative')
    report += `

🚨 NEGATIVE FEEDBACK REQUIRING ATTENTION
───────────────────────────────────────────────────────`
    
    negativeFeedback.forEach((item, index) => {
      report += `
${index + 1}. Account: ${item.accountName}
   Manager: ${item.accountOwner || 'Unassigned'}
   Date: ${formatDate(item.createdDate)}
   Client ID: ${item.platformClientId}
   Feedback: ${item.feedback}
   ───────────────────────────────────────────────────────`
    })
  }

  // Recent positive highlights
  if (sentimentCounts.positive > 0) {
    const positiveFeedback = data.filter(item => item.sentiment === 'Positive').slice(0, 5)
    report += `

✨ POSITIVE FEEDBACK HIGHLIGHTS
───────────────────────────────────────────────────────`
    
    positiveFeedback.forEach((item, index) => {
      report += `
${index + 1}. Account: ${item.accountName}
   Manager: ${item.accountOwner || 'Unassigned'}
   Date: ${formatDate(item.createdDate)}
   Feedback: ${item.feedback}
   ───────────────────────────────────────────────────────`
    })
  }

  report += `

📈 KEY INSIGHTS & RECOMMENDATIONS
───────────────────────────────────────────────────────`

  // Generate insights based on data
  if (totalFeedback === 0) {
    report += `
• No feedback collected during this period
• Consider reaching out to clients for feedback
• Review feedback collection processes`
  } else {
    const positiveRate = Math.round((sentimentCounts.positive / totalFeedback) * 100)
    const negativeRate = Math.round((sentimentCounts.negative / totalFeedback) * 100)
    
    if (positiveRate >= 70) {
      report += `
• Excellent customer satisfaction with ${positiveRate}% positive feedback
• Continue current service quality standards`
    } else if (positiveRate >= 50) {
      report += `
• Moderate customer satisfaction at ${positiveRate}% positive feedback
• Opportunity for improvement in service quality`
    } else {
      report += `
• Low customer satisfaction at ${positiveRate}% positive feedback
• Immediate action required to address service issues`
    }
    
    if (negativeRate > 20) {
      report += `
• High negative feedback rate (${negativeRate}%) requires immediate attention
• Review negative feedback details and implement corrective actions`
    }
    
    // Manager-specific insights
    const topManager = Object.entries(managerStats).sort(([,a], [,b]) => b.total - a.total)[0]
    if (topManager) {
      report += `
• ${topManager[0]} leads in feedback collection with ${topManager[1].total} responses`
    }
  }

  report += `

═══════════════════════════════════════════════════════
End of Report
═══════════════════════════════════════════════════════
`

  return report
}

// Download report as file
const downloadReport = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Format date for filename
const formatDateForFilename = (date) => {
  return date.toISOString().split('T')[0]
}

// Handle showing report in popup modal
const handleShowReport = async (type) => {
  try {
    // Generate structured report data for the popup
    const reportData = generateStructuredReportData(type)
    currentReportData.value = reportData
    showReportDisplay.value = true
  } catch (error) {
    console.error('Failed to generate report:', error)
    error.value = `Failed to generate ${type} report. Please try again.`
  }
}

// Generate structured report data for popup display
const generateStructuredReportData = (type) => {
  // Determine date range based on report type
  const now = new Date()
  let startDate, endDate, reportTitle
  
  if (type === 'weekly') {
    // Get current week (Sunday to Saturday)
    const currentDay = now.getDay()
    startDate = new Date(now)
    startDate.setDate(now.getDate() - currentDay)
    startDate.setHours(0, 0, 0, 0)
    
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    
    reportTitle = `Weekly Feedback Report - Week of ${formatDate(startDate)}`
  } else if (type === 'monthly') {
    // Get current month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    reportTitle = `Monthly Feedback Report - ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
  }
  
  // Filter data for the report period
  const reportData = feedbackData.value.filter(item => {
    const itemDate = new Date(item.createdDate)
    return itemDate >= startDate && itemDate <= endDate
  })
  
  const totalFeedback = reportData.length
  const sentimentCounts = {
    positive: reportData.filter(item => item.sentiment === 'Positive').length,
    neutral: reportData.filter(item => item.sentiment === 'Neutral').length,
    negative: reportData.filter(item => item.sentiment === 'Negative').length
  }
  
  // Account manager stats
  const managerStats = {}
  reportData.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    if (!managerStats[manager]) {
      managerStats[manager] = { total: 0, positive: 0, neutral: 0, negative: 0 }
    }
    managerStats[manager].total++
    managerStats[manager][item.sentiment.toLowerCase()]++
  })
  
  const managers = Object.entries(managerStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      positive: stats.positive,
      neutral: stats.neutral,
      negative: stats.negative,
      positiveRate: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0
    }))
  
  // Top accounts by feedback volume
  const accountStats = {}
  reportData.forEach(item => {
    const account = item.accountName || 'Unknown'
    accountStats[account] = (accountStats[account] || 0) + 1
  })
  const topAccounts = Object.entries(accountStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))
  
  // Generate insights
  const insights = []
  if (totalFeedback === 0) {
    insights.push('No feedback collected during this period')
    insights.push('Consider reaching out to clients for feedback')
    insights.push('Review feedback collection processes')
  } else {
    const positiveRate = Math.round((sentimentCounts.positive / totalFeedback) * 100)
    const negativeRate = Math.round((sentimentCounts.negative / totalFeedback) * 100)
    
    if (positiveRate >= 70) {
      insights.push(`Excellent customer satisfaction with ${positiveRate}% positive feedback`)
      insights.push('Continue current service quality standards')
    } else if (positiveRate >= 50) {
      insights.push(`Moderate customer satisfaction at ${positiveRate}% positive feedback`)
      insights.push('Opportunity for improvement in service quality')
    } else {
      insights.push(`Low customer satisfaction at ${positiveRate}% positive feedback`)
      insights.push('Immediate action required to address service issues')
    }
    
    if (negativeRate > 20) {
      insights.push(`High negative feedback rate (${negativeRate}%) requires immediate attention`)
      insights.push('Review negative feedback details and implement corrective actions')
    }
    
    // Manager-specific insights
    const topManager = managers[0]
    if (topManager) {
      insights.push(`${topManager.name} leads in feedback collection with ${topManager.total} responses`)
    }
  }
  
  return {
    type,
    title: reportTitle,
    dateRange: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    summary: {
      total: totalFeedback,
      positive: sentimentCounts.positive,
      neutral: sentimentCounts.neutral,
      negative: sentimentCounts.negative,
      positivePercent: totalFeedback > 0 ? Math.round((sentimentCounts.positive / totalFeedback) * 100) : 0,
      neutralPercent: totalFeedback > 0 ? Math.round((sentimentCounts.neutral / totalFeedback) * 100) : 0,
      negativePercent: totalFeedback > 0 ? Math.round((sentimentCounts.negative / totalFeedback) * 100) : 0
    },
    managers,
    topAccounts,
    insights
  }
}

// Logout method
const handleLogout = async () => {
  // Clear client-side authentication
  if (process.client) {
    localStorage.removeItem('ontop_authenticated')
    localStorage.removeItem('ontop_auth_timestamp')
  }
  
  // Clear server-side cookie
  const authCookie = useCookie('ontop_auth')
  authCookie.value = false
  
  // Redirect to login page
  await navigateTo('/login')
}

// Helper function for sentiment analysis
const getDominantSentiment = (sentiments) => {
  const { positive, neutral, negative } = sentiments
  if (positive >= neutral && positive >= negative) return 'Positive'
  if (negative >= neutral) return 'Negative'
  return 'Neutral'
}

// AI Recommendations Methods
const canGenerateAI = computed(() => {
  if (aiSegmentType.value === 'all') return true
  return aiSegmentType.value && aiSegmentValue.value
})

const getAISegmentedData = () => {
  let data = feedbackData.value

  if (aiSegmentType.value === 'all') {
    return data
  }

  switch (aiSegmentType.value) {
    case 'year':
      return data.filter(item => {
        const year = new Date(item.createdDate).getFullYear().toString()
        return year === aiSegmentValue.value
      })
    
    case 'sentiment':
      return data.filter(item => item.sentiment === aiSegmentValue.value)
    
    case 'category':
      return data.filter(item => item.categoryFormulaText === aiSegmentValue.value)
    
    case 'account_manager':
      return data.filter(item => item.accountOwner === aiSegmentValue.value)
    
    default:
      return data
  }
}

const generateAIRecommendations = async () => {
  const segmentedData = getAISegmentedData()
  
  if (segmentedData.length === 0) {
    alert('No feedback items found for the selected segment')
    return
  }

  // Limit to 500 items for performance
  const dataToAnalyze = segmentedData.slice(0, 500)
  
  await generateRecommendations(dataToAnalyze, {
    segmentType: aiSegmentType.value,
    segmentValue: aiSegmentValue.value,
    focusArea: aiFocusArea.value || undefined
  })
}

// Enterprise analytics computed properties
const topSubcategories = computed(() => {
  const subcategoryCount = new Map()
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  
  sourceData.forEach(item => {
    const subcategory = item.subcategory || 'Uncategorized'
    subcategoryCount.set(subcategory, (subcategoryCount.get(subcategory) || 0) + 1)
  })
  
  const total = sourceData.length || 1
  return Array.from(subcategoryCount.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

    const topCategoryFormulas = computed(() => {
      const categoryCount = new Map()
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
      
      sourceData.forEach(item => {
        const category = item.categoryFormulaText || 'Unclassified'
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
      })
      
      const total = sourceData.length || 1
      return Array.from(categoryCount.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    })

    // Feedback Directed To analytics
    const feedbackDirectedToAnalytics = computed(() => {
      const directedToCount = new Map()
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
      
      sourceData.forEach(item => {
        const directedTo = item.feedbackDirectedTo || 'Unspecified'
        if (!directedToCount.has(directedTo)) {
          directedToCount.set(directedTo, {
            total: 0,
            positive: 0,
            neutral: 0,
            negative: 0
          })
        }
        const stats = directedToCount.get(directedTo)
        stats.total++
        if (item.sentiment === 'Positive') stats.positive++
        else if (item.sentiment === 'Neutral') stats.neutral++
        else if (item.sentiment === 'Negative') stats.negative++
      })
      
      const total = sourceData.length || 1
      return Array.from(directedToCount.entries())
        .map(([name, stats]) => ({
          name,
          ...stats,
          percentage: Math.round((stats.total / total) * 100),
          positiveRate: Math.round((stats.positive / (stats.total || 1)) * 100)
        }))
        .sort((a, b) => b.total - a.total)
    })

// Chart data computed properties
const feedbackTrendsData = computed(() => {
  const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value
  if (!sourceData.length) return []
  
  // Get last 30 days of data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentData = sourceData.filter(item => {
    const itemDate = new Date(item.createdDate)
    return itemDate >= thirtyDaysAgo
  })
  
  // Group by date
  const groupedByDate = recentData.reduce((acc, item) => {
    const date = new Date(item.createdDate).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { positive: 0, neutral: 0, negative: 0 }
    }
    
    if (item.sentiment === 'Positive') acc[date].positive++
    else if (item.sentiment === 'Neutral') acc[date].neutral++
    else acc[date].negative++
    
    return acc
  }, {} as Record<string, { positive: number; neutral: number; negative: number }>)
  
  return Object.entries(groupedByDate)
    .map(([date, sentiments]) => ({
      date,
      ...sentiments
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Financial analytics computed properties
const hasFinancialData = computed(() => {
  return feedbackData.value.some(item => item.realMrrLastMonth || item.lastInvoicedTpv)
})

const totalMrr = computed(() => {
  const uniqueAccounts = new Map()
  feedbackData.value.forEach(item => {
    if (item.realMrrLastMonth && item.accountName) {
      uniqueAccounts.set(item.accountName, item.realMrrLastMonth)
    }
  })
  return Array.from(uniqueAccounts.values()).reduce((sum, mrr) => sum + mrr, 0)
})

const totalTpv = computed(() => {
  const uniqueAccounts = new Map()
  feedbackData.value.forEach(item => {
    if (item.lastInvoicedTpv && item.accountName) {
      uniqueAccounts.set(item.accountName, item.lastInvoicedTpv)
    }
  })
  return Array.from(uniqueAccounts.values()).reduce((sum, tpv) => sum + tpv, 0)
})

const avgMrrPerAccount = computed(() => {
  const accountsWithMrr = new Set()
  feedbackData.value.forEach(item => {
    if (item.realMrrLastMonth && item.accountName) {
      accountsWithMrr.add(item.accountName)
    }
  })
  return accountsWithMrr.size > 0 ? Math.round(totalMrr.value / accountsWithMrr.size) : 0
})

const highValueAccounts = computed(() => {
  const accountMrr = new Map()
  feedbackData.value.forEach(item => {
    if (item.realMrrLastMonth && item.accountName) {
      accountMrr.set(item.accountName, item.realMrrLastMonth)
    }
  })
  // High-value threshold: above average MRR
  const avgMrr = avgMrrPerAccount.value
  return Array.from(accountMrr.values()).filter(mrr => mrr > avgMrr).length
})

const topRevenueAccounts = computed(() => {
  const accountStats = new Map()
  
  feedbackData.value.forEach(item => {
    if (!item.accountName) return
    
    if (!accountStats.has(item.accountName)) {
      accountStats.set(item.accountName, {
        name: item.accountName,
        owner: item.accountOwner || 'Unassigned',
        mrr: item.realMrrLastMonth || 0,
        tpv: item.lastInvoicedTpv || 0,
        feedbackCount: 0,
        sentiments: { positive: 0, neutral: 0, negative: 0 }
      })
    }
    
    const account = accountStats.get(item.accountName)
    account.feedbackCount++
    
    if (item.sentiment) {
      account.sentiments[item.sentiment.toLowerCase()]++
    }
  })
  
  return Array.from(accountStats.values())
    .filter(account => account.mrr > 0 || account.tpv > 0)
    .map(account => ({
      ...account,
      dominantSentiment: getDominantSentiment(account.sentiments)
    }))
    .sort((a, b) => (b.mrr + b.tpv) - (a.mrr + a.tpv))
    .slice(0, 10)
})

// Initialize data on mount
onMounted(() => {
  // Initialize dark mode
  initializeDarkMode()
  watchSystemTheme()
  
  // Load dashboard data
  refreshData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
