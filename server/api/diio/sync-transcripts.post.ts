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

    // Step 4: Check which transcripts already exist (in chunks to avoid query limits)
    let existingIds = new Set<string>()
    
    if (allTranscriptIds.length > 0) {
      console.log(`🔍 Checking which of ${allTranscriptIds.length} transcripts already exist in database...`)
      
      // Supabase .in() has limits, so we need to query in chunks
      const chunkSize = 100 // Safe chunk size for .in() queries
      const chunks: string[][] = []
      
      for (let i = 0; i < allTranscriptIds.length; i += chunkSize) {
        chunks.push(allTranscriptIds.slice(i, i + chunkSize))
      }
      
      console.log(`📦 Processing ${chunks.length} chunks of transcript IDs...`)
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        try {
          const { data: existingTranscripts, error: queryError } = await supabase
            .from('diio_transcripts')
            .select('diio_transcript_id')
            .in('diio_transcript_id', chunk)

          if (queryError) {
            console.error(`Error querying chunk ${i + 1}/${chunks.length}:`, queryError)
            // Continue with other chunks even if one fails
            continue
          }

          if (existingTranscripts) {
            existingTranscripts.forEach((t: any) => {
              existingIds.add(t.diio_transcript_id)
            })
          }
          
          if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
            console.log(`✅ Processed ${i + 1}/${chunks.length} chunks (${existingIds.size} existing transcripts found so far)`)
          }
        } catch (error: any) {
          console.error(`Error processing chunk ${i + 1}:`, error)
          // Continue with next chunk
          continue
        }
      }
      
      console.log(`✅ Found ${existingIds.size} existing transcripts in database`)
    }
    
    const newTranscriptIds = allTranscriptIds.filter(id => !existingIds.has(id))
    
    result.summary.newTranscriptsFound = newTranscriptIds.length
    console.log(`🆕 Found ${newTranscriptIds.length} new transcripts to fetch`)
    console.log(`📊 Summary: ${meetings.length} total meetings, ${phoneCalls.length} total phone calls`)

    if (newTranscriptIds.length === 0) {
      result.success = true
      result.message = `No new transcripts found. All transcripts are up to date. (${meetings.length} meetings, ${phoneCalls.length} calls checked)`
      return result
    }

    // Step 5: Fetch and store new transcripts in batches of 100
    console.log(`🎙️ Fetching and storing ${newTranscriptIds.length} new transcripts in batches of 100...`)
    
    const batchSize = 100
    const batches: string[][] = []
    
    for (let i = 0; i < newTranscriptIds.length; i += batchSize) {
      batches.push(newTranscriptIds.slice(i, i + batchSize))
    }
    
    console.log(`📦 Processing ${batches.length} batches of transcripts...`)
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} transcripts)...`)
      
      for (let i = 0; i < batch.length; i++) {
        const transcriptId = batch[i]
        const globalIndex = batchIndex * batchSize + i + 1
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
                  // Prioritize speaker reconstruction if both speaker and text are available
                  if (segment.speaker && segment.text) {
                    return `${segment.speaker}: ${segment.text}`
                  }

                  return segment.text ||
                         segment.content ||
                         segment.transcript ||
                         segment.speech ||
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
          
          // Log progress every 10 transcripts or at batch boundaries
          if (globalIndex % 10 === 0 || i === batch.length - 1) {
            console.log(`✅ Progress: ${globalIndex}/${newTranscriptIds.length} (${result.summary.transcriptsStored} stored, ${result.summary.transcriptsSkipped} skipped, ${result.summary.errors} errors)`)
          }

          // Rate limiting: 1.5 seconds between requests
          if (i < batch.length - 1) {
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
      
      // Small delay between batches
      if (batchIndex < batches.length - 1) {
        console.log(`⏸️  Batch ${batchIndex + 1} complete. Pausing 2 seconds before next batch...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    result.success = true
    result.message = `Sync completed! Found ${meetings.length} meetings and ${phoneCalls.length} calls. Stored ${result.summary.transcriptsStored} new transcripts, skipped ${result.summary.transcriptsSkipped}, ${result.summary.errors} errors.`
    console.log(`✅ Sync completed: ${result.message}`)
    
    // Step 6: Automatically extract feedback from newly stored transcripts
    if (result.summary.transcriptsStored > 0) {
      console.log(`\n🎯 Starting automatic feedback extraction for ${result.summary.transcriptsStored} new transcripts...`)
      
      try {
        // Call extraction endpoint internally
        const extractionResult = await $fetch('/api/diio/extract-feedback', {
          method: 'POST',
          params: {
            limit: result.summary.transcriptsStored
          }
        })
        
        if (extractionResult.success) {
          console.log(`✅ Feedback extraction completed: ${extractionResult.message}`)
          result.message += ` | Extracted ${extractionResult.summary.feedbackSegmentsExtracted} feedback segments from ${extractionResult.summary.transcriptsProcessed} transcripts.`
        } else {
          console.warn(`⚠️ Feedback extraction completed with warnings: ${extractionResult.message}`)
          result.message += ` | Extraction warning: ${extractionResult.message}`
          // Track this as a warning that may need attention
          if (!result.details.errors) {
            result.details.errors = []
          }
          result.details.errors.push({
            transcriptId: 'feedback_extraction',
            error: `Extraction completed with warnings: ${extractionResult.message}`
          })
        }
      } catch (extractionError: any) {
        const errorMessage = extractionError?.message || extractionError?.data?.message || 'Unknown extraction error'
        console.error('⚠️ Feedback extraction failed (non-blocking):', errorMessage)
        console.error('   Full error:', extractionError)
        
        // Track extraction failure in errors array
        if (!result.details.errors) {
          result.details.errors = []
        }
        result.details.errors.push({
          transcriptId: 'feedback_extraction',
          error: `Automatic feedback extraction failed: ${errorMessage}. Run extraction manually via /api/diio/extract-feedback`
        })
        
        // Add to summary error count
        result.summary.errors++
        
        // Add detailed message for user
        result.message += ` | ⚠️ Feedback extraction failed: ${errorMessage} (can be run manually)`
      }
    }

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

