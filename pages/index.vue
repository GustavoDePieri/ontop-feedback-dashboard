<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p class="mt-2 text-gray-600">
              Real-time insights from Salesforce feedback data
            </p>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <button 
              @click="testConnection"
              class="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Advanced Filters -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Filters</h2>
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Account Manager</label>
            <select 
              v-model="filters.accountManager"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Managers</option>
              <option v-for="manager in uniqueAccountManagers" :key="manager.name" :value="manager.name">
                {{ manager.name }} ({{ manager.count }} feedback{{ manager.count !== 1 ? 's' : '' }})
              </option>
            </select>
          </div>

          <!-- Date Period Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Period</label>
            <select 
              v-model="filters.datePeriod"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Custom Date Range</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="filters.startDate"
                type="date"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
              />
              <input
                v-model="filters.endDate"
                type="date"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>

          <!-- Platform Client ID Search -->
          <div :class="filters.datePeriod === 'custom' ? '' : 'md:col-span-2'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Platform Client ID</label>
            <div class="relative">
              <input
                v-model="filters.platformClientId"
                type="text"
                placeholder="Search by Platform Client ID..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span class="text-sm text-gray-500">Active filters:</span>
          <span 
            v-if="filters.accountManager"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            Manager: {{ filters.accountManager }}
            <button @click="filters.accountManager = ''" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <span 
            v-if="filters.datePeriod"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            Period: {{ getDatePeriodLabel(filters.datePeriod) }}
            <button @click="clearDateFilter" class="ml-1 text-green-600 hover:text-green-800">×</button>
          </span>
          <span 
            v-if="filters.platformClientId"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            Client ID: {{ filters.platformClientId }}
            <button @click="filters.platformClientId = ''" class="ml-1 text-purple-600 hover:text-purple-800">×</button>
          </span>
        </div>

        <!-- Results Count -->
        <div v-if="hasActiveFilters" class="mt-3 text-sm text-gray-600">
          Showing {{ filteredFeedbackData.length }} of {{ feedbackData.length }} feedback items
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Status Message -->
      <div class="mb-6 p-4 rounded-lg" :class="{
        'bg-blue-50 border border-blue-200': loading,
        'bg-red-50 border border-red-200': error,
        'bg-green-50 border border-green-200': !loading && !error && feedbackData.length > 0,
        'bg-yellow-50 border border-yellow-200': !loading && !error && feedbackData.length === 0
      }">
        <div v-if="loading" class="text-blue-800">
          🔄 Loading feedback data...
        </div>
        <div v-else-if="error" class="text-red-800">
          ❌ Error: {{ error }}
        </div>
        <div v-else-if="feedbackData.length > 0" class="text-green-800">
          ✅ Successfully loaded {{ feedbackData.length }} feedback items
          <span v-if="hasActiveFilters" class="block text-sm mt-1">
            📊 {{ filteredFeedbackData.length }} items match current filters
          </span>
        </div>
        <div v-else class="text-yellow-800">
          ⚠️ No feedback data found. Click "Test Connection" to check your Google Sheets connection.
        </div>
      </div>

      <!-- Advanced Stats Grid -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Feedback</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ feedbackData.length }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Positive Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.positive }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Neutral Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.neutral }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Negative Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.negative }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
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
              <h3 class="text-lg font-medium text-gray-900">Feedback Calendar</h3>
              <div class="flex items-center space-x-2">
                <button 
                  @click="previousMonth"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 class="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                  {{ currentCalendarMonth }}
                </h4>
                <button 
                  @click="nextMonth"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
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
                class="p-3 text-center text-sm font-medium text-gray-500 border-b border-gray-200"
              >
                {{ day }}
              </div>

              <!-- Calendar Days -->
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                @click="day.date && day.feedbackCount > 0 ? selectCalendarDay(day.date) : null"
                class="relative p-2 h-16 border border-gray-100 transition-all duration-200"
                :class="{
                  'bg-gray-50 text-gray-400': !day.inCurrentMonth,
                  'bg-white text-gray-900 hover:bg-gray-50': day.inCurrentMonth && day.feedbackCount === 0,
                  'bg-green-50 text-green-900 hover:bg-green-100 cursor-pointer ring-1 ring-green-200': day.feedbackCount > 0 && day.dominantSentiment === 'positive',
                  'bg-red-50 text-red-900 hover:bg-red-100 cursor-pointer ring-1 ring-red-200': day.feedbackCount > 0 && day.dominantSentiment === 'negative',
                  'bg-yellow-50 text-yellow-900 hover:bg-yellow-100 cursor-pointer ring-1 ring-yellow-200': day.feedbackCount > 0 && day.dominantSentiment === 'neutral',
                  'bg-blue-600 text-white': day.isSelected,
                  'ring-2 ring-blue-500': day.isToday && !day.isSelected
                }"
              >
                <div v-if="day.date" class="flex flex-col h-full">
                  <span class="text-sm font-medium">{{ day.date.getDate() }}</span>
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
            <div class="mt-4 flex items-center justify-center flex-wrap gap-4 text-sm text-gray-600">
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
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                Feedback for {{ formatSelectedDate(selectedDate) }}
                <span class="ml-2 text-sm text-gray-500">({{ selectedDateFeedback.length }} items)</span>
              </h3>
              <button 
                @click="clearSelectedDate"
                class="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
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

      <!-- Charts Grid -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Sentiment Analysis Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
            <SentimentChart :data="sentimentSummary" />
          </div>
        </AppCard>

        <!-- Feedback Trends Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Feedback Trends (Last 30 Days)</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Time Series Chart</h3>
                <p class="mt-1 text-sm text-gray-500">Coming soon - Feedback trends over time</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Weekly Overview Section -->
      <div v-if="feedbackData.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">This Week's Overview</h2>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
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

      <!-- Recent Feedback -->
      <div v-if="feedbackData.length > 0 && !selectedSentiment" class="bg-white rounded-lg shadow">
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
  platformClientId: ''
})

// Calendar data
const calendarDate = ref(new Date())
const selectedDate = ref(null)

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

const hasActiveFilters = computed(() => {
  return filters.accountManager || filters.datePeriod || filters.platformClientId
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
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
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
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdDate)
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate
        } else if (startDate) {
          return itemDate >= startDate
        } else if (endDate) {
          return itemDate <= endDate
        }
        return true
      })
    }
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
  
  sourceData.forEach(item => {
    const date = new Date(item.createdDate)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    
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

// Initialize data on mount
onMounted(() => {
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
