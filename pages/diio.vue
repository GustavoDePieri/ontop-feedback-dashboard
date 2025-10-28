<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">
              Call Transcripts
            </h1>
            <p class="text-gray-400">Access and analyze meeting and call transcripts from DIIO</p>
          </div>
          
          <!-- Status Badge -->
          <div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-white/80">DIIO Connected</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Users</p>
              <p class="text-3xl font-bold text-white mt-2">{{ users.length }}</p>
            </div>
            <div class="p-3 bg-blue-500/20 rounded-lg">
              <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Phone Calls</p>
              <p class="text-3xl font-bold text-white mt-2">{{ phoneCallsTotal }}</p>
            </div>
            <div class="p-3 bg-green-500/20 rounded-lg">
              <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Meetings</p>
              <p class="text-3xl font-bold text-white mt-2">{{ meetingsTotal || '—' }}</p>
            </div>
            <div class="p-3 bg-purple-500/20 rounded-lg">
              <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Database Storage</p>
              <p class="text-lg font-semibold text-blue-400 mt-2">{{ storageStatus.totalTranscripts }} transcripts</p>
            </div>
            <div class="p-3 bg-blue-500/20 rounded-lg">
              <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {{ loading ? 'Loading...' : 'Fetch Users' }}
        </button>
        
        <button
          @click="fetchPhoneCalls"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ loading ? 'Loading...' : 'Fetch Phone Calls' }}
        </button>

        <button
          @click="fetchMeetings"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ loading ? 'Loading...' : 'Fetch Meetings' }}
        </button>
        
        <button
          @click="exportData"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ loading ? 'Exporting...' : 'Export Data' }}
        </button>

        <button
          @click="loadTranscriptStats"
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Refresh Stats
        </button>
      </div>

      <!-- User Filter (shown when meetings are loaded) -->
      <div v-if="meetings.length > 0" class="mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label class="text-white font-medium text-sm">Filter by User:</label>
          <select
            v-model="selectedUserEmail"
            class="bg-gray-800 text-white border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[300px]"
            style="color-scheme: dark;"
          >
            <option value="" class="bg-gray-800 text-white">All Users</option>
            <option v-for="user in users" :key="user.id" :value="user.email" class="bg-gray-800 text-white">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
          <span class="text-white/60 text-sm">{{ filteredMeetings.length }} of {{ meetings.length }} meetings loaded</span>
          <button
            v-if="meetings.length < meetingsTotal"
            @click="loadMoreMeetings"
            :disabled="loading"
            class="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            Load More ({{ meetingsTotal - meetings.length }} remaining)
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-400">{{ error }}</p>
        </div>
      </div>

      <!-- Transcripts Scope Warning -->
      <div class="mb-6 p-6 bg-yellow-900/20 border border-yellow-500/50 rounded-lg backdrop-blur-sm">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-yellow-300 font-semibold mb-1">Waiting for Transcripts Scope</h3>
            <p class="text-yellow-200/80 text-sm">
              DIIO integration is ready! We're waiting for the <code class="px-2 py-0.5 bg-yellow-900/30 rounded text-yellow-300">transcripts</code> scope to be added by DIIO support. 
              Once added, all {{ meetingsTotal || 812 }} meetings with transcripts will be immediately accessible.
            </p>
            <p class="text-yellow-200/70 text-xs mt-2">
              Current scopes: <span class="text-yellow-300">users, phone_calls, exports, meetings</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Users Section -->
      <div v-if="users.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            DIIO Users ({{ users.length }})
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in users"
              :key="user.id"
              class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-200"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">{{ user.name.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold truncate">{{ user.name }}</h3>
                  <p class="text-gray-400 text-sm truncate">{{ user.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meetings Section -->
      <div v-if="meetings.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Recent Meetings ({{ filteredMeetings.length }})
          </h2>
          
          <div class="space-y-3">
            <div
              v-for="meeting in filteredMeetings"
              :key="meeting.id"
              class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold mb-1">{{ meeting.name }}</h3>
                  <p class="text-gray-400 text-sm mb-2">{{ formatDate(meeting.scheduled_at) }}</p>
                  
                  <div v-if="meeting.attendees" class="space-y-1">
                    <p class="text-gray-500 text-xs">
                      <span class="text-gray-400">Sellers:</span> {{ meeting.attendees.sellers?.map(s => s.name).join(', ') || 'None' }}
                    </p>
                    <p class="text-gray-500 text-xs">
                      <span class="text-gray-400">Customers:</span> {{ meeting.attendees.customers?.map(c => c.name).join(', ') || 'None' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs rounded-lg"
                    :class="{
                      'bg-green-900/30 text-green-300 border border-green-500/30': meeting.analyzed_status === 'finished',
                      'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30': meeting.analyzed_status === 'pending',
                      'bg-red-900/30 text-red-300 border border-red-500/30': meeting.analyzed_status === 'error'
                    }"
                  >
                    {{ meeting.analyzed_status || 'unknown' }}
                  </span>
                  
                  <button
                    v-if="meeting.last_transcript_id"
                    @click="fetchTranscript(meeting.last_transcript_id, meeting.name)"
                    class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Transcript
                  </button>
                  <span v-else class="text-xs text-gray-500">No transcript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Phone Calls Section -->
      <div v-if="phoneCalls.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Calls ({{ phoneCallsTotal }})
          </h2>
          
          <div class="space-y-3">
            <div
              v-for="call in phoneCalls"
              :key="call.id"
              class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-green-500/50 hover:bg-white/10 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <h3 class="text-white font-semibold mb-1">{{ call.name }}</h3>
                  <p class="text-gray-400 text-sm mb-2">{{ formatDate(call.occurred_at) }}</p>
                  
                  <div v-if="call.attendees">
                    <p class="text-gray-500 text-xs">
                      <span class="text-gray-400">Sellers:</span> {{ call.attendees.sellers?.map(s => s.name).join(', ') || 'None' }}
                    </p>
                  </div>
                </div>

                <button
                  v-if="call.last_trancript_id"
                  @click="fetchTranscript(call.last_trancript_id, call.name)"
                  class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  View Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Data Display -->
      <div v-if="exportedData" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4">Exported Data</h2>
          <pre class="text-gray-300 text-sm overflow-auto max-h-96 bg-gray-900/50 p-4 rounded border border-white/10">{{ JSON.stringify(exportedData, null, 2) }}</pre>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!loading && users.length === 0 && phoneCalls.length === 0 && meetings.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p class="text-gray-400 mb-2">No data loaded yet</p>
        <p class="text-gray-500 text-sm">Click the buttons above to fetch data from DIIO</p>
      </div>

      <!-- Transcript Modal -->
      <div
        v-if="selectedTranscript"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="selectedTranscript = null"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ selectedTranscriptName }}</h2>
              <p class="text-gray-400 text-sm mt-1">Transcript ID: {{ selectedTranscript.id }}</p>
            </div>
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          <div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap border border-gray-700">
            {{ selectedTranscript.transcript }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiioUser, DiioPhoneCall, DiioMeeting, DiioTranscript } from '~/types/diio'

definePageMeta({
  layout: 'default'
})

const { getUsers, getPhoneCalls, getMeetings, getTranscript, exportPhoneCalls, loading, error } = useDiio()
const { 
  saveDiioUsers, 
  saveDiioMeetings, 
  saveDiioPhoneCalls, 
  saveDiioTranscript, 
  getDiioTranscripts, 
  getDiioTranscriptStats,
  transcriptExists 
} = useSupabase()

const users = ref<DiioUser[]>([])
const phoneCalls = ref<DiioPhoneCall[]>([])
const meetings = ref<DiioMeeting[]>([])
const phoneCallsTotal = ref(0)
const meetingsTotal = ref(0)
const meetingsCurrentPage = ref(1)
const exportedData = ref<any>(null)
const selectedTranscript = ref<DiioTranscript | null>(null)
const selectedTranscriptName = ref('')
const selectedUserEmail = ref('')

// Database storage status
const storageStatus = ref<{
  usersStored: boolean
  meetingsStored: boolean
  phoneCallsStored: boolean
  transcriptsStored: number
  totalTranscripts: number
}>({
  usersStored: false,
  meetingsStored: false,
  phoneCallsStored: false,
  transcriptsStored: 0,
  totalTranscripts: 0
})

// Computed property to filter meetings by selected user
const filteredMeetings = computed(() => {
  if (!selectedUserEmail.value) {
    return meetings.value
  }
  
  return meetings.value.filter(meeting => {
    if (!meeting.attendees?.sellers) return false
    return meeting.attendees.sellers.some(seller => seller.email === selectedUserEmail.value)
  })
})

const fetchUsers = async () => {
  users.value = await getUsers()
  // Store users in database
  if (users.value.length > 0) {
    const { error } = await saveDiioUsers(users.value)
    if (!error) {
      storageStatus.value.usersStored = true
      console.log(`✅ Stored ${users.value.length} users in database`)
    } else {
      console.error('❌ Error storing users:', error)
    }
  }
}

const fetchPhoneCalls = async () => {
  const result = await getPhoneCalls(1, 50)
  phoneCalls.value = result.calls
  phoneCallsTotal.value = result.total
  
  // Store phone calls in database
  if (phoneCalls.value.length > 0) {
    const { error } = await saveDiioPhoneCalls(phoneCalls.value)
    if (!error) {
      storageStatus.value.phoneCallsStored = true
      console.log(`✅ Stored ${phoneCalls.value.length} phone calls in database`)
    } else {
      console.error('❌ Error storing phone calls:', error)
    }
  }
}

const fetchMeetings = async () => {
  meetingsCurrentPage.value = 1
  const result = await getMeetings(1, 100) // Load 100 meetings initially
  meetings.value = result.meetings
  meetingsTotal.value = result.total
  
  // Store meetings in database
  if (meetings.value.length > 0) {
    const { error } = await saveDiioMeetings(meetings.value)
    if (!error) {
      storageStatus.value.meetingsStored = true
      console.log(`✅ Stored ${meetings.value.length} meetings in database`)
    } else {
      console.error('❌ Error storing meetings:', error)
    }
  }
}

const loadMoreMeetings = async () => {
  meetingsCurrentPage.value++
  const result = await getMeetings(meetingsCurrentPage.value, 100)
  meetings.value = [...meetings.value, ...result.meetings]
  meetingsTotal.value = result.total
  
  // Store new meetings in database
  if (result.meetings.length > 0) {
    const { error } = await saveDiioMeetings(result.meetings)
    if (!error) {
      console.log(`✅ Stored ${result.meetings.length} additional meetings in database`)
    } else {
      console.error('❌ Error storing additional meetings:', error)
    }
  }
}

const fetchTranscript = async (transcriptId: string, name: string) => {
  // Check if transcript already exists in database
  const { exists } = await transcriptExists(transcriptId)
  
  if (exists) {
    console.log(`📋 Transcript ${transcriptId} already exists in database`)
  }
  
  const transcript = await getTranscript(transcriptId)
  if (transcript) {
    selectedTranscript.value = transcript
    selectedTranscriptName.value = name
    
    // Store transcript in database if it doesn't exist
    if (!exists) {
      // Determine source type and metadata
      const sourceType = name.toLowerCase().includes('meeting') ? 'meeting' : 'phone_call'
      const sourceId = transcriptId // This would need to be mapped to actual meeting/call ID
      
      const { error } = await saveDiioTranscript(
        transcript, 
        sourceType, 
        sourceId, 
        name,
        {
          occurred_at: new Date().toISOString(),
          attendees: {}
        }
      )
      
      if (!error) {
        storageStatus.value.transcriptsStored++
        console.log(`✅ Stored transcript ${transcriptId} in database`)
      } else {
        console.error('❌ Error storing transcript:', error)
      }
    }
  }
}

const exportData = async () => {
  exportedData.value = await exportPhoneCalls()
}

const loadTranscriptStats = async () => {
  const { data } = await getDiioTranscriptStats()
  if (data) {
    storageStatus.value.totalTranscripts = data.total_transcripts || 0
    console.log(`📊 Database contains ${data.total_transcripts} transcripts`)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

// Auto-load users and stats on mount
onMounted(async () => {
  await fetchUsers()
  await loadTranscriptStats()
})
</script>

