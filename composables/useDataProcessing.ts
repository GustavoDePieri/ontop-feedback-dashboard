import type { FeedbackItem } from '~/types/feedback'

export const useDataProcessing = () => {
  // Process feedback items for better analysis
  const processFeedbackItems = (items: FeedbackItem[]) => {
    return items.map(item => ({
      ...item,
      // Add processed fields
      wordCount: item.feedback.split(' ').length,
      hasKeywords: extractKeywords(item.feedback),
      urgencyLevel: calculateUrgencyLevel(item),
      accountRisk: calculateAccountRisk(item)
    }))
  }

  // Extract keywords from feedback text
  const extractKeywords = (text: string): string[] => {
    const stopWords = new Set([
      'the', 'and', 'is', 'of', 'to', 'in', 'it', 'that', 'for', 'on', 'with', 'as', 'by', 'at', 'from',
      'a', 'an', 'we', 'they', 'you', 'i', 'me', 'my', 'your', 'our', 'their', 'this', 'these', 'those',
      'but', 'or', 'not', 'can', 'will', 'would', 'could', 'should', 'have', 'has', 'had', 'do', 'does',
      'did', 'are', 'was', 'were', 'be', 'been', 'being'
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10) // Top 10 keywords
  }

  // Calculate urgency level based on sentiment and keywords
  const calculateUrgencyLevel = (item: FeedbackItem): 'Low' | 'Medium' | 'High' | 'Critical' => {
    const urgentKeywords = ['urgent', 'critical', 'broken', 'error', 'bug', 'issue', 'problem', 'fail', 'down']
    const text = item.feedback.toLowerCase()
    
    const hasUrgentKeywords = urgentKeywords.some(keyword => text.includes(keyword))
    
    if (item.sentiment === 'Negative' && hasUrgentKeywords) return 'Critical'
    if (item.sentiment === 'Negative') return 'High'
    if (hasUrgentKeywords) return 'Medium'
    return 'Low'
  }

  // Calculate account risk based on feedback patterns
  const calculateAccountRisk = (item: FeedbackItem): 'Low' | 'Medium' | 'High' => {
    const riskKeywords = ['cancel', 'switch', 'competitor', 'unhappy', 'disappointed', 'frustrated']
    const text = item.feedback.toLowerCase()
    
    const hasRiskKeywords = riskKeywords.some(keyword => text.includes(keyword))
    
    if (item.sentiment === 'Negative' && hasRiskKeywords) return 'High'
    if (item.sentiment === 'Negative' || hasRiskKeywords) return 'Medium'
    return 'Low'
  }

  // Group feedback by time period
  const groupByTimePeriod = (items: FeedbackItem[], period: 'day' | 'week' | 'month') => {
    const groups = new Map()
    
    items.forEach(item => {
      const date = new Date(item.createdDate)
      let key: string
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }
      
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key).push(item)
    })
    
    return groups
  }

  // Calculate feedback velocity (feedback per time period)
  const calculateFeedbackVelocity = (items: FeedbackItem[], days = 7) => {
    const now = new Date()
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const recentFeedback = items.filter(item => 
      new Date(item.createdDate) >= startDate
    )
    
    return {
      total: recentFeedback.length,
      average: recentFeedback.length / days,
      trend: calculateTrend(items, days)
    }
  }

  // Calculate trend direction
  const calculateTrend = (items: FeedbackItem[], days: number): 'up' | 'down' | 'stable' => {
    const now = new Date()
    const midPoint = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000 / 2))
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const firstHalf = items.filter(item => {
      const date = new Date(item.createdDate)
      return date >= startDate && date < midPoint
    }).length
    
    const secondHalf = items.filter(item => {
      const date = new Date(item.createdDate)
      return date >= midPoint
    }).length
    
    const difference = secondHalf - firstHalf
    const threshold = Math.max(1, firstHalf * 0.1) // 10% threshold
    
    if (difference > threshold) return 'up'
    if (difference < -threshold) return 'down'
    return 'stable'
  }

  // Detect anomalies in feedback patterns
  const detectAnomalies = (items: FeedbackItem[]) => {
    const dailyGroups = groupByTimePeriod(items, 'day')
    const dailyCounts = Array.from(dailyGroups.values()).map(group => group.length)
    
    if (dailyCounts.length < 7) return []
    
    const average = dailyCounts.reduce((sum, count) => sum + count, 0) / dailyCounts.length
    const threshold = average * 2 // 2x average is considered anomaly
    
    const anomalies = []
    for (const [date, group] of dailyGroups.entries()) {
      if (group.length > threshold) {
        anomalies.push({
          date,
          count: group.length,
          type: 'spike' as const,
          severity: group.length > threshold * 1.5 ? 'high' as const : 'medium' as const
        })
      }
    }
    
    return anomalies
  }

  return {
    processFeedbackItems,
    extractKeywords,
    calculateUrgencyLevel,
    calculateAccountRisk,
    groupByTimePeriod,
    calculateFeedbackVelocity,
    calculateTrend,
    detectAnomalies
  }
}
