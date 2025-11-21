import { d as defineEventHandler, g as getQuery, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import { p as parseTranscript, g as getSegmentStats, f as formatSegmentsForAI } from '../../../_/transcriptParser.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const feedbackTranscripts_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const days = parseInt(query.days) || 30;
    const limit = parseInt(query.limit) || 50;
    const accountName = query.accountName;
    console.log(`\u{1F4DE} Fetching transcripts from last ${days} days (limit: ${limit})...`);
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const [phoneCalls, meetings] = await Promise.all([
      fetchPhoneCalls(limit),
      fetchMeetings(limit)
    ]);
    console.log(`\u{1F4CA} Fetched ${phoneCalls.length} phone calls, ${meetings.length} meetings`);
    const allCalls = [
      ...phoneCalls.map((call) => ({
        id: call.id,
        name: call.name,
        date: call.occurred_at,
        type: "phone_call",
        transcriptId: call.last_transcript_id,
        participants: [
          ...call.attendees.sellers.map((s) => s.name),
          ...call.attendees.customers.map((c) => c.name)
        ],
        accountName: extractAccountName(call.name, call.attendees),
        duration: call.duration
      })),
      ...meetings.map((meeting) => ({
        id: meeting.id,
        name: meeting.name,
        date: meeting.scheduled_at,
        type: "meeting",
        transcriptId: meeting.last_transcript_id,
        participants: [
          ...meeting.attendees.sellers.map((s) => s.name),
          ...meeting.attendees.customers.map((c) => c.name)
        ],
        accountName: extractAccountName(meeting.name, meeting.attendees),
        duration: void 0
      }))
    ];
    const recentCalls = allCalls.filter((call) => {
      const callDate = new Date(call.date);
      return callDate >= startDate && callDate <= endDate;
    });
    const filteredCalls = accountName ? recentCalls.filter(
      (call) => {
        var _a;
        return (_a = call.accountName) == null ? void 0 : _a.toLowerCase().includes(accountName.toLowerCase());
      }
    ) : recentCalls;
    console.log(`\u{1F50D} Filtered to ${filteredCalls.length} calls in date range`);
    const callsWithTranscripts = [];
    let processedCount = 0;
    for (const call of filteredCalls) {
      if (!call.transcriptId) continue;
      try {
        const transcriptData = await diioRequest(`/v1/transcripts/${call.transcriptId}`);
        if (!transcriptData || !transcriptData.transcript) {
          console.warn(`\u26A0\uFE0F No transcript data for call ${call.id}`);
          continue;
        }
        const parsed = parseTranscript(transcriptData.transcript, {
          callName: call.name,
          participants: call.participants,
          date: call.date
        });
        if (parsed.feedbackSegments.length > 0) {
          callsWithTranscripts.push({
            ...call,
            transcript: transcriptData.transcript,
            feedbackSegments: parsed.feedbackSegments,
            stats: getSegmentStats(parsed.feedbackSegments)
          });
          processedCount++;
        }
        if (processedCount >= limit) break;
      } catch (error) {
        console.error(`\u274C Error fetching transcript for call ${call.id}:`, error);
        continue;
      }
    }
    console.log(`\u2705 Successfully processed ${callsWithTranscripts.length} calls with feedback`);
    const formattedForAI = callsWithTranscripts.map((call) => ({
      id: call.id,
      source: "diio_call",
      type: call.type,
      date: call.date,
      accountName: call.accountName || "Unknown",
      callName: call.name,
      participants: call.participants,
      feedbackText: formatSegmentsForAI(call.feedbackSegments, {
        callName: call.name,
        date: call.date,
        participants: call.participants,
        accountName: call.accountName
      }),
      stats: call.stats
    }));
    const totalSegments = callsWithTranscripts.reduce((sum, call) => sum + call.feedbackSegments.length, 0);
    const typeDistribution = callsWithTranscripts.reduce((acc, call) => {
      for (const [type, count] of Object.entries(call.stats.byType)) {
        acc[type] = (acc[type] || 0) + count;
      }
      return acc;
    }, {});
    const urgencyDistribution = callsWithTranscripts.reduce((acc, call) => {
      for (const [urgency, count] of Object.entries(call.stats.byUrgency)) {
        acc[urgency] = (acc[urgency] || 0) + count;
      }
      return acc;
    }, {});
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
    };
  } catch (error) {
    console.error("\u274C Error fetching feedback transcripts:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch feedback transcripts"
    });
  }
});
async function fetchPhoneCalls(limit) {
  try {
    const response = await diioRequest("/v1/phone_calls", {
      params: {
        page: 1,
        limit: Math.min(limit, 100)
        // DIIO max per page
      }
    });
    return response.phone_calls || [];
  } catch (error) {
    console.error("Error fetching phone calls:", error);
    return [];
  }
}
async function fetchMeetings(limit) {
  try {
    const response = await diioRequest("/v1/meetings", {
      params: {
        page: 1,
        limit: Math.min(limit, 100)
        // DIIO max per page
      }
    });
    return response.meetings || [];
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }
}
function extractAccountName(callName, attendees) {
  const namePatterns = [
    /call with (.+?)(?:\s*-|\s*\(|$)/i,
    /meeting with (.+?)(?:\s*-|\s*\(|$)/i,
    /^(.+?)(?:\s*-|\s*call|\s*meeting)/i
  ];
  for (const pattern of namePatterns) {
    const match = callName.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  if (attendees.customers && attendees.customers.length > 0) {
    return attendees.customers[0].name;
  }
  return void 0;
}

export { feedbackTranscripts_get as default };
//# sourceMappingURL=feedback-transcripts.get.mjs.map
