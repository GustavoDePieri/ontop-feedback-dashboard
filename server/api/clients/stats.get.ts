import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get search parameter from query
  const query = getQuery(event)
  const searchQuery = (query.search as string) || ''
  
  try {
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseAnonKey!
    )

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthsAgoISO = threeMonthsAgo.toISOString()

    console.log(`📊 Stats API called with search: "${searchQuery}"`)

    // Get all clients from both sources to calculate stats
    // We need enrichment status and interaction counts
    
    // Get DIIO clients with transcript counts and account names for search
    const { data: diioClients, error: diioError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id, account_name')
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

    // Merge and deduplicate clients (same logic as list.get.ts)
    const clientMap = new Map()

    // Add DIIO clients
    diioClients?.forEach((item: any) => {
      if (item.client_platform_id) {
        clientMap.set(item.client_platform_id, {
          client_id: item.client_platform_id,
          client_name: item.account_name || item.client_platform_id
        })
      }
    })

    // Add/update with Zendesk clients
    zendeskClients?.forEach((item: any) => {
      if (item.client_id) {
        const existing = clientMap.get(item.client_id)
        if (existing) {
          // Client already exists from DIIO
        } else {
          clientMap.set(item.client_id, {
            client_id: item.client_id,
            client_name: item.client_id
          })
        }
      }
    })

    // Convert to array
    let clients = Array.from(clientMap.values())
    
    console.log(`📊 Stats API: DIIO: ${diioClients?.length || 0} records, Zendesk: ${zendeskClients?.length || 0} records, Unique clients before search: ${clients.length}`)

    // Apply search filter (same logic as list.get.ts)
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase()
      clients = clients.filter((client: any) => 
        client.client_name.toLowerCase().includes(lowerSearch) ||
        client.client_id.toLowerCase().includes(lowerSearch)
      )
      console.log(`📊 Stats API: After search filter "${searchQuery}": ${clients.length} clients`)
    }

    // Get all filtered client IDs
    const clientIds = new Set(clients.map((c: any) => c.client_id))

    // Get enrichment status for filtered clients only
    const { data: enrichmentData, error: enrichmentError } = await supabase
      .from('client_enrichment')
      .select('client_id, enrichment_status')
      .in('client_id', Array.from(clientIds))

    if (enrichmentError) throw enrichmentError

    // Calculate stats for filtered clients
    const enriched = enrichmentData?.filter((e: any) => e.enrichment_status === 'completed').length || 0
    const pending = clientIds.size - enriched // All clients without completed enrichment are pending

    // Calculate total interactions for filtered clients only
    const filteredTickets = zendeskClients?.filter((t: any) => clientIds.has(t.client_id)) || []
    const filteredTranscripts = diioClients?.filter((t: any) => clientIds.has(t.client_platform_id)) || []
    
    const totalTickets = filteredTickets.length
    const totalTranscripts = filteredTranscripts.length
    const totalInteractions = totalTickets + totalTranscripts
    
    console.log(`📊 Stats API: Filtered stats - ${clientIds.size} clients, ${totalTickets} tickets, ${totalTranscripts} transcripts`)

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

