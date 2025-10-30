<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm">Total Users</p>
          <p class="text-3xl font-bold text-white mt-2">{{ usersCount }}</p>
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
          <p class="text-3xl font-bold text-white mt-2">{{ phoneCallsCount }}</p>
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
          <p class="text-3xl font-bold text-white mt-2">{{ meetingsCount || '—' }}</p>
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
          <p class="text-lg font-semibold text-blue-400 mt-2">{{ totalTranscripts }} transcripts</p>
        </div>
        <div class="p-3 bg-blue-500/20 rounded-lg">
          <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  usersCount: number
  phoneCallsCount: number
  meetingsCount: number
  totalTranscripts: number
}

defineProps<Props>()
</script>
