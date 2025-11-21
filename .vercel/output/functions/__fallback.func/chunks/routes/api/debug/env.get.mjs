import { d as defineEventHandler, a as useRuntimeConfig } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const env_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const envStatus = {
    HUGGINGFACE_API_KEY: !!config.huggingfaceApiKey,
    SUPABASE_URL: !!config.supabaseUrl,
    SUPABASE_ANON_KEY: !!config.supabaseAnonKey,
    DIIO_CLIENT_ID: !!config.diioClientId,
    DIIO_CLIENT_SECRET: !!config.diioClientSecret,
    DIIO_REFRESH_TOKEN: !!config.diioRefreshToken,
    public: {
      SUPABASE_URL: !!config.public.supabaseUrl,
      SUPABASE_ANON_KEY: !!config.public.supabaseAnonKey
    }
  };
  return {
    status: "Environment variables check",
    available: envStatus,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { env_get as default };
//# sourceMappingURL=env.get.mjs.map
