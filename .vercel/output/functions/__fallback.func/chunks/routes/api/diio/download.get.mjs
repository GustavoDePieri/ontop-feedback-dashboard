import { d as defineEventHandler, g as getQuery, c as createError, s as setHeader } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const download_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const fileUrl = query.url;
    if (!fileUrl) {
      throw createError({
        statusCode: 400,
        message: "File URL is required"
      });
    }
    if (!fileUrl.includes("diio-production-files.s3.us-west-2.amazonaws.com")) {
      throw createError({
        statusCode: 400,
        message: "Invalid file URL"
      });
    }
    console.log("\u{1F4E5} Proxying download request for:", fileUrl);
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to download file: ${response.statusText}`
      });
    }
    const contentType = response.headers.get("content-type") || "application/json";
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "export.json";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
      }
    }
    const data = await response.text();
    setHeader(event, "Content-Type", contentType);
    setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);
    setHeader(event, "Cache-Control", "no-cache");
    console.log(`\u2705 Successfully proxied download: ${filename} (${data.length} bytes)`);
    return data;
  } catch (error) {
    console.error("Error proxying download:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to download file"
    });
  }
});

export { download_get as default };
//# sourceMappingURL=download.get.mjs.map
