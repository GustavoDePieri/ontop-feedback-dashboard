<template>
  <div class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-200">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-white font-semibold mb-1">{{ meeting.name }}</h3>
        <p class="text-gray-400 text-sm mb-2">{{ formatDate(meeting.scheduled_at) }}</p>
        
        <div v-if="meeting.attendees" class="space-y-2">
          <div v-if="meeting.attendees.sellers && meeting.attendees.sellers.length > 0">
            <p class="text-gray-400 text-xs font-medium mb-1">Sellers:</p>
            <div class="space-y-1">
              <div v-for="seller in meeting.attendees.sellers" :key="seller.user_id || seller.name" class="text-gray-500 text-xs">
                <div class="font-medium">{{ seller.name }}</div>
                <div class="text-gray-600">{{ seller.email }}</div>
              </div>
            </div>
          </div>
          <div v-if="meeting.attendees.customers && meeting.attendees.customers.length > 0">
            <p class="text-gray-400 text-xs font-medium mb-1">Customers:</p>
            <div class="space-y-1">
              <div v-for="customer in meeting.attendees.customers" :key="customer.name" class="text-gray-500 text-xs">
                <div class="font-medium">{{ customer.name }}</div>
                <div class="text-gray-600">{{ customer.email }}</div>
              </div>
            </div>
          </div>
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
          @click="$emit('view-transcript', meeting.last_transcript_id, meeting.name)"
          class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          View Transcript
        </button>
        <span v-else class="text-xs text-gray-500">No transcript</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiioMeeting } from '~/types/diio'

interface Props {
  meeting: DiioMeeting
}

defineProps<Props>()

defineEmits<{
  'view-transcript': [transcriptId: string, name: string]
}>()

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}
</script>
