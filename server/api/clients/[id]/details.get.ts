import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const clientId = getRouterParam(event, 'id')
  
  if (!clientId) {
    throw createError({
      statusCode: 400,
      message: 'Client ID is required'
    })
  }

  try {
    const supabase = createClient(
      config.supabaseUrl!,
      config.supabaseAnonKey!
    )

    // Get all tickets for this client
    const { data: tickets, error: ticketsError } = await supabase
      .from('zendesk_conversations')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (ticketsError) throw ticketsError

    // Get all transcripts for this client
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('diio_transcripts')
      .select('*')
      .eq('client_platform_id', clientId)
      .order('occurred_at', { ascending: false })

    if (transcriptsError) throw transcriptsError

    // Get enrichment data
    const { data: enrichment, error: enrichmentError } = await supabase
      .from('client_enrichment')
      .select('*')
      .eq('client_id', clientId)
      .single()

    // enrichmentError is ok if no enrichment exists yet

    return {
      success: true,
      client_id: clientId,
      tickets: tickets || [],
      transcripts: transcripts || [],
      enrichment: enrichment || null,
      summary: {
        total_tickets: tickets?.length || 0,
        total_transcripts: transcripts?.length || 0,
        has_enrichment: !!enrichment,
        enrichment_status: enrichment?.enrichment_status || 'pending'
      }
    }
  } catch (error: any) {
    console.error('Error fetching client details:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
