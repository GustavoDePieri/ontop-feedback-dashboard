import type { FeedbackItem } from '~/types/feedback'

export const useInsights = () => {
  // Generate automated insights from feedback data
  const generateInsights = (items: FeedbackItem[]) => {
    const insights = []
    
    // Volume insights
    const volumeInsights = analyzeVolume(items)
    insights.push(...volumeInsights)
    
    // Sentiment insights
    const sentimentInsights = analyzeSentiment(items)
    insights.push(...sentimentInsights)
    
    // Account insights
    const accountInsights = analyzeAccounts(items)
    insights.push(...accountInsights)
    
    // Temporal insights
    const temporalInsights = analyzeTemporal(items)
    insights.push(...temporalInsights)
    
    return insights.slice(0, 10) // Top 10 insights
  }

  // Analyze feedback volume patterns
  const analyzeVolume = (items: FeedbackItem[]) => {
    const insights = []
    const total = items.length
    
    if (total === 0) return insights
    
    // Compare with previous period
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000))
    
    const recent = items.filter(item => new Date(item.createdDate) >= thirtyDaysAgo)
    const previous = items.filter(item => {
      const date = new Date(item.createdDate)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    })
    
    const growth = previous.length > 0 
      ? ((recent.length - previous.length) / previous.length) * 100 
      : 0
    
    if (growth > 20) {
      insights.push({
        type: 'volume' as const,
        severity: 'medium' as const,
        title: 'Feedback Volume Increase',
        description: `Feedback volume has increased by ${Math.round(growth)}% compared to the previous 30 days.`,
        recommendation: 'Monitor for emerging issues and ensure adequate support capacity.'
      })
    } else if (growth < -20) {
      insights.push({
        type: 'volume' as const,
        severity: 'low' as const,
        title: 'Feedback Volume Decrease',
        description: `Feedback volume has decreased by ${Math.round(Math.abs(growth))}% compared to the previous 30 days.`,
        recommendation: 'This could indicate improved satisfaction or reduced engagement.'
      })
    }
    
    return insights
  }

  // Analyze sentiment patterns
  const analyzeSentiment = (items: FeedbackItem[]) => {
    const insights = []
    const total = items.length
    
    if (total === 0) return insights
    
    const positive = items.filter(item => item.sentiment === 'Positive').length
    const negative = items.filter(item => item.sentiment === 'Negative').length
    const neutral = items.filter(item => item.sentiment === 'Neutral').length
    
    const positiveRate = (positive / total) * 100
    const negativeRate = (negative / total) * 100
    
    if (negativeRate > 30) {
      insights.push({
        type: 'sentiment' as const,
        severity: 'high' as const,
        title: 'High Negative Sentiment',
        description: `${Math.round(negativeRate)}% of feedback is negative, which is above the recommended threshold.`,
        recommendation: 'Review negative feedback patterns and implement improvement actions.'
      })
    } else if (positiveRate > 70) {
      insights.push({
        type: 'sentiment' as const,
        severity: 'low' as const,
        title: 'Excellent Customer Satisfaction',
        description: `${Math.round(positiveRate)}% of feedback is positive, indicating high customer satisfaction.`,
        recommendation: 'Continue current practices and identify what drives positive feedback.'
      })
    }
    
    return insights
  }

  // Analyze account-specific patterns
  const analyzeAccounts = (items: FeedbackItem[]) => {
    const insights = []
    
    // Group by account
    const accountGroups = new Map()
    items.forEach(item => {
      const account = item.accountName
      if (!accountGroups.has(account)) {
        accountGroups.set(account, [])
      }
      accountGroups.get(account).push(item)
    })
    
    // Find accounts with concerning patterns
    for (const [account, feedback] of accountGroups.entries()) {
      const negativeCount = feedback.filter((item: FeedbackItem) => item.sentiment === 'Negative').length
      const totalCount = feedback.length
      
      if (totalCount >= 3 && (negativeCount / totalCount) > 0.6) {
        insights.push({
          type: 'account' as const,
          severity: 'high' as const,
          title: 'Account at Risk',
          description: `${account} has ${negativeCount} negative feedback items out of ${totalCount} total.`,
          recommendation: 'Prioritize outreach and support for this account to prevent churn.'
        })
      }
    }
    
    return insights
  }

  // Analyze temporal patterns
  const analyzeTemporal = (items: FeedbackItem[]) => {
    const insights = []
    
    // Analyze day of week patterns
    const dayGroups = new Map()
    items.forEach(item => {
      const day = new Date(item.createdDate).getDay()
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
      dayGroups.set(dayName, (dayGroups.get(dayName) || 0) + 1)
    })
    
    const maxDay = Array.from(dayGroups.entries()).reduce((max, [day, count]) => 
      count > (max[1] || 0) ? [day, count] : max, ['', 0])
    
    if (maxDay[1] > items.length * 0.3) {
      insights.push({
        type: 'temporal' as const,
        severity: 'low' as const,
        title: 'Peak Feedback Day',
        description: `Most feedback (${maxDay[1]} items) is received on ${maxDay[0]}.`,
        recommendation: 'Consider staffing adjustments or proactive communication on peak days.'
      })
    }
    
    return insights
  }

  // Generate recommendations based on data patterns
  const generateRecommendations = (items: FeedbackItem[]) => {
    const recommendations = []
    
    // Analyze common themes in negative feedback
    const negativeFeedback = items.filter(item => item.sentiment === 'Negative')
    const commonIssues = extractCommonThemes(negativeFeedback)
    
    commonIssues.forEach(issue => {
      recommendations.push({
        priority: 'high' as const,
        category: 'improvement' as const,
        title: `Address ${issue.theme}`,
        description: `${issue.count} customers mentioned issues related to ${issue.theme}.`,
        impact: 'Resolving this could improve satisfaction for multiple customers.',
        effort: 'medium' as const
      })
    })
    
    return recommendations.slice(0, 5)
  }

  // Extract common themes from feedback text
  const extractCommonThemes = (items: FeedbackItem[]) => {
    const themes = new Map()
    
    // Common issue keywords
    const issueKeywords = {
      'performance': ['slow', 'performance', 'speed', 'lag', 'delay'],
      'usability': ['confusing', 'difficult', 'complicated', 'user-friendly', 'interface'],
      'reliability': ['bug', 'error', 'crash', 'broken', 'fail', 'issue'],
      'support': ['support', 'help', 'response', 'service', 'assistance'],
      'features': ['feature', 'functionality', 'missing', 'need', 'want']
    }
    
    items.forEach(item => {
      const text = item.feedback.toLowerCase()
      
      Object.entries(issueKeywords).forEach(([theme, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          themes.set(theme, (themes.get(theme) || 0) + 1)
        }
      })
    })
    
    return Array.from(themes.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // Detect trending topics
  const detectTrendingTopics = (items: FeedbackItem[], days = 7) => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const recentItems = items.filter(item => new Date(item.createdDate) >= recentDate)
    const allWords = recentItems.flatMap(item => 
      item.feedback.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4)
    )
    
    const wordCounts = new Map()
    allWords.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })
    
    return Array.from(wordCounts.entries())
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))
  }

  return {
    generateInsights,
    generateRecommendations,
    detectTrendingTopics,
    analyzeVolume,
    analyzeSentiment,
    analyzeAccounts,
    analyzeTemporal
  }
}
