import { createClient } from '@supabase/supabase-js'
import { logger } from '~/server/utils/logger'
import { validateSearchQuery, validateNumericParam, validateSortBy } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    logger.error('Supabase configuration missing')
    throw createError({
      statusCode: 500,
      message: 'Server configuration error. Please contact support.'
    })
  }
  
  // Get pagination and search params from query with validation
  const query = getQuery(event)
  const limit = validateNumericParam(query.limit, {
    min: 1,
    max: 200,
    defaultValue: 50,
    paramName: 'limit'
  })
  const offset = validateNumericParam(query.offset, {
    min: 0,
    defaultValue: 0,
    paramName: 'offset'
  })
  const searchQuery = validateSearchQuery(query.search as string, 200)
  const sortBy = validateSortBy(query.sortBy as string, [
    'interactions',
    'name',
    'sentiment',
    'tickets',
    'transcripts',
    'recent'
  ])
  
  try {
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseAnonKey
    )

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const threeMonthsAgoISO = threeMonthsAgo.toISOString()

    logger.debug('Filtering interactions from last 3 months', { date: threeMonthsAgoISO })

    // STEP 1: Get ALL clients from client_sentiment_summary (the source of truth - 655 records)
    const { data: allClientsFromSummary, error: summaryError } = await supabase
      .from('client_sentiment_summary')
      .select('client_id')
      .is('period_start', null) // All-time summary only
      .order('client_id')

    if (summaryError) {
      logger.error('Failed to fetch clients from sentiment summary', { error: summaryError })
      throw createError({
        statusCode: 500,
        message: 'Failed to load client data. Please try again later.'
      })
    }

    logger.debug('Found clients in sentiment summary', { count: allClientsFromSummary?.length || 0 })

    // STEP 2: Get client names from DIIO and Zendesk (no date filter - we want all names)
    const { data: diioNames, error: diioNameError } = await supabase
      .from('diio_transcripts')
      .select('client_platform_id, account_name')
      .not('client_platform_id', 'is', null)
      .order('client_platform_id')

    if (diioNameError) {
      logger.error('Failed to fetch DIIO client names', { error: diioNameError })
      // Non-critical error - continue without DIIO names
    }

    const { data: zendeskNames, error: zendeskNameError } = await supabase
      .from('zendesk_conversations')
      .select('client_id')
      .not('client_id', 'is', null)
      .order('client_id')

    if (zendeskNameError) {
      logger.error('Failed to fetch Zendesk client names', { error: zendeskNameError })
      // Non-critical error - continue without Zendesk names
    }

    logger.debug('Found client names', { diio: diioNames?.length || 0, zendesk: zendeskNames?.length || 0 })

    // STEP 3: Build client name lookup map
    const clientNameMap = new Map()
    
    // Add DIIO names (account_name is the best source)
    diioNames?.forEach((item: any) => {
      if (item.client_platform_id && item.account_name) {
        clientNameMap.set(item.client_platform_id, item.account_name)
      }
    })

    // Zendesk doesn't have names, just IDs
    // (client names from DIIO will be used if available)

    // STEP 4: Create client list from sentiment summary with names
    let clients = allClientsFromSummary?.map((item: any) => ({
      client_id: item.client_id,
      client_name: clientNameMap.get(item.client_id) || item.client_id,
      has_transcripts: false, // Will be updated when counting
      has_tickets: false // Will be updated when counting
    })) || []
    
    logger.debug('Created clients list', { count: clients.length })

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

    logger.debug('Sorting clients', { sortBy })

    // Get ALL client IDs (BEFORE pagination) so we can fetch data for all, sort, then paginate
    const clientIds = clients.map(c => c.client_id)
    logger.debug('Total clients to process', { count: clientIds.length })

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
          logger.error('Error fetching ticket counts', {
            batch: `${i}-${i+batchSize}`,
            offset: ticketOffset,
            error: ticketError
          })
          // Continue with next batch - don't fail entire request
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

        // Mark clients that have tickets
        ticketData?.forEach((row: any) => {
          const client = clients.find(c => c.client_id === row.client_id)
          if (client) {
            client.has_tickets = true
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
          .select('client_platform_id')
          .in('client_platform_id', batch)
          .gte('occurred_at', threeMonthsAgoISO)
          .range(transcriptOffset, transcriptOffset + pageSize - 1)

        if (transcriptError) {
          logger.error('Error fetching transcript counts', {
            batch: `${i}-${i+batchSize}`,
            offset: transcriptOffset,
            error: transcriptError
          })
          // Continue with next batch - don't fail entire request
          break
        }

        // Count transcripts for each client
        transcriptData?.forEach((row: any) => {
          transcriptCounts[row.client_platform_id] = (transcriptCounts[row.client_platform_id] || 0) + 1
        })

        // Check if we need to fetch more
        hasMoreTranscripts = transcriptData && transcriptData.length === pageSize
        transcriptOffset += pageSize
      }
    }

    const totalTickets = Object.values(ticketCounts).reduce((sum: number, count: number) => sum + count, 0)
    const totalTranscripts = Object.values(transcriptCounts).reduce((sum: number, count: number) => sum + count, 0)
    logger.debug('Counts fetched', {
      ticketClients: Object.keys(ticketCounts).length,
      totalTickets,
      transcriptClients: Object.keys(transcriptCounts).length,
      totalTranscripts
    })

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
        logger.warn('Error fetching enrichment data', {
          batch: `${i}-${i+batchSize}`,
          error: enrichError
        })
        // Non-critical - continue without enrichment data for this batch
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
        logger.warn('Error fetching sentiment data', {
          batch: `${i}-${i+batchSize}`,
          error: sentimentError
        })
        // Non-critical - continue without sentiment data for this batch
      }

      sentiments?.forEach((sentiment: any) => {
        sentimentMap[sentiment.client_id] = sentiment
      })
    }

    logger.debug('Enrichment and sentiment data fetched', {
      enrichment: Object.keys(enrichmentMap).length,
      sentiment: Object.keys(sentimentMap).length
    })

    // Combine all data BEFORE sorting and pagination
    // We need to enrich ALL clients first, then sort, then paginate
    const allEnrichedClients = clients.map(client => {
      const enrichment = enrichmentMap[client.client_id]
      const sentiment = sentimentMap[client.client_id]
      const payment = paymentIssues[client.client_id]
      const ticketCount = ticketCounts[client.client_id] || 0
      const transcriptCount = transcriptCounts[client.client_id] || 0
      return {
        ...client,
        ticket_count: ticketCount,
        transcript_count: transcriptCount,
        has_tickets: ticketCount > 0,
        has_transcripts: transcriptCount > 0,
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

    logger.debug('Returning clients', {
      returned: enrichedClients.length,
      offset,
      limit,
      total: totalClients,
      sortBy
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
    logger.error('Error fetching clients list', { error })
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a proper HTTP error response
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to load clients. Please try again later.',
      data: {
        success: false,
        clients: [],
        total: 0
      }
    })
  }
})
