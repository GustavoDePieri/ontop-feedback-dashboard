import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get pagination and search params from query
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0
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

    console.log('Filtering data from last 3 months:', threeMonthsAgoISO)

    // Get all unique clients from DIIO transcripts (last 3 months only)
    const { data: diioClients, error: diioError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id, account_name')
      .not('client_platform_id', 'is', null)
      .gte('occurred_at', threeMonthsAgoISO)
      .order('client_platform_id')

    if (diioError) throw diioError

    // Get all unique clients from Zendesk conversations 
    // Filter: is_external = TRUE and last 3 months only
    const { data: zendeskClients, error: zendeskError } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .not('client_id', 'is', null)
      .eq('is_external', true)
      .gte('created_at', threeMonthsAgoISO)
      .order('client_id')

    if (zendeskError) throw zendeskError

    console.log('Found DIIO clients:', diioClients?.length || 0)
    console.log('Found Zendesk external clients:', zendeskClients?.length || 0)

    // Merge and deduplicate clients
    const clientMap = new Map()

    // Add DIIO clients
    diioClients?.forEach((item: any) => {
      if (item.client_platform_id) {
        clientMap.set(item.client_platform_id, {
          client_id: item.client_platform_id,
          client_name: item.account_name || item.client_platform_id,
          has_transcripts: true,
          has_tickets: false
        })
      }
    })

    // Add/update with Zendesk clients
    zendeskClients?.forEach((item: any) => {
      if (item.client_id) {
        const existing = clientMap.get(item.client_id)
        if (existing) {
          existing.has_tickets = true
        } else {
          clientMap.set(item.client_id, {
            client_id: item.client_id,
            client_name: item.client_id,
            has_transcripts: false,
            has_tickets: true
          })
        }
      }
    })

    // Convert to array
    let clients = Array.from(clientMap.values())
    
    console.log(`📊 List API: DIIO: ${diioClients?.length || 0} records, Zendesk: ${zendeskClients?.length || 0} records, Unique clients after merge: ${clients.length}`)

    // Apply search filter if provided
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase()
      clients = clients.filter(client => 
        client.client_name.toLowerCase().includes(lowerSearch) ||
        client.client_id.toLowerCase().includes(lowerSearch)
      )
    }

    // Store total before pagination
    const totalClients = clients.length

    // Apply pagination
    const paginatedClients = clients.slice(offset, offset + limit)

    console.log(`Returning ${paginatedClients.length} clients (${offset}-${offset + limit} of ${totalClients})`)

    // Optimize: Get all counts and enrichment data in batch queries instead of per-client
    const clientIds = paginatedClients.map(c => c.client_id)

    // Batch query: Get ticket counts for all clients at once
    const { data: ticketData } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .in('client_id', clientIds)
      .eq('is_external', true)
      .gte('created_at', threeMonthsAgoISO)

    const ticketCounts = ticketData?.reduce((acc: any, row: any) => {
      acc[row.client_id] = (acc[row.client_id] || 0) + 1
      return acc
    }, {}) || {}

    // Batch query: Get transcript counts for all clients at once
    const { data: transcriptData } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id')
      .in('client_platform_id', clientIds)
      .gte('occurred_at', threeMonthsAgoISO)

    const transcriptCounts = transcriptData?.reduce((acc: any, row: any) => {
      acc[row.client_platform_id] = (acc[row.client_platform_id] || 0) + 1
      return acc
    }, {}) || {}

    // Batch query: Get enrichment data for all clients at once
    const { data: enrichments } = await supabase
      .from('client_enrichment')
      .select('client_id, enrichment_status, enriched_at, overall_sentiment, sentiment_score')
      .in('client_id', clientIds)

    const enrichmentMap = enrichments?.reduce((acc: any, enrich: any) => {
      acc[enrich.client_id] = enrich
      return acc
    }, {}) || {}

    // Combine all data
    const enrichedClients = paginatedClients.map(client => {
      const enrichment = enrichmentMap[client.client_id]
      return {
        ...client,
        ticket_count: ticketCounts[client.client_id] || 0,
        transcript_count: transcriptCounts[client.client_id] || 0,
        enrichment_status: enrichment?.enrichment_status || 'pending',
        enriched_at: enrichment?.enriched_at || null,
        overall_sentiment: enrichment?.overall_sentiment || null,
        sentiment_score: enrichment?.sentiment_score || null
      }
    })

    // Sort by total interactions (tickets + transcripts)
    enrichedClients.sort((a, b) => {
      const totalA = a.ticket_count + a.transcript_count
      const totalB = b.ticket_count + b.transcript_count
      return totalB - totalA
    })

    const hasMore = (offset + limit) < totalClients

    return {
      success: true,
      clients: enrichedClients,
      total: totalClients,
      limit,
      offset,
      hasMore,
      returned: enrichedClients.length
    }
  } catch (error: any) {
    console.error('Error fetching clients:', error)
    return {
      success: false,
      error: error.message,
      clients: [],
      total: 0
    }
  }
})
