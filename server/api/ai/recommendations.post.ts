import { GoogleGenerativeAI } from '@google/generative-ai'
import type { FeedbackItem } from '~/types/feedback'

interface RecommendationRequest {
  feedbackItems: FeedbackItem[]
  segmentType?: 'all' | 'year' | 'sentiment' | 'category' | 'account_manager'
  segmentValue?: string
  focusArea?: string
}

interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  area: string
  action: string
  rationale: string
  impact: string
  timeline: string
  affectedAccounts?: string[]
}

interface AIRecommendation {
  summary: string
  keyInsights: string[]
  actionItems: ActionItem[]
  trends: string[]
  risks: string[]
  opportunities: string[]
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

  return `You are an expert customer success analyst for Ontop, a financial services platform. Analyze the following customer feedback data and provide strategic, actionable recommendations.

FEEDBACK DATA (${segmentDescription}):
${feedbackSummary}
${focusAreaText}

Please provide a comprehensive analysis in the following JSON format:

{
  "summary": "A concise 2-3 sentence executive summary of the overall feedback landscape",
  "keyInsights": [
    "3-5 most important insights discovered from the data",
    "Include patterns, trends, and notable observations"
  ],
  "actionItems": [
    {
      "priority": "high|medium|low",
      "area": "The department or area this action targets (e.g., Product, Support, Operations, Sales)",
      "action": "Clear, specific action to take",
      "rationale": "Why this action is important based on the data",
      "impact": "Expected positive outcome",
      "timeline": "Suggested timeframe (e.g., Immediate, Within 1 week, Within 30 days)",
      "affectedAccounts": ["Optional: list of specific accounts if relevant"]
    }
  ],
  "trends": [
    "3-5 emerging trends or patterns in the feedback",
    "Both positive trends to amplify and negative trends to address"
  ],
  "risks": [
    "2-4 potential risks or issues that need immediate attention",
    "Include customer churn risks or escalation concerns"
  ],
  "opportunities": [
    "3-5 opportunities for improvement or growth",
    "Include upsell opportunities, feature requests, or process improvements"
  ]
}

IMPORTANT GUIDELINES:
- Be specific and actionable - avoid generic advice
- Prioritize based on impact and urgency
- Reference specific data points when possible
- Consider both quick wins and long-term improvements
- Think about resource allocation and feasibility
- For high-priority items, be especially clear about why they matter
- If you see patterns affecting high-value accounts (high MRR/TPV), flag those
- Consider the feedback direction (who it's directed to) when making recommendations

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
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      actionItems: Array.isArray(parsed.actionItems) 
        ? parsed.actionItems.map((item: any) => ({
            priority: item.priority || 'medium',
            area: item.area || 'General',
            action: item.action || '',
            rationale: item.rationale || '',
            impact: item.impact || '',
            timeline: item.timeline || 'TBD',
            affectedAccounts: item.affectedAccounts || []
          }))
        : [],
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : []
    }
  } catch (error) {
    // Return a fallback structure
    return {
      summary: 'AI analysis completed but response parsing failed. Please try again.',
      keyInsights: ['Unable to parse AI response'],
      actionItems: [],
      trends: [],
      risks: [],
      opportunities: []
    }
  }
}
