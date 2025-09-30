import { GoogleGenerativeAI } from '@google/generative-ai'
import type { FeedbackItem } from '~/types/feedback'

interface RecommendationRequest {
  feedbackItems: FeedbackItem[]
  segmentType?: 'all' | 'year' | 'sentiment' | 'category' | 'account_manager'
  segmentValue?: string
  focusArea?: string
}

interface RecurringRequest {
  request: string
  frequency: number
  priority: 'high' | 'medium' | 'low'
  evidence: string
  revenueImpact: string
  sentiment: string
  recommendedAction: string
  quickWinPotential: string
  crossFunctionalOwner: string
}

interface AIRecommendation {
  summary: string
  topRecurringRequests: RecurringRequest[]
  emergingPatterns: string[]
  criticalRisks: string[]
  quickWins: string[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const body = await readBody<RecommendationRequest>(event)
    const { feedbackItems, segmentType = 'all', segmentValue, focusArea } = body

    if (!feedbackItems || feedbackItems.length === 0) {
      throw new Error('No feedback items provided')
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Prepare feedback summary for AI
    const feedbackSummary = prepareFeedbackSummary(feedbackItems, segmentType, segmentValue)

    // Create the prompt
    const prompt = createPrompt(feedbackSummary, segmentType, segmentValue, focusArea)

    // Generate recommendations
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse the AI response
    const recommendations = parseAIResponse(text, feedbackItems)

    return {
      success: true,
      data: recommendations,
      metadata: {
        itemsAnalyzed: feedbackItems.length,
        segmentType,
        segmentValue,
        focusArea,
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('AI Recommendations Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate recommendations: ${error.message}`
    })
  }
})

function prepareFeedbackSummary(
  items: FeedbackItem[], 
  segmentType: string, 
  segmentValue?: string
): string {
  const segments = {
    positive: items.filter(i => i.sentiment === 'Positive'),
    neutral: items.filter(i => i.sentiment === 'Neutral'),
    negative: items.filter(i => i.sentiment === 'Negative')
  }

  const summary = {
    total: items.length,
    sentimentBreakdown: {
      positive: segments.positive.length,
      neutral: segments.neutral.length,
      negative: segments.negative.length
    },
    categories: getTopCategories(items),
    subcategories: getTopSubcategories(items),
    accountManagers: getAccountManagerStats(items),
    feedbackDirections: getFeedbackDirections(items),
    topAccounts: getTopAccounts(items),
    recentFeedback: items.slice(0, 20).map(i => ({
      date: new Date(i.createdDate).toLocaleDateString(),
      account: i.accountName,
      sentiment: i.sentiment,
      category: i.categoryFormulaText,
      subcategory: i.subcategory,
      feedback: i.feedback.substring(0, 200),
      directedTo: i.feedbackDirectedTo,
      manager: i.accountOwner
    }))
  }

  return JSON.stringify(summary, null, 2)
}

function getTopCategories(items: FeedbackItem[]): Record<string, number> {
  const categories = new Map<string, number>()
  items.forEach(item => {
    const cat = item.categoryFormulaText || 'Uncategorized'
    categories.set(cat, (categories.get(cat) || 0) + 1)
  })
  return Object.fromEntries(
    Array.from(categories.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  )
}

function getTopSubcategories(items: FeedbackItem[]): Record<string, number> {
  const subcategories = new Map<string, number>()
  items.forEach(item => {
    const subcat = item.subcategory || 'None'
    subcategories.set(subcat, (subcategories.get(subcat) || 0) + 1)
  })
  return Object.fromEntries(
    Array.from(subcategories.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  )
}

function getAccountManagerStats(items: FeedbackItem[]): Record<string, number> {
  const managers = new Map<string, number>()
  items.forEach(item => {
    const manager = item.accountOwner || 'Unassigned'
    managers.set(manager, (managers.get(manager) || 0) + 1)
  })
  return Object.fromEntries(
    Array.from(managers.entries())
      .sort(([, a], [, b]) => b - a)
  )
}

function getFeedbackDirections(items: FeedbackItem[]): Record<string, number> {
  const directions = new Map<string, number>()
  items.forEach(item => {
    const direction = item.feedbackDirectedTo || 'General'
    directions.set(direction, (directions.get(direction) || 0) + 1)
  })
  return Object.fromEntries(
    Array.from(directions.entries())
      .sort(([, a], [, b]) => b - a)
  )
}

function getTopAccounts(items: FeedbackItem[]): Array<{ name: string; count: number; mrr?: number; tpv?: number }> {
  const accounts = new Map<string, { count: number; mrr?: number; tpv?: number }>()
  items.forEach(item => {
    const name = item.accountName || 'Unknown'
    const existing = accounts.get(name) || { count: 0 }
    accounts.set(name, {
      count: existing.count + 1,
      mrr: item.realMrrLastMonth || existing.mrr,
      tpv: item.lastInvoicedTpv || existing.tpv
    })
  })
  return Array.from(accounts.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([name, data]) => ({ name, ...data }))
}

function createPrompt(
  feedbackSummary: string, 
  segmentType: string, 
  segmentValue?: string,
  focusArea?: string
): string {
  const segmentDescription = segmentValue 
    ? `focusing specifically on ${segmentType}: ${segmentValue}`
    : `analyzing all feedback data`

  const focusAreaText = focusArea 
    ? `\n\nPay special attention to: ${focusArea}`
    : ''

  return `You are a strategic analyst for Ontop leadership. Your goal is to identify the MOST RECURRING client requests and prioritize them by evidence and frequency - NOT by department or subcategory.

CRITICAL CONTEXT:
This dashboard is for LEADERSHIP VISIBILITY. We need to see what clients are asking for most consistently, so we can tackle the biggest problems first and work our way down. This is about crossing items off a priority list backed by data, not creating scattered feedback reports.

FEEDBACK DATA (${segmentDescription}):
${feedbackSummary}
${focusAreaText}

ANALYSIS INSTRUCTIONS:
1. **IGNORE department silos** - Look at ALL feedback holistically
2. **GROUP by what clients actually want** - Not by internal categories
3. **COUNT frequency** - How many times do we hear similar requests?
4. **RANK by evidence** - Most mentioned = highest priority
5. **IDENTIFY patterns** - What are the recurring themes week after week?
6. **CONNECT revenue impact** - Which issues affect high-value clients (MRR/TPV)?

Please provide a FREQUENCY-DRIVEN ANALYSIS in the following JSON format:

{
  "summary": "A 2-3 sentence executive summary highlighting the TOP 3 most recurring client requests and their combined impact on the business",
  "topRecurringRequests": [
    {
      "request": "Clear description of what clients are asking for (e.g., 'Faster payment processing', 'Better reporting tools', 'Multi-currency support')",
      "frequency": "number of feedback items mentioning this (as a number)",
      "priority": "high|medium|low (based on frequency + revenue impact)",
      "evidence": "Specific data points showing this pattern (e.g., '15 mentions across 10 accounts, including 3 high-MRR clients')",
      "revenueImpact": "How much MRR/TPV is affected by this issue",
      "sentiment": "Overall sentiment about this issue (Positive/Negative/Mixed)",
      "recommendedAction": "Specific action to address this recurring request",
      "quickWinPotential": "Can this be solved quickly? (Yes/No + why)",
      "crossFunctionalOwner": "Who should own this (Product/Support/Operations/Sales/etc.)"
    }
  ],
  "emergingPatterns": [
    "Patterns that are starting to appear but haven't reached critical mass yet",
    "Early warning signs that could become major issues if ignored"
  ],
  "criticalRisks": [
    "Issues with strong evidence of potential churn or escalation",
    "Problems affecting multiple high-value clients"
  ],
  "quickWins": [
    "Low-hanging fruit that appears frequently and can be solved fast",
    "Small changes with disproportionate positive impact"
  ]
}

MANDATORY RULES:
- Sort topRecurringRequests by FREQUENCY FIRST, then by revenue impact
- Only include requests mentioned in at least 3+ feedback items
- Be SPECIFIC about numbers - how many times, how much revenue, how many clients
- Focus on ACTIONABLE insights, not descriptive observations
- If there's insufficient evidence (< 3 mentions), don't include it
- Think like a CEO: What matters most? What should we fix first?
- Avoid generic advice - every recommendation must be tied to specific data

Return ONLY the JSON object, no additional text.`
}

function parseAIResponse(text: string, feedbackItems: FeedbackItem[]): AIRecommendation {
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
    }

    const parsed = JSON.parse(jsonText)

    // Validate and structure the response
    return {
      summary: parsed.summary || 'No summary provided',
      topRecurringRequests: Array.isArray(parsed.topRecurringRequests) 
        ? parsed.topRecurringRequests.map((item: any) => ({
            request: item.request || '',
            frequency: item.frequency || 0,
            priority: item.priority || 'medium',
            evidence: item.evidence || '',
            revenueImpact: item.revenueImpact || 'Unknown',
            sentiment: item.sentiment || 'Mixed',
            recommendedAction: item.recommendedAction || '',
            quickWinPotential: item.quickWinPotential || 'Unknown',
            crossFunctionalOwner: item.crossFunctionalOwner || 'TBD'
          }))
        : [],
      emergingPatterns: Array.isArray(parsed.emergingPatterns) ? parsed.emergingPatterns : [],
      criticalRisks: Array.isArray(parsed.criticalRisks) ? parsed.criticalRisks : [],
      quickWins: Array.isArray(parsed.quickWins) ? parsed.quickWins : []
    }
  } catch (error) {
    // Return a fallback structure
    return {
      summary: 'AI analysis completed but response parsing failed. Please try again.',
      topRecurringRequests: [],
      emergingPatterns: ['Unable to parse AI response'],
      criticalRisks: [],
      quickWins: []
    }
  }
}
