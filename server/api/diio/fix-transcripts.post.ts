/**
 * POST /api/diio/fix-transcripts
 * 
 * Fixes transcripts that were stored as objects/arrays instead of strings
 * Converts them to proper text format
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase configuration is missing'
    })
  }
  
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
  
  try {
    // Get all transcripts
    const { data: transcripts, error: fetchError } = await supabase
      .from('diio_transcripts')
      .select('id, diio_transcript_id, transcript_text')
    
    if (fetchError) {
      throw fetchError
    }
    
    if (!transcripts || transcripts.length === 0) {
      return {
        success: true,
        message: 'No transcripts to fix',
        fixed: 0,
        total: 0
      }
    }
    
    let fixedCount = 0
    
    for (const transcript of transcripts) {
      const text = transcript.transcript_text
      
      // Skip if already a proper string (not starting with [ or {)
      if (typeof text === 'string' && !text.trim().startsWith('[') && !text.trim().startsWith('{')) {
        // Check if it contains "[object Object]"
        if (!text.includes('[object Object]')) {
          continue
        }
      }
      
      let fixedText = ''
      
      try {
        // Try to parse if it's JSON
        let parsed: any = text
        
        if (typeof text === 'string') {
          // Try to parse JSON
          try {
            parsed = JSON.parse(text)
          } catch {
            // Not JSON, use as is but clean it
            fixedText = text.replace(/\[object Object\]/g, '').trim()
            if (fixedText && fixedText.length > 0 && fixedText !== text) {
              // Update only if different
              await supabase
                .from('diio_transcripts')
                .update({ transcript_text: fixedText })
                .eq('id', transcript.id)
              fixedCount++
              continue
            }
            continue
          }
        } else {
          parsed = text
        }
        
        // Handle array of segments
        if (Array.isArray(parsed)) {
          fixedText = parsed.map((segment: any) => {
            if (typeof segment === 'string') {
              return segment
            } else if (segment && typeof segment === 'object') {
              return segment.text || 
                     segment.content || 
                     segment.transcript ||
                     (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) ||
                     JSON.stringify(segment)
            }
            return String(segment)
          }).filter((t: string) => t && t.trim().length > 0).join('\n')
        } else if (parsed && typeof parsed === 'object') {
          // Single object
          fixedText = parsed.text || parsed.content || parsed.transcript || JSON.stringify(parsed, null, 2)
        } else {
          fixedText = String(parsed)
        }
        
        // Clean up
        fixedText = fixedText.replace(/\[object Object\]/g, '').trim()
        
        if (fixedText && fixedText.length > 0) {
          // Update the transcript
          const { error: updateError } = await supabase
            .from('diio_transcripts')
            .update({ transcript_text: fixedText })
            .eq('id', transcript.id)
          
          if (updateError) {
            console.error(`Error fixing transcript ${transcript.diio_transcript_id}:`, updateError)
          } else {
            fixedCount++
            console.log(`✅ Fixed transcript ${transcript.diio_transcript_id}`)
          }
        }
      } catch (error: any) {
        console.error(`Error processing transcript ${transcript.diio_transcript_id}:`, error)
      }
    }
    
    return {
      success: true,
      message: `Fixed ${fixedCount} out of ${transcripts.length} transcripts`,
      fixed: fixedCount,
      total: transcripts.length
    }
    
  } catch (error: any) {
    console.error('Error fixing transcripts:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to fix transcripts: ${error.message}`
    })
  }
})

