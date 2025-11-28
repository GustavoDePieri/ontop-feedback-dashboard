import { config } from 'dotenv'
import { resolve } from 'path'

// Try multiple ways to load .env
console.log('Testing .env loading...')
console.log('Current directory:', process.cwd())
console.log('Script directory:', __dirname)

// Method 1: Relative to current directory
config({ path: '.env' })
console.log('\nMethod 1 (.env):')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'FOUND' : 'NOT FOUND')
console.log('NUXT_PUBLIC_SUPABASE_URL:', process.env.NUXT_PUBLIC_SUPABASE_URL ? 'FOUND' : 'NOT FOUND')

// Method 2: Relative to script directory
config({ path: resolve(__dirname, '../.env') })
console.log('\nMethod 2 (resolve):')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'FOUND' : 'NOT FOUND')
console.log('NUXT_PUBLIC_SUPABASE_URL:', process.env.NUXT_PUBLIC_SUPABASE_URL ? 'FOUND' : 'NOT FOUND')
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'FOUND' : 'NOT FOUND')

// Show actual values (first 20 chars)
if (process.env.NUXT_PUBLIC_SUPABASE_URL) {
  console.log('\nActual URL (first 30 chars):', process.env.NUXT_PUBLIC_SUPABASE_URL.substring(0, 30))
}
