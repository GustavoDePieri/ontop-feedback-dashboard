/**
 * GET /api/transcripts/sync-client-ids-daily
 * 
 * Daily sync endpoint for cron jobs
 * Can be called by Vercel Cron or external scheduler
 * 
 * To use with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/transcripts/sync-client-ids-daily",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 * 
 * Schedule: Runs daily at 3 AM UTC
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Verify this is a cron request (optional - add auth header check)
  const authHeader = getHeader(event, 'authorization')
  const cronSecret = config.cronSecret
  
  // If cron secret is set, verify it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    // Call the sync endpoint via HTTP
    const baseURL = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const syncResult = await $fetch('/api/transcripts/sync-client-ids', {
      method: 'POST',
      baseURL
    })

    return {
      success: true,
      message: 'Daily Client ID sync triggered',
      timestamp: new Date().toISOString(),
      result: syncResult
    }
  } catch (error: any) {
    const logger = (await import('~/server/utils/logger')).logger
    logger.error('Daily Client ID sync failed', { error: error.message })
    
    return {
      success: false,
      message: 'Daily sync failed',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error'
    }
  }
})

