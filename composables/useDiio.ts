/**
 * DIIO API Composable
 * 
 * Provides access to DIIO call transcription service
 * - Fetch phone calls and meetings
 * - Get transcripts
 * - Export data
 * 
 * API Docs: https://getontop.diio.com
 */

import type { DiioUser, DiioPhoneCall, DiioMeeting, DiioTranscript, DiioExport } from '~/types/diio'

export const useDiio = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get list of DIIO users
   */
  const getUsers = async (page = 1): Promise<DiioUser[]> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{ users: DiioUser[] }>('/api/diio/users', {
        params: { page }
      })
      
      return data.users || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Error fetching DIIO users:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get list of phone calls
   */
  const getPhoneCalls = async (page = 1, limit = 20): Promise<{ calls: DiioPhoneCall[], total: number, next: number | null }> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{ phone_calls: DiioPhoneCall[], total: number, next: number | null }>('/api/diio/phone-calls', {
        params: { page, limit }
      })
      
      return {
        calls: data.phone_calls || [],
        total: data.total || 0,
        next: data.next || null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch phone calls'
      console.error('Error fetching phone calls:', err)
      return { calls: [], total: 0, next: null }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get details for a specific phone call
   */
  const getPhoneCall = async (id: string): Promise<DiioPhoneCall | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<DiioPhoneCall>(`/api/diio/phone-calls/${id}`)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch phone call'
      console.error('Error fetching phone call:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get list of meetings
   */
  const getMeetings = async (page = 1, limit = 20): Promise<{ meetings: DiioMeeting[], total: number, next: number | null }> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{ meetings: DiioMeeting[], total: number, next: number | null }>('/api/diio/meetings', {
        params: { page, limit }
      })
      
      return {
        meetings: data.meetings || [],
        total: data.total || 0,
        next: data.next || null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch meetings'
      console.error('Error fetching meetings:', err)
      return { meetings: [], total: 0, next: null }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get details for a specific meeting
   */
  const getMeeting = async (id: string): Promise<DiioMeeting | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<DiioMeeting>(`/api/diio/meetings/${id}`)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch meeting'
      console.error('Error fetching meeting:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a transcript by ID
   */
  const getTranscript = async (id: string, email?: string): Promise<DiioTranscript | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<DiioTranscript>(`/api/diio/transcripts/${id}`, {
        params: email ? { email } : {}
      })
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch transcript'
      console.error('Error fetching transcript:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create an export of phone calls or meetings
   */
  const createExport = async (
    model: 'phone_call' | 'meeting',
    fileType: 'json' | 'csv' = 'json',
    sendTo?: string
  ): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<{ id: string }>('/api/diio/exports', {
        method: 'POST',
        body: {
          model,
          file_type: fileType,
          send_to: sendTo
        }
      })
      
      return data.id
    } catch (err: any) {
      error.value = err.message || 'Failed to create export'
      console.error('Error creating export:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get export status and download URL
   */
  const getExport = async (exportId: string): Promise<DiioExport | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<DiioExport>(`/api/diio/exports/${exportId}`)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch export'
      console.error('Error fetching export:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Download export file data
   */
  const downloadExport = async (fileUrl: string): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch(fileUrl)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to download export'
      console.error('Error downloading export:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Helper: Get all phone calls with transcripts
   */
  const getPhoneCallsWithTranscripts = async (limit = 10): Promise<Array<DiioPhoneCall & { transcript?: DiioTranscript }>> => {
    const { calls } = await getPhoneCalls(1, limit)
    
    // Fetch transcripts for calls that have them
    const callsWithTranscripts = await Promise.all(
      calls.map(async (call) => {
        if (call.last_trancript_id) {
          const transcript = await getTranscript(call.last_trancript_id)
          return { ...call, transcript: transcript || undefined }
        }
        return call
      })
    )
    
    return callsWithTranscripts
  }

  /**
   * Helper: Export and download phone calls data
   */
  const exportPhoneCalls = async (): Promise<any> => {
    // Create export
    const exportId = await createExport('phone_call', 'json')
    
    if (!exportId) {
      return null
    }
    
    // Wait for export to complete (poll every 2 seconds, max 30 seconds)
    const maxAttempts = 15
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const exportData = await getExport(exportId)
      
      if (!exportData) {
        return null
      }
      
      if (exportData.status === 'finished' && exportData.file_url) {
        // Download the file
        return await downloadExport(exportData.file_url)
      }
      
      if (exportData.status === 'error') {
        error.value = 'Export failed'
        return null
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    error.value = 'Export timeout'
    return null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    
    // Users
    getUsers,
    
    // Phone Calls
    getPhoneCalls,
    getPhoneCall,
    
    // Meetings
    getMeetings,
    getMeeting,
    
    // Transcripts
    getTranscript,
    
    // Exports
    createExport,
    getExport,
    downloadExport,
    exportPhoneCalls,
    
    // Helpers
    getPhoneCallsWithTranscripts
  }
}

