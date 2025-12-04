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
  ai_analysis?: any
  ai_analysis_date?: string
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string
  client_platform_id?: string
  account_name?: string
  account_status?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed' | null
  sentiment_score?: number | null
  positive_meetings?: number
  neutral_meetings?: number
  negative_meetings?: number
  avg_sentiment_meetings?: number | null
  created_at?: string
  updated_at?: string
}

export interface DiioMeetingRecord {
  id?: string
  diio_meeting_id: string
  name: string
  scheduled_at?: string
  attendees?: any
  participant_emails?: string[]
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
  participant_emails?: string[]
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string
  last_transcript_id?: string
  created_at?: string
  updated_at?: string
}

export interface DiioTranscriptFeedbackRecord {
  id?: string
  transcript_id: string
  diio_transcript_id: string
  source_type: 'meeting' | 'phone_call'
  source_id: string
  source_name?: string
  segment_number: number
  speaker_name?: string
  speaker_type?: 'seller' | 'customer'
  feedback_text: string
  feedback_type: 'pain_point' | 'feature_request' | 'praise' | 'concern' | 'question'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  sentiment: 'positive' | 'neutral' | 'negative'
  keywords?: string[]
  occurred_at?: string
  participant_emails?: string[]
  account_name?: string
  analyzed_by_ai?: boolean
  ai_analysis_date?: string
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

