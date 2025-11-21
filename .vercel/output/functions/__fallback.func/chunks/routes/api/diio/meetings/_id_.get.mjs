import { d as defineEventHandler, b as getRouterParam, c as createError } from '../../../../_/nitro.mjs';
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
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Meeting ID is required"
      });
    }
    const data = await diioRequest(`/v1/meetings/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching DIIO meeting:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch DIIO meeting"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
