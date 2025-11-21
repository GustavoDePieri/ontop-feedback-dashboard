import { d as defineEventHandler, g as getQuery, a as useRuntimeConfig, c as createError } from '../../../_/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import { p as parseTranscript } from '../../../_/transcriptParser.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const extractFeedback_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: "Supabase configuration is missing"
    });
  }
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
  const result = {
    success: false,
    message: "",
    summary: {
      transcriptsProcessed: 0,
      transcriptsSkipped: 0,
      feedbackSegmentsExtracted: 0,
      errors: 0
    },
    details: {
      processedTranscriptIds: [],
      skippedTranscriptIds: [],
      errors: []
    }
  };
  try {
    console.log("\u{1F504} Starting feedback extraction from transcripts...");
    const limit = query.limit ? parseInt(query.limit) : 100;
    const force = query.force === "true";
    const specificTranscriptId = query.transcript_id;
    let transcriptsQuery = supabase.from("diio_transcripts").select("*").order("occurred_at", { ascending: false });
    if (specificTranscriptId) {
      transcriptsQuery = transcriptsQuery.eq("diio_transcript_id", specificTranscriptId);
    } else {
      if (!force) {
        transcriptsQuery = transcriptsQuery.eq("feedback_extracted", false);
      }
      transcriptsQuery = transcriptsQuery.limit(limit);
    }
    const { data: transcripts, error: transcriptsError } = await transcriptsQuery;
    if (transcriptsError) {
      throw transcriptsError;
    }
    if (!transcripts || transcripts.length === 0) {
      result.success = true;
      result.message = "No transcripts found to process";
      return result;
    }
    console.log(`\u{1F4CB} Found ${transcripts.length} transcripts to process`);
    for (const transcript of transcripts) {
      try {
        if (!force && transcript.feedback_extracted) {
          console.log(`\u23ED\uFE0F  Skipping transcript ${transcript.diio_transcript_id} (already extracted)`);
          result.summary.transcriptsSkipped++;
          result.details.skippedTranscriptIds.push(transcript.diio_transcript_id);
          continue;
        }
        if (!transcript.transcript_text || transcript.transcript_text.trim().length === 0) {
          console.log(`\u26A0\uFE0F Skipping transcript ${transcript.diio_transcript_id} (empty transcript)`);
          result.summary.transcriptsSkipped++;
          result.details.skippedTranscriptIds.push(transcript.diio_transcript_id);
          continue;
        }
        console.log(`\u{1F4DD} Processing transcript ${transcript.diio_transcript_id}...`);
        let sourceData = null;
        let sellerEmails = [];
        let customerEmails = [];
        let participantEmails = [];
        if (transcript.transcript_type === "meeting") {
          const { data: meeting } = await supabase.from("diio_meetings").select("*").eq("diio_meeting_id", transcript.source_id).single();
          if (meeting) {
            sourceData = meeting;
            if (meeting.attendees) {
              if (meeting.attendees.sellers) {
                sellerEmails = meeting.attendees.sellers.map((s) => s.email).filter((e) => e);
              }
              if (meeting.attendees.customers) {
                customerEmails = meeting.attendees.customers.map((c) => c.email).filter((e) => e);
              }
            }
            participantEmails = meeting.participant_emails || [];
            if (!participantEmails || participantEmails.length === 0) {
              const emails = [];
              if (meeting.attendees) {
                if (meeting.attendees.sellers) {
                  emails.push(...meeting.attendees.sellers.map((s) => s.email).filter((e) => e));
                }
                if (meeting.attendees.customers) {
                  emails.push(...meeting.attendees.customers.map((c) => c.email).filter((e) => e));
                }
              }
              participantEmails = [...new Set(emails)];
            }
          }
        } else if (transcript.transcript_type === "phone_call") {
          const { data: call } = await supabase.from("diio_phone_calls").select("*").eq("diio_call_id", transcript.source_id).single();
          if (call) {
            sourceData = call;
            if (call.attendees) {
              if (call.attendees.sellers) {
                sellerEmails = call.attendees.sellers.map((s) => s.email).filter((e) => e);
              }
              if (call.attendees.customers) {
                customerEmails = call.attendees.customers.map((c) => c.email).filter((e) => e);
              }
            }
            participantEmails = call.participant_emails || [];
            if (!participantEmails || participantEmails.length === 0) {
              const emails = [];
              if (call.attendees) {
                if (call.attendees.sellers) {
                  emails.push(...call.attendees.sellers.map((s) => s.email).filter((e) => e));
                }
                if (call.attendees.customers) {
                  emails.push(...call.attendees.customers.map((c) => c.email).filter((e) => e));
                }
              }
              participantEmails = [...new Set(emails)];
            }
          }
        }
        const metadata = {
          callName: transcript.source_name || "Unknown",
          date: transcript.occurred_at || transcript.created_at,
          sellerEmails,
          customerEmails,
          participantEmails,
          accountName: extractAccountName(transcript.source_name, sourceData == null ? void 0 : sourceData.attendees)
        };
        const parsed = parseTranscript(transcript.transcript_text, metadata);
        if (parsed.feedbackSegments.length === 0) {
          console.log(`\u26A0\uFE0F No feedback segments found in transcript ${transcript.diio_transcript_id}`);
          await supabase.from("diio_transcripts").update({
            feedback_extracted: true,
            feedback_extraction_date: (/* @__PURE__ */ new Date()).toISOString(),
            feedback_segments_count: 0
          }).eq("id", transcript.id);
          result.summary.transcriptsProcessed++;
          result.details.processedTranscriptIds.push(transcript.diio_transcript_id);
          continue;
        }
        console.log(`\u2705 Extracted ${parsed.feedbackSegments.length} feedback segments`);
        const transcriptId = transcript.id;
        const feedbackRecords = parsed.feedbackSegments.map((segment, index) => {
          let speakerType = segment.speakerType;
          if (segment.speakerType === "unknown" && (sourceData == null ? void 0 : sourceData.attendees)) {
            const speakerNameLower = segment.speaker.toLowerCase();
            if (sourceData.attendees.sellers) {
              const sellerMatch = sourceData.attendees.sellers.find((s) => {
                var _a, _b, _c;
                const nameMatch = ((_a = s.name) == null ? void 0 : _a.toLowerCase().includes(speakerNameLower)) || speakerNameLower.includes((_b = s.name) == null ? void 0 : _b.toLowerCase());
                const emailMatch = (_c = s.email) == null ? void 0 : _c.toLowerCase().includes(speakerNameLower);
                return nameMatch || emailMatch;
              });
              if (sellerMatch) {
                speakerType = "seller";
              }
            }
            if (speakerType === "unknown" && sourceData.attendees.customers) {
              const customerMatch = sourceData.attendees.customers.find((c) => {
                var _a, _b, _c;
                const nameMatch = ((_a = c.name) == null ? void 0 : _a.toLowerCase().includes(speakerNameLower)) || speakerNameLower.includes((_b = c.name) == null ? void 0 : _b.toLowerCase());
                const emailMatch = (_c = c.email) == null ? void 0 : _c.toLowerCase().includes(speakerNameLower);
                return nameMatch || emailMatch;
              });
              if (customerMatch) {
                speakerType = "customer";
              }
            }
          }
          const segmentChurnScore = segment.churnSignals.reduce((score, signal) => {
            const severityMap = {
              critical: 25,
              high: 15,
              medium: 8,
              low: 3
            };
            return score + (severityMap[signal.severity] || 0);
          }, 0);
          const allKeywords = [
            ...segment.keywords,
            ...segment.churnSignals.map((s) => s.category)
          ];
          return {
            transcript_id: transcriptId,
            diio_transcript_id: transcript.diio_transcript_id,
            source_type: transcript.transcript_type,
            source_id: transcript.source_id,
            source_name: transcript.source_name,
            segment_number: index + 1,
            speaker_name: segment.speaker || "Unknown",
            speaker_type: speakerType,
            feedback_text: segment.text,
            feedback_type: segment.type,
            urgency: segment.urgency,
            sentiment: segment.sentiment,
            keywords: allKeywords.length > 0 ? allKeywords : void 0,
            occurred_at: transcript.occurred_at || transcript.created_at,
            participant_emails: participantEmails.length > 0 ? participantEmails : void 0,
            account_name: metadata.accountName,
            analyzed_by_ai: false,
            ai_analysis_date: null
          };
        });
        const batchSize = 100;
        for (let i = 0; i < feedbackRecords.length; i += batchSize) {
          const batch = feedbackRecords.slice(i, i + batchSize);
          const { error: insertError } = await supabase.from("diio_transcript_feedback").insert(batch);
          if (insertError) {
            console.error(`Error inserting feedback batch:`, insertError);
            throw insertError;
          }
        }
        await supabase.from("diio_transcripts").update({
          feedback_extracted: true,
          feedback_extraction_date: (/* @__PURE__ */ new Date()).toISOString(),
          feedback_segments_count: parsed.feedbackSegments.length
        }).eq("id", transcript.id);
        result.summary.transcriptsProcessed++;
        result.summary.feedbackSegmentsExtracted += parsed.feedbackSegments.length;
        result.details.processedTranscriptIds.push(transcript.diio_transcript_id);
        console.log(`\u2705 Successfully processed transcript ${transcript.diio_transcript_id} (${parsed.feedbackSegments.length} segments)`);
      } catch (error) {
        console.error(`\u274C Error processing transcript ${transcript.diio_transcript_id}:`, error);
        result.summary.errors++;
        result.details.errors.push({
          transcriptId: transcript.diio_transcript_id,
          error: error.message || "Unknown error"
        });
        continue;
      }
    }
    result.success = true;
    result.message = `Extraction completed! Processed ${result.summary.transcriptsProcessed} transcripts, extracted ${result.summary.feedbackSegmentsExtracted} feedback segments, skipped ${result.summary.transcriptsSkipped}, ${result.summary.errors} errors.`;
    console.log(`\u2705 Extraction completed: ${result.message}`);
    return result;
  } catch (error) {
    console.error("\u274C Extraction failed:", error);
    result.success = false;
    result.message = `Extraction failed: ${error.message || "Unknown error"}`;
    throw createError({
      statusCode: error.statusCode || 500,
      message: result.message
    });
  }
});
function extractAccountName(callName, attendees) {
  if (!callName && !attendees) return void 0;
  if (callName) {
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
  }
  if ((attendees == null ? void 0 : attendees.customers) && attendees.customers.length > 0) {
    return attendees.customers[0].name;
  }
  return void 0;
}

export { extractFeedback_post as default };
//# sourceMappingURL=extract-feedback.post.mjs.map
