import { d as defineEventHandler, e as getHeader, a as useRuntimeConfig, c as createError } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const syncTranscriptsDaily_get = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const cronSecret = useRuntimeConfig().cronSecret;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  const syncResult = await $fetch("/api/diio/sync-transcripts", {
    method: "POST"
  });
  return {
    success: true,
    message: "Daily sync triggered",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    result: syncResult
  };
});

export { syncTranscriptsDaily_get as default };
//# sourceMappingURL=sync-transcripts-daily.get.mjs.map
