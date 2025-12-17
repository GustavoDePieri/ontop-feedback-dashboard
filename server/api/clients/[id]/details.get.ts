import { createClient } from '@supabase/supabase-js'
import { logger } from '~/server/utils/logger'

interface PaymentIssue {
  count: number
  negative_count: number
  avg_sentiment: number
  main_complaints: Array<{
    id: number | string
    subject: string
    sentiment: number
    date: string
    type: 'ticket' | 'transcript'
    issue_category?: string
    preview?: string
  }>
}

function analyzePaymentIssues(tickets: any[], transcripts: any[]): PaymentIssue {
  const paymentRelated: any[] = []

  // Analyze tickets for payment issues
  tickets.forEach((ticket: any) => {
    const hasPaymentAspect = ticket.aspect_sentiment?.payments !== undefined && ticket.aspect_sentiment?.payments !== null
    const isPaymentCategory = ticket.issue_category?.toLowerCase().includes('payment')
    const isPaymentInSubject = ticket.subject?.toLowerCase().match(/payment|pago|pay|billing|factura|cobro|cargo|refund|reembolso/i)
    
    if (hasPaymentAspect || isPaymentCategory || isPaymentInSubject) {
      // Extract first customer message as preview
      const conversation = ticket.conversation || []
      const firstCustomerMsg = conversation.find((msg: any) => msg.author_type === 'end-user')
      const preview = firstCustomerMsg?.message_text?.substring(0, 150) || ''
      
      paymentRelated.push({
        id: ticket.ticket_id,
        subject: ticket.subject || 'Sin asunto',
        sentiment: ticket.aspect_sentiment?.payments || ticket.sentiment_score || 0,
        date: ticket.created_at,
        type: 'ticket',
        issue_category: ticket.issue_category,
        preview: preview
      })
    }
  })

  // Analyze transcripts for payment issues
  transcripts.forEach((transcript: any) => {
    const hasPaymentAspect = transcript.aspect_sentiment?.payments !== undefined && transcript.aspect_sentiment?.payments !== null
    const isPaymentInName = transcript.account_name?.toLowerCase().match(/payment|pago|pay|billing|factura/i)
    
    if (hasPaymentAspect || isPaymentInName) {
      // Extract summary as preview
      const preview = transcript.ai_summary?.substring(0, 150) || transcript.account_name || ''
      
      paymentRelated.push({
        id: transcript.id,
        subject: transcript.account_name || 'Transcript sin nombre',
        sentiment: transcript.aspect_sentiment?.payments || transcript.sentiment_score || 0,
        date: transcript.occurred_at,
        type: 'transcript',
        issue_category: 'payment',
        preview: preview
      })
    }
  })

  // Sort by sentiment (most negative first) and date (most recent first)
  paymentRelated.sort((a, b) => {
    const sentimentDiff = a.sentiment - b.sentiment
    if (sentimentDiff !== 0) return sentimentDiff
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Calculate statistics
  const count = paymentRelated.length
  const negative_count = paymentRelated.filter(p => p.sentiment < -0.1).length
  const avg_sentiment = count > 0 ? paymentRelated.reduce((sum, p) => sum + p.sentiment, 0) / count : 0
  
  // Get top 5 main complaints (most negative)
  const main_complaints = paymentRelated.slice(0, 5)

  return {
    count,
    negative_count,
    avg_sentiment,
    main_complaints
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const clientId = getRouterParam(event, 'id')
  
  if (!clientId) {
    throw createError({
      statusCode: 400,
      message: 'Client ID is required'
    })
  }

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    logger.error('Supabase configuration missing in client details endpoint')
    throw createError({
      statusCode: 500,
      message: 'Server configuration error. Please contact support.'
    })
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

    // Get all tickets for this client (is_external = true, last 3 months)
    const { data: tickets, error: ticketsError } = await supabase
      .from('zendesk_conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_external', true)
      .gte('created_at', threeMonthsAgoISO)
      .order('created_at', { ascending: false })

    if (ticketsError) {
      logger.error('Failed to fetch tickets for client', { clientId, error: ticketsError })
      throw createError({
        statusCode: 500,
        message: 'Failed to load ticket data. Please try again later.'
      })
    }

    // Get all transcripts for this client (last 3 months)
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('diio_transcripts')
      .select('*')
      .eq('client_platform_id', clientId)
      .gte('occurred_at', threeMonthsAgoISO)
      .order('occurred_at', { ascending: false })

    if (transcriptsError) {
      logger.error('Failed to fetch transcripts for client', { clientId, error: transcriptsError })
      throw createError({
        statusCode: 500,
        message: 'Failed to load transcript data. Please try again later.'
      })
    }

    // Get enrichment data (maybeSingle returns null if no row found instead of error)
    const { data: enrichment, error: enrichmentError } = await supabase
      .from('client_enrichment')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle()

    // enrichmentError is ok if no enrichment exists yet, but log if it's a real error
    if (enrichmentError && enrichmentError.code !== 'PGRST116') {
      logger.warn('Error fetching enrichment data (non-critical)', { clientId, error: enrichmentError })
    }

    // Analyze payment-related issues
    const paymentIssues = analyzePaymentIssues(tickets || [], transcripts || [])

    return {
      success: true,
      client_id: clientId,
      tickets: tickets || [],
      transcripts: transcripts || [],
      enrichment: enrichment || null,
      payment_issues: paymentIssues,
      summary: {
        total_tickets: tickets?.length || 0,
        total_transcripts: transcripts?.length || 0,
        has_enrichment: !!enrichment,
        enrichment_status: enrichment?.enrichment_status || 'pending'
      }
    }
  } catch (error: any) {
    logger.error('Error fetching client details', { clientId, error })
    
    // If it's already a createError, preserve it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise create a proper HTTP error
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to load client details. Please try again later.'
    })
  }
})
