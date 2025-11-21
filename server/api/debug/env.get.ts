export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check which environment variables are available
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
  }

  return {
    status: 'Environment variables check',
    available: envStatus,
    timestamp: new Date().toISOString()
  }
})
