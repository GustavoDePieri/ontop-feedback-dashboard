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
    
    // Fetch data from Google Sheets - just the date column
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: 'Sheet1!G:G', // Just the date column
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      throw new Error('No data found in spreadsheet')
    }

    const [header, ...dataRows] = rows
    console.log('Date column header:', header)
    
    // Get today's date for comparison
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayLocal = today.toLocaleDateString()
    
    // Process first 20 dates to see the patterns
    const dateAnalysis = dataRows.slice(0, 20).map((row, index) => {
      const rawDateStr = row[0] || ''
      let parsedDate: Date
      let parseMethod = 'none'
      
      try {
        if (!rawDateStr) {
          parsedDate = new Date()
          parseMethod = 'fallback-current'
        } else {
          // Try standard parsing first
          parsedDate = new Date(rawDateStr)
          parseMethod = 'standard'
          
          // If that fails, try MM/DD/YYYY parsing
          if (isNaN(parsedDate.getTime())) {
            const parts = rawDateStr.split('/')
            if (parts.length === 3) {
              const month = parseInt(parts[0]) - 1
              const day = parseInt(parts[1])
              const year = parseInt(parts[2])
              parsedDate = new Date(year, month, day)
              parseMethod = 'MM/DD/YYYY'
            }
          }
          
          // If still invalid, try dash format
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date(rawDateStr.replace(/-/g, '/'))
            parseMethod = 'dash-to-slash'
          }
          
          // Last resort
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date()
            parseMethod = 'fallback-invalid'
          }
        }
      } catch (error) {
        parsedDate = new Date()
        parseMethod = 'error-fallback'
      }
      
      const isToday = parsedDate.toDateString() === today.toDateString()
      
      return {
        index,
        rawDateStr,
        parsedDate: parsedDate.toISOString(),
        parsedDateLocal: parsedDate.toLocaleDateString(),
        parseMethod,
        isToday,
        daysFromToday: Math.round((parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }
    })
    
    // Count today's entries
    const todayCount = dataRows.filter(row => {
      const dateStr = row[0] || ''
      if (!dateStr) return false
      
      let date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
        }
      }
      
      return date.toDateString() === today.toDateString()
    }).length
    
    return {
      success: true,
      serverTime: new Date().toISOString(),
      serverLocalTime: new Date().toLocaleString(),
      todayStr,
      todayLocal,
      totalRows: dataRows.length,
      todayCount,
      dateColumnHeader: header,
      sampleDates: dateAnalysis,
      recentDates: dataRows.slice(-10).map(row => row[0] || 'empty').filter(d => d !== 'empty')
    }
  } catch (error: any) {
    console.error('Debug dates error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Debug failed: ${error.message}`
    })
  }
})
