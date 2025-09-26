export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    // Server-side environment variables
    googleProjectId: process.env.GOOGLE_PROJECT_ID,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googlePrivateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
    googleSheetsId: '1VfTbd2J91PgIj5skhUbqOst1oLgXEuoyLTqxCOPLJ2Q',
    public: {
      // Client-side environment variables
      appName: 'Ontop Feedback Analytics'
    }
  },
  typescript: {
    strict: true,
    typeCheck: false // Disable type checking during build for Vercel compatibility
  },
  nitro: {
    preset: 'vercel'
  }
})