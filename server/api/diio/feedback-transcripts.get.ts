/**
 * GET /api/diio/feedback-transcripts
 * 
 * Fetch DIIO call transcripts and extract feedback segments for AI analysis
 * 
 * Query Parameters:
 * - days: Number of days to look back (default: 30)
 * - limit: Maximum number of calls to fetch (default: 50)
 * - accountName: Filter by account name (optional)
 */

import type { DiioPhoneCall, DiioMeeting } from '~/types/diio'
import { parseTranscript, formatSegmentsForAI, getSegmentStats } from '~/server/utils/transcriptParser'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const limit = parseInt(query.limit as string) || 50
    const accountName = query.accountName as string | undefined

    console.log(`📞 Fetching transcripts from last ${days} days (limit: ${limit})...`)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch phone calls and meetings from DIIO
    const [phoneCalls, meetings] = await Promise.all([
      fetchPhoneCalls(limit),
      fetchMeetings(limit)
    ])

    console.log(`📊 Fetched ${phoneCalls.length} phone calls, ${meetings.length} meetings`)

    // Combine and process calls
    const allCalls = [
      ...phoneCalls.map(call => ({
        id: call.id,
        name: call.name,
        date: call.occurred_at,
        type: 'phone_call' as const,
        transcriptId: call.last_transcript_id,
        participants: [
          ...call.attendees.sellers.map(s => s.name),
          ...call.attendees.customers.map(c => c.name)
        ],
        accountName: extractAccountName(call.name, call.attendees),
        duration: call.duration
      })),
      ...meetings.map(meeting => ({
        id: meeting.id,
        name: meeting.name,
        date: meeting.scheduled_at,
        type: 'meeting' as const,
        transcriptId: meeting.last_transcript_id,
        participants: [
          ...meeting.attendees.sellers.map(s => s.name),
          ...meeting.attendees.customers.map(c => c.name)
        ],
        accountName: extractAccountName(meeting.name, meeting.attendees),
        duration: undefined
      }))
    ]

    // Filter by date range
    const recentCalls = allCalls.filter(call => {
      const callDate = new Date(call.date)
      return callDate >= startDate && callDate <= endDate
    })

    // Filter by account name if provided
    const filteredCalls = accountName
      ? recentCalls.filter(call => 
          call.accountName?.toLowerCase().includes(accountName.toLowerCase())
        )
      : recentCalls

    console.log(`🔍 Filtered to ${filteredCalls.length} calls in date range`)

    // Fetch transcripts for calls that have them
    const callsWithTranscripts = []
    let processedCount = 0

    for (const call of filteredCalls) {
      if (!call.transcriptId) continue

      try {
        // Fetch transcript
        const transcriptData = await diioRequest(`/v1/transcripts/${call.transcriptId}`)
        
        if (!transcriptData || !transcriptData.transcript) {
          console.warn(`⚠️ No transcript data for call ${call.id}`)
          continue
        }

        // Parse transcript to extract feedback segments
        const parsed = parseTranscript(transcriptData.transcript, {
          callName: call.name,
          participants: call.participants,
          date: call.date
        })

        // Only include calls with feedback segments
        if (parsed.feedbackSegments.length > 0) {
          callsWithTranscripts.push({
            ...call,
            transcript: transcriptData.transcript,
            feedbackSegments: parsed.feedbackSegments,
            stats: getSegmentStats(parsed.feedbackSegments)
          })
          processedCount++
        }

        // Respect rate limits
        if (processedCount >= limit) break
        
      } catch (error) {
        console.error(`❌ Error fetching transcript for call ${call.id}:`, error)
        continue
      }
    }

    console.log(`✅ Successfully processed ${callsWithTranscripts.length} calls with feedback`)

    // Format for AI analysis
    const formattedForAI = callsWithTranscripts.map(call => ({
      id: call.id,
      source: 'diio_call',
      type: call.type,
      date: call.date,
      accountName: call.accountName || 'Unknown',
      callName: call.name,
      participants: call.participants,
      feedbackText: formatSegmentsForAI(call.feedbackSegments, {
        callName: call.name,
        date: call.date,
        participants: call.participants,
        accountName: call.accountName
      }),
      stats: call.stats
    }))

    // Calculate summary statistics
    const totalSegments = callsWithTranscripts.reduce((sum, call) => sum + call.feedbackSegments.length, 0)
    const typeDistribution = callsWithTranscripts.reduce((acc, call) => {
      for (const [type, count] of Object.entries(call.stats.byType)) {
        acc[type] = (acc[type] || 0) + count
      }
      return acc
    }, {} as Record<string, number>)

    const urgencyDistribution = callsWithTranscripts.reduce((acc, call) => {
      for (const [urgency, count] of Object.entries(call.stats.byUrgency)) {
        acc[urgency] = (acc[urgency] || 0) + count
      }
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      calls: formattedForAI,
      summary: {
        totalCalls: callsWithTranscripts.length,
        totalFeedbackSegments: totalSegments,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        distribution: {
          byType: typeDistribution,
          byUrgency: urgencyDistribution
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error fetching feedback transcripts:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch feedback transcripts'
    })
  }
})

/**
 * Fetch phone calls from DIIO
 */
async function fetchPhoneCalls(limit: number): Promise<DiioPhoneCall[]> {
  try {
    const response = await diioRequest('/v1/phone_calls', {
      params: {
        page: 1,
        limit: Math.min(limit, 100) // DIIO max per page
      }
    })
    
    return response.phone_calls || []
  } catch (error) {
    console.error('Error fetching phone calls:', error)
    return []
  }
}

/**
 * Fetch meetings from DIIO
 */
async function fetchMeetings(limit: number): Promise<DiioMeeting[]> {
  try {
    const response = await diioRequest('/v1/meetings', {
      params: {
        page: 1,
        limit: Math.min(limit, 100) // DIIO max per page
      }
    })
    
    return response.meetings || []
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return []
  }
}

/**
 * Extract account name from call name or attendees
 */
function extractAccountName(callName: string, attendees: any): string | undefined {
  // Try to extract from call name (common patterns: "Call with Acme Corp", "Acme Corp - Review")
  const namePatterns = [
    /call with (.+?)(?:\s*-|\s*\(|$)/i,
    /meeting with (.+?)(?:\s*-|\s*\(|$)/i,
    /^(.+?)(?:\s*-|\s*call|\s*meeting)/i
  ]
  
  for (const pattern of namePatterns) {
    const match = callName.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Try to use customer name if available
  if (attendees.customers && attendees.customers.length > 0) {
    return attendees.customers[0].name
  }
  
  return undefined
}

