import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseAnonKey!
    )

    // Get all unique clients from DIIO transcripts
    const { data: diioClients, error: diioError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id, account_name')
      .not('client_platform_id', 'is', null)
      .order('client_platform_id')

    if (diioError) throw diioError

    // Get all unique clients from Zendesk conversations
    const { data: zendeskClients, error: zendeskError } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .not('client_id', 'is', null)
      .order('client_id')

    if (zendeskError) throw zendeskError

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
    const clients = Array.from(clientMap.values())

    // For each client, get counts and enrichment status
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        // Get ticket count
        const { count: ticketCount } = await supabase
          .from('zendesk_conversations')
          .select('ticket_id', { count: 'exact', head: true })
          .eq('client_id', client.client_id)

        // Get transcript count
        const { count: transcriptCount } = await supabase
          .from('diio_transcripts')
          .select('id', { count: 'exact', head: true })
          .eq('client_platform_id', client.client_id)

        // Get enrichment status
        const { data: enrichment } = await supabase
          .from('client_enrichment')
          .select('enrichment_status, enriched_at, overall_sentiment, sentiment_score')
          .eq('client_id', client.client_id)
          .single()

        return {
          ...client,
          ticket_count: ticketCount || 0,
          transcript_count: transcriptCount || 0,
          enrichment_status: enrichment?.enrichment_status || 'pending',
          enriched_at: enrichment?.enriched_at || null,
          overall_sentiment: enrichment?.overall_sentiment || null,
          sentiment_score: enrichment?.sentiment_score || null
        }
      })
    )

    // Sort by total interactions (tickets + transcripts)
    enrichedClients.sort((a, b) => {
      const totalA = a.ticket_count + a.transcript_count
      const totalB = b.ticket_count + b.transcript_count
      return totalB - totalA
    })

    return {
      success: true,
      clients: enrichedClients,
      total: enrichedClients.length
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
