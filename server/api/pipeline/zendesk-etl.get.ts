/**
 * GET /api/pipeline/zendesk-etl
 * 
 * Triggers Zendesk ETL pipeline to sync tickets from Zendesk API
 * Can be called by Vercel Cron or external scheduler
 * 
 * This endpoint executes the Python ETL script to fetch and store Zendesk conversations
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
    const scriptPath = join(process.cwd(), 'scripts', 'etl_pipeline.py')
    const maxTickets = getQuery(event).max_tickets || '10000'
    
    // Execute the Python script
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" --max-tickets ${maxTickets}`,
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
      message: 'Zendesk ETL pipeline triggered',
      timestamp: new Date().toISOString(),
      output: stdout,
      errors: stderr || null
    }
  } catch (error: any) {
    console.error('Zendesk ETL Error:', error)
    return {
      success: false,
      message: 'Zendesk ETL pipeline failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      output: error.stdout || null,
      errors: error.stderr || null
    }
  }
})

