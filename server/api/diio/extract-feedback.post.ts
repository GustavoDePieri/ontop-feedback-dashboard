/**
 * POST /api/diio/extract-feedback
 * 
 * Extract feedback, sentiment, and churn signals from stored transcripts
 * Processes transcripts and stores feedback segments in diio_transcript_feedback table
 * 
 * Query Parameters:
 * - transcript_id: Optional - specific transcript ID to process
 * - limit: Optional - max number of transcripts to process (default: 100)
 * - force: Optional - force re-extraction even if already extracted
 */

import { createClient } from '@supabase/supabase-js'
import { parseTranscript, type FeedbackSegment, type TranscriptMetadata } from '~/server/utils/transcriptParser'
import { diioRequest } from '~/server/utils/diio'

interface ExtractionResult {
  success: boolean
  message: string
  summary: {
    transcriptsProcessed: number
    transcriptsSkipped: number
    feedbackSegmentsExtracted: number
    errors: number
  }
  details: {
    processedTranscriptIds: string[]
    skippedTranscriptIds: string[]
    errors: Array<{ transcriptId: string; error: string }>
  }
}

export default defineEventHandler(async (event): Promise<ExtractionResult> => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  // Initialize Supabase client
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration is missing'
    })
  }
  
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
  
  const result: ExtractionResult = {
    success: false,
    message: '',
    summary: {
      transcriptsProcessed: 0,
      transcriptsSkipped: 0,
      feedbackSegmentsExtracted: 0,
      errors: 0
    },
    details: {
      processedTranscriptIds: [],
      skippedTranscriptIds: [],
      errors: []
    }
  }
  
  try {
    console.log('🔄 Starting feedback extraction from transcripts...')
    
    const limit = query.limit ? parseInt(query.limit as string) : 100
    const force = query.force === 'true'
    const specificTranscriptId = query.transcript_id as string | undefined
    
    // Fetch transcripts to process
    let transcriptsQuery = supabase
      .from('diio_transcripts')
      .select('id, diio_transcript_id, transcript_text, transcript_type, source_id, source_name, occurred_at, duration, attendees, ai_analysis, ai_analysis_date, analyzed_status, client_platform_id, account_name, account_status, sentiment, sentiment_score, created_at, updated_at')
      .order('occurred_at', { ascending: false })
    
    if (specificTranscriptId) {
      transcriptsQuery = transcriptsQuery.eq('diio_transcript_id', specificTranscriptId)
    } else {
      // Only fetch transcripts that haven't been processed yet (unless force=true)
      // NOTE: Commented out feedback_extracted filter - add column to database if needed
      // See: database/fix_missing_feedback_extracted_column.sql
      // if (!force) {
      //   transcriptsQuery = transcriptsQuery.eq('feedback_extracted', false)
      // }
      transcriptsQuery = transcriptsQuery.limit(limit)
    }
    
    const { data: transcripts, error: transcriptsError } = await transcriptsQuery
    
    if (transcriptsError) {
      throw transcriptsError
    }
    
    if (!transcripts || transcripts.length === 0) {
      result.success = true
      result.message = 'No transcripts found to process'
      return result
    }
    
    console.log(`📋 Found ${transcripts.length} transcripts to process`)
    
    // Process each transcript
    for (const transcript of transcripts) {
      try {
        // Check if already extracted (unless force)
        // NOTE: Commented out feedback_extracted check - add column to database if needed
        // See: database/fix_missing_feedback_extracted_column.sql
        // if (!force && transcript.feedback_extracted) {
        //   console.log(`⏭️  Skipping transcript ${transcript.diio_transcript_id} (already extracted)`)
        //   result.summary.transcriptsSkipped++
        //   result.details.skippedTranscriptIds.push(transcript.diio_transcript_id)
        //   continue
        // }
        
        // Skip if transcript text is empty
        if (!transcript.transcript_text || transcript.transcript_text.trim().length === 0) {
          console.log(`⚠️ Skipping transcript ${transcript.diio_transcript_id} (empty transcript)`)
          result.summary.transcriptsSkipped++
          result.details.skippedTranscriptIds.push(transcript.diio_transcript_id)
          continue
        }
        
        console.log(`📝 Processing transcript ${transcript.diio_transcript_id}...`)
        
        // Extract participant emails from transcript attendees (tables diio_meetings and diio_phone_calls were removed)
        let sellerEmails: string[] = []
        let customerEmails: string[] = []
        let participantEmails: string[] = []
        
        // Extract emails directly from transcript attendees field
        if (transcript.attendees) {
          if (transcript.attendees.sellers) {
            sellerEmails = transcript.attendees.sellers.map((s: any) => s.email).filter((e: string) => e)
          }
          if (transcript.attendees.customers) {
            customerEmails = transcript.attendees.customers.map((c: any) => c.email).filter((e: string) => e)
          }
          // Combine all participant emails
          participantEmails = [...new Set([...sellerEmails, ...customerEmails])] // Remove duplicates
        }
        
        
        // Prepare metadata for parser
        const metadata: TranscriptMetadata = {
          callName: transcript.source_name || 'Unknown',
          date: transcript.occurred_at || transcript.created_at,
          sellerEmails,
          customerEmails,
          participantEmails,
          accountName: extractAccountName(transcript.source_name, sourceData?.attendees)
        }
        
        // Parse transcript
        const parsed = parseTranscript(transcript.transcript_text, metadata)
        
        if (parsed.feedbackSegments.length === 0) {
          console.log(`⚠️ No feedback segments found in transcript ${transcript.diio_transcript_id}`)
          // Still mark as extracted even if no feedback found
          // NOTE: Commented out feedback_extracted update - add column to database if needed
          // See: database/fix_missing_feedback_extracted_column.sql
          // await supabase
          //   .from('diio_transcripts')
          //   .update({
          //     feedback_extracted: true,
          //     feedback_extraction_date: new Date().toISOString(),
          //     feedback_segments_count: 0
          //   })
          //   .eq('id', transcript.id)
          
          result.summary.transcriptsProcessed++
          result.details.processedTranscriptIds.push(transcript.diio_transcript_id)
          continue
        }
        
        console.log(`✅ Extracted ${parsed.feedbackSegments.length} feedback segments`)
        
        // Get transcript UUID from database
        const transcriptId = transcript.id
        
        // Prepare feedback records
        const feedbackRecords = parsed.feedbackSegments.map((segment: FeedbackSegment, index: number) => {
          // Identify speaker type based on metadata
          let speakerType: 'seller' | 'customer' | 'unknown' = segment.speakerType
          
          // Enhanced speaker identification using attendees data
          if (segment.speakerType === 'unknown' && sourceData?.attendees) {
            const speakerNameLower = segment.speaker.toLowerCase()
            
            // Check if speaker matches any seller
            if (sourceData.attendees.sellers) {
              const sellerMatch = sourceData.attendees.sellers.find((s: any) => {
                const nameMatch = s.name?.toLowerCase().includes(speakerNameLower) || 
                                 speakerNameLower.includes(s.name?.toLowerCase())
                const emailMatch = s.email?.toLowerCase().includes(speakerNameLower)
                return nameMatch || emailMatch
              })
              
              if (sellerMatch) {
                speakerType = 'seller'
              }
            }
            
            // Check if speaker matches any customer
            if (speakerType === 'unknown' && sourceData.attendees.customers) {
              const customerMatch = sourceData.attendees.customers.find((c: any) => {
                const nameMatch = c.name?.toLowerCase().includes(speakerNameLower) || 
                                 speakerNameLower.includes(c.name?.toLowerCase())
                const emailMatch = c.email?.toLowerCase().includes(speakerNameLower)
                return nameMatch || emailMatch
              })
              
              if (customerMatch) {
                speakerType = 'customer'
              }
            }
          }
          
          // Calculate churn risk score for this segment
          const segmentChurnScore = segment.churnSignals.reduce((score, signal) => {
            const severityMap: Record<string, number> = {
              critical: 25,
              high: 15,
              medium: 8,
              low: 3
            }
            return score + (severityMap[signal.severity] || 0)
          }, 0)
          
          // Combine keywords with churn signal categories
          const allKeywords = [
            ...segment.keywords,
            ...segment.churnSignals.map(s => s.category)
          ]
          
          return {
            transcript_id: transcriptId,
            diio_transcript_id: transcript.diio_transcript_id,
            source_type: transcript.transcript_type,
            source_id: transcript.source_id,
            source_name: transcript.source_name,
            segment_number: index + 1,
            speaker_name: segment.speaker || 'Unknown',
            speaker_type: speakerType,
            feedback_text: segment.text,
            feedback_type: segment.type,
            urgency: segment.urgency,
            sentiment: segment.sentiment,
            keywords: allKeywords.length > 0 ? allKeywords : undefined,
            occurred_at: transcript.occurred_at || transcript.created_at,
            participant_emails: participantEmails.length > 0 ? participantEmails : undefined,
            account_name: metadata.accountName,
            analyzed_by_ai: false,
            ai_analysis_date: null
          }
        })
        
        // Store feedback segments in batches
        const batchSize = 100
        for (let i = 0; i < feedbackRecords.length; i += batchSize) {
          const batch = feedbackRecords.slice(i, i + batchSize)
          
          const { error: insertError } = await supabase
            .from('diio_transcript_feedback')
            .insert(batch)
          
          if (insertError) {
            console.error(`Error inserting feedback batch:`, insertError)
            throw insertError
          }
        }
        
        // Update transcript record
        // NOTE: Commented out feedback_extracted update - add column to database if needed
        // See: database/fix_missing_feedback_extracted_column.sql
        // await supabase
        //   .from('diio_transcripts')
        //   .update({
        //     feedback_extracted: true,
        //     feedback_extraction_date: new Date().toISOString(),
        //     feedback_segments_count: parsed.feedbackSegments.length
        //   })
        //   .eq('id', transcript.id)
        
        result.summary.transcriptsProcessed++
        result.summary.feedbackSegmentsExtracted += parsed.feedbackSegments.length
        result.details.processedTranscriptIds.push(transcript.diio_transcript_id)
        
        console.log(`✅ Successfully processed transcript ${transcript.diio_transcript_id} (${parsed.feedbackSegments.length} segments)`)
        
      } catch (error: any) {
        console.error(`❌ Error processing transcript ${transcript.diio_transcript_id}:`, error)
        result.summary.errors++
        result.details.errors.push({
          transcriptId: transcript.diio_transcript_id,
          error: error.message || 'Unknown error'
        })
        // Continue with next transcript
        continue
      }
    }
    
    result.success = true
    result.message = `Extraction completed! Processed ${result.summary.transcriptsProcessed} transcripts, extracted ${result.summary.feedbackSegmentsExtracted} feedback segments, skipped ${result.summary.transcriptsSkipped}, ${result.summary.errors} errors.`
    
    console.log(`✅ Extraction completed: ${result.message}`)
    
    return result
    
  } catch (error: any) {
    console.error('❌ Extraction failed:', error)
    result.success = false
    result.message = `Extraction failed: ${error.message || 'Unknown error'}`
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: result.message
    })
  }
})

/**
 * Extract account name from call name or attendees
 */
function extractAccountName(callName?: string, attendees?: any): string | undefined {
  if (!callName && !attendees) return undefined
  
  // Try to extract from call name
  if (callName) {
    const namePatterns = [
      /call with (.+?)(?:\s*-|\s*\(|$)/i,
      /meeting with (.+?)(?:\s*-|\s*\(|$)/i,
      /^(.+?)(?:\s*-|\s*call|\s*meeting)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = callName.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  }
  
  // Try to use customer name if available
  if (attendees?.customers && attendees.customers.length > 0) {
    return attendees.customers[0].name
  }
  
  return undefined
}

