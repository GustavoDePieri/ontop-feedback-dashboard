import { d as defineEventHandler, a as useRuntimeConfig, c as createError } from '../../../_/nitro.mjs';
import { google } from 'googleapis';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const data_get = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: config.googleProjectId,
        private_key_id: config.googlePrivateKeyId,
        private_key: (_a = config.googlePrivateKey) == null ? void 0 : _a.replace(/\\n/g, "\n"),
        client_email: config.googleClientEmail,
        client_id: config.googleClientId,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(config.googleClientEmail || "")}`
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: "Sheet1!A:L"
      // Updated to include all new columns
    });
    const rows = response.data.values || [];
    if (rows.length === 0) {
      throw new Error("No data found in spreadsheet");
    }
    const [headers, ...dataRows] = rows;
    console.log("Headers found:", headers);
    const feedbackItems = dataRows.map((row, index) => {
      let createdDate;
      try {
        const dateStr = row[6] || "";
        if (!dateStr) {
          const now = /* @__PURE__ */ new Date();
          createdDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
        } else {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const month = parseInt(parts[0]) - 1;
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            createdDate = new Date(year, month, day, 12, 0, 0, 0);
          } else {
            createdDate = new Date(dateStr);
            if (isNaN(createdDate.getTime())) {
              createdDate = new Date(dateStr.replace(/-/g, "/"));
            }
            if (isNaN(createdDate.getTime())) {
              console.warn(`\u26A0\uFE0F Could not parse date: "${dateStr}", using current date`);
              const now = /* @__PURE__ */ new Date();
              createdDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
            } else {
              const normalizedDate = new Date(createdDate);
              createdDate = new Date(
                normalizedDate.getFullYear(),
                normalizedDate.getMonth(),
                normalizedDate.getDate(),
                12,
                0,
                0,
                0
              );
            }
          }
        }
      } catch (error) {
        console.error(`\u274C Date parsing error for "${row[6]}":`, error);
        const now = /* @__PURE__ */ new Date();
        createdDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
      }
      const realMrrLastMonth = row[3] ? parseFloat(row[3]) : void 0;
      const lastInvoicedTpv = row[4] ? parseFloat(row[4]) : void 0;
      return {
        id: `feedback-${index}`,
        accountOwner: row[0] || "",
        // Column A
        platformClientId: row[1] || "",
        // Column B
        accountName: row[2] || "",
        // Column C
        realMrrLastMonth,
        // Column D
        lastInvoicedTpv,
        // Column E
        csInsightName: row[5] || "",
        // Column F
        createdDate,
        // Column G
        subcategory: row[7] || "",
        // Column H
        feedback: row[8] || "",
        // Column I
        feedbackDirectedTo: row[9] || "",
        // Column J
        customerSatisfaction: row[10] || "",
        // Column K
        categoryFormulaText: row[11] || ""
        // Column L
      };
    }).filter((item) => item.feedback && item.feedback.length > 5);
    const processedItems = feedbackItems.map((item) => ({
      ...item,
      sentiment: analyzeSentiment(item.feedback),
      sentimentScore: calculateSentimentScore(item.feedback)
    }));
    return {
      success: true,
      data: processedItems,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      totalRecords: processedItems.length
    };
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch data: ${error.message}`
    });
  }
});
function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();
  const positiveWords = ["good", "great", "excellent", "amazing", "love", "perfect", "happy", "satisfied", "wonderful", "fantastic", "awesome", "brilliant", "outstanding"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "disappointed", "frustrated", "poor", "worst", "horrible", "useless", "broken", "slow", "confusing"];
  let score = 0;
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) score += 1;
  });
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) score -= 1;
  });
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}
function calculateSentimentScore(text) {
  const lowerText = text.toLowerCase();
  const positiveWords = ["good", "great", "excellent", "amazing", "love", "perfect", "happy", "satisfied", "wonderful", "fantastic", "awesome", "brilliant", "outstanding"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "disappointed", "frustrated", "poor", "worst", "horrible", "useless", "broken", "slow", "confusing"];
  let score = 0;
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) score += 1;
  });
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) score -= 1;
  });
  return score;
}

export { data_get as default };
//# sourceMappingURL=data.get.mjs.map
