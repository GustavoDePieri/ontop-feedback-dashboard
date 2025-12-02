/**
 * GET /api/pipeline/aggregate-clients
 * 
 * Triggers client sentiment aggregation pipeline
 * Can be called by Vercel Cron or external scheduler
 * 
 * This endpoint executes the Python aggregator script to combine
 * Zendesk and DIIO sentiment data into client-level summaries
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'

const execAsync = promisify(exec)

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

  try {
    const scriptPath = join(process.cwd(), 'scripts', 'client_sentiment_aggregator.py')
    const clientId = getQuery(event).client_id
    
    // Build command
    let command = `python3 "${scriptPath}"`
    if (clientId) {
      command += ` --client ${clientId}`
    }
    // Otherwise processes all clients
    
    // Execute the Python script
    const { stdout, stderr } = await execAsync(
      command,
      {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1'
        },
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      }
    )

    return {
      success: true,
      message: 'Client sentiment aggregation triggered',
      timestamp: new Date().toISOString(),
      output: stdout,
      errors: stderr || null
    }
  } catch (error: any) {
    console.error('Client Aggregation Error:', error)
    return {
      success: false,
      message: 'Client sentiment aggregation failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      output: error.stdout || null,
      errors: error.stderr || null
    }
  }
})

