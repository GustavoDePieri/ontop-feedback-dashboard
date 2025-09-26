export interface FeedbackItem {
  id: string
  accountOwner: string
  platformClientId: string
  accountName: string
  realMrrLastMonth?: number
  lastInvoicedTpv?: number
  csInsightName?: string
  createdDate: Date
  subcategory?: string
  feedback: string
  feedbackDirectedTo?: string
  customerSatisfaction?: string
  categoryFormulaText?: string
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore?: number
  topics?: string[]
}

export interface SentimentAnalysis {
  positive: number
  neutral: number
  negative: number
  totalItems: number
}

export interface TopicModel {
  id: number
  words: string[]
  description: string
  weight: number
}

export interface WeeklyReport {
  period: {
    start: string
    end: string
    weekNumber: number
    year: number
  }
  summary: {
    totalFeedback: number
    newAccounts: number
    responseRate: number
    avgSentimentScore: number
    weekOverWeekGrowth: number
  }
  sentiment: {
    distribution: SentimentAnalysis
    trends: SentimentTrend[]
    topPositive: FeedbackItem[]
    topNegative: FeedbackItem[]
  }
  topics: {
    trending: TopicModel[]
    emerging: TopicModel[]
    declining: TopicModel[]
  }
  accounts: {
    mostActive: AccountActivity[]
    satisfaction: AccountSatisfaction[]
    riskAccounts: RiskAccount[]
  }
  insights: {
    keyFindings: string[]
    recommendations: Recommendation[]
    alerts: Alert[]
  }
  charts: {
    sentimentTrend: ChartData
    topicDistribution: ChartData
    accountActivity: ChartData
    timeDistribution: ChartData
  }
}

export interface SentimentTrend {
  date: string
  positive: number
  neutral: number
  negative: number
}

export interface AccountActivity {
  name: string
  feedbackCount: number
  lastActivity: Date
}

export interface AccountSatisfaction {
  name: string
  score: number
  trend: 'up' | 'down' | 'stable'
}

export interface RiskAccount {
  name: string
  riskScore: number
  riskReason: string
  lastFeedback: Date
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  category: 'product' | 'support' | 'sales' | 'general'
  action: string
  impact: string
  timeline: string
}

export interface Alert {
  id: string
  type: 'sentiment_decline' | 'account_risk' | 'emerging_issue'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  affectedAccounts?: string[]
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}
