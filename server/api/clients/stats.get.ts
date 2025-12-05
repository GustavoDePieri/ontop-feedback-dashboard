import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseAnonKey!
    )

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthsAgoISO = threeMonthsAgo.toISOString()

    // Get all clients from both sources to calculate stats
    // We need enrichment status and interaction counts
    
    // Get DIIO clients with transcript counts
    const { data: diioClients, error: diioError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id')
      .not('client_platform_id', 'is', null)
      .gte('occurred_at', threeMonthsAgoISO)

    if (diioError) throw diioError

    // Get Zendesk clients with ticket counts
    const { data: zendeskClients, error: zendeskError } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .not('client_id', 'is', null)
      .eq('is_external', true)
      .gte('created_at', threeMonthsAgoISO)

    if (zendeskError) throw zendeskError

    // Get all unique client IDs
    const clientIds = new Set([
      ...(diioClients?.map((c: any) => c.client_platform_id) || []),
      ...(zendeskClients?.map((c: any) => c.client_id) || [])
    ])
    
    console.log(`📊 Stats API: DIIO: ${diioClients?.length || 0} records, Zendesk: ${zendeskClients?.length || 0} records, Unique clients after merge: ${clientIds.size}`)

    // Get enrichment status for all clients
    const { data: enrichmentData, error: enrichmentError } = await supabase
      .from('client_enrichment')
      .select('client_id, enrichment_status')
      .in('client_id', Array.from(clientIds))

    if (enrichmentError) throw enrichmentError

    // Calculate stats
    const enriched = enrichmentData?.filter((e: any) => e.enrichment_status === 'completed').length || 0
    const pending = clientIds.size - enriched // All clients without completed enrichment are pending

    // Calculate total interactions (tickets + transcripts)
    const totalTickets = zendeskClients?.length || 0
    const totalTranscripts = diioClients?.length || 0
    const totalInteractions = totalTickets + totalTranscripts

    return {
      success: true,
      stats: {
        enriched,
        pending,
        totalInteractions,
        totalClients: clientIds.size
      }
    }
  } catch (error: any) {
    console.error('Error fetching client stats:', error)
    return {
      success: false,
      error: error.message,
      stats: {
        enriched: 0,
        pending: 0,
        totalInteractions: 0,
        totalClients: 0
      }
    }
  }
})

