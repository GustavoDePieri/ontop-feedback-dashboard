import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const db_get = defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const { data, error, count } = await supabase.from("diio_transcripts").select("id", { count: "exact", head: true });
    if (error) {
      return {
        status: "Database connection test",
        success: false,
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return {
      status: "Database connection test",
      success: true,
      recordCount: count,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (err) {
    return {
      status: "Database connection test",
      success: false,
      error: err.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});

export { db_get as default };
//# sourceMappingURL=db.get.mjs.map
