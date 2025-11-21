import { d as defineEventHandler, r as readBody, c as createError } from '../../../_/nitro.mjs';
import { d as diioRequest } from '../../../_/diio.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const exports_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { model, file_type, send_to } = body;
    if (!model || !file_type) {
      throw createError({
        statusCode: 400,
        message: "model and file_type are required"
      });
    }
    if (!["phone_call", "meeting"].includes(model)) {
      throw createError({
        statusCode: 400,
        message: 'model must be "phone_call" or "meeting"'
      });
    }
    if (!["json", "csv"].includes(file_type)) {
      throw createError({
        statusCode: 400,
        message: 'file_type must be "json" or "csv"'
      });
    }
    const data = await diioRequest("/v1/exports", {
      method: "POST",
      body: {
        model,
        file_type,
        ...send_to && { send_to }
      }
    });
    return data;
  } catch (error) {
    console.error("Error creating DIIO export:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create DIIO export"
    });
  }
});

export { exports_post as default };
//# sourceMappingURL=exports.post.mjs.map
