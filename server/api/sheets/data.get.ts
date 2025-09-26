import { google } from 'googleapis'
import type { FeedbackItem } from '~/types/feedback'

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
    
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: 'Sheet1!A:L', // Updated to include all new columns
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      throw new Error('No data found in spreadsheet')
    }

    // Convert rows to FeedbackItem objects
    const [headers, ...dataRows] = rows
    console.log('Headers found:', headers)
    
    const feedbackItems: FeedbackItem[] = dataRows.map((row, index) => {
      // Parse the date (MM/DD/YYYY format) - now from column G (CS Insight: Created Date)
      let createdDate: Date
      try {
        const dateStr = row[6] || '' // Column G
        createdDate = new Date(dateStr)
        if (isNaN(createdDate.getTime())) {
          createdDate = new Date()
        }
      } catch {
        createdDate = new Date()
      }

      // Parse numeric values
      const realMrrLastMonth = row[3] ? parseFloat(row[3]) : undefined
      const lastInvoicedTpv = row[4] ? parseFloat(row[4]) : undefined

      return {
        id: `feedback-${index}`,
        accountOwner: row[0] || '', // Column A
        platformClientId: row[1] || '', // Column B
        accountName: row[2] || '', // Column C
        realMrrLastMonth, // Column D
        lastInvoicedTpv, // Column E
        csInsightName: row[5] || '', // Column F
        createdDate, // Column G
        subcategory: row[7] || '', // Column H
        feedback: row[8] || '', // Column I
        feedbackDirectedTo: row[9] || '', // Column J
        customerSatisfaction: row[10] || '', // Column K
        categoryFormulaText: row[11] || '' // Column L
      }
    }).filter(item => item.feedback && item.feedback.length > 5) // Filter out empty feedback

    // Add basic sentiment analysis
    const processedItems = feedbackItems.map(item => ({
      ...item,
      sentiment: analyzeSentiment(item.feedback),
      sentimentScore: calculateSentimentScore(item.feedback)
    }))

    return {
      success: true,
      data: processedItems,
      lastUpdated: new Date().toISOString(),
      totalRecords: processedItems.length
    }
  } catch (error: any) {
    console.error('Google Sheets API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch data: ${error.message}`
    })
  }
})

// Simple sentiment analysis function
function analyzeSentiment(text: string): 'Positive' | 'Neutral' | 'Negative' {
  const lowerText = text.toLowerCase()
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'happy', 'satisfied', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'poor', 'worst', 'horrible', 'useless', 'broken', 'slow', 'confusing']
  
  let score = 0
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1
  })
  
  if (score > 0) return 'Positive'
  if (score < 0) return 'Negative'
  return 'Neutral'
}

function calculateSentimentScore(text: string): number {
  const lowerText = text.toLowerCase()
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'happy', 'satisfied', 'wonderful', 'fantastic', 'awesome', 'brilliant', 'outstanding']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'poor', 'worst', 'horrible', 'useless', 'broken', 'slow', 'confusing']
  
  let score = 0
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1
  })
  
  return score
}
