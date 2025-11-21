import { d as defineEventHandler, g as getQuery, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const phoneCalls_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;
    const data = await diioRequest("/v1/phone_calls", {
      params: { page, limit }
    });
    return data;
  } catch (error) {
    console.error("Error fetching DIIO phone calls:", error);
    if (error.statusCode === 404) {
      return {
        phone_calls: [],
        total: 0,
        next: null
      };
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch DIIO phone calls"
    });
  }
});

export { phoneCalls_get as default };
//# sourceMappingURL=phone-calls.get.mjs.map
