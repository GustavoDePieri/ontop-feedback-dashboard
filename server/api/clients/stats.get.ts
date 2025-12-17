import { createClient } from '@supabase/supabase-js'
import { logger } from '~/server/utils/logger'
import { validateSearchQuery } from '~/server/utils/validation'
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
  
  // Get and validate search parameter from query
  const query = getQuery(event)
  const searchQuery = validateSearchQuery(query.search as string, 200)

  // Check cache (10 minute TTL)
  const cacheKey = generateCacheKey('clients:stats', { searchQuery })
  const cached = cache.get(cacheKey)
  if (cached) {
    logger.debug('Returning cached client stats')
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

    logger.debug('Stats API called', { searchQuery })

    // STEP 1: Get ALL clients and names in parallel
    const [summaryResult, diioNamesResult] = await Promise.all([
      supabase
        .from('client_sentiment_summary')
        .select('client_id')
        .is('period_start', null)
        .order('client_id'),
      supabase
        .from('diio_transcripts')
        .select('client_platform_id, account_name')
        .not('client_platform_id', 'is', null)
        .order('client_platform_id')
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

    logger.debug('Found clients and names', {
      clients: allClientsFromSummary.length,
      diio: diioNames.length
    })

    // STEP 2: Build client name lookup map
    const clientNameMap = new Map()
    diioNames.forEach((item: any) => {
      if (item.client_platform_id && item.account_name) {
        clientNameMap.set(item.client_platform_id, item.account_name)
      }
    })

    // STEP 3: Create client list with names
    let clients = allClientsFromSummary.map((item: any) => ({
      client_id: item.client_id,
      client_name: clientNameMap.get(item.client_id) || item.client_id
    }))
    
    logger.debug('Created clients list', { count: clients.length })

    // STEP 4: Apply search filter
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase()
      clients = clients.filter((client: any) => 
        client.client_name.toLowerCase().includes(lowerSearch) ||
        client.client_id.toLowerCase().includes(lowerSearch)
      )
      logger.debug('After search filter', { count: clients.length })
    }

    // Get all filtered client IDs
    const clientIds = new Set(clients.map((c: any) => c.client_id))

    // STEP 5: Fetch enrichment status and interaction counts in parallel
    const [enrichmentResult, ticketsResult, transcriptsResult] = await Promise.all([
      supabase
        .from('client_enrichment')
        .select('client_id, enrichment_status')
        .in('client_id', Array.from(clientIds)),
      supabase
        .from('zendesk_conversations')
        .select('client_id')
        .not('client_id', 'is', null)
        .eq('is_external', true)
        .gte('created_at', threeMonthsAgoISO)
        .in('client_id', Array.from(clientIds)),
      supabase
        .from('diio_transcripts')
        .select('client_platform_id')
        .not('client_platform_id', 'is', null)
        .gte('occurred_at', threeMonthsAgoISO)
        .in('client_platform_id', Array.from(clientIds))
    ])

    if (enrichmentResult.error) {
      logger.error('Error fetching enrichment data', { error: enrichmentResult.error })
      throw createError({
        statusCode: 500,
        message: 'Failed to load enrichment data. Please try again later.'
      })
    }

    // Calculate stats
    const enriched = enrichmentResult.data?.filter((e: any) => e.enrichment_status === 'completed').length || 0
    const pending = clientIds.size - enriched
    const totalTickets = ticketsResult.data?.length || 0
    const totalTranscripts = transcriptsResult.data?.length || 0
    const totalInteractions = totalTickets + totalTranscripts
    
    logger.debug('Stats calculated', {
      clients: clientIds.size,
      enriched,
      pending,
      interactions: totalInteractions
    })

    const result = {
      success: true,
      stats: {
        enriched,
        pending,
        totalInteractions,
        totalClients: clientIds.size
      }
    }

    // Cache the result (10 minutes)
    cache.set(cacheKey, result, 10 * 60 * 1000)

    return result
  } catch (error: any) {
    logger.error('Error fetching client stats', { error })
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to load client stats. Please try again later.',
      data: {
        success: false,
        stats: {
          enriched: 0,
          pending: 0,
          totalInteractions: 0,
          totalClients: 0
        }
      }
    })
  }
})
