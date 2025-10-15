<template>
  <div class="min-h-screen bg-gray-900 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">DIIO Integration Test</h1>
        <p class="text-gray-400">Test DIIO API integration and view users and transcripts</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 mb-8">
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Loading...' : 'Fetch Users' }}
        </button>
        
        <button
          @click="fetchPhoneCalls"
          :disabled="loading"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Loading...' : 'Fetch Phone Calls' }}
        </button>
        
        <button
          @click="exportData"
          :disabled="loading"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Exporting...' : 'Export Phone Calls' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <!-- Users Section -->
      <div v-if="users.length > 0" class="mb-8">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-2xl font-bold text-white mb-4">
            DIIO Users ({{ users.length }})
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in users"
              :key="user.id"
              class="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition"
            >
              <h3 class="text-white font-semibold mb-1">{{ user.name }}</h3>
              <p class="text-gray-400 text-sm">{{ user.email }}</p>
              <p class="text-gray-500 text-xs mt-2 font-mono">ID: {{ user.id }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Phone Calls Section -->
      <div v-if="phoneCalls.length > 0" class="mb-8">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-2xl font-bold text-white mb-4">
            Phone Calls ({{ phoneCallsTotal }})
          </h2>
          
          <div class="space-y-4">
            <div
              v-for="call in phoneCalls"
              :key="call.id"
              class="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-white font-semibold">{{ call.name }}</h3>
                <span
                  class="px-2 py-1 text-xs rounded"
                  :class="{
                    'bg-green-900 text-green-300': call.analyzed_status === 'finished',
                    'bg-yellow-900 text-yellow-300': call.analyzed_status === 'pending',
                    'bg-red-900 text-red-300': call.analyzed_status === 'error'
                  }"
                >
                  {{ call.analyzed_status || 'unknown' }}
                </span>
              </div>
              
              <p class="text-gray-400 text-sm mb-2">{{ formatDate(call.occurred_at) }}</p>
              
              <div v-if="call.attendees" class="mb-2">
                <p class="text-gray-500 text-sm">
                  Sellers: {{ call.attendees.sellers?.map(s => s.name).join(', ') || 'None' }}
                </p>
                <p class="text-gray-500 text-sm">
                  Customers: {{ call.attendees.customers?.map(c => c.name).join(', ') || 'None' }}
                </p>
              </div>
              
              <button
                v-if="call.last_trancript_id"
                @click="fetchTranscript(call.last_trancript_id, call.name)"
                class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                View Transcript
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!loading && users.length === 0 && phoneCalls.length === 0" class="text-center py-12">
        <p class="text-gray-400 mb-4">Click "Fetch Users" or "Fetch Phone Calls" to test the integration</p>
      </div>

      <!-- Export Data Display -->
      <div v-if="exportedData" class="mb-8">
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-2xl font-bold text-white mb-4">Exported Data</h2>
          <pre class="text-gray-300 text-sm overflow-auto max-h-96 bg-gray-900 p-4 rounded">{{ JSON.stringify(exportedData, null, 2) }}</pre>
        </div>
      </div>

      <!-- Transcript Modal -->
      <div
        v-if="selectedTranscript"
        class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        @click.self="selectedTranscript = null"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto border border-gray-700">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">{{ selectedTranscriptName }}</h2>
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          
          <div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
            {{ selectedTranscript.transcript }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiioUser, DiioPhoneCall, DiioTranscript } from '~/types/diio'

definePageMeta({
  layout: 'default'
})

const { getUsers, getPhoneCalls, getTranscript, exportPhoneCalls, loading, error } = useDiio()

const users = ref<DiioUser[]>([])
const phoneCalls = ref<DiioPhoneCall[]>([])
const phoneCallsTotal = ref(0)
const exportedData = ref<any>(null)
const selectedTranscript = ref<DiioTranscript | null>(null)
const selectedTranscriptName = ref('')

const fetchUsers = async () => {
  users.value = await getUsers()
}

const fetchPhoneCalls = async () => {
  const result = await getPhoneCalls(1, 50)
  phoneCalls.value = result.calls
  phoneCallsTotal.value = result.total
}

const fetchTranscript = async (transcriptId: string, callName: string) => {
  const transcript = await getTranscript(transcriptId)
  if (transcript) {
    selectedTranscript.value = transcript
    selectedTranscriptName.value = callName
  }
}

const exportData = async () => {
  exportedData.value = await exportPhoneCalls()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}
</script>

