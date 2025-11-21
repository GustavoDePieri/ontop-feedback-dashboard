import { d as defineEventHandler, b as getRouterParam, g as getQuery, c as createError } from '../../../../_/nitro.mjs';
import { d as diioRequest } from '../../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const _id__get = defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    const query = getQuery(event);
    const email = query.email;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Transcript ID is required"
      });
    }
    const data = await diioRequest(`/v1/transcripts/${id}`, {
      params: email ? { email } : {}
    });
    return data;
  } catch (error) {
    console.error("Error fetching DIIO transcript:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch DIIO transcript"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
