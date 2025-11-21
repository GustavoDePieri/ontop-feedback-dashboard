import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { g as getDiioAccessToken, d as diioRequest } from '../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const testTranscripts_get = defineEventHandler(async (event) => {
  const results = [];
  results.push({
    step: "Authentication",
    success: false,
    message: "Testing..."
  });
  try {
    const token = await getDiioAccessToken();
    results[0] = {
      step: "Authentication",
      success: true,
      message: "Successfully obtained access token",
      details: {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "..."
      }
    };
  } catch (error) {
    results[0] = {
      step: "Authentication",
      success: false,
      message: "Failed to obtain access token",
      error: error.message
    };
    return {
      success: false,
      message: "Authentication failed - cannot proceed with transcript tests",
      results
    };
  }
  results.push({
    step: "Fetch Phone Calls",
    success: false,
    message: "Testing..."
  });
  let phoneCalls = [];
  let phoneCallTranscriptIds = [];
  try {
    const phoneCallsData = await diioRequest("/v1/phone_calls", {
      params: { page: 1, limit: 10 }
    });
    phoneCalls = phoneCallsData.phone_calls || [];
    phoneCallTranscriptIds = phoneCalls.filter((call) => call.last_transcript_id || call.last_trancript_id).map((call) => call.last_transcript_id || call.last_trancript_id);
    results[1] = {
      step: "Fetch Phone Calls",
      success: true,
      message: `Found ${phoneCalls.length} phone calls, ${phoneCallTranscriptIds.length} with transcripts`,
      details: {
        totalCalls: phoneCalls.length,
        callsWithTranscripts: phoneCallTranscriptIds.length,
        transcriptIds: phoneCallTranscriptIds.slice(0, 5)
        // Show first 5
      }
    };
  } catch (error) {
    results[1] = {
      step: "Fetch Phone Calls",
      success: false,
      message: `Phone calls endpoint not available (${error.statusCode || "unknown error"})`,
      error: error.message,
      details: {
        statusCode: error.statusCode,
        note: "This is OK if your account only has meetings"
      }
    };
  }
  results.push({
    step: "Fetch Meetings",
    success: false,
    message: "Testing..."
  });
  let meetings = [];
  let meetingTranscriptIds = [];
  try {
    const meetingsData = await diioRequest("/v1/meetings", {
      params: { page: 1, limit: 10 }
    });
    meetings = meetingsData.meetings || [];
    meetingTranscriptIds = meetings.filter((meeting) => meeting.last_transcript_id || meeting.last_trancript_id).map((meeting) => meeting.last_transcript_id || meeting.last_trancript_id);
    results[2] = {
      step: "Fetch Meetings",
      success: true,
      message: `Found ${meetings.length} meetings, ${meetingTranscriptIds.length} with transcripts`,
      details: {
        totalMeetings: meetings.length,
        meetingsWithTranscripts: meetingTranscriptIds.length,
        transcriptIds: meetingTranscriptIds.slice(0, 5)
        // Show first 5
      }
    };
  } catch (error) {
    results[2] = {
      step: "Fetch Meetings",
      success: false,
      message: "Failed to fetch meetings",
      error: error.message,
      details: {
        statusCode: error.statusCode
      }
    };
  }
  const allTranscriptIds = [...phoneCallTranscriptIds, ...meetingTranscriptIds];
  if (allTranscriptIds.length === 0) {
    results.push({
      step: "Fetch Transcripts",
      success: false,
      message: "No transcript IDs found in phone calls or meetings",
      details: {
        phoneCallTranscriptIds: phoneCallTranscriptIds.length,
        meetingTranscriptIds: meetingTranscriptIds.length
      }
    });
    return {
      success: false,
      message: "No transcript IDs available to test",
      results
    };
  }
  const testTranscriptIds = allTranscriptIds.slice(0, 3);
  const transcriptResults = [];
  for (let i = 0; i < testTranscriptIds.length; i++) {
    const transcriptId = testTranscriptIds[i];
    const isPhoneCall = phoneCallTranscriptIds.includes(transcriptId);
    const source = isPhoneCall ? "phone_call" : "meeting";
    transcriptResults.push({
      step: `Fetch Transcript ${i + 1} (${source})`,
      success: false,
      message: "Testing..."
    });
    try {
      const transcript = await diioRequest(`/v1/transcripts/${transcriptId}`);
      console.log(`[DEBUG] Transcript ${transcriptId} response type:`, typeof transcript);
      console.log(`[DEBUG] Transcript ${transcriptId} response keys:`, transcript && typeof transcript === "object" ? Object.keys(transcript) : "N/A");
      let transcriptText = "";
      let transcriptType = "unknown";
      if (typeof transcript === "string") {
        transcriptText = transcript;
        transcriptType = "string";
      } else if (transcript && typeof transcript === "object") {
        transcriptText = transcript.transcript || transcript.text || transcript.content || "";
        if (!transcriptText && transcript.transcript) {
          if (Array.isArray(transcript.transcript)) {
            transcriptText = transcript.transcript.map(
              (item) => typeof item === "string" ? item : JSON.stringify(item)
            ).join("\n");
            transcriptType = "array";
          } else if (typeof transcript.transcript === "object") {
            transcriptText = JSON.stringify(transcript.transcript);
            transcriptType = "object";
          }
        }
        if (typeof transcriptText !== "string") {
          transcriptText = String(transcriptText);
        }
      }
      const hasContent = transcriptText.length > 0;
      transcriptResults[i] = {
        step: `Fetch Transcript ${i + 1} (${source})`,
        success: true,
        message: hasContent ? `Successfully fetched transcript with ${transcriptText.length} characters` : "Transcript fetched but appears empty",
        details: {
          transcriptId,
          source,
          hasContent,
          contentLength: transcriptText.length,
          transcriptType,
          responseStructure: Object.keys(transcript || {}),
          preview: hasContent ? transcriptText.substring(0, 100) + (transcriptText.length > 100 ? "..." : "") : "No content available"
        }
      };
    } catch (error) {
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
      };
    }
    if (i < testTranscriptIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  results.push(...transcriptResults);
  const allSuccess = results.every((r) => r.success);
  const authSuccess = results[0].success;
  const transcriptSuccess = transcriptResults.some((r) => r.success);
  return {
    success: allSuccess && transcriptSuccess,
    message: authSuccess && transcriptSuccess ? "\u2705 All tests passed! Transcript access is working." : authSuccess && !transcriptSuccess ? "\u26A0\uFE0F Authentication works, but transcript fetching failed" : "\u274C Tests failed - see results for details",
    summary: {
      totalSteps: results.length,
      successfulSteps: results.filter((r) => r.success).length,
      failedSteps: results.filter((r) => !r.success).length,
      authenticationWorks: authSuccess,
      transcriptAccessWorks: transcriptSuccess,
      availableTranscripts: allTranscriptIds.length
    },
    results
  };
});

export { testTranscripts_get as default };
//# sourceMappingURL=test-transcripts.get.mjs.map