  // ⚠️ DEPRECATED: diio_meetings table was removed in database cleanup
  // This function will fail if called. Use transcript.attendees field instead.
  const saveDiioMeetings = async (meetings: DiioMeeting[]) => {
    try {
      console.log(`💾 Preparing to store ${meetings.length} meetings...`)
      
      const meetingRecords: DiioMeetingRecord[] = meetings.map(meeting => {
        // Extract participant emails from attendees
        const participantEmails: string[] = []
        if (meeting.attendees) {
          if (meeting.attendees.sellers) {
            participantEmails.push(...meeting.attendees.sellers.map((s: any) => s.email).filter((e: string) => e))
          }
          if (meeting.attendees.customers) {
            participantEmails.push(...meeting.attendees.customers.map((c: any) => c.email).filter((e: string) => e))
          }
        }
        
        return {
          diio_meeting_id: meeting.id,
          name: meeting.name,
          scheduled_at: meeting.scheduled_at,
          attendees: meeting.attendees,
          participant_emails: participantEmails.length > 0 ? participantEmails : undefined,
          analyzed_status: meeting.analyzed_status || 'pending',
          error_cause: meeting.error_cause,
          last_transcript_id: meeting.last_transcript_id
        }
      })

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

  // ⚠️ DEPRECATED: diio_phone_calls table was removed in database cleanup
  // This function will fail if called. Use transcript.attendees field instead.
  const saveDiioPhoneCalls = async (phoneCalls: DiioPhoneCall[]) => {
    try {
      console.log(`💾 Preparing to store ${phoneCalls.length} phone calls...`)
      
      const callRecords: DiioPhoneCallRecord[] = phoneCalls.map(call => {
        // Extract participant emails from attendees
        const participantEmails: string[] = []
        if (call.attendees) {
          if (call.attendees.sellers) {
            participantEmails.push(...call.attendees.sellers.map((s: any) => s.email).filter((e: string) => e))
          }
          if (call.attendees.customers) {
            participantEmails.push(...call.attendees.customers.map((c: any) => c.email).filter((e: string) => e))
          }
        }
        
        return {
          diio_call_id: call.id,
          name: call.name,
          occurred_at: call.occurred_at,
          duration: call.duration,
          call_from_number: call.call_from_number,
          attendees: call.attendees,
          participant_emails: participantEmails.length > 0 ? participantEmails : undefined,
          analyzed_status: call.analyzed_status || 'pending',
          error_cause: call.error_cause,
          last_transcript_id: call.last_transcript_id
        }
      })

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
  const getDiioTranscripts = async (limit = 50, offset = 0, timeout = 30000) => {
    try {
      // If limit is very large, fetch all in chunks (Supabase has limits)
      if (limit > 10000) {
        let allData: any[] = []
        let currentOffset = offset
        const chunkSize = 1000 // Fetch in chunks of 1000
        let hasMore = true
        
        while (hasMore) {
          const { data, error } = await supabase
            .from('diio_transcripts')
            .select(`
              id,
              diio_transcript_id,
              transcript_text,
              transcript_type,
              source_id,
              source_name,
              occurred_at,
              duration,
              attendees,
              ai_analysis,
              ai_analysis_date,
              analyzed_status,
              client_platform_id,
              account_name,
              account_status,
              sentiment,
              sentiment_score,
              created_at,
              updated_at
            `)
            .order('created_at', { ascending: false })
            .range(currentOffset, currentOffset + chunkSize - 1)
          
          if (error) throw error
          
          if (data && data.length > 0) {
            allData.push(...data)
            currentOffset += chunkSize
            
            // Stop if we got fewer results than requested (end of data)
            hasMore = data.length === chunkSize
          } else {
            hasMore = false
          }
          
          // Safety limit
          if (currentOffset > 100000) {
            console.warn('⚠️ Reached safety limit of 100,000 transcripts')
            break
          }
        }
        
        console.log(`✅ Loaded ${allData.length} transcripts in chunks`)
        return { data: allData, error: null }
      }
      
      // Normal fetch for smaller limits
      const { data, error } = await supabase
        .from('diio_transcripts')
        .select(`
          id,
          diio_transcript_id,
          transcript_text,
          transcript_type,
          source_id,
          source_name,
          occurred_at,
          duration,
          attendees,
          ai_analysis,
          ai_analysis_date,
          analyzed_status,
          client_platform_id,
          account_name,
          account_status,
          sentiment,
          sentiment_score,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      
      // Log first transcript for debugging
      if (data && data.length > 0) {
        console.log('✅ Loaded transcript with text length:', data[0].transcript_text?.length || 0)
      }
      
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
        .maybeSingle()

      if (error) throw error
      return { exists: !!data, error: null }
    } catch (error) {
      console.error('Error checking transcript existence:', error)
      return { exists: false, error }
    }
  }

  // Save transcript feedback segments
  const saveTranscriptFeedback = async (feedbackSegments: DiioTranscriptFeedbackRecord[]) => {
    try {
      if (feedbackSegments.length === 0) {
        return { data: null, error: null }
      }

      console.log(`💾 Saving ${feedbackSegments.length} transcript feedback segments...`)

      const { data, error} = await supabase
        .from('diio_transcript_feedback')
        .upsert(feedbackSegments)
        .select()

      if (error) throw error
      
      console.log(`✅ Saved ${feedbackSegments.length} feedback segments`)
      return { data, error: null }
    } catch (error) {
      console.error('Error saving transcript feedback:', error)
      return { data: null, error }
    }
  }

  // Get transcript feedback by transcript ID
  const getTranscriptFeedback = async (transcriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('diio_transcript_feedback')
        .select('*')
        .eq('transcript_id', transcriptId)
        .order('segment_number', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching transcript feedback:', error)
      return { data: null, error }
    }
  }

  // Get all transcript feedback with filters
  const getAllTranscriptFeedback = async (filters?: {
    startDate?: string
    endDate?: string
    feedbackType?: string
    urgency?: string
    limit?: number
    offset?: number
  }) => {
    try {
      let query = supabase
        .from('diio_transcript_feedback_summary')
        .select('*')

      if (filters?.startDate) {
        query = query.gte('occurred_at', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('occurred_at', filters.endDate)
      }
      if (filters?.feedbackType) {
        query = query.eq('feedback_type', filters.feedbackType)
      }
      if (filters?.urgency) {
        query = query.eq('urgency', filters.urgency)
      }

      query = query.order('occurred_at', { ascending: false })

      if (filters?.limit) {
        query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching all transcript feedback:', error)
      return { data: null, error }
    }
  }

  // Get transcript feedback statistics
  const getTranscriptFeedbackStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_diio_transcript_feedback_stats')

      if (error) throw error
      return { data: data?.[0] || null, error: null }
    } catch (error) {
      console.error('Error fetching transcript feedback stats:', error)
      return { data: null, error }
    }
  }

  // Get Zendesk tickets
  const getZendeskTickets = async (limit = 50, offset = 0) => {
    try {
      // First get the count
      const { count, error: countError } = await supabase
        .from('zendesk_conversations')
        .select('*', { count: 'exact', head: true })
      
      if (countError) throw countError

      // Then get the data
      const { data, error } = await supabase
        .from('zendesk_conversations')
        .select('*')
        .order('ticket_id', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { data, count, error: null }
    } catch (error) {
      console.error('Error fetching Zendesk tickets:', error)
      return { data: null, count: 0, error }
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
    transcriptExists,
    // DIIO Transcript Feedback Functions
    saveTranscriptFeedback,
    getTranscriptFeedback,
    getAllTranscriptFeedback,
    getTranscriptFeedbackStats,
    getZendeskTickets
  }
}
