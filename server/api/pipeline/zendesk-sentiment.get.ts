/**
 * GET /api/pipeline/zendesk-sentiment
 * 
 * Triggers Zendesk sentiment analysis pipeline
 * Can be called by Vercel Cron or external scheduler
 * 
 * This endpoint executes the Python sentiment analyzer script
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
    const scriptPath = join(process.cwd(), 'scripts', 'zendesk_sentiment_analyzer.py')
    const batchSize = getQuery(event).batch_size || '50'
    const allClients = getQuery(event).all_clients === 'true'
    
    // Build command
    let command = `python3 "${scriptPath}" --batch-size ${batchSize} --external-only`
    if (allClients) {
      command += ' --all-clients'
    }
    
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
      message: 'Zendesk sentiment analysis triggered',
      timestamp: new Date().toISOString(),
      output: stdout,
      errors: stderr || null
    }
  } catch (error: any) {
    console.error('Zendesk Sentiment Analysis Error:', error)
    return {
      success: false,
      message: 'Zendesk sentiment analysis failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      output: error.stdout || null,
      errors: error.stderr || null
    }
  }
})

