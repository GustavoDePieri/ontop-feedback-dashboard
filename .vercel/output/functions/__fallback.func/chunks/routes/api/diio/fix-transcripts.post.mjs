import { d as defineEventHandler, a as useRuntimeConfig, c as createError } from '../../../_/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const fixTranscripts_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      message: "Supabase configuration is missing"
    });
  }
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
  try {
    const { data: transcripts, error: fetchError } = await supabase.from("diio_transcripts").select("id, diio_transcript_id, transcript_text");
    if (fetchError) {
      throw fetchError;
    }
    if (!transcripts || transcripts.length === 0) {
      return {
        success: true,
        message: "No transcripts to fix",
        fixed: 0,
        total: 0
      };
    }
    let fixedCount = 0;
    for (const transcript of transcripts) {
      const text = transcript.transcript_text;
      if (typeof text === "string" && !text.trim().startsWith("[") && !text.trim().startsWith("{")) {
        if (!text.includes("[object Object]")) {
          continue;
        }
      }
      let fixedText = "";
      try {
        let parsed = text;
        if (typeof text === "string") {
          try {
            parsed = JSON.parse(text);
          } catch {
            fixedText = text.replace(/\[object Object\]/g, "").trim();
            if (fixedText && fixedText.length > 0 && fixedText !== text) {
              await supabase.from("diio_transcripts").update({ transcript_text: fixedText }).eq("id", transcript.id);
              fixedCount++;
              continue;
            }
            continue;
          }
        } else {
          parsed = text;
        }
        if (Array.isArray(parsed)) {
          fixedText = parsed.map((segment) => {
            if (typeof segment === "string") {
              return segment;
            } else if (segment && typeof segment === "object") {
              return segment.text || segment.content || segment.transcript || (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) || JSON.stringify(segment);
            }
            return String(segment);
          }).filter((t) => t && t.trim().length > 0).join("\n");
        } else if (parsed && typeof parsed === "object") {
          fixedText = parsed.text || parsed.content || parsed.transcript || JSON.stringify(parsed, null, 2);
        } else {
          fixedText = String(parsed);
        }
        fixedText = fixedText.replace(/\[object Object\]/g, "").trim();
        if (fixedText && fixedText.length > 0) {
          const { error: updateError } = await supabase.from("diio_transcripts").update({ transcript_text: fixedText }).eq("id", transcript.id);
          if (updateError) {
            console.error(`Error fixing transcript ${transcript.diio_transcript_id}:`, updateError);
          } else {
            fixedCount++;
            console.log(`\u2705 Fixed transcript ${transcript.diio_transcript_id}`);
          }
        }
      } catch (error) {
        console.error(`Error processing transcript ${transcript.diio_transcript_id}:`, error);
      }
    }
    return {
      success: true,
      message: `Fixed ${fixedCount} out of ${transcripts.length} transcripts`,
      fixed: fixedCount,
      total: transcripts.length
    };
  } catch (error) {
    console.error("Error fixing transcripts:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to fix transcripts: ${error.message}`
    });
  }
});

export { fixTranscripts_post as default };
//# sourceMappingURL=fix-transcripts.post.mjs.map
