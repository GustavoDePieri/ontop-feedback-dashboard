import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Initialize stats object
    const stats = {
      feedbackCount: 0,
      transcriptCount: 0,
      reportsCount: 0, // Can be tracked later if we store reports
      success: true,
      lastUpdated: new Date().toISOString()
    }

    // Get feedback count from Google Sheets
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          type: 'service_account',
          project_id: config.googleProjectId,
          private_key_id: config.googlePrivateKeyId,
          private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
          client_email: config.googleClientEmail,
          client_id: config.googleClientId,
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(config.googleClientEmail || '')}`
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      })

      const sheets = google.sheets({ version: 'v4', auth })
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.googleSheetsId,
        range: 'Sheet1!A:L',
      })

      const rows = response.data.values || []
      // Subtract 1 for header row, and filter out empty feedback
      const feedbackRows = rows.slice(1).filter((row) => row[8] && row[8].length > 5)
      stats.feedbackCount = feedbackRows.length
    } catch (error) {
      console.error('Error fetching feedback count:', error)
      // Continue with 0 if error
    }

    // Get transcript count from Supabase
    try {
      const supabase = createClient(
        config.supabaseUrl!,
        config.supabaseAnonKey!
      )

      const { count, error } = await supabase
        .from('diio_transcripts')
        .select('id', { count: 'exact', head: true })

      if (!error && count !== null) {
        stats.transcriptCount = count
      }
    } catch (error) {
      console.error('Error fetching transcript count:', error)
      // Continue with 0 if error
    }

    return stats
  } catch (error: any) {
    console.error('Stats API Error:', error)
    return {
      feedbackCount: 0,
      transcriptCount: 0,
      reportsCount: 0,
      success: false,
      error: error.message,
      lastUpdated: new Date().toISOString()
    }
  }
})

