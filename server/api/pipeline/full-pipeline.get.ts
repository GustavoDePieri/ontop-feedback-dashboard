/**
 * GET /api/pipeline/full-pipeline
 * 
 * Runs the complete sentiment analysis pipeline:
 * 1. Zendesk ETL (sync tickets)
 * 2. Zendesk Sentiment Analysis
 * 3. Client Aggregation (combines Zendesk + DIIO)
 * 
 * Can be called by Vercel Cron or external scheduler
 * 
 * Note: DIIO transcripts are assumed to be already analyzed
 * (they have sentiment_score column populated)
 */

export default defineEventHandler(async (event) => {
  // Verify this is a cron request (optional - add auth header check)
  const authHeader = getHeader(event, 'authorization')
  const cronSecret = useRuntimeConfig().cronSecret
  
  // If cron secret is set, verify it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const results = {
    timestamp: new Date().toISOString(),
    steps: [] as any[]
  }

  try {
    // Step 1: Zendesk ETL
    console.log('Step 1: Running Zendesk ETL...')
    const etlResult = await $fetch('/api/pipeline/zendesk-etl', {
      method: 'GET',
      headers: authHeader ? { authorization: authHeader } : {}
    })
    results.steps.push({
      step: 'zendesk_etl',
      ...etlResult
    })

    // Wait a bit between steps
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Step 2: Zendesk Sentiment Analysis
    console.log('Step 2: Running Zendesk Sentiment Analysis...')
    const sentimentResult = await $fetch('/api/pipeline/zendesk-sentiment', {
      method: 'GET',
      query: { batch_size: '100', all_clients: 'true' },
      headers: authHeader ? { authorization: authHeader } : {}
    })
    results.steps.push({
      step: 'zendesk_sentiment',
      ...sentimentResult
    })

    // Wait a bit between steps
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Step 3: Client Aggregation
    console.log('Step 3: Running Client Aggregation...')
    const aggregationResult = await $fetch('/api/pipeline/aggregate-clients', {
      method: 'GET',
      headers: authHeader ? { authorization: authHeader } : {}
    })
    results.steps.push({
      step: 'client_aggregation',
      ...aggregationResult
    })

    const allSuccessful = results.steps.every(step => step.success !== false)

    return {
      success: allSuccessful,
      message: 'Full pipeline completed',
      ...results
    }
  } catch (error: any) {
    console.error('Full Pipeline Error:', error)
    return {
      success: false,
      message: 'Full pipeline failed',
      error: error.message,
      ...results
    }
  }
})

