/**
 * POST /api/transcripts/sync-client-ids
 * 
 * Syncs Client IDs for transcripts by calling n8n webhook
 * 
 * Flow:
 * 1. Find transcripts without client_platform_id
 * 2. Extract customer emails from attendees
 * 3. Call n8n webhook with emails
 * 4. Receive Client IDs from n8n
 * 5. Update transcripts in database
 * 6. Repeat until no more transcripts need Client IDs
 * 
 * Can be called:
 * - Manually via POST
 * - Scheduled (cron job)
 * - Webhook from DIIO sync
 */

import { createClient } from '@supabase/supabase-js'
import { updateSyncProgress, clearSyncProgress } from '~/server/utils/sync-progress'
import { logger } from '~/server/utils/logger'

interface SyncResult {
  success: boolean
  message: string
  summary: {
    transcriptsProcessed: number
    emailsExtracted: number
    clientIdsMatched: number
    transcriptsUpdated: number
    errors: number
  }
  details: {
    matched: Array<{ transcript_id: string; email: string; client_id: string }>
    notFound: Array<{ transcript_id: string; email: string }>
    errors: Array<{ transcript_id: string; error: string }>
  }
}

export default defineEventHandler(async (event): Promise<SyncResult> => {
  const config = useRuntimeConfig()
  
  // Initialize Supabase
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration missing'
    })
  }
  
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
  
  // Get n8n webhook URL from environment
  const n8nWebhookUrl = config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || ''
  
  if (!n8nWebhookUrl) {
    throw createError({
      statusCode: 500,
      message: 'N8N_WEBHOOK_URL environment variable is required'
    })
  }
  
  const result: SyncResult = {
    success: true,
    message: '',
    summary: {
      transcriptsProcessed: 0,
      emailsExtracted: 0,
      clientIdsMatched: 0,
      transcriptsUpdated: 0,
      errors: 0
    },
    details: {
      matched: [],
      notFound: [],
      errors: []
    }
  }
  
  try {
    logger.info('Starting Client ID sync for transcripts')
    
    // Initialize progress tracking
    clearSyncProgress()
    updateSyncProgress({
      isRunning: true,
      currentStep: 'Initializing sync...',
      currentBatch: 0
    })
    
    // Keep processing until no more transcripts need Client IDs
    let hasMore = true
    const maxIterations = 100 // Safety limit
    let iteration = 0
    
    // Track emails we've already attempted in this sync session
    const attemptedEmails = new Set<string>()
    
    while (hasMore && iteration < maxIterations) {
      iteration++
      logger.debug(`Iteration ${iteration}: Looking for transcripts without Client IDs`, { iteration })
      
      updateSyncProgress({
        currentBatch: iteration,
        currentStep: `Batch ${iteration}: Finding transcripts without Client IDs...`
      })
      
      // Step 1: Find transcripts without client_platform_id that haven't been attempted yet
      // Use separate queries for NULL and empty string, then combine
      // This is more reliable than .or() syntax which can be problematic
      let transcripts: any[] = []
      let fetchError: any = null
      
      // First, try to query for NULL client_platform_id
      // Check if client_id_lookup_attempted_at column exists by trying to select it
      let nullQuery = supabase
        .from('diio_transcripts')
        .select('id, diio_transcript_id, attendees, client_id_lookup_attempted_at')
        .is('client_platform_id', null)
        .limit(50)
      
      // If column doesn't exist, fall back to query without it
      let nullResult = await nullQuery
      if (nullResult.error && (nullResult.error.message?.includes('column') || nullResult.error.code === 'PGRST116')) {
        // Column doesn't exist, query without it
        nullQuery = supabase
          .from('diio_transcripts')
          .select('id, diio_transcript_id, attendees')
          .is('client_platform_id', null)
          .limit(50)
        nullResult = await nullQuery
      }
      
      // Filter out transcripts that have already been attempted (if column exists)
      if (nullResult.data) {
        const nullTranscripts = nullResult.data.filter((t: any) => {
          // If client_id_lookup_attempted_at exists and is set, skip it
          return !t.client_id_lookup_attempted_at
        })
        transcripts.push(...nullTranscripts)
      }
      
      if (nullResult.error && !nullResult.error.message?.includes('column')) {
        fetchError = nullResult.error
      }
      
      // Also query for empty string client_platform_id
      let emptyQuery = supabase
        .from('diio_transcripts')
        .select('id, diio_transcript_id, attendees, client_id_lookup_attempted_at')
        .eq('client_platform_id', '')
        .limit(50)
      
      let emptyResult = await emptyQuery
      if (emptyResult.error && (emptyResult.error.message?.includes('column') || emptyResult.error.code === 'PGRST116')) {
        emptyQuery = supabase
          .from('diio_transcripts')
          .select('id, diio_transcript_id, attendees')
          .eq('client_platform_id', '')
          .limit(50)
        emptyResult = await emptyQuery
      }
      
      if (emptyResult.data) {
        const emptyTranscripts = emptyResult.data.filter((t: any) => {
          return !t.client_id_lookup_attempted_at
        })
        transcripts.push(...emptyTranscripts)
      }
      
      if (emptyResult.error && !emptyResult.error.message?.includes('column')) {
        fetchError = emptyResult.error || fetchError
      }
      
      // Deduplicate by id (in case a transcript appears in both queries)
      const uniqueMap = new Map()
      transcripts.forEach(t => uniqueMap.set(t.id, t))
      transcripts = Array.from(uniqueMap.values()).slice(0, 50)
      
      if (fetchError) {
        logger.error('Query error while fetching transcripts', { error: fetchError })
        throw new Error(`Failed to fetch transcripts: ${fetchError.message}`)
      }
      
      if (transcripts.length === 0) {
        // Debug: Check what's actually in the database
        const debugQuery = await supabase
          .from('diio_transcripts')
          .select('id, client_platform_id, client_id_lookup_attempted_at')
          .limit(10)
        
        const nullCount = await supabase
          .from('diio_transcripts')
          .select('id', { count: 'exact', head: true })
          .is('client_platform_id', null)
        
        const emptyCount = await supabase
          .from('diio_transcripts')
          .select('id', { count: 'exact', head: true })
          .eq('client_platform_id', '')
        
        // Check how many have been attempted
        let attemptedCount = 0
        try {
          const attemptedQuery = await supabase
            .from('diio_transcripts')
            .select('id', { count: 'exact', head: true })
            .is('client_platform_id', null)
            .not('client_id_lookup_attempted_at', 'is', null)
          attemptedCount = attemptedQuery.count || 0
        } catch (e) {
          // Column doesn't exist, that's fine
        }
        
        logger.debug('No transcripts found - debug info', {
          nullCount: nullCount.count,
          emptyCount: emptyCount.count,
          attemptedCount,
          sampleTranscripts: debugQuery.data?.slice(0, 3)
        })
        
        logger.info('No more transcripts need Client IDs')
        updateSyncProgress({
          currentStep: `✅ Sync complete! No transcripts found (NULL: ${nullCount.count}, Empty: ${emptyCount.count}, Already attempted: ${attemptedCount})`,
          isRunning: false
        })
        hasMore = false
        break
      }
      
      logger.info(`Found ${transcripts.length} transcripts without Client IDs`, { count: transcripts.length })
      
      updateSyncProgress({
        transcriptsProcessed: result.summary.transcriptsProcessed || 0,
        currentStep: `Batch ${iteration}: Found ${transcripts.length} transcripts, extracting emails...`
      })
      
      // Step 2: Extract customer emails from attendees
      // Only include emails we haven't attempted yet
      const emailMap = new Map<string, Array<{ transcript_id: string; diio_id: string }>>()
      const transcriptIdsToMark = new Set<string>() // Track transcripts we're processing
      
      for (const transcript of transcripts) {
        transcriptIdsToMark.add(transcript.id)
        try {
          const attendees = transcript.attendees as any
          
          if (attendees && attendees.customers && Array.isArray(attendees.customers)) {
            for (const customer of attendees.customers) {
              if (customer.email && typeof customer.email === 'string' && customer.email.includes('@')) {
                const email = customer.email.toLowerCase().trim()
                
                // Skip emails we've already attempted in this session
                if (attemptedEmails.has(email)) {
                  continue
                }
                
                if (!emailMap.has(email)) {
                  emailMap.set(email, [])
                }
                
                emailMap.get(email)!.push({
                  transcript_id: transcript.id,
                  diio_id: transcript.diio_transcript_id
                })
              }
            }
          }
        } catch (error: any) {
          result.details.errors.push({
            transcript_id: transcript.id || transcript.diio_transcript_id,
            error: `Failed to extract email: ${error.message}`
          })
          result.summary.errors++
        }
      }
      
      const uniqueEmails = Array.from(emailMap.keys())
      result.summary.emailsExtracted += uniqueEmails.length
      
      updateSyncProgress({
        emailsExtracted: result.summary.emailsExtracted,
        currentStep: `Batch ${iteration}: Extracted ${uniqueEmails.length} unique emails, querying Salesforce...`
      })
      
      if (uniqueEmails.length === 0) {
        logger.warn('No new customer emails found in this batch (all already attempted)')
        // Mark these transcripts as attempted even if no emails
        for (const transcriptId of transcriptIdsToMark) {
          await supabase
            .from('diio_transcripts')
            .update({ client_id_lookup_attempted_at: new Date().toISOString() })
            .eq('id', transcriptId)
        }
        continue
      }
      
      // Add emails to attempted set
      uniqueEmails.forEach(email => attemptedEmails.add(email))
      
      logger.info(`Extracted ${uniqueEmails.length} unique customer emails`, {
        uniqueEmails: uniqueEmails.length,
        totalAttempted: attemptedEmails.size
      })
      
      // Step 3: Call n8n webhook with emails
      try {
        logger.debug('Calling n8n webhook', { url: n8nWebhookUrl, emailCount: uniqueEmails.length })
        
        updateSyncProgress({
          currentStep: `Batch ${iteration}: Calling Salesforce via n8n for ${uniqueEmails.length} emails...`
        })
        
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emails: uniqueEmails
          })
        })
        
        // Check content type before parsing
        const contentType = n8nResponse.headers.get('content-type') || ''
        const responseText = await n8nResponse.text()
        
        logger.debug('n8n response received', {
          status: n8nResponse.status,
          contentType
        })
        
        if (!n8nResponse.ok) {
          logger.error('n8n webhook error response', {
            status: n8nResponse.status,
            response: responseText.substring(0, 500)
          })
          throw new Error(`n8n webhook returned ${n8nResponse.status}: ${responseText.substring(0, 200)}`)
        }
        
        // Check if response is JSON
        if (!contentType.includes('application/json')) {
          logger.error('n8n returned non-JSON response', {
            contentType,
            response: responseText.substring(0, 500)
          })
          throw new Error(`n8n webhook returned HTML instead of JSON. Check webhook URL and workflow configuration. Response preview: ${responseText.substring(0, 200)}`)
        }
        
        let n8nData
        try {
          const parsed = JSON.parse(responseText)
          // n8n returns an array, so extract the first element if it's an array
          n8nData = Array.isArray(parsed) ? parsed[0] : parsed
          logger.debug('Extracted n8n data', {
            success: n8nData?.success,
            resultsCount: Object.keys(n8nData?.results || {}).length,
            notFoundCount: Array.isArray(n8nData?.notFound) ? n8nData.notFound.length : 0
          })
        } catch (parseError: any) {
          logger.error('Failed to parse n8n response as JSON', {
            error: parseError.message,
            response: responseText.substring(0, 500)
          })
          throw new Error(`n8n response is not valid JSON: ${parseError.message}. Response preview: ${responseText.substring(0, 200)}`)
        }
        
        // Step 4: Process n8n response
        // Expected format from n8n (may be wrapped in array):
        // [
        //   {
        //     "success": true,
        //     "results": {
        //       "email@example.com": {
        //         "client_platform_id": "CL001234",
        //         "account_name": "Example Corp"
        //       }
        //     },
        //     "notFound": ["email2@example.com", null, null, ...]
        //   }
        // ]
        
        if (!n8nData || typeof n8nData !== 'object') {
          throw new Error('Invalid n8n response format: expected object')
        }
        
        const clientIdMap = new Map<string, { client_id: string; account_name?: string }>()
        
        // Process results
        if (n8nData.results && typeof n8nData.results === 'object') {
          for (const [email, data] of Object.entries(n8nData.results)) {
            if (data && typeof data === 'object' && 'client_platform_id' in data) {
              const clientData = data as { client_platform_id: string; account_name?: string }
              if (clientData.client_platform_id) {
                clientIdMap.set(email.toLowerCase(), {
                  client_id: clientData.client_platform_id,
                  account_name: clientData.account_name
                })
              }
            }
          }
        }
        
        logger.debug(`Received ${clientIdMap.size} Client IDs from n8n`, { count: clientIdMap.size })
        
        // Step 5: Update transcripts in database
        const updates: any[] = []
        
        for (const [email, clientData] of clientIdMap.entries()) {
          const transcriptsForEmail = emailMap.get(email) || []
          
          for (const transcriptRef of transcriptsForEmail) {
            updates.push({
              transcript_id: transcriptRef.transcript_id,
              diio_id: transcriptRef.diio_id,
              client_platform_id: clientData.client_id,
              account_name: clientData.account_name
            })
            
            result.details.matched.push({
              transcript_id: transcriptRef.transcript_id,
              email: email,
              client_id: clientData.client_id
            })
          }
        }
        
        // Mark emails not found - filter out null values
        const notFoundArray = n8nData.notFound || []
        const notFoundEmails = Array.isArray(notFoundArray) 
          ? notFoundArray.filter((email: any) => email !== null && email !== undefined && typeof email === 'string')
          : []
        
        logger.info('Client IDs matched from n8n', {
          matched: clientIdMap.size,
          notFound: notFoundEmails.length,
          totalEntries: notFoundArray.length
        })
        
        updateSyncProgress({
          clientIdsMatched: result.summary.clientIdsMatched,
          currentStep: `Batch ${iteration}: Found ${clientIdMap.size} Client IDs, updating transcripts...`
        })
        
        // Track transcripts that didn't find Client IDs
        const notFoundTranscriptIds = new Set<string>()
        
        for (const email of notFoundEmails) {
          const transcriptsForEmail = emailMap.get(email.toLowerCase()) || []
          for (const transcriptRef of transcriptsForEmail) {
            notFoundTranscriptIds.add(transcriptRef.transcript_id)
            result.details.notFound.push({
              transcript_id: transcriptRef.transcript_id,
              email: email
            })
          }
        }
        
        // Mark transcripts that were attempted but didn't find Client IDs
        // This prevents us from retrying them in future syncs
        if (notFoundTranscriptIds.size > 0) {
          logger.info(`Marking ${notFoundTranscriptIds.size} transcripts as attempted (no Client ID found)`, {
            count: notFoundTranscriptIds.size
          })
          const now = new Date().toISOString()
          for (const transcriptId of notFoundTranscriptIds) {
            try {
              const { error } = await supabase
                .from('diio_transcripts')
                .update({ client_id_lookup_attempted_at: now })
                .eq('id', transcriptId)
              
              // If column doesn't exist, log warning but continue
              if (error && (error.message?.includes('column') || error.code === 'PGRST116')) {
                logger.warn('client_id_lookup_attempted_at column not found - run migration to enable tracking')
                break // Skip remaining updates if column doesn't exist
              }
            } catch (err: any) {
              // Silently continue if column doesn't exist
              if (err.message?.includes('column') || err.code === 'PGRST116') {
                logger.warn('client_id_lookup_attempted_at column not found - run migration to enable tracking')
                break
              }
            }
          }
        }
        
        // Also mark transcripts that were processed (even if they got Client IDs)
        // This helps track which transcripts have been through the sync process
        const processedTranscriptIds = new Set<string>()
        for (const [email] of clientIdMap.entries()) {
          const transcriptsForEmail = emailMap.get(email) || []
          for (const transcriptRef of transcriptsForEmail) {
            processedTranscriptIds.add(transcriptRef.transcript_id)
          }
        }
        
        // Mark all transcripts in this batch as attempted
        for (const transcriptId of transcriptIdsToMark) {
          if (!processedTranscriptIds.has(transcriptId) && !notFoundTranscriptIds.has(transcriptId)) {
            // Transcript was in batch but had no emails or other issue
            try {
              const { error } = await supabase
                .from('diio_transcripts')
                .update({ client_id_lookup_attempted_at: new Date().toISOString() })
                .eq('id', transcriptId)
              
              // If column doesn't exist, skip silently
              if (error && (error.message?.includes('column') || error.code === 'PGRST116')) {
                break
              }
            } catch (err: any) {
              // Silently continue if column doesn't exist
              if (err.message?.includes('column') || err.code === 'PGRST116') {
                break
              }
            }
          }
        }
        
        // Batch update transcripts
        if (updates.length > 0) {
          for (const update of updates) {
            try {
              // Try by UUID first
              let query = supabase
                .from('diio_transcripts')
                .update({
                  client_platform_id: update.client_platform_id,
                  account_name: update.account_name || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', update.transcript_id)
              
              const { error: updateError } = await query
              
              // If UUID update failed, try diio_transcript_id
              if (updateError) {
                query = supabase
                  .from('diio_transcripts')
                  .update({
                    client_platform_id: update.client_platform_id,
                    account_name: update.account_name || null,
                    updated_at: new Date().toISOString()
                  })
                  .eq('diio_transcript_id', update.diio_id)
                
                const { error: diioError } = await query
                
                if (diioError) {
                  throw new Error(diioError.message)
                }
              }
              
              result.summary.transcriptsUpdated++
              result.summary.clientIdsMatched++
            } catch (error: any) {
              result.details.errors.push({
                transcript_id: update.transcript_id,
                error: error.message
              })
              result.summary.errors++
            }
          }
        }
        
        result.summary.transcriptsProcessed += transcripts.length
        
        logger.info(`Updated ${result.summary.transcriptsUpdated} transcripts in this iteration`, {
          updated: result.summary.transcriptsUpdated,
          iteration
        })
        
        updateSyncProgress({
          transcriptsUpdated: result.summary.transcriptsUpdated,
          transcriptsProcessed: result.summary.transcriptsProcessed,
          errors: result.summary.errors,
          currentStep: `Batch ${iteration} complete: ${result.summary.transcriptsUpdated} updated, ${result.summary.errors} errors`
        })
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (n8nError: any) {
        logger.error('Error calling n8n webhook', { error: n8nError })
        result.details.errors.push({
          transcript_id: 'batch',
          error: `n8n webhook error: ${n8nError.message}`
        })
        result.summary.errors++
        // Continue with next batch
      }
    }
    
    if (iteration >= maxIterations) {
      result.message = `Processed ${maxIterations} iterations (safety limit). There may be more transcripts to process.`
    } else {
      result.message = `Successfully synced Client IDs for all available transcripts.`
    }
    
    logger.info('Sync complete', {
      transcriptsUpdated: result.summary.transcriptsUpdated,
      emailsExtracted: result.summary.emailsExtracted,
      notFoundCount: result.details.notFound.length,
      errors: result.summary.errors,
      totalEmailsAttempted: attemptedEmails.size
    })
    
    // Final progress update
    updateSyncProgress({
      isRunning: false,
      currentStep: `✅ Sync complete! ${result.summary.transcriptsUpdated} transcripts updated, ${result.summary.errors} errors`,
      transcriptsProcessed: result.summary.transcriptsProcessed,
      transcriptsUpdated: result.summary.transcriptsUpdated,
      clientIdsMatched: result.summary.clientIdsMatched,
      errors: result.summary.errors
    })
    
    return result
    
  } catch (error: any) {
    logger.error('Sync error', { error })
    
    // Update progress with error
    updateSyncProgress({
      isRunning: false,
      currentStep: `❌ Sync failed: ${error.message}`,
      errors: result.summary.errors + 1
    })
    
    throw createError({
      statusCode: 500,
      message: `Failed to sync Client IDs: ${error.message}`
    })
  } finally {
    // Clear progress after a delay (to allow UI to fetch final state)
    setTimeout(() => {
      clearSyncProgress()
    }, 30000) // Clear after 30 seconds
  }
})

