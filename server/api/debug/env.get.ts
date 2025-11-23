export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  return {
    huggingfaceApiKeyConfigured: !!config.huggingfaceApiKey,
    huggingfaceApiKeyLength: config.huggingfaceApiKey ? config.huggingfaceApiKey.length : 0,
    supabaseConfigured: !!(config.public.supabaseUrl && config.public.supabaseAnonKey),
    environment: process.env.NODE_ENV || 'unknown'
  }
})