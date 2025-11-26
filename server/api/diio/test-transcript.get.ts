/**
 * GET /api/diio/test-transcript
 *
 * Test endpoint to fetch a single transcript and examine its raw structure
 */

import { diioRequest } from '~/server/utils/diio'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Initialize Supabase client
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

  try {
    // Get one transcript ID from database
    const { data: transcripts, error: dbError } = await supabase
      .from('diio_transcripts')
      .select('diio_transcript_id')
      .limit(1)

    if (dbError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${dbError.message}`
      })
    }

    if (!transcripts || transcripts.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No transcripts found in database'
      })
    }

    const transcriptId = transcripts[0].diio_transcript_id
    console.log(`Testing transcript ID: ${transcriptId}`)

    // Fetch raw transcript from DIIO
    const transcriptData = await diioRequest(`/v1/transcripts/${transcriptId}`)

    // Return detailed analysis
    const analysis = {
      transcriptId,
      responseType: typeof transcriptData,
      isArray: Array.isArray(transcriptData),
      isObject: typeof transcriptData === 'object' && transcriptData !== null && !Array.isArray(transcriptData),
      isString: typeof transcriptData === 'string',
      topLevelKeys: typeof transcriptData === 'object' && transcriptData !== null ? Object.keys(transcriptData) : null,
      rawData: transcriptData
    }

    // If it's an object, check for transcript fields
    if (analysis.isObject && transcriptData) {
      const possibleFields = ['transcript', 'text', 'content', 'data', 'segments', 'utterances']
      analysis.possibleTranscriptFields = {}

      for (const field of possibleFields) {
        if (transcriptData[field]) {
          const fieldData = transcriptData[field]
          analysis.possibleTranscriptFields[field] = {
            type: typeof fieldData,
            isArray: Array.isArray(fieldData),
            length: Array.isArray(fieldData) ? fieldData.length : (typeof fieldData === 'string' ? fieldData.length : null),
            sample: Array.isArray(fieldData) ? fieldData.slice(0, 2) : (typeof fieldData === 'string' ? fieldData.substring(0, 200) : fieldData)
          }
        }
      }
    }

    return {
      success: true,
      analysis
    }

  } catch (error: any) {
    console.error('Test transcript error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Test failed: ${error.message}`
    })
  }
})




