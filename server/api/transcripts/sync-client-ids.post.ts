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
    console.log('🔄 Starting Client ID sync for transcripts...')
    
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
      console.log(`📊 Iteration ${iteration}: Looking for transcripts without Client IDs...`)
      
      updateSyncProgress({
        currentBatch: iteration,
        currentStep: `Batch ${iteration}: Finding transcripts without Client IDs...`
      })
      
      // Step 1: Find transcripts without client_platform_id that haven't been attempted yet
      // Exclude transcripts that have already been attempted (client_id_lookup_attempted_at is set)
      // Try with the attempted_at filter first, fall back if column doesn't exist yet
      let transcripts: any[] | null = null
      let fetchError: any = null
      
      // Try query with client_id_lookup_attempted_at filter
      let query = supabase
        .from('diio_transcripts')
        .select('id, diio_transcript_id, attendees, client_id_lookup_attempted_at')
        .is('client_platform_id', null)
        .is('client_id_lookup_attempted_at', null)
        .limit(50)
      
      const result = await query
      fetchError = result.error
      
      // If column doesn't exist, fall back to query without it
      if (fetchError && (fetchError.message?.includes('column') || fetchError.code === 'PGRST116')) {
        console.log('⚠️ client_id_lookup_attempted_at column not found, using fallback query')
        const fallbackResult = await supabase
          .from('diio_transcripts')
          .select('id, diio_transcript_id, attendees')
          .is('client_platform_id', null)
          .limit(50)
        
        transcripts = fallbackResult.data
        fetchError = fallbackResult.error
      } else {
        transcripts = result.data
      }
      
      if (fetchError) {
        throw new Error(`Failed to fetch transcripts: ${fetchError.message}`)
      }
      
      if (!transcripts || transcripts.length === 0) {
        console.log('✅ No more transcripts need Client IDs!')
        updateSyncProgress({
          currentStep: '✅ Sync complete! No more transcripts need Client IDs.',
          isRunning: false
        })
        hasMore = false
        break
      }
      
      console.log(`📋 Found ${transcripts.length} transcripts without Client IDs`)
      
      updateSyncProgress({
        transcriptsProcessed: result.summary.transcriptsProcessed,
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
        console.log('⚠️ No new customer emails found in this batch (all already attempted)')
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
      
      console.log(`📧 Extracted ${uniqueEmails.length} unique customer emails (${attemptedEmails.size} total attempted in this session)`)
      
      // Step 3: Call n8n webhook with emails
      try {
        console.log(`📡 Calling n8n webhook: ${n8nWebhookUrl}`)
        console.log(`📧 Sending ${uniqueEmails.length} emails to n8n`)
        
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
        
        console.log(`📥 n8n response status: ${n8nResponse.status}`)
        console.log(`📥 n8n response content-type: ${contentType}`)
        
        if (!n8nResponse.ok) {
          console.error(`❌ n8n webhook error response: ${responseText.substring(0, 500)}`)
          throw new Error(`n8n webhook returned ${n8nResponse.status}: ${responseText.substring(0, 200)}`)
        }
        
        // Check if response is JSON
        if (!contentType.includes('application/json')) {
          console.error(`❌ n8n returned non-JSON response (${contentType}): ${responseText.substring(0, 500)}`)
          throw new Error(`n8n webhook returned HTML instead of JSON. Check webhook URL and workflow configuration. Response preview: ${responseText.substring(0, 200)}`)
        }
        
        let n8nData
        try {
          const parsed = JSON.parse(responseText)
          console.log(`📦 n8n response type: ${Array.isArray(parsed) ? 'array' : 'object'}`)
          // n8n returns an array, so extract the first element if it's an array
          n8nData = Array.isArray(parsed) ? parsed[0] : parsed
          console.log(`✅ Extracted n8n data: success=${n8nData?.success}, results=${Object.keys(n8nData?.results || {}).length}, notFound=${Array.isArray(n8nData?.notFound) ? n8nData.notFound.length : 0}`)
        } catch (parseError: any) {
          console.error(`❌ Failed to parse n8n response as JSON: ${parseError.message}`)
          console.error(`Response text: ${responseText.substring(0, 500)}`)
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
        
        console.log(`✅ Received ${clientIdMap.size} Client IDs from n8n`)
        
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
        
        console.log(`📧 Found ${clientIdMap.size} Client IDs, ${notFoundEmails.length} emails not found (filtered from ${notFoundArray.length} total entries)`)
        
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
          console.log(`🏷️ Marking ${notFoundTranscriptIds.size} transcripts as attempted (no Client ID found)`)
          const now = new Date().toISOString()
          for (const transcriptId of notFoundTranscriptIds) {
            try {
              const { error } = await supabase
                .from('diio_transcripts')
                .update({ client_id_lookup_attempted_at: now })
                .eq('id', transcriptId)
              
              // If column doesn't exist, log warning but continue
              if (error && (error.message?.includes('column') || error.code === 'PGRST116')) {
                console.log('⚠️ client_id_lookup_attempted_at column not found - run migration to enable tracking')
                break // Skip remaining updates if column doesn't exist
              }
            } catch (err: any) {
              // Silently continue if column doesn't exist
              if (err.message?.includes('column') || err.code === 'PGRST116') {
                console.log('⚠️ client_id_lookup_attempted_at column not found - run migration to enable tracking')
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
        
        console.log(`✅ Updated ${result.summary.transcriptsUpdated} transcripts in this iteration`)
        
        updateSyncProgress({
          transcriptsUpdated: result.summary.transcriptsUpdated,
          transcriptsProcessed: result.summary.transcriptsProcessed,
          errors: result.summary.errors,
          currentStep: `Batch ${iteration} complete: ${result.summary.transcriptsUpdated} updated, ${result.summary.errors} errors`
        })
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (n8nError: any) {
        console.error('❌ Error calling n8n webhook:', n8nError)
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
    
    console.log(`✅ Sync complete:`)
    console.log(`   - ${result.summary.transcriptsUpdated} transcripts updated with Client IDs`)
    console.log(`   - ${result.summary.emailsExtracted} unique emails processed`)
    console.log(`   - ${result.details.notFound.length} transcripts marked as attempted (no Client ID found)`)
    console.log(`   - ${result.summary.errors} errors`)
    console.log(`   - ${attemptedEmails.size} total emails attempted in this session`)
    
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
    console.error('❌ Sync error:', error)
    
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

