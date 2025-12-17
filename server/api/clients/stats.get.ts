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

    // STEP 1: Get ALL clients from client_sentiment_summary (the source of truth - 655 records)
    const { data: allClientsFromSummary, error: summaryError } = await supabase
      .from('client_sentiment_summary')
      .select('client_id')
      .is('period_start', null) // All-time summary only
      .order('client_id')

    if (summaryError) throw summaryError

    console.log(`📊 Stats API: Found ${allClientsFromSummary?.length || 0} clients in client_sentiment_summary`)

    // STEP 2: Get client names from DIIO (no date filter - we want all names for search)
    const { data: diioNames, error: diioNameError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id, account_name')
      .not('client_platform_id', 'is', null)
      .order('client_platform_id')

    if (diioNameError) throw diioNameError

    console.log(`📊 Stats API: Found ${diioNames?.length || 0} DIIO names`)

    // STEP 3: Build client name lookup map
    const clientNameMap = new Map()
    
    // Add DIIO names (account_name is the best source)
    diioNames?.forEach((item: any) => {
      if (item.client_platform_id && item.account_name) {
        clientNameMap.set(item.client_platform_id, item.account_name)
      }
    })

    // STEP 4: Create client list from sentiment summary with names
    let clients = allClientsFromSummary?.map((item: any) => ({
      client_id: item.client_id,
      client_name: clientNameMap.get(item.client_id) || item.client_id
    })) || []
    
    console.log(`📊 Stats API: Created ${clients.length} clients from sentiment summary`)

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

    // STEP 5: Count interactions (tickets/transcripts) from last 3 months for filtered clients
    const { data: recentTickets, error: ticketsError } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .not('client_id', 'is', null)
      .eq('is_external', true)
      .gte('created_at', threeMonthsAgoISO)
      .in('client_id', Array.from(clientIds))

    if (ticketsError) throw ticketsError

    const { data: recentTranscripts, error: transcriptsError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id')
      .not('client_platform_id', 'is', null)
      .gte('occurred_at', threeMonthsAgoISO)
      .in('client_platform_id', Array.from(clientIds))

    if (transcriptsError) throw transcriptsError
    
    const totalTickets = recentTickets?.length || 0
    const totalTranscripts = recentTranscripts?.length || 0
    const totalInteractions = totalTickets + totalTranscripts
    
    console.log(`📊 Stats API: Filtered stats - ${clientIds.size} clients, ${totalTickets} tickets (last 3m), ${totalTranscripts} transcripts (last 3m)`)

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

