import { d as defineEventHandler, g as getQuery, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const users_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = query.page ? Number(query.page) : void 0;
    const data = await diioRequest("/v1/users", {
      params: page ? { page } : {}
    });
    return data;
  } catch (error) {
    console.error("Error fetching DIIO users:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch DIIO users"
    });
  }
});

export { users_get as default };
//# sourceMappingURL=users.get.mjs.map
