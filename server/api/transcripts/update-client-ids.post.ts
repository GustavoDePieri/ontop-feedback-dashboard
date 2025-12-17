/**
 * POST /api/transcripts/update-client-ids
 * 
 * Updates transcripts with Client IDs
 * Used by n8n workflow after looking up Client IDs from Salesforce
 * 
 * Request body:
 * {
 *   "updates": [
 *     {
 *       "transcript_id": "uuid-or-diio-id",
 *       "client_platform_id": "CL001234",
 *       "account_name": "Example Corp"
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "updated": 5,
 *   "errors": []
 * }
 */

import { createClient } from '@supabase/supabase-js'

interface UpdateRequest {
  updates: Array<{
    transcript_id: string // Can be UUID or diio_transcript_id
    client_platform_id: string
    account_name?: string
  }>
}

interface UpdateResult {
  success: boolean
  message?: string
  updated: number
  errors: Array<{ transcript_id: string; error: string }>
}

export default defineEventHandler(async (event): Promise<UpdateResult> => {
  const config = useRuntimeConfig()
  
  // Initialize Supabase
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration missing'
    })
  }
  
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
  
  // Parse request body
  const body = await readBody<UpdateRequest>(event)
  
  if (!body || !Array.isArray(body.updates) || body.updates.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Request body must contain an array of updates'
    })
  }
  
  const result: UpdateResult = {
    success: true,
    updated: 0,
    errors: []
  }
  
  try {
    console.log(`🔄 Updating ${body.updates.length} transcripts with Client IDs...`)
    
    // Process updates in batches
    const batchSize = 50
    for (let i = 0; i < body.updates.length; i += batchSize) {
      const batch = body.updates.slice(i, i + batchSize)
      
      for (const update of batch) {
        try {
          // Try to find transcript by UUID first, then by diio_transcript_id
          let query = supabase
            .from('diio_transcripts')
            .update({
              client_platform_id: update.client_platform_id,
              account_name: update.account_name || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', update.transcript_id)
          
          const { data: uuidResult, error: uuidError } = await query
          
          // If UUID lookup failed, try diio_transcript_id
          if (uuidError || !uuidResult || uuidResult.length === 0) {
            query = supabase
              .from('diio_transcripts')
              .update({
                client_platform_id: update.client_platform_id,
                account_name: update.account_name || null,
                updated_at: new Date().toISOString()
              })
              .eq('diio_transcript_id', update.transcript_id)
            
            const { data: diioResult, error: diioError } = await query
            
            if (diioError) {
              result.errors.push({
                transcript_id: update.transcript_id,
                error: diioError.message
              })
              continue
            }
            
            if (!diioResult || diioResult.length === 0) {
              result.errors.push({
                transcript_id: update.transcript_id,
                error: 'Transcript not found'
              })
              continue
            }
          }
          
          result.updated++
        } catch (error: any) {
          result.errors.push({
            transcript_id: update.transcript_id,
            error: error.message || 'Unknown error'
          })
        }
      }
    }
    
    console.log(`✅ Updated ${result.updated} transcripts, ${result.errors.length} errors`)
    
    return result
  } catch (error: any) {
    console.error('Update error:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to update transcripts: ${error.message}`
    })
  }
})

