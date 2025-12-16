import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Get pagination and search params from query
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0
  const searchQuery = (query.search as string) || ''
  const sortBy = (query.sortBy as string) || 'interactions'
  
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

    console.log(`Sorting by: ${sortBy}`)

    // Get ALL client IDs (BEFORE pagination) so we can fetch data for all, sort, then paginate
    const clientIds = clients.map(c => c.client_id)
    console.log(`📊 Total unique clients to process: ${clientIds.length}`)

    // Initialize count objects
    const ticketCounts: Record<string, number> = {}
    const transcriptCounts: Record<string, number> = {}
    const paymentIssues: Record<string, { count: number; negative_count: number; total_sentiment: number }> = {}

    // Process in batches to avoid hitting Supabase limits
    const batchSize = 50  // Reduced to ensure we don't hit 1000 row limit per query
    for (let i = 0; i < clientIds.length; i += batchSize) {
      const batch = clientIds.slice(i, i + batchSize)
      
      // Fetch ALL ticket counts for this batch (with pagination to avoid 1000 row limit)
      let ticketOffset = 0
      let hasMoreTickets = true
      const pageSize = 1000
      
      while (hasMoreTickets) {
        const { data: ticketData, error: ticketError } = await supabase
          .from('zendesk_conversations')
          .select('client_id, aspect_sentiment, issue_category, subject, sentiment_score')
          .in('client_id', batch)
          .eq('is_external', true)
          .gte('created_at', threeMonthsAgoISO)
          .range(ticketOffset, ticketOffset + pageSize - 1)

        if (ticketError) {
          console.error(`❌ Error fetching ticket counts for batch ${i}-${i+batchSize}, offset ${ticketOffset}:`, ticketError)
          break
        }

        // Count tickets and analyze payment issues for each client
        ticketData?.forEach((row: any) => {
          ticketCounts[row.client_id] = (ticketCounts[row.client_id] || 0) + 1
          
          // Track payment-related tickets
          const hasPaymentAspect = row.aspect_sentiment?.payments !== undefined && row.aspect_sentiment?.payments !== null
          const isPaymentCategory = row.issue_category?.toLowerCase().includes('payment')
          const isPaymentInSubject = row.subject?.toLowerCase().match(/payment|pago|pay|billing|factura|cobro|cargo|refund|reembolso/i)
          
          if (hasPaymentAspect || isPaymentCategory || isPaymentInSubject) {
            if (!paymentIssues[row.client_id]) {
              paymentIssues[row.client_id] = {
                count: 0,
                negative_count: 0,
                total_sentiment: 0
              }
            }
            const sentiment = row.aspect_sentiment?.payments || row.sentiment_score || 0
            paymentIssues[row.client_id].count++
            paymentIssues[row.client_id].total_sentiment += sentiment
            if (sentiment < -0.1) {
              paymentIssues[row.client_id].negative_count++
            }
          }
        })

        // Check if we need to fetch more
        hasMoreTickets = ticketData && ticketData.length === pageSize
        ticketOffset += pageSize
      }

      // Fetch ALL transcript counts for this batch (with pagination)
      let transcriptOffset = 0
      let hasMoreTranscripts = true
      
      while (hasMoreTranscripts) {
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('diio_transcripts')
          .select('client_platform_id, aspect_sentiment, sentiment_score')
          .in('client_platform_id', batch)
          .gte('occurred_at', threeMonthsAgoISO)
          .range(transcriptOffset, transcriptOffset + pageSize - 1)

        if (transcriptError) {
          console.error(`❌ Error fetching transcript counts for batch ${i}-${i+batchSize}, offset ${transcriptOffset}:`, transcriptError)
          break
        }

        // Count transcripts and analyze payment issues for each client
        transcriptData?.forEach((row: any) => {
          transcriptCounts[row.client_platform_id] = (transcriptCounts[row.client_platform_id] || 0) + 1
          
          // Track payment-related transcripts
          const hasPaymentAspect = row.aspect_sentiment?.payments !== undefined && row.aspect_sentiment?.payments !== null
          
          if (hasPaymentAspect) {
            if (!paymentIssues[row.client_platform_id]) {
              paymentIssues[row.client_platform_id] = {
                count: 0,
                negative_count: 0,
                total_sentiment: 0
              }
            }
            const sentiment = row.aspect_sentiment?.payments || row.sentiment_score || 0
            paymentIssues[row.client_platform_id].count++
            paymentIssues[row.client_platform_id].total_sentiment += sentiment
            if (sentiment < -0.1) {
              paymentIssues[row.client_platform_id].negative_count++
            }
          }
        })

        // Check if we need to fetch more
        hasMoreTranscripts = transcriptData && transcriptData.length === pageSize
        transcriptOffset += pageSize
      }
    }

    const totalTickets = Object.values(ticketCounts).reduce((sum: number, count: number) => sum + count, 0)
    const totalTranscripts = Object.values(transcriptCounts).reduce((sum: number, count: number) => sum + count, 0)
    console.log(`📊 Ticket counts: ${Object.keys(ticketCounts).length} clients with ${totalTickets} total tickets`)
    console.log(`📊 Transcript counts: ${Object.keys(transcriptCounts).length} clients with ${totalTranscripts} total transcripts`)

    // Fetch enrichment and sentiment data in batches
    const enrichmentMap: Record<string, any> = {}
    const sentimentMap: Record<string, any> = {}

    for (let i = 0; i < clientIds.length; i += batchSize) {
      const batch = clientIds.slice(i, i + batchSize)
      
      // Fetch enrichment data for this batch (these tables are small, no pagination needed)
      const { data: enrichments, error: enrichError } = await supabase
        .from('client_enrichment')
        .select('client_id, enrichment_status, enriched_at, overall_sentiment, sentiment_score')
        .in('client_id', batch)

      if (enrichError) {
        console.error(`❌ Error fetching enrichment for batch ${i}-${i+batchSize}:`, enrichError)
      }

      enrichments?.forEach((enrich: any) => {
        enrichmentMap[enrich.client_id] = enrich
      })

      // Fetch sentiment data for this batch
      const { data: sentiments, error: sentimentError } = await supabase
        .from('client_sentiment_summary')
        .select('client_id, client_sentiment_category, client_final_score, total_tickets_analyzed, positive_percentage, negative_percentage, neutral_percentage')
        .in('client_id', batch)
        .is('period_start', null) // Get all-time summary (where period is NULL)

      if (sentimentError) {
        console.error(`❌ Error fetching sentiment for batch ${i}-${i+batchSize}:`, sentimentError)
      }

      sentiments?.forEach((sentiment: any) => {
        sentimentMap[sentiment.client_id] = sentiment
      })
    }

    console.log(`📊 Enrichment data for ${Object.keys(enrichmentMap).length} clients`)
    console.log(`📊 Sentiment data for ${Object.keys(sentimentMap).length} clients`)

    // Combine all data BEFORE sorting and pagination
    // We need to enrich ALL clients first, then sort, then paginate
    const allEnrichedClients = clients.map(client => {
      const enrichment = enrichmentMap[client.client_id]
      const sentiment = sentimentMap[client.client_id]
      const payment = paymentIssues[client.client_id]
      return {
        ...client,
        ticket_count: ticketCounts[client.client_id] || 0,
        transcript_count: transcriptCounts[client.client_id] || 0,
        enrichment_status: enrichment?.enrichment_status || 'pending',
        payment_issues: payment ? {
          count: payment.count,
          negative_count: payment.negative_count,
          avg_sentiment: payment.count > 0 ? payment.total_sentiment / payment.count : 0
        } : null,
        enriched_at: enrichment?.enriched_at || null,
        overall_sentiment: enrichment?.overall_sentiment || null,
        sentiment_score: enrichment?.sentiment_score || null,
        // Real sentiment from client_sentiment_summary (calculated from actual data)
        real_sentiment_category: sentiment?.client_sentiment_category || null,
        real_sentiment_score: sentiment?.client_final_score || null,
        sentiment_stats: sentiment ? {
          total_analyzed: sentiment.total_tickets_analyzed,
          positive_percentage: sentiment.positive_percentage,
          negative_percentage: sentiment.negative_percentage,
          neutral_percentage: sentiment.neutral_percentage
        } : null
      }
    })

    // Sort ALL clients based on sortBy parameter
    allEnrichedClients.sort((a, b) => {
      switch (sortBy) {
        case 'sentiment-desc':
          // Positive first (higher scores first)
          const scoreDescA = a.real_sentiment_score ?? -999
          const scoreDescB = b.real_sentiment_score ?? -999
          return scoreDescB - scoreDescA
        
        case 'sentiment-asc':
          // Negative first (lower scores first)
          const scoreAscA = a.real_sentiment_score ?? 999
          const scoreAscB = b.real_sentiment_score ?? 999
          return scoreAscA - scoreAscB
        
        case 'name':
          return a.client_name.localeCompare(b.client_name)
        
        case 'recent':
          if (!a.enriched_at) return 1
          if (!b.enriched_at) return -1
          return new Date(b.enriched_at).getTime() - new Date(a.enriched_at).getTime()
        
        case 'interactions':
        default:
          // Sort by total interactions (tickets + transcripts)
          const totalA = a.ticket_count + a.transcript_count
          const totalB = b.ticket_count + b.transcript_count
          return totalB - totalA
      }
    })

    // NOW apply pagination after sorting
    const enrichedClients = allEnrichedClients.slice(offset, offset + limit)

    console.log(`Returning ${enrichedClients.length} clients (${offset}-${offset + limit} of ${totalClients}) sorted by ${sortBy}`)

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
