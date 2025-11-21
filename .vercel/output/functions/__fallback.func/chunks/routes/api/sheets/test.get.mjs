import { d as defineEventHandler, a as useRuntimeConfig } from '../../../_/nitro.mjs';
import { google } from 'googleapis';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const test_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
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
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: config.googleSheetsId
    });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: "Sheet1!A1:H5"
    });
    const rows = response.data.values || [];
    return {
      success: true,
      message: "\u2705 Google Sheets connection successful!",
      sheetTitle: (_b = spreadsheet.data.properties) == null ? void 0 : _b.title,
      worksheets: (_c = spreadsheet.data.sheets) == null ? void 0 : _c.map((sheet) => {
        var _a2;
        return (_a2 = sheet.properties) == null ? void 0 : _a2.title;
      }),
      sampleDataRows: rows.length,
      headers: rows[0] || [],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("Google Sheets Test Error:", error);
    return {
      success: false,
      message: `\u274C Connection failed: ${error.message}`,
      error: error.code || "UNKNOWN_ERROR",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});

export { test_get as default };
//# sourceMappingURL=test.get.mjs.map
