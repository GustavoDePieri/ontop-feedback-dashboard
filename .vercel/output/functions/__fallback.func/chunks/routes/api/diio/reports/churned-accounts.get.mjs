import { d as defineEventHandler, a as useRuntimeConfig, c as createError } from '../../../../_/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const churnedAccounts_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  );
  try {
    console.log("\u{1F4CA} Generating churned accounts report...");
    const { data: accountData, error: accountError } = await supabase.rpc("get_churned_accounts_report");
    if (accountError) {
      console.log("\u26A0\uFE0F RPC function not found, using manual query...");
      const { data: transcripts, error: transcriptError } = await supabase.from("diio_transcripts").select("client_platform_id, account_name, occurred_at").not("client_platform_id", "is", null).not("account_name", "is", null).order("occurred_at", { ascending: false });
      if (transcriptError) {
        throw transcriptError;
      }
      const accountMap = /* @__PURE__ */ new Map();
      for (const transcript of transcripts || []) {
        const key = transcript.client_platform_id;
        if (!accountMap.has(key)) {
          accountMap.set(key, {
            accountName: transcript.account_name,
            transcriptCount: 0,
            lastTranscriptDate: null,
            transcripts: []
          });
        }
        const account = accountMap.get(key);
        account.transcriptCount++;
        account.transcripts.push(transcript.occurred_at);
        if (!account.lastTranscriptDate || transcript.occurred_at && transcript.occurred_at > account.lastTranscriptDate) {
          account.lastTranscriptDate = transcript.occurred_at;
        }
      }
      const accountsArray = Array.from(accountMap.entries()).map(([clientPlatformId, data]) => ({
        accountName: data.accountName,
        clientPlatformId,
        transcriptCount: data.transcriptCount,
        lastTranscriptDate: data.lastTranscriptDate
      }));
      accountsArray.sort((a, b) => b.transcriptCount - a.transcriptCount);
      const distribution = {
        accountsWith1Transcript: accountsArray.filter((a) => a.transcriptCount === 1).length,
        accountsWith2To5Transcripts: accountsArray.filter((a) => a.transcriptCount >= 2 && a.transcriptCount <= 5).length,
        accountsWith6To10Transcripts: accountsArray.filter((a) => a.transcriptCount >= 6 && a.transcriptCount <= 10).length,
        accountsWith10PlusTranscripts: accountsArray.filter((a) => a.transcriptCount > 10).length
      };
      const report = {
        totalChurnedAccounts: accountsArray.length,
        totalTranscripts: (transcripts == null ? void 0 : transcripts.length) || 0,
        accountsWithTranscripts: accountsArray.filter((a) => a.transcriptCount > 0).length,
        accountsWithoutTranscripts: accountsArray.filter((a) => a.transcriptCount === 0).length,
        topAccountsByTranscripts: accountsArray.slice(0, 20),
        // Top 20 accounts
        transcriptDistribution: distribution,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log(`\u2705 Generated churned accounts report: ${report.totalChurnedAccounts} accounts, ${report.totalTranscripts} transcripts`);
      return report;
    } else {
      const report = {
        totalChurnedAccounts: accountData.total_accounts || 0,
        totalTranscripts: accountData.total_transcripts || 0,
        accountsWithTranscripts: accountData.accounts_with_transcripts || 0,
        accountsWithoutTranscripts: accountData.accounts_without_transcripts || 0,
        topAccountsByTranscripts: accountData.top_accounts || [],
        transcriptDistribution: accountData.distribution || {
          accountsWith1Transcript: 0,
          accountsWith2To5Transcripts: 0,
          accountsWith6To10Transcripts: 0,
          accountsWith10PlusTranscripts: 0
        },
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      return report;
    }
  } catch (error) {
    console.error("\u274C Error generating churned accounts report:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate churned accounts report: ${error.message}`
    });
  }
});

export { churnedAccounts_get as default };
//# sourceMappingURL=churned-accounts.get.mjs.map
