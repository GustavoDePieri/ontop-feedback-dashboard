import { d as defineEventHandler, r as readBody, c as createError, a as useRuntimeConfig } from '../../../_/nitro.mjs';
import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const analyzeTranscript_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    const body = await readBody(event);
    const { transcriptId } = body;
    if (!transcriptId) {
      throw createError({
        statusCode: 400,
        message: "Transcript ID is required"
      });
    }
    if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        message: "Supabase configuration is missing"
      });
    }
    const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
    const { data: transcript, error: fetchError } = await supabase.from("diio_transcripts").select("*").eq("id", transcriptId).single();
    if (fetchError || !transcript) {
      throw createError({
        statusCode: 404,
        message: "Transcript not found"
      });
    }
    if (transcript.ai_analysis) {
      console.log(`\u2705 Returning cached sentiment analysis for transcript ${transcriptId}`);
      return {
        success: true,
        transcriptId,
        analysis: transcript.ai_analysis,
        metadata: {
          analyzedAt: transcript.ai_analysis_date || transcript.updated_at,
          sourceName: transcript.source_name || "Unknown",
          occurredAt: transcript.occurred_at,
          attendees: transcript.attendees,
          participantEmails: extractParticipantEmails(transcript.attendees),
          cached: true
        }
      };
    }
    if (!config.huggingFaceApiKey) {
      throw createError({
        statusCode: 500,
        message: "HuggingFace API key not configured"
      });
    }
    const hf = new HfInference(config.huggingFaceApiKey);
    const participantEmails = extractParticipantEmails(transcript.attendees);
    let transcriptText = transcript.transcript_text;
    if (typeof transcriptText !== "string") {
      try {
        if (Array.isArray(transcriptText)) {
          transcriptText = transcriptText.map((s) => {
            if (typeof s === "string") return s;
            return s.text || s.content || JSON.stringify(s);
          }).join("\n");
        } else {
          transcriptText = JSON.stringify(transcriptText);
        }
      } catch {
        transcriptText = String(transcriptText);
      }
    }
    console.log(`\u{1F916} Analyzing transcript ${transcriptId} with HuggingFace sentiment analysis...`);
    const sentiment = await hf.textClassification({
      model: "cardiffnlp/twitter-xlm-roberta-base-sentiment",
      inputs: transcriptText
    });
    const topSentiment = Array.isArray(sentiment) ? sentiment[0] : sentiment;
    const analysis = generateSentimentAnalysis(
      topSentiment,
      transcriptText,
      transcript.source_name,
      transcript.transcript_type
    );
    const { error: updateError } = await supabase.from("diio_transcripts").update({
      ai_analysis: analysis,
      ai_analysis_date: (/* @__PURE__ */ new Date()).toISOString(),
      analyzed_status: "finished",
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", transcriptId);
    if (updateError) {
      console.error("Failed to cache sentiment analysis:", updateError);
    }
    console.log(`\u2705 Successfully analyzed and cached transcript ${transcriptId}`);
    return {
      success: true,
      transcriptId,
      analysis,
      metadata: {
        analyzedAt: (/* @__PURE__ */ new Date()).toISOString(),
        sourceName: transcript.source_name || "Unknown",
        occurredAt: transcript.occurred_at,
        attendees: transcript.attendees,
        participantEmails,
        cached: false
      }
    };
  } catch (error) {
    console.error("Transcript analysis error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to analyze transcript"
    });
  }
});
function extractParticipantEmails(attendees) {
  const emails = [];
  if (!attendees) return emails;
  if (attendees.sellers && Array.isArray(attendees.sellers)) {
    attendees.sellers.forEach((s) => {
      if (s.email) emails.push(s.email);
    });
  }
  if (attendees.customers && Array.isArray(attendees.customers)) {
    attendees.customers.forEach((c) => {
      if (c.email) emails.push(c.email);
    });
  }
  return emails;
}
function generateSentimentAnalysis(sentiment, transcriptText, sourceName, transcriptType) {
  const { label, score } = sentiment;
  const sentimentMapping = {
    "Positive": "positive",
    "Neutral": "neutral",
    "Negative": "negative"
  };
  const overallSentiment = sentimentMapping[label] || "neutral";
  const sentimentScore = label === "Positive" ? score : label === "Negative" ? -score : 0;
  let customerSatisfaction;
  if (overallSentiment === "positive") {
    customerSatisfaction = "satisfied";
  } else if (overallSentiment === "negative") {
    customerSatisfaction = score > 0.7 ? "at_risk" : "frustrated";
  } else {
    customerSatisfaction = "neutral";
  }
  let churnRisk;
  if (overallSentiment === "positive") {
    churnRisk = "low";
  } else if (overallSentiment === "negative") {
    churnRisk = score > 0.8 ? "critical" : score > 0.6 ? "high" : "medium";
  } else {
    churnRisk = "low";
  }
  const churnSignals = [];
  if (churnRisk === "high" || churnRisk === "critical") {
    churnSignals.push("Negative sentiment detected in conversation");
    if (transcriptText.toLowerCase().includes("competitor") || transcriptText.toLowerCase().includes("alternative")) {
      churnSignals.push("Mention of competitors or alternatives");
    }
  }
  const keyThemes = [
    {
      theme: overallSentiment === "positive" ? "General satisfaction" : "General concerns",
      sentiment: overallSentiment,
      mentions: 1,
      urgency: overallSentiment === "negative" ? churnRisk === "critical" ? "critical" : "medium" : "low"
    }
  ];
  const painPoints = [];
  const positiveHighlights = [];
  if (overallSentiment === "negative") {
    painPoints.push("Customer expressed dissatisfaction during the conversation");
  } else if (overallSentiment === "positive") {
    positiveHighlights.push("Customer showed positive sentiment during the conversation");
  }
  const actionableInsights = [];
  if (churnRisk === "high" || churnRisk === "critical") {
    actionableInsights.push({
      insight: "Schedule follow-up call to address concerns and prevent potential churn",
      priority: churnRisk === "critical" ? "critical" : "high",
      owner: "Customer Success",
      estimatedImpact: "Improve customer satisfaction and reduce churn risk"
    });
  } else if (overallSentiment === "positive") {
    actionableInsights.push({
      insight: "Continue providing excellent service to maintain customer satisfaction",
      priority: "low",
      owner: "Account Management",
      estimatedImpact: "Maintain strong customer relationship"
    });
  }
  const summary = `This ${transcriptType} showed ${overallSentiment} sentiment with a ${customerSatisfaction} customer satisfaction level. ${churnRisk !== "low" ? `Churn risk is ${churnRisk} - follow-up recommended.` : "Customer appears satisfied with current service."}`;
  return {
    overallSentiment,
    sentimentScore,
    customerSatisfaction,
    churnRisk,
    churnSignals,
    keyThemes,
    painPoints,
    positiveHighlights,
    actionableInsights,
    summary
  };
}

export { analyzeTranscript_post as default };
//# sourceMappingURL=analyze-transcript.post.mjs.map
