import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )

    // Try a simple query
    const { data, error, count } = await supabase
      .from('diio_transcripts')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return {
        status: 'Database connection test',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }

    return {
      status: 'Database connection test',
      success: true,
      recordCount: count,
      timestamp: new Date().toISOString()
    }
  } catch (err: any) {
    return {
      status: 'Database connection test',
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }
  }
})
