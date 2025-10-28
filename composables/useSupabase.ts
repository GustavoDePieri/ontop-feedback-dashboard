import { createClient } from '@supabase/supabase-js'
import type { DiioUser, DiioMeeting, DiioPhoneCall, DiioTranscript } from '~/types/diio'

export interface SavedReport {
  id?: string
  title: string
  description?: string
  report_html: string
  report_data: any // JSON data for the report
  filters_applied: any // JSON of filters used
  created_at?: string
  updated_at?: string
  created_by?: string
}

// DIIO Database Types
export interface DiioUserRecord {
  id?: string
  diio_id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface DiioTranscriptRecord {
  id?: string
  diio_transcript_id: string
  transcript_text: string
  transcript_type: 'meeting' | 'phone_call'
  source_id: string
  source_name?: string
  occurred_at?: string
  duration?: number
  attendees?: any
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string
  created_at?: string
  updated_at?: string
}

export interface DiioMeetingRecord {
  id?: string
  diio_meeting_id: string
  name: string
  scheduled_at?: string
  attendees?: any
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string
  last_transcript_id?: string
  created_at?: string
  updated_at?: string
}

export interface DiioPhoneCallRecord {
  id?: string
  diio_call_id: string
  name: string
  occurred_at?: string
  duration?: number
  call_from_number?: string
  attendees?: any
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string
  last_transcript_id?: string
  created_at?: string
  updated_at?: string
}

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  // Initialize Supabase client
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // Save a new report
  const saveReport = async (report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .insert([report])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving report:', error)
      return { data: null, error }
    }
  }

  // Get all saved reports
  const getSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching reports:', error)
      return { data: null, error }
    }
  }

  // Get a specific report by ID
  const getReportById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching report:', error)
      return { data: null, error }
    }
  }

  // Delete a report
  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting report:', error)
      return { error }
    }
  }

  // Update a report
  const updateReport = async (id: string, updates: Partial<SavedReport>) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating report:', error)
      return { data: null, error }
    }
  }

  // ==============================================
  // DIIO FUNCTIONS
  // ==============================================

  // Save or update DIIO users
  const saveDiioUsers = async (users: DiioUser[]) => {
    try {
      const userRecords: DiioUserRecord[] = users.map(user => ({
        diio_id: user.id,
        name: user.name,
        email: user.email
      }))

      const { data, error } = await supabase
        .from('diio_users')
        .upsert(userRecords, { 
          onConflict: 'diio_id',
          ignoreDuplicates: false 
        })
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving DIIO users:', error)
      return { data: null, error }
    }
  }

  // Save or update DIIO meetings (optimized for large batches)
  const saveDiioMeetings = async (meetings: DiioMeeting[]) => {
    try {
      console.log(`💾 Preparing to store ${meetings.length} meetings...`)
      
      const meetingRecords: DiioMeetingRecord[] = meetings.map(meeting => ({
        diio_meeting_id: meeting.id,
        name: meeting.name,
        scheduled_at: meeting.scheduled_at,
        attendees: meeting.attendees,
        analyzed_status: meeting.analyzed_status || 'pending',
        error_cause: meeting.error_cause,
        last_transcript_id: meeting.last_transcript_id
      }))

      // Process in batches of 1000 to avoid database limits
      const batchSize = 1000
      const batches = []
      
      for (let i = 0; i < meetingRecords.length; i += batchSize) {
        batches.push(meetingRecords.slice(i, i + batchSize))
      }

      console.log(`📦 Processing ${batches.length} batches of meetings...`)
      
      let totalStored = 0
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`📦 Storing batch ${i + 1}/${batches.length} (${batch.length} meetings)...`)
        
        const { data, error } = await supabase
          .from('diio_meetings')
          .upsert(batch, { 
            onConflict: 'diio_meeting_id',
            ignoreDuplicates: false 
          })
          .select()

        if (error) throw error
        totalStored += batch.length
      }

      console.log(`✅ Successfully stored ${totalStored} meetings in ${batches.length} batches`)
      return { data: { count: totalStored }, error: null }
    } catch (error) {
      console.error('Error saving DIIO meetings:', error)
      return { data: null, error }
    }
  }

  // Save or update DIIO phone calls (optimized for large batches)
  const saveDiioPhoneCalls = async (phoneCalls: DiioPhoneCall[]) => {
    try {
      console.log(`💾 Preparing to store ${phoneCalls.length} phone calls...`)
      
      const callRecords: DiioPhoneCallRecord[] = phoneCalls.map(call => ({
        diio_call_id: call.id,
        name: call.name,
        occurred_at: call.occurred_at,
        duration: call.duration,
        call_from_number: call.call_from_number,
        attendees: call.attendees,
        analyzed_status: call.analyzed_status || 'pending',
        error_cause: call.error_cause,
        last_transcript_id: call.last_transcript_id
      }))

      // Process in batches of 1000 to avoid database limits
      const batchSize = 1000
      const batches = []
      
      for (let i = 0; i < callRecords.length; i += batchSize) {
        batches.push(callRecords.slice(i, i + batchSize))
      }

      console.log(`📦 Processing ${batches.length} batches of phone calls...`)
      
      let totalStored = 0
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`📦 Storing batch ${i + 1}/${batches.length} (${batch.length} calls)...`)
        
        const { data, error } = await supabase
          .from('diio_phone_calls')
          .upsert(batch, { 
            onConflict: 'diio_call_id',
            ignoreDuplicates: false 
          })
          .select()

        if (error) throw error
        totalStored += batch.length
      }

      console.log(`✅ Successfully stored ${totalStored} phone calls in ${batches.length} batches`)
      return { data: { count: totalStored }, error: null }
    } catch (error) {
      console.error('Error saving DIIO phone calls:', error)
      return { data: null, error }
    }
  }

  // Save DIIO transcript
  const saveDiioTranscript = async (transcript: DiioTranscript, sourceType: 'meeting' | 'phone_call', sourceId: string, sourceName?: string, metadata?: any) => {
    try {
      const transcriptRecord: DiioTranscriptRecord = {
        diio_transcript_id: transcript.id,
        transcript_text: transcript.transcript,
        transcript_type: sourceType,
        source_id: sourceId,
        source_name: sourceName,
        occurred_at: metadata?.occurred_at,
        duration: metadata?.duration,
        attendees: metadata?.attendees,
        analyzed_status: 'pending'
      }

      const { data, error } = await supabase
        .from('diio_transcripts')
        .upsert(transcriptRecord, { 
          onConflict: 'diio_transcript_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving DIIO transcript:', error)
      return { data: null, error }
    }
  }

  // Get stored DIIO transcripts
  const getDiioTranscripts = async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('diio_transcripts_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching DIIO transcripts:', error)
      return { data: null, error }
    }
  }

  // Get transcript statistics
  const getDiioTranscriptStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_diio_transcript_stats')

      if (error) throw error
      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Error fetching DIIO transcript stats:', error)
      return { data: null, error }
    }
  }

  // Check if transcript already exists
  const transcriptExists = async (diioTranscriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('diio_transcripts')
        .select('id')
        .eq('diio_transcript_id', diioTranscriptId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      return { exists: !!data, error: null }
    } catch (error) {
      console.error('Error checking transcript existence:', error)
      return { exists: false, error }
    }
  }

  return {
    supabase,
    // Saved Reports
    saveReport,
    getSavedReports,
    getReportById,
    deleteReport,
    updateReport,
    // DIIO Functions
    saveDiioUsers,
    saveDiioMeetings,
    saveDiioPhoneCalls,
    saveDiioTranscript,
    getDiioTranscripts,
    getDiioTranscriptStats,
    transcriptExists
  }
}
