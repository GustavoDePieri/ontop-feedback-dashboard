import { GoogleGenerativeAI } from '@google/generative-ai'

interface TranscriptData {
  id: string
  transcript_text: string
  source_name?: string
  occurred_at?: string
  attendees?: any
  account_name?: string
  client_platform_id?: string
  ai_analysis?: any
}

interface CompanyArea {
  name: string
  description: string
  responsibleTeam: string
}

interface CompanyAction {
  area: string
  action: string
  rationale: string
  priority: 'high' | 'medium' | 'low'
  timeline: 'immediate' | 'short-term' | 'long-term'
  expectedImpact: string
  supportingEvidence: string[]
}

interface AIReport {
  summary: string
  companyActions: CompanyAction[]
  metadata: {
    transcriptsAnalyzed: number
    generatedAt: string
    modelUsed: string
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const body = await readBody<{ transcripts: TranscriptData[] }>(event)
    const { transcripts } = body

    if (!transcripts || transcripts.length === 0) {
      throw new Error('No transcripts provided')
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.NUXT_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Generate AI report using transcriptions
    const report = await generateTranscriptReport(model, transcripts)

    return {
      success: true,
      data: report,
      metadata: {
        transcriptsAnalyzed: transcripts.length,
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-2.0-flash-exp'
      }
    }
  } catch (error: any) {
    console.error('AI Report Generation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate AI report: ${error.message}`
    })
  }
})

// Define company areas that need actions
const COMPANY_AREAS: CompanyArea[] = [
  {
    name: 'Customer Success',
    description: 'Customer onboarding, retention, relationship management, and churn prevention',
    responsibleTeam: 'Customer Success Team'
  },
  {
    name: 'Product',
    description: 'Product features, functionality, user experience, and technical capabilities',
    responsibleTeam: 'Product & Engineering'
  },
  {
    name: 'Sales',
    description: 'Sales process, pricing, contracts, and initial customer acquisition',
    responsibleTeam: 'Sales Team'
  },
  {
    name: 'Operations',
    description: 'Internal processes, efficiency, workflow optimization, and scalability',
    responsibleTeam: 'Operations Team'
  },
  {
    name: 'Support',
    description: 'Technical support, bug fixes, help desk, and customer assistance',
    responsibleTeam: 'Support Team'
  },
  {
    name: 'Leadership',
    description: 'Strategic decisions, company direction, and high-level initiatives',
    responsibleTeam: 'Executive Team'
  }
]

async function generateTranscriptReport(
  model: any,
  transcripts: TranscriptData[]
): Promise<AIReport> {
  // Prepare transcript content for AI analysis
  const transcriptContent = transcripts.map(t => ({
    id: t.id,
    account: t.account_name || 'Unknown Account',
    callName: t.source_name || 'Call',
    date: t.occurred_at || 'Unknown Date',
    transcript: t.transcript_text,
    attendees: t.attendees
  }))

  // Create comprehensive prompt for Gemini AI
  const prompt = `
You are an expert business analyst analyzing customer call transcripts to generate actionable insights for a SaaS company.

ANALYZE THESE ${transcriptContent.length} CUSTOMER CALL TRANSCRIPTS and generate exactly 2 specific, actionable recommendations for EACH of the following company areas:

COMPANY AREAS TO ANALYZE:
${COMPANY_AREAS.map(area => `- ${area.name}: ${area.description}`).join('\n')}

TRANSCRIPTS TO ANALYZE:
${transcriptContent.map((t, i) => `
TRANSCRIPT ${i + 1}:
Account: ${t.account}
Call: ${t.callName}
Date: ${t.date}
Content: ${t.transcript.substring(0, 2000)}${t.transcript.length > 2000 ? '...' : ''}
`).join('\n')}

REQUIREMENTS:
1. Generate EXACTLY 2 actions per company area (12 total actions)
2. Each action must be SPECIFIC and ACTIONABLE
3. Include supporting evidence from the transcripts
4. Set appropriate priority (high/medium/low) and timeline (immediate/short-term/long-term)
5. Explain the rationale and expected impact

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "summary": "Brief executive summary of key findings from transcripts",
  "companyActions": [
    {
      "area": "Customer Success",
      "action": "Specific actionable recommendation",
      "rationale": "Why this action is needed based on transcript evidence",
      "priority": "high|medium|low",
      "timeline": "immediate|short-term|long-term",
      "expectedImpact": "Expected business impact",
      "supportingEvidence": ["Quote or evidence from transcript 1", "Quote or evidence from transcript 2"]
    },
    // ... exactly 2 more for Customer Success, then 2 each for other areas
  ]
}

Focus on insights that will drive business growth and customer satisfaction. Be specific and actionable.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsedResponse = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (!parsedResponse.companyActions || parsedResponse.companyActions.length !== 12) {
      throw new Error(`Expected 12 actions, got ${parsedResponse.companyActions?.length || 0}`)
    }

    // Validate that we have exactly 2 actions per area
    const actionsByArea = parsedResponse.companyActions.reduce((acc: any, action: CompanyAction) => {
      if (!acc[action.area]) acc[action.area] = []
      acc[action.area].push(action)
      return acc
    }, {})

    for (const area of COMPANY_AREAS) {
      if (!actionsByArea[area.name] || actionsByArea[area.name].length !== 2) {
        throw new Error(`Expected 2 actions for ${area.name}, got ${actionsByArea[area.name]?.length || 0}`)
      }
    }

    return {
      summary: parsedResponse.summary || 'Analysis completed based on customer call transcripts.',
      companyActions: parsedResponse.companyActions,
      metadata: {
        transcriptsAnalyzed: transcripts.length,
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-2.0-flash-exp'
      }
    }

  } catch (error) {
    console.error('Error generating AI report:', error)
    throw error
  }
}