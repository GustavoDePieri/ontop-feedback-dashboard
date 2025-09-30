import type { FeedbackItem } from '~/types/feedback'

export interface WeeklyReportData {
  title: string
  period: {
    start: Date
    end: Date
    weekNumber: number
    year: number
  }
  summary: {
    total: number
    positive: number
    neutral: number
    negative: number
    positivePercent: number
    neutralPercent: number
    negativePercent: number
    weekOverWeekChange: number
  }
  priorityIssues: {
    request: string
    frequency: number
    impact: string
    status: 'critical' | 'high' | 'medium' | 'low'
    department: string
  }[]
  departmentBreakdown: Record<string, number>
  topAccounts: {
    name: string
    count: number
    sentiment: string
    mrr?: number
    tpv?: number
  }[]
  managers: {
    name: string
    total: number
    positive: number
    neutral: number
    negative: number
    positiveRate: number
  }[]
  keyInsights: string[]
  actionItems: {
    priority: 'immediate' | 'this-week' | 'next-week'
    action: string
    owner: string
    impact: string
  }[]
  metadata: {
    generatedAt: Date
    generatedBy: string
    reportVersion: string
  }
}

export const useReportGenerator = () => {
  const generateWeeklyReport = (feedbackItems: FeedbackItem[], weekOffset: number = 0): WeeklyReportData => {
    const now = new Date()
    const currentDay = now.getDay()
    
    // Calculate week range (Sunday to Saturday)
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - currentDay + (weekOffset * 7))
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    
    // Filter feedback for this week
    const weekFeedback = feedbackItems.filter(item => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    // Filter previous week for comparison
    const prevWeekStart = new Date(startDate)
    prevWeekStart.setDate(startDate.getDate() - 7)
    const prevWeekEnd = new Date(endDate)
    prevWeekEnd.setDate(endDate.getDate() - 7)
    
    const prevWeekFeedback = feedbackItems.filter(item => {
      const itemDate = new Date(item.createdDate)
      return itemDate >= prevWeekStart && itemDate <= prevWeekEnd
    })
    
    // Calculate summary metrics
    const summary = calculateSummary(weekFeedback, prevWeekFeedback)
    
    // Identify priority issues
    const priorityIssues = identifyPriorityIssues(weekFeedback)
    
    // Department breakdown
    const departmentBreakdown = calculateDepartmentBreakdown(weekFeedback)
    
    // Top accounts
    const topAccounts = getTopAccounts(weekFeedback)
    
    // Manager performance
    const managers = getManagerPerformance(weekFeedback)
    
    // Generate insights
    const keyInsights = generateInsights(weekFeedback, prevWeekFeedback, summary)
    
    // Generate action items
    const actionItems = generateActionItems(priorityIssues, summary)
    
    return {
      title: `Weekly Feedback Report - Week ${getWeekNumber(startDate)}`,
      period: {
        start: startDate,
        end: endDate,
        weekNumber: getWeekNumber(startDate),
        year: startDate.getFullYear()
      },
      summary,
      priorityIssues,
      departmentBreakdown,
      topAccounts,
      managers,
      keyInsights,
      actionItems,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'Ontop Feedback Analytics',
        reportVersion: '2.0'
      }
    }
  }
  
  const calculateSummary = (currentWeek: FeedbackItem[], previousWeek: FeedbackItem[]) => {
    const total = currentWeek.length
    const positive = currentWeek.filter(f => f.sentiment === 'Positive').length
    const neutral = currentWeek.filter(f => f.sentiment === 'Neutral').length
    const negative = currentWeek.filter(f => f.sentiment === 'Negative').length
    
    const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0
    const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0
    const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0
    
    const prevTotal = previousWeek.length
    const weekOverWeekChange = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0
    
    return {
      total,
      positive,
      neutral,
      negative,
      positivePercent,
      neutralPercent,
      negativePercent,
      weekOverWeekChange
    }
  }
  
  const identifyPriorityIssues = (feedback: FeedbackItem[]) => {
    // Group by category and count frequency
    const categoryMap = new Map<string, { count: number, items: FeedbackItem[] }>()
    
    feedback.forEach(item => {
      const category = item.categoryFormulaText || 'Uncategorized'
      const subcategory = item.subcategory || ''
      const key = subcategory || category
      
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { count: 0, items: [] })
      }
      
      const existing = categoryMap.get(key)!
      existing.count++
      existing.items.push(item)
    })
    
    // Convert to priority issues
    const issues = Array.from(categoryMap.entries())
      .map(([request, data]) => {
        // Calculate revenue impact
        const totalMRR = data.items.reduce((sum, item) => sum + (item.realMrrLastMonth || 0), 0)
        const impact = totalMRR > 100000 ? 'High Revenue Impact' : 
                      totalMRR > 50000 ? 'Medium Revenue Impact' : 
                      'Standard Impact'
        
        // Determine status based on frequency and sentiment
        const negativeCount = data.items.filter(i => i.sentiment === 'Negative').length
        const status = data.count >= 5 && negativeCount > data.count * 0.5 ? 'critical' :
                      data.count >= 3 ? 'high' :
                      data.count >= 2 ? 'medium' : 'low'
        
        // Determine department
        const directedTo = data.items[0]?.feedbackDirectedTo || 'General'
        const department = directedTo
        
        return {
          request,
          frequency: data.count,
          impact,
          status,
          department
        }
      })
      .filter(issue => issue.frequency >= 2) // Only include issues mentioned 2+ times
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
    
    return issues
  }
  
  const calculateDepartmentBreakdown = (feedback: FeedbackItem[]) => {
    const breakdown = new Map<string, number>()
    
    feedback.forEach(item => {
      const direction = item.feedbackDirectedTo || 'General'
      breakdown.set(direction, (breakdown.get(direction) || 0) + 1)
    })
    
    // Convert to object and sort by count
    return Object.fromEntries(
      Array.from(breakdown.entries())
        .sort(([, a], [, b]) => b - a)
    )
  }
  
  const getTopAccounts = (feedback: FeedbackItem[]) => {
    const accountMap = new Map<string, { count: number, sentiments: string[], mrr: number, tpv: number }>()
    
    feedback.forEach(item => {
      const name = item.accountName || 'Unknown'
      if (!accountMap.has(name)) {
        accountMap.set(name, { 
          count: 0, 
          sentiments: [], 
          mrr: item.realMrrLastMonth || 0,
          tpv: item.lastInvoicedTpv || 0
        })
      }
      
      const account = accountMap.get(name)!
      account.count++
      account.sentiments.push(item.sentiment)
    })
    
    return Array.from(accountMap.entries())
      .map(([name, data]) => {
        const positiveCount = data.sentiments.filter(s => s === 'Positive').length
        const sentiment = positiveCount > data.count / 2 ? 'Positive' :
                         positiveCount < data.count / 3 ? 'Negative' : 'Mixed'
        
        return {
          name,
          count: data.count,
          sentiment,
          mrr: data.mrr,
          tpv: data.tpv
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
  
  const getManagerPerformance = (feedback: FeedbackItem[]) => {
    const managerMap = new Map<string, { total: number, positive: number, neutral: number, negative: number }>()
    
    feedback.forEach(item => {
      const manager = item.accountOwner || 'Unassigned'
      if (!managerMap.has(manager)) {
        managerMap.set(manager, { total: 0, positive: 0, neutral: 0, negative: 0 })
      }
      
      const stats = managerMap.get(manager)!
      stats.total++
      
      if (item.sentiment === 'Positive') stats.positive++
      else if (item.sentiment === 'Neutral') stats.neutral++
      else if (item.sentiment === 'Negative') stats.negative++
    })
    
    return Array.from(managerMap.entries())
      .map(([name, stats]) => ({
        name,
        ...stats,
        positiveRate: stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
  }
  
  const generateInsights = (current: FeedbackItem[], previous: FeedbackItem[], summary: any) => {
    const insights: string[] = []
    
    // Trend insight
    if (summary.weekOverWeekChange > 20) {
      insights.push(`📈 Feedback volume increased ${summary.weekOverWeekChange}% from last week - indicates higher engagement or potential issues emerging`)
    } else if (summary.weekOverWeekChange < -20) {
      insights.push(`📉 Feedback volume decreased ${Math.abs(summary.weekOverWeekChange)}% from last week - monitor for reduced engagement`)
    } else {
      insights.push(`📊 Feedback volume stable week-over-week (${summary.weekOverWeekChange > 0 ? '+' : ''}${summary.weekOverWeekChange}%)`)
    }
    
    // Sentiment insight
    if (summary.positivePercent > 70) {
      insights.push(`✨ Strong positive sentiment at ${summary.positivePercent}% - clients are generally satisfied`)
    } else if (summary.negativePercent > 40) {
      insights.push(`⚠️ High negative sentiment at ${summary.negativePercent}% - immediate attention required`)
    }
    
    // High-value account insight
    const highValueAccounts = current.filter(f => (f.realMrrLastMonth || 0) > 50000)
    if (highValueAccounts.length > 0) {
      const highValueNegative = highValueAccounts.filter(f => f.sentiment === 'Negative').length
      if (highValueNegative > 0) {
        insights.push(`🚨 ${highValueNegative} feedback from high-value accounts (>$50K MRR) are negative - priority escalation needed`)
      } else {
        insights.push(`💰 ${highValueAccounts.length} feedback from high-value accounts with positive sentiment`)
      }
    }
    
    // Department insight
    const directionCounts = new Map<string, number>()
    current.forEach(f => {
      const dir = f.feedbackDirectedTo || 'Other'
      directionCounts.set(dir, (directionCounts.get(dir) || 0) + 1)
    })
    const topDirection = Array.from(directionCounts.entries()).sort((a, b) => b[1] - a[1])[0]
    if (topDirection && topDirection[1] > current.length * 0.3) {
      insights.push(`🎯 ${Math.round((topDirection[1] / current.length) * 100)}% of feedback directed to ${topDirection[0]} - consider focused initiative`)
    }
    
    return insights.slice(0, 5)
  }
  
  const generateActionItems = (priorityIssues: any[], summary: any) => {
    const actions: {
      priority: 'immediate' | 'this-week' | 'next-week'
      action: string
      owner: string
      impact: string
    }[] = []
    
    // Critical issues
    const criticalIssues = priorityIssues.filter(i => i.status === 'critical')
    criticalIssues.forEach(issue => {
      actions.push({
        priority: 'immediate',
        action: `Address "${issue.request}" - mentioned ${issue.frequency} times with ${issue.impact}`,
        owner: issue.department,
        impact: 'High - potential churn risk'
      })
    })
    
    // High priority issues
    const highIssues = priorityIssues.filter(i => i.status === 'high').slice(0, 3)
    highIssues.forEach(issue => {
      actions.push({
        priority: 'this-week',
        action: `Review and plan resolution for "${issue.request}" (${issue.frequency} mentions)`,
        owner: issue.department,
        impact: issue.impact
      })
    })
    
    // Negative sentiment action
    if (summary.negativePercent > 40) {
      actions.push({
        priority: 'immediate',
        action: 'Conduct emergency review of negative feedback patterns and implement immediate improvements',
        owner: 'Leadership Team',
        impact: 'Critical - client satisfaction at risk'
      })
    }
    
    // Proactive follow-up
    if (summary.total > 10) {
      actions.push({
        priority: 'this-week',
        action: 'Schedule follow-ups with top 5 accounts providing feedback to close the loop',
        owner: 'Customer Success',
        impact: 'Medium - demonstrates responsiveness'
      })
    }
    
    return actions.slice(0, 8)
  }
  
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
  
  return {
    generateWeeklyReport
  }
}
