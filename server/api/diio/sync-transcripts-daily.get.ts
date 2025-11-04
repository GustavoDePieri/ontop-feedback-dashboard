/**
 * GET /api/diio/sync-transcripts-daily
 * 
 * Daily sync endpoint for cron jobs
 * Can be called by Vercel Cron or external scheduler
 * 
 * To use with Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/diio/sync-transcripts-daily",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
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

  // Call the sync endpoint logic
  const syncResult = await $fetch('/api/diio/sync-transcripts', {
    method: 'POST'
  })

  return {
    success: true,
    message: 'Daily sync triggered',
    timestamp: new Date().toISOString(),
    result: syncResult
  }
})

