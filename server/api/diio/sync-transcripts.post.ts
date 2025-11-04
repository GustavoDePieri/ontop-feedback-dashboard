/**
 * POST /api/diio/sync-transcripts
 * 
 * Syncs transcripts from DIIO API to database
 * - Fetches meetings and phone calls
 * - Identifies new transcripts
 * - Fetches and stores new transcripts
 * - Returns summary of sync results
 */

import { diioRequest } from '~/server/utils/diio'
import { createClient } from '@supabase/supabase-js'

interface SyncResult {
  success: boolean
  message: string
  summary: {
    meetingsFetched: number
    phoneCallsFetched: number
    newTranscriptsFound: number
    transcriptsStored: number
    transcriptsSkipped: number
    errors: number
  }
  details: {
    meetingTranscriptIds: string[]
    phoneCallTranscriptIds: string[]
    storedTranscriptIds: string[]
    errors: Array<{ transcriptId: string; error: string }>
  }
}

export default defineEventHandler(async (event): Promise<SyncResult> => {
  const config = useRuntimeConfig()
  
  // Initialize Supabase client
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration is missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    })
  }
  
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
  
  const result: SyncResult = {
    success: false,
    message: '',
    summary: {
      meetingsFetched: 0,
      phoneCallsFetched: 0,
      newTranscriptsFound: 0,
      transcriptsStored: 0,
      transcriptsSkipped: 0,
      errors: 0
    },
    details: {
      meetingTranscriptIds: [],
      phoneCallTranscriptIds: [],
      storedTranscriptIds: [],
      errors: []
    }
  }

  try {
    console.log('🔄 Starting transcript sync...')

    // Step 1: Fetch all meetings (with pagination)
    console.log('📅 Fetching meetings...')
    let meetings: any[] = []
    try {
      let currentPage = 1
      let hasMore = true
      const limit = 100 // Fetch in smaller batches to avoid timeouts
      
      while (hasMore) {
        const meetingsData = await diioRequest('/v1/meetings', {
          params: { page: currentPage, limit }
        })
        
        const pageMeetings = meetingsData.meetings || []
        meetings.push(...pageMeetings)
        
        console.log(`📄 Fetched page ${currentPage}: ${pageMeetings.length} meetings (total: ${meetings.length})`)
        
        // Check if there are more pages
        hasMore = meetingsData.next !== null && pageMeetings.length === limit
        currentPage++
        
        // Safety limit: stop after 100 pages (10,000 meetings)
        if (currentPage > 100) {
          console.warn('⚠️ Reached safety limit of 100 pages for meetings')
          break
        }
        
        // Small delay between pages to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      result.summary.meetingsFetched = meetings.length
      console.log(`✅ Found ${meetings.length} total meetings`)
    } catch (error: any) {
      console.error('Error fetching meetings:', error)
      // Continue anyway - might not have meetings
    }

    // Step 2: Fetch all phone calls (with pagination)
    console.log('📞 Fetching phone calls...')
    let phoneCalls: any[] = []
    try {
      let currentPage = 1
      let hasMore = true
      const limit = 100 // Fetch in smaller batches
      
      while (hasMore) {
        const phoneCallsData = await diioRequest('/v1/phone_calls', {
          params: { page: currentPage, limit }
        })
        
        const pageCalls = phoneCallsData.phone_calls || []
        phoneCalls.push(...pageCalls)
        
        console.log(`📄 Fetched page ${currentPage}: ${pageCalls.length} calls (total: ${phoneCalls.length})`)
        
        // Check if there are more pages
        hasMore = phoneCallsData.next !== null && pageCalls.length === limit
        currentPage++
        
        // Safety limit: stop after 100 pages (10,000 calls)
        if (currentPage > 100) {
          console.warn('⚠️ Reached safety limit of 100 pages for phone calls')
          break
        }
        
        // Small delay between pages to avoid rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      result.summary.phoneCallsFetched = phoneCalls.length
      console.log(`✅ Found ${phoneCalls.length} total phone calls`)
    } catch (error: any) {
      console.error('Error fetching phone calls (might not be available):', error)
      // Continue anyway - account might only have meetings
    }

    // Step 3: Extract transcript IDs
    const meetingTranscriptIds = meetings
      .filter(m => m.last_transcript_id || m.last_trancript_id)
      .map(m => m.last_transcript_id || m.last_trancript_id)
    
    const phoneCallTranscriptIds = phoneCalls
      .filter(c => c.last_transcript_id || c.last_trancript_id)
      .map(c => c.last_transcript_id || c.last_trancript_id)

    result.details.meetingTranscriptIds = meetingTranscriptIds
    result.details.phoneCallTranscriptIds = phoneCallTranscriptIds

    const allTranscriptIds = [...meetingTranscriptIds, ...phoneCallTranscriptIds]
    console.log(`📋 Found ${allTranscriptIds.length} total transcript IDs (${meetingTranscriptIds.length} meetings, ${phoneCallTranscriptIds.length} calls)`)

    // Step 4: Check which transcripts already exist
    let existingIds = new Set<string>()
    
    if (allTranscriptIds.length > 0) {
      // Supabase .in() doesn't work well with empty arrays, so check first
      const { data: existingTranscripts, error: queryError } = await supabase
        .from('diio_transcripts')
        .select('diio_transcript_id')
        .in('diio_transcript_id', allTranscriptIds)

      if (queryError) {
        console.error('Error querying existing transcripts:', queryError)
        throw new Error(`Database query failed: ${queryError.message}`)
      }

      existingIds = new Set(existingTranscripts?.map(t => t.diio_transcript_id) || [])
    }
    
    const newTranscriptIds = allTranscriptIds.filter(id => !existingIds.has(id))
    
    result.summary.newTranscriptsFound = newTranscriptIds.length
    console.log(`🆕 Found ${newTranscriptIds.length} new transcripts to fetch`)

    if (newTranscriptIds.length === 0) {
      result.success = true
      result.message = 'No new transcripts found. All transcripts are up to date.'
      return result
    }

    // Step 5: Fetch and store new transcripts
    console.log(`🎙️ Fetching and storing ${newTranscriptIds.length} new transcripts...`)
    
    for (let i = 0; i < newTranscriptIds.length; i++) {
      const transcriptId = newTranscriptIds[i]
      const isFromMeeting = meetingTranscriptIds.includes(transcriptId)
      const source = isFromMeeting ? 'meeting' : 'phone_call'
      
      // Find the source meeting/call for metadata
      const sourceMeeting = meetings.find(m => 
        (m.last_transcript_id || m.last_trancript_id) === transcriptId
      )
      const sourceCall = phoneCalls.find(c => 
        (c.last_transcript_id || c.last_trancript_id) === transcriptId
      )
      const sourceData = sourceMeeting || sourceCall

      try {
        // Fetch transcript
        const transcriptData = await diioRequest(`/v1/transcripts/${transcriptId}`)
        
        // Extract transcript text (handle different response structures)
        let transcriptText = ''
        
        if (typeof transcriptData === 'string') {
          transcriptText = transcriptData
        } else if (transcriptData && typeof transcriptData === 'object') {
          // Check if transcript field exists
          const transcriptField = transcriptData.transcript || transcriptData.text || transcriptData.content
          
          if (typeof transcriptField === 'string') {
            // Already a string
            transcriptText = transcriptField
          } else if (Array.isArray(transcriptField)) {
            // Array of transcript segments - extract text from each segment
            transcriptText = transcriptField.map((segment: any) => {
              if (typeof segment === 'string') {
                return segment
              } else if (segment && typeof segment === 'object') {
                // Try common field names for transcript segments
                return segment.text || 
                       segment.content || 
                       segment.transcript || 
                       segment.speech ||
                       (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) ||
                       JSON.stringify(segment)
              }
              return String(segment)
            }).filter((text: string) => text && text.trim().length > 0).join('\n')
          } else if (transcriptField && typeof transcriptField === 'object') {
            // Single object - try to extract text or stringify
            transcriptText = transcriptField.text || 
                           transcriptField.content || 
                           JSON.stringify(transcriptField)
          } else if (transcriptField) {
            // Fallback: convert to string
            transcriptText = String(transcriptField)
          }
          
          // Final check: if still empty, try the whole response
          if (!transcriptText && transcriptData) {
            // Log the structure for debugging
            console.log(`[DEBUG] Transcript structure for ${transcriptId}:`, Object.keys(transcriptData))
            
            // Try to find any text-like fields
            for (const key of Object.keys(transcriptData)) {
              const value = transcriptData[key]
              if (typeof value === 'string' && value.length > 10) {
                transcriptText = value
                break
              }
            }
            
            // Last resort: stringify the whole object
            if (!transcriptText) {
              transcriptText = JSON.stringify(transcriptData, null, 2)
            }
          }
        }
        
        // Ensure we have a string
        if (typeof transcriptText !== 'string') {
          transcriptText = String(transcriptText)
        }
        
        // Clean up: remove any "[object Object]" strings
        transcriptText = transcriptText.replace(/\[object Object\]/g, '').trim()

        // Skip if transcript is empty
        if (!transcriptText || transcriptText.trim().length === 0) {
          console.log(`⚠️ Skipping empty transcript ${transcriptId}`)
          result.summary.transcriptsSkipped++
          continue
        }

        // Prepare transcript record
        const transcriptRecord = {
          diio_transcript_id: transcriptId,
          transcript_text: transcriptText,
          transcript_type: source,
          source_id: sourceData?.id || transcriptId,
          source_name: sourceData?.name || 'Unknown',
          occurred_at: sourceData?.scheduled_at || sourceData?.occurred_at || null,
          duration: sourceData?.duration || null,
          attendees: sourceData?.attendees || null,
          analyzed_status: 'pending'
        }

        // Store in database
        const { error: insertError } = await supabase
          .from('diio_transcripts')
          .upsert(transcriptRecord, {
            onConflict: 'diio_transcript_id',
            ignoreDuplicates: false
          })

        if (insertError) {
          throw insertError
        }

        result.summary.transcriptsStored++
        result.details.storedTranscriptIds.push(transcriptId)
        console.log(`✅ Stored transcript ${i + 1}/${newTranscriptIds.length}: ${transcriptId}`)

        // Rate limiting: 1.5 seconds between requests
        if (i < newTranscriptIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

      } catch (error: any) {
        console.error(`❌ Error processing transcript ${transcriptId}:`, error)
        result.summary.errors++
        result.details.errors.push({
          transcriptId,
          error: error.message || 'Unknown error'
        })
        
        // Continue with next transcript
        continue
      }
    }

    result.success = true
    result.message = `Sync completed! Stored ${result.summary.transcriptsStored} new transcripts, skipped ${result.summary.transcriptsSkipped}, ${result.summary.errors} errors.`
    console.log(`✅ Sync completed: ${result.message}`)

    return result

  } catch (error: any) {
    console.error('❌ Sync failed:', error)
    result.success = false
    result.message = `Sync failed: ${error.message || 'Unknown error'}`
    
    // If it's a createError, preserve the status code
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        message: result.message
      })
    }
    
    // Otherwise return the result with error details
    return result
  }
})

