// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-side environment variables
    googleProjectId: process.env.GOOGLE_PROJECT_ID,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googlePrivateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
    googleSheetsId: '1VfTbd2J91PgIj5skhUbqOst1oLgXEuoyLTqxCOPLJ2Q',
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY, // OpenAI API for client enrichment
    // DIIO API Configuration
    diioClientId: process.env.DIIO_CLIENT_ID,
    diioClientSecret: process.env.DIIO_CLIENT_SECRET,
    diioRefreshToken: process.env.DIIO_REFRESH_TOKEN,
    diioSubdomain: process.env.DIIO_SUBDOMAIN || 'getontop',
    cronSecret: process.env.CRON_SECRET, // Optional: for securing daily sync endpoint
    // n8n Webhook URL (for Client ID lookup via n8n)
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
    public: {
      // Client-side environment variables
      appName: 'Ontop Feedback Analytics',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  nitro: {
    preset: 'vercel'
  },
  typescript: {
    strict: true,
    typeCheck: false // Disable type checking during build for Vercel compatibility
  }
})