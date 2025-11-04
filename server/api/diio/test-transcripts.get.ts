/**
 * GET /api/diio/test-transcripts
 * 
 * Test endpoint to verify DIIO API access to transcriptions
 * Tests:
 * 1. Authentication
 * 2. Fetching phone calls/meetings (to get transcript IDs)
 * 3. Fetching actual transcripts
 */

import { getDiioAccessToken, diioRequest } from '~/server/utils/diio'

interface TestResult {
  step: string
  success: boolean
  message: string
  details?: any
  error?: string
}

export default defineEventHandler(async (event) => {
  const results: TestResult[] = []
  
  // Step 1: Test Authentication
  results.push({
    step: 'Authentication',
    success: false,
    message: 'Testing...'
  })
  
  try {
    const token = await getDiioAccessToken()
    results[0] = {
      step: 'Authentication',
      success: true,
      message: 'Successfully obtained access token',
      details: {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      }
    }
  } catch (error: any) {
    results[0] = {
      step: 'Authentication',
      success: false,
      message: 'Failed to obtain access token',
      error: error.message
    }
    return {
      success: false,
      message: 'Authentication failed - cannot proceed with transcript tests',
      results
    }
  }
  
  // Step 2: Fetch Phone Calls (to find transcript IDs)
  results.push({
    step: 'Fetch Phone Calls',
    success: false,
    message: 'Testing...'
  })
  
  let phoneCalls: any[] = []
  let phoneCallTranscriptIds: string[] = []
  
  try {
    const phoneCallsData = await diioRequest('/v1/phone_calls', {
      params: { page: 1, limit: 10 }
    })
    
    phoneCalls = phoneCallsData.phone_calls || []
    // Also check for alternative field names (last_trancript_id with typo in docs)
    phoneCallTranscriptIds = phoneCalls
      .filter(call => call.last_transcript_id || call.last_trancript_id)
      .map(call => call.last_transcript_id || call.last_trancript_id)
    
    results[1] = {
      step: 'Fetch Phone Calls',
      success: true,
      message: `Found ${phoneCalls.length} phone calls, ${phoneCallTranscriptIds.length} with transcripts`,
      details: {
        totalCalls: phoneCalls.length,
        callsWithTranscripts: phoneCallTranscriptIds.length,
        transcriptIds: phoneCallTranscriptIds.slice(0, 5) // Show first 5
      }
    }
  } catch (error: any) {
    // Phone calls endpoint might not be available or might return 404
    // This is OK - we can still test with meetings
    results[1] = {
      step: 'Fetch Phone Calls',
      success: false,
      message: `Phone calls endpoint not available (${error.statusCode || 'unknown error'})`,
      error: error.message,
      details: {
        statusCode: error.statusCode,
        note: 'This is OK if your account only has meetings'
      }
    }
  }
  
  // Step 3: Fetch Meetings (to find transcript IDs)
  results.push({
    step: 'Fetch Meetings',
    success: false,
    message: 'Testing...'
  })
  
  let meetings: any[] = []
  let meetingTranscriptIds: string[] = []
  
  try {
    const meetingsData = await diioRequest('/v1/meetings', {
      params: { page: 1, limit: 10 }
    })
    
    meetings = meetingsData.meetings || []
    // Also check for alternative field names (last_trancript_id with typo in docs)
    meetingTranscriptIds = meetings
      .filter(meeting => meeting.last_transcript_id || meeting.last_trancript_id)
      .map(meeting => meeting.last_transcript_id || meeting.last_trancript_id)
    
    results[2] = {
      step: 'Fetch Meetings',
      success: true,
      message: `Found ${meetings.length} meetings, ${meetingTranscriptIds.length} with transcripts`,
      details: {
        totalMeetings: meetings.length,
        meetingsWithTranscripts: meetingTranscriptIds.length,
        transcriptIds: meetingTranscriptIds.slice(0, 5) // Show first 5
      }
    }
  } catch (error: any) {
    results[2] = {
      step: 'Fetch Meetings',
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message,
      details: {
        statusCode: error.statusCode
      }
    }
  }
  
  // Step 4: Test Fetching Transcripts
  const allTranscriptIds = [...phoneCallTranscriptIds, ...meetingTranscriptIds]
  
  if (allTranscriptIds.length === 0) {
    results.push({
      step: 'Fetch Transcripts',
      success: false,
      message: 'No transcript IDs found in phone calls or meetings',
      details: {
        phoneCallTranscriptIds: phoneCallTranscriptIds.length,
        meetingTranscriptIds: meetingTranscriptIds.length
      }
    })
    
    return {
      success: false,
      message: 'No transcript IDs available to test',
      results
    }
  }
  
  // Test fetching up to 3 transcripts
  const testTranscriptIds = allTranscriptIds.slice(0, 3)
  const transcriptResults: TestResult[] = []
  
  for (let i = 0; i < testTranscriptIds.length; i++) {
    const transcriptId = testTranscriptIds[i]
    const isPhoneCall = phoneCallTranscriptIds.includes(transcriptId)
    const source = isPhoneCall ? 'phone_call' : 'meeting'
    
    transcriptResults.push({
      step: `Fetch Transcript ${i + 1} (${source})`,
      success: false,
      message: 'Testing...'
    })
    
    try {
      const transcript = await diioRequest(`/v1/transcripts/${transcriptId}`)
      
      // Debug: Log the actual response structure
      console.log(`[DEBUG] Transcript ${transcriptId} response type:`, typeof transcript)
      console.log(`[DEBUG] Transcript ${transcriptId} response keys:`, transcript && typeof transcript === 'object' ? Object.keys(transcript) : 'N/A')
      
      // Handle different possible response structures
      let transcriptText: string = ''
      let transcriptType: string = 'unknown'
      
      if (typeof transcript === 'string') {
        transcriptText = transcript
        transcriptType = 'string'
      } else if (transcript && typeof transcript === 'object') {
        // Try different possible field names
        transcriptText = transcript.transcript || transcript.text || transcript.content || ''
        
        // If transcript field is an object/array, try to stringify it
        if (!transcriptText && transcript.transcript) {
          if (Array.isArray(transcript.transcript)) {
            transcriptText = transcript.transcript.map((item: any) => 
              typeof item === 'string' ? item : JSON.stringify(item)
            ).join('\n')
            transcriptType = 'array'
          } else if (typeof transcript.transcript === 'object') {
            transcriptText = JSON.stringify(transcript.transcript)
            transcriptType = 'object'
          }
        }
        
        // Ensure we have a string
        if (typeof transcriptText !== 'string') {
          transcriptText = String(transcriptText)
        }
      }
      
      const hasContent = transcriptText.length > 0
      
      transcriptResults[i] = {
        step: `Fetch Transcript ${i + 1} (${source})`,
        success: true,
        message: hasContent 
          ? `Successfully fetched transcript with ${transcriptText.length} characters`
          : 'Transcript fetched but appears empty',
        details: {
          transcriptId,
          source,
          hasContent,
          contentLength: transcriptText.length,
          transcriptType,
          responseStructure: Object.keys(transcript || {}),
          preview: hasContent 
            ? (transcriptText.substring(0, 100) + (transcriptText.length > 100 ? '...' : ''))
            : 'No content available'
        }
      }
    } catch (error: any) {
      transcriptResults[i] = {
        step: `Fetch Transcript ${i + 1} (${source})`,
        success: false,
        message: `Failed to fetch transcript`,
        error: error.message,
        details: {
          transcriptId,
          source,
          statusCode: error.statusCode
        }
      }
    }
    
    // Small delay between requests to avoid rate limiting
    if (i < testTranscriptIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  results.push(...transcriptResults)
  
  // Summary
  const allSuccess = results.every(r => r.success)
  const authSuccess = results[0].success
  const transcriptSuccess = transcriptResults.some(r => r.success)
  
  return {
    success: allSuccess && transcriptSuccess,
    message: authSuccess && transcriptSuccess
      ? '✅ All tests passed! Transcript access is working.'
      : authSuccess && !transcriptSuccess
      ? '⚠️ Authentication works, but transcript fetching failed'
      : '❌ Tests failed - see results for details',
    summary: {
      totalSteps: results.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      authenticationWorks: authSuccess,
      transcriptAccessWorks: transcriptSuccess,
      availableTranscripts: allTranscriptIds.length
    },
    results
  }
})


