import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Setup Google Sheets authentication
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
    
    // Test connection by getting sheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: config.googleSheetsId,
    })
    
    // Get first few rows to verify data access
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: 'Sheet1!A1:H5',
    })

    const rows = response.data.values || []
    
    return {
      success: true,
      message: '✅ Google Sheets connection successful!',
      sheetTitle: spreadsheet.data.properties?.title,
      worksheets: spreadsheet.data.sheets?.map(sheet => sheet.properties?.title),
      sampleDataRows: rows.length,
      headers: rows[0] || [],
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Google Sheets Test Error:', error)
    return {
      success: false,
      message: `❌ Connection failed: ${error.message}`,
      error: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }
  }
})
