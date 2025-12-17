/**
 * GET /api/transcripts/stats
 * 
 * Get statistics about transcripts and Client ID sync status
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = config.public.supabaseAnonKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration missing'
    })
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Get total transcripts
    const { count: totalCount, error: totalError } = await supabase
      .from('diio_transcripts')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) {
      console.error('Error fetching total transcripts:', totalError)
      throw totalError
    }
    
    // Get transcripts with Client ID
    const { count: withClientIdCount, error: withClientIdError } = await supabase
      .from('diio_transcripts')
      .select('*', { count: 'exact', head: true })
      .not('client_platform_id', 'is', null)
    
    if (withClientIdError) {
      console.error('Error fetching transcripts with Client ID:', withClientIdError)
      throw withClientIdError
    }
    
    const total = totalCount || 0
    const withClientId = withClientIdCount || 0
    const missing = total - withClientId
    
    return {
      success: true,
      total,
      withClientId,
      missing,
      percentComplete: total > 0 ? ((withClientId / total) * 100).toFixed(1) : '0'
    }
    
  } catch (error: any) {
    console.error('Error fetching transcript stats:', error)
    return {
      success: false,
      error: error.message,
      total: 0,
      withClientId: 0,
      missing: 0
    }
  }
})

