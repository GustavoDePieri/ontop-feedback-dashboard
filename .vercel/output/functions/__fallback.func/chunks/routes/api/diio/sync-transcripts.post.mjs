import { d as defineEventHandler, a as useRuntimeConfig, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const syncTranscripts_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: "Supabase configuration is missing. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables."
    });
  }
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
  const result = {
    success: false,
    message: "",
    summary: {
      meetingsFetched: 0,
      phoneCallsFetched: 0,
      newTranscriptsFound: 0,
      transcriptsStored: 0,
      transcriptsSkipped: 0,
      errors: 0
    },
    details: {
      meetingTranscriptIds: [],
      phoneCallTranscriptIds: [],
      storedTranscriptIds: [],
      errors: []
    }
  };
  try {
    console.log("\u{1F504} Starting transcript sync...");
    console.log("\u{1F4C5} Fetching meetings...");
    let meetings = [];
    try {
      let currentPage = 1;
      let hasMore = true;
      const limit = 100;
      while (hasMore) {
        const meetingsData = await diioRequest("/v1/meetings", {
          params: { page: currentPage, limit }
        });
        const pageMeetings = meetingsData.meetings || [];
        meetings.push(...pageMeetings);
        console.log(`\u{1F4C4} Fetched page ${currentPage}: ${pageMeetings.length} meetings (total: ${meetings.length})`);
        hasMore = meetingsData.next !== null && pageMeetings.length === limit;
        currentPage++;
        if (currentPage > 100) {
          console.warn("\u26A0\uFE0F Reached safety limit of 100 pages for meetings");
          break;
        }
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      result.summary.meetingsFetched = meetings.length;
      console.log(`\u2705 Found ${meetings.length} total meetings`);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
    console.log("\u{1F4DE} Fetching phone calls...");
    let phoneCalls = [];
    try {
      let currentPage = 1;
      let hasMore = true;
      const limit = 100;
      while (hasMore) {
        const phoneCallsData = await diioRequest("/v1/phone_calls", {
          params: { page: currentPage, limit }
        });
        const pageCalls = phoneCallsData.phone_calls || [];
        phoneCalls.push(...pageCalls);
        console.log(`\u{1F4C4} Fetched page ${currentPage}: ${pageCalls.length} calls (total: ${phoneCalls.length})`);
        hasMore = phoneCallsData.next !== null && pageCalls.length === limit;
        currentPage++;
        if (currentPage > 100) {
          console.warn("\u26A0\uFE0F Reached safety limit of 100 pages for phone calls");
          break;
        }
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      result.summary.phoneCallsFetched = phoneCalls.length;
      console.log(`\u2705 Found ${phoneCalls.length} total phone calls`);
    } catch (error) {
      console.error("Error fetching phone calls (might not be available):", error);
    }
    const meetingTranscriptIds = meetings.filter((m) => m.last_transcript_id || m.last_trancript_id).map((m) => m.last_transcript_id || m.last_trancript_id);
    const phoneCallTranscriptIds = phoneCalls.filter((c) => c.last_transcript_id || c.last_trancript_id).map((c) => c.last_transcript_id || c.last_trancript_id);
    result.details.meetingTranscriptIds = meetingTranscriptIds;
    result.details.phoneCallTranscriptIds = phoneCallTranscriptIds;
    const allTranscriptIds = [...meetingTranscriptIds, ...phoneCallTranscriptIds];
    console.log(`\u{1F4CB} Found ${allTranscriptIds.length} total transcript IDs (${meetingTranscriptIds.length} meetings, ${phoneCallTranscriptIds.length} calls)`);
    let existingIds = /* @__PURE__ */ new Set();
    if (allTranscriptIds.length > 0) {
      console.log(`\u{1F50D} Checking which of ${allTranscriptIds.length} transcripts already exist in database...`);
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < allTranscriptIds.length; i += chunkSize) {
        chunks.push(allTranscriptIds.slice(i, i + chunkSize));
      }
      console.log(`\u{1F4E6} Processing ${chunks.length} chunks of transcript IDs...`);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const { data: existingTranscripts, error: queryError } = await supabase.from("diio_transcripts").select("diio_transcript_id").in("diio_transcript_id", chunk);
          if (queryError) {
            console.error(`Error querying chunk ${i + 1}/${chunks.length}:`, queryError);
            continue;
          }
          if (existingTranscripts) {
            existingTranscripts.forEach((t) => {
              existingIds.add(t.diio_transcript_id);
            });
          }
          if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
            console.log(`\u2705 Processed ${i + 1}/${chunks.length} chunks (${existingIds.size} existing transcripts found so far)`);
          }
        } catch (error) {
          console.error(`Error processing chunk ${i + 1}:`, error);
          continue;
        }
      }
      console.log(`\u2705 Found ${existingIds.size} existing transcripts in database`);
    }
    const newTranscriptIds = allTranscriptIds.filter((id) => !existingIds.has(id));
    result.summary.newTranscriptsFound = newTranscriptIds.length;
    console.log(`\u{1F195} Found ${newTranscriptIds.length} new transcripts to fetch`);
    console.log(`\u{1F4CA} Summary: ${meetings.length} total meetings, ${phoneCalls.length} total phone calls`);
    if (newTranscriptIds.length === 0) {
      result.success = true;
      result.message = `No new transcripts found. All transcripts are up to date. (${meetings.length} meetings, ${phoneCalls.length} calls checked)`;
      return result;
    }
    console.log(`\u{1F399}\uFE0F Fetching and storing ${newTranscriptIds.length} new transcripts in batches of 100...`);
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < newTranscriptIds.length; i += batchSize) {
      batches.push(newTranscriptIds.slice(i, i + batchSize));
    }
    console.log(`\u{1F4E6} Processing ${batches.length} batches of transcripts...`);
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`
\u{1F4E6} Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} transcripts)...`);
      for (let i = 0; i < batch.length; i++) {
        const transcriptId = batch[i];
        const globalIndex = batchIndex * batchSize + i + 1;
        const isFromMeeting = meetingTranscriptIds.includes(transcriptId);
        const source = isFromMeeting ? "meeting" : "phone_call";
        const sourceMeeting = meetings.find(
          (m) => (m.last_transcript_id || m.last_trancript_id) === transcriptId
        );
        const sourceCall = phoneCalls.find(
          (c) => (c.last_transcript_id || c.last_trancript_id) === transcriptId
        );
        const sourceData = sourceMeeting || sourceCall;
        try {
          const transcriptData = await diioRequest(`/v1/transcripts/${transcriptId}`);
          let transcriptText = "";
          if (typeof transcriptData === "string") {
            transcriptText = transcriptData;
          } else if (transcriptData && typeof transcriptData === "object") {
            const transcriptField = transcriptData.transcript || transcriptData.text || transcriptData.content;
            if (typeof transcriptField === "string") {
              transcriptText = transcriptField;
            } else if (Array.isArray(transcriptField)) {
              transcriptText = transcriptField.map((segment) => {
                if (typeof segment === "string") {
                  return segment;
                } else if (segment && typeof segment === "object") {
                  return segment.text || segment.content || segment.transcript || segment.speech || (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) || JSON.stringify(segment);
                }
                return String(segment);
              }).filter((text) => text && text.trim().length > 0).join("\n");
            } else if (transcriptField && typeof transcriptField === "object") {
              transcriptText = transcriptField.text || transcriptField.content || JSON.stringify(transcriptField);
            } else if (transcriptField) {
              transcriptText = String(transcriptField);
            }
            if (!transcriptText && transcriptData) {
              console.log(`[DEBUG] Transcript structure for ${transcriptId}:`, Object.keys(transcriptData));
              for (const key of Object.keys(transcriptData)) {
                const value = transcriptData[key];
                if (typeof value === "string" && value.length > 10) {
                  transcriptText = value;
                  break;
                }
              }
              if (!transcriptText) {
                transcriptText = JSON.stringify(transcriptData, null, 2);
              }
            }
          }
          if (typeof transcriptText !== "string") {
            transcriptText = String(transcriptText);
          }
          transcriptText = transcriptText.replace(/\[object Object\]/g, "").trim();
          if (!transcriptText || transcriptText.trim().length === 0) {
            console.log(`\u26A0\uFE0F Skipping empty transcript ${transcriptId}`);
            result.summary.transcriptsSkipped++;
            continue;
          }
          const transcriptRecord = {
            diio_transcript_id: transcriptId,
            transcript_text: transcriptText,
            transcript_type: source,
            source_id: (sourceData == null ? void 0 : sourceData.id) || transcriptId,
            source_name: (sourceData == null ? void 0 : sourceData.name) || "Unknown",
            occurred_at: (sourceData == null ? void 0 : sourceData.scheduled_at) || (sourceData == null ? void 0 : sourceData.occurred_at) || null,
            duration: (sourceData == null ? void 0 : sourceData.duration) || null,
            attendees: (sourceData == null ? void 0 : sourceData.attendees) || null,
            analyzed_status: "pending"
          };
          const { error: insertError } = await supabase.from("diio_transcripts").upsert(transcriptRecord, {
            onConflict: "diio_transcript_id",
            ignoreDuplicates: false
          });
          if (insertError) {
            throw insertError;
          }
          result.summary.transcriptsStored++;
          result.details.storedTranscriptIds.push(transcriptId);
          if (globalIndex % 10 === 0 || i === batch.length - 1) {
            console.log(`\u2705 Progress: ${globalIndex}/${newTranscriptIds.length} (${result.summary.transcriptsStored} stored, ${result.summary.transcriptsSkipped} skipped, ${result.summary.errors} errors)`);
          }
          if (i < batch.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        } catch (error) {
          console.error(`\u274C Error processing transcript ${transcriptId}:`, error);
          result.summary.errors++;
          result.details.errors.push({
            transcriptId,
            error: error.message || "Unknown error"
          });
          continue;
        }
      }
      if (batchIndex < batches.length - 1) {
        console.log(`\u23F8\uFE0F  Batch ${batchIndex + 1} complete. Pausing 2 seconds before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 2e3));
      }
    }
    result.success = true;
    result.message = `Sync completed! Found ${meetings.length} meetings and ${phoneCalls.length} calls. Stored ${result.summary.transcriptsStored} new transcripts, skipped ${result.summary.transcriptsSkipped}, ${result.summary.errors} errors.`;
    console.log(`\u2705 Sync completed: ${result.message}`);
    if (result.summary.transcriptsStored > 0) {
      console.log(`
\u{1F3AF} Starting automatic feedback extraction for ${result.summary.transcriptsStored} new transcripts...`);
      try {
        const extractionResult = await $fetch("/api/diio/extract-feedback", {
          method: "POST",
          params: {
            limit: result.summary.transcriptsStored
          }
        });
        if (extractionResult.success) {
          console.log(`\u2705 Feedback extraction completed: ${extractionResult.message}`);
          result.message += ` | Extracted ${extractionResult.summary.feedbackSegmentsExtracted} feedback segments from ${extractionResult.summary.transcriptsProcessed} transcripts.`;
        } else {
          console.warn(`\u26A0\uFE0F Feedback extraction completed with warnings: ${extractionResult.message}`);
          result.message += ` | Extraction: ${extractionResult.message}`;
        }
      } catch (extractionError) {
        console.error("\u26A0\uFE0F Feedback extraction failed (non-blocking):", extractionError);
        result.message += ` | Extraction failed (can be run manually)`;
      }
    }
    return result;
  } catch (error) {
    console.error("\u274C Sync failed:", error);
    result.success = false;
    result.message = `Sync failed: ${error.message || "Unknown error"}`;
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        message: result.message
      });
    }
    return result;
  }
});

export { syncTranscripts_post as default };
//# sourceMappingURL=sync-transcripts.post.mjs.map
