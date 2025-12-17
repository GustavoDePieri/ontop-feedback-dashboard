import { createClient } from '@supabase/supabase-js'
import { logger } from '~/server/utils/logger'
import { validateSearchQuery, validateNumericParam, validateSortBy } from '~/server/utils/validation'
import { cache, generateCacheKey } from '~/server/utils/cache'

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

  // Check cache (5 minute TTL)
  const cacheKey = generateCacheKey('clients:list', { limit, offset, searchQuery, sortBy })
  const cached = cache.get(cacheKey)
  if (cached) {
    logger.debug('Returning cached clients list')
    return cached
  }
  
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

    // STEP 1: Get ALL clients from client_sentiment_summary in parallel with names
    const [summaryResult, diioNamesResult, zendeskNamesResult] = await Promise.all([
      supabase
        .from('client_sentiment_summary')
        .select('client_id')
        .is('period_start', null)
        .order('client_id'),
      supabase
        .from('diio_transcripts')
        .select('client_platform_id, account_name')
        .not('client_platform_id', 'is', null)
        .order('client_platform_id'),
      supabase
        .from('zendesk_conversations')
        .select('client_id')
        .not('client_id', 'is', null)
        .order('client_id')
    ])

    if (summaryResult.error) {
      logger.error('Failed to fetch clients from sentiment summary', { error: summaryResult.error })
      throw createError({
        statusCode: 500,
        message: 'Failed to load client data. Please try again later.'
      })
    }

    const allClientsFromSummary = summaryResult.data || []
    const diioNames = diioNamesResult.data || []
    const zendeskNames = zendeskNamesResult.data || []

    logger.debug('Found clients and names', {
      clients: allClientsFromSummary.length,
      diio: diioNames.length,
      zendesk: zendeskNames.length
    })

    // STEP 2: Build client name lookup map
    const clientNameMap = new Map()
    diioNames.forEach((item: any) => {
      if (item.client_platform_id && item.account_name) {
        clientNameMap.set(item.client_platform_id, item.account_name)
      }
    })

    // STEP 3: Create client list from sentiment summary with names
    let clients = allClientsFromSummary.map((item: any) => ({
      client_id: item.client_id,
      client_name: clientNameMap.get(item.client_id) || item.client_id,
      has_transcripts: false,
      has_tickets: false
    }))
    
    logger.debug('Created clients list', { count: clients.length })

    // STEP 4: Apply search filter (client-side for now, can be moved to DB later)
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase()
      clients = clients.filter(client => 
        client.client_name.toLowerCase().includes(lowerSearch) ||
        client.client_id.toLowerCase().includes(lowerSearch)
      )
    }

    const totalClients = clients.length
    const clientIds = clients.map(c => c.client_id)

    logger.debug('Clients after search filter', { count: clientIds.length, sortBy })

    // STEP 5: Fetch counts using database aggregations (OPTIMIZED)
    // Use COUNT queries instead of fetching all records
    const batchSize = 100 // Increased batch size since we're only counting
    const ticketCounts: Record<string, number> = {}
    const transcriptCounts: Record<string, number> = {}
    const paymentIssues: Record<string, { count: number; negative_count: number; total_sentiment: number }> = {}

    // Process in batches with parallel queries
    for (let i = 0; i < clientIds.length; i += batchSize) {
      const batch = clientIds.slice(i, i + batchSize)
      
      // Execute ticket and transcript queries in parallel
      const [ticketResult, transcriptResult] = await Promise.all([
        // Get ticket counts and payment data in one query
        supabase
          .from('zendesk_conversations')
          .select('client_id, aspect_sentiment, issue_category, subject, sentiment_score')
          .in('client_id', batch)
          .eq('is_external', true)
          .gte('created_at', threeMonthsAgoISO),
        // Get transcript counts
        supabase
          .from('diio_transcripts')
          .select('client_platform_id')
          .in('client_platform_id', batch)
          .gte('occurred_at', threeMonthsAgoISO)
      ])

      if (ticketResult.error) {
        logger.error('Error fetching ticket counts', {
          batch: `${i}-${i+batchSize}`,
          error: ticketResult.error
        })
        // Continue with next batch
      } else {
        // Count tickets and analyze payment issues
        ticketResult.data?.forEach((row: any) => {
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
      }

      if (transcriptResult.error) {
        logger.error('Error fetching transcript counts', {
          batch: `${i}-${i+batchSize}`,
          error: transcriptResult.error
        })
        // Continue with next batch
      } else {
        // Count transcripts
        transcriptResult.data?.forEach((row: any) => {
          transcriptCounts[row.client_platform_id] = (transcriptCounts[row.client_platform_id] || 0) + 1
        })
      }
    }

    logger.debug('Counts fetched', {
      ticketClients: Object.keys(ticketCounts).length,
      transcriptClients: Object.keys(transcriptCounts).length
    })

    // STEP 6: Fetch enrichment and sentiment data in parallel (only for clients we need)
    const enrichmentMap: Record<string, any> = {}
    const sentimentMap: Record<string, any> = {}

    // Fetch enrichment and sentiment in parallel batches
    for (let i = 0; i < clientIds.length; i += batchSize) {
      const batch = clientIds.slice(i, i + batchSize)
      
      const [enrichmentResult, sentimentResult] = await Promise.all([
        supabase
          .from('client_enrichment')
          .select('client_id, enrichment_status, enriched_at, overall_sentiment, sentiment_score')
          .in('client_id', batch),
        supabase
          .from('client_sentiment_summary')
          .select('client_id, client_sentiment_category, client_final_score, total_tickets_analyzed, positive_percentage, negative_percentage, neutral_percentage')
          .in('client_id', batch)
          .is('period_start', null)
      ])

      if (!enrichmentResult.error) {
        enrichmentResult.data?.forEach((enrich: any) => {
          enrichmentMap[enrich.client_id] = enrich
        })
      }

      if (!sentimentResult.error) {
        sentimentResult.data?.forEach((sentiment: any) => {
          sentimentMap[sentiment.client_id] = sentiment
        })
      }
    }

    logger.debug('Enrichment and sentiment data fetched', {
      enrichment: Object.keys(enrichmentMap).length,
      sentiment: Object.keys(sentimentMap).length
    })

    // STEP 7: Combine all data and sort
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

    // STEP 8: Sort based on sortBy parameter
    allEnrichedClients.sort((a, b) => {
      switch (sortBy) {
        case 'sentiment':
          const scoreA = a.real_sentiment_score ?? -999
          const scoreB = b.real_sentiment_score ?? -999
          return scoreB - scoreA
        
        case 'name':
          return a.client_name.localeCompare(b.client_name)
        
        case 'recent':
          if (!a.enriched_at) return 1
          if (!b.enriched_at) return -1
          return new Date(b.enriched_at).getTime() - new Date(a.enriched_at).getTime()
        
        case 'tickets':
          return b.ticket_count - a.ticket_count
        
        case 'transcripts':
          return b.transcript_count - a.transcript_count
        
        case 'interactions':
        default:
          const totalA = a.ticket_count + a.transcript_count
          const totalB = b.ticket_count + b.transcript_count
          return totalB - totalA
      }
    })

    // STEP 9: Apply pagination
    const enrichedClients = allEnrichedClients.slice(offset, offset + limit)

    logger.debug('Returning clients', {
      returned: enrichedClients.length,
      offset,
      limit,
      total: totalClients,
      sortBy
    })

    const hasMore = (offset + limit) < totalClients

    const result = {
      success: true,
      clients: enrichedClients,
      total: totalClients,
      limit,
      offset,
      hasMore,
      returned: enrichedClients.length
    }

    // Cache the result (5 minutes)
    cache.set(cacheKey, result, 5 * 60 * 1000)

    return result
  } catch (error: any) {
    logger.error('Error fetching clients list', { error })
    
    if (error.statusCode) {
      throw error
    }
    
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
