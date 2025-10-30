/**
 * Diio Store - Centralized state management for Diio integration
 * 
 * This composable provides a centralized store for all Diio-related data
 * and operations, replacing the scattered reactive refs in the main component.
 */

import type { DiioUser, DiioPhoneCall, DiioMeeting, DiioTranscript } from '~/types/diio'

interface DiioState {
  // Data
  users: DiioUser[]
  phoneCalls: DiioPhoneCall[]
  meetings: DiioMeeting[]
  storedTranscripts: any[]
  
  // Counts
  usersCount: number
  phoneCallsCount: number
  meetingsCount: number
  totalTranscripts: number
  
  // Loading states
  loading: boolean
  usersLoading: boolean
  phoneCallsLoading: boolean
  meetingsLoading: boolean
  transcriptsLoading: boolean
  
  // Error handling
  error: {
    title?: string
    message: string
    details?: string
  } | null
  
  // Pagination
  meetingsCurrentPage: number
  meetingsTotal: number
  
  // Processing
  transcriptProcessing: {
    isProcessing: boolean
    current: number
    total: number
    currentItem: string
    stored: number
    skipped: number
    errors: number
  }
  
  // Storage status
  storageStatus: {
    usersStored: boolean
    meetingsStored: boolean
    phoneCallsStored: boolean
    transcriptsStored: number
    totalTranscripts: number
  }
}

const state = reactive<DiioState>({
  // Data
  users: [],
  phoneCalls: [],
  meetings: [],
  storedTranscripts: [],
  
  // Counts
  usersCount: 0,
  phoneCallsCount: 0,
  meetingsCount: 0,
  totalTranscripts: 0,
  
  // Loading states
  loading: false,
  usersLoading: false,
  phoneCallsLoading: false,
  meetingsLoading: false,
  transcriptsLoading: false,
  
  // Error handling
  error: null,
  
  // Pagination
  meetingsCurrentPage: 1,
  meetingsTotal: 0,
  
  // Processing
  transcriptProcessing: {
    isProcessing: false,
    current: 0,
    total: 0,
    currentItem: '',
    stored: 0,
    skipped: 0,
    errors: 0
  },
  
  // Storage status
  storageStatus: {
    usersStored: false,
    meetingsStored: false,
    phoneCallsStored: false,
    transcriptsStored: 0,
    totalTranscripts: 0
  }
})

export const useDiioStore = () => {
  // Getters
  const getFilteredMeetings = (selectedUserEmail: string) => {
    if (!selectedUserEmail) {
      return state.meetings
    }
    
    return state.meetings.filter(meeting => {
      if (!meeting.attendees?.sellers) return false
      return meeting.attendees.sellers.some(seller => seller.email === selectedUserEmail)
    })
  }

  // Actions
  const setError = (error: { title?: string; message: string; details?: string } | null) => {
    state.error = error
  }

  const clearError = () => {
    state.error = null
  }

  const setLoading = (loading: boolean) => {
    state.loading = loading
  }

  const setUsersLoading = (loading: boolean) => {
    state.usersLoading = loading
  }

  const setPhoneCallsLoading = (loading: boolean) => {
    state.phoneCallsLoading = loading
  }

  const setMeetingsLoading = (loading: boolean) => {
    state.meetingsLoading = loading
  }

  const setTranscriptsLoading = (loading: boolean) => {
    state.transcriptsLoading = loading
  }

  const setUsers = (users: DiioUser[]) => {
    state.users = users
    state.usersCount = users.length
  }

  const setPhoneCalls = (phoneCalls: DiioPhoneCall[], total: number) => {
    state.phoneCalls = phoneCalls
    state.phoneCallsCount = total
  }

  const setMeetings = (meetings: DiioMeeting[], total: number) => {
    state.meetings = meetings
    state.meetingsCount = total
    state.meetingsTotal = total
  }

  const addMeetings = (meetings: DiioMeeting[]) => {
    state.meetings = [...state.meetings, ...meetings]
  }

  const setStoredTranscripts = (transcripts: any[]) => {
    state.storedTranscripts = transcripts
  }

  const setTotalTranscripts = (count: number) => {
    state.totalTranscripts = count
    state.storageStatus.totalTranscripts = count
  }

  const updateStorageStatus = (updates: Partial<typeof state.storageStatus>) => {
    state.storageStatus = { ...state.storageStatus, ...updates }
  }

  const setTranscriptProcessing = (processing: Partial<typeof state.transcriptProcessing>) => {
    state.transcriptProcessing = { ...state.transcriptProcessing, ...processing }
  }

  const resetTranscriptProcessing = () => {
    state.transcriptProcessing = {
      isProcessing: false,
      current: 0,
      total: 0,
      currentItem: '',
      stored: 0,
      skipped: 0,
      errors: 0
    }
  }

  // Computed
  const hasData = computed(() => 
    state.users.length > 0 || state.phoneCalls.length > 0 || state.meetings.length > 0
  )

  const isLoading = computed(() => 
    state.loading || state.usersLoading || state.phoneCallsLoading || state.meetingsLoading || state.transcriptsLoading
  )

  return {
    // State (readonly)
    state: readonly(state),
    
    // Getters
    getFilteredMeetings,
    hasData,
    isLoading,
    
    // Actions
    setError,
    clearError,
    setLoading,
    setUsersLoading,
    setPhoneCallsLoading,
    setMeetingsLoading,
    setTranscriptsLoading,
    setUsers,
    setPhoneCalls,
    setMeetings,
    addMeetings,
    setStoredTranscripts,
    setTotalTranscripts,
    updateStorageStatus,
    setTranscriptProcessing,
    resetTranscriptProcessing
  }
}
