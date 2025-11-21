import { d as defineEventHandler, g as getQuery, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const meetings_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;
    const data = await diioRequest("/v1/meetings", {
      params: { page, limit }
    });
    return data;
  } catch (error) {
    console.error("Error fetching DIIO meetings:", error);
    if (error.statusCode === 401 || error.statusCode === 404) {
      return {
        meetings: [],
        total: 0,
        next: null
      };
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch DIIO meetings"
    });
  }
});

export { meetings_get as default };
//# sourceMappingURL=meetings.get.mjs.map
