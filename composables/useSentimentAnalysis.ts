import type { FeedbackItem, SentimentAnalysis } from '~/types/feedback'

export const useSentimentAnalysis = () => {
  const getSentimentSummary = (items: FeedbackItem[]): SentimentAnalysis => {
    const summary = items.reduce(
      (acc, item) => {
        if (item.sentiment === 'Positive') acc.positive++
        else if (item.sentiment === 'Negative') acc.negative++
        else acc.neutral++
        return acc
      },
      { positive: 0, neutral: 0, negative: 0, totalItems: items.length }
    )
    
    return summary
  }

  const getSentimentTrends = (items: FeedbackItem[]) => {
    // Group by date and calculate sentiment distribution
    const groupedByDate = items.reduce((acc, item) => {
      const date = new Date(item.createdDate).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { positive: 0, neutral: 0, negative: 0 }
      }
      
      if (item.sentiment === 'Positive') acc[date].positive++
      else if (item.sentiment === 'Negative') acc[date].negative++
      else acc[date].neutral++
      
      return acc
    }, {} as Record<string, { positive: number; neutral: number; negative: number }>)

    return Object.entries(groupedByDate)
      .map(([date, sentiments]) => ({
        date,
        ...sentiments
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getTopPositiveFeedback = (items: FeedbackItem[], limit = 5) => {
    return items
      .filter(item => item.sentiment === 'Positive')
      .sort((a, b) => (b.sentimentScore || 0) - (a.sentimentScore || 0))
      .slice(0, limit)
  }

  const getTopNegativeFeedback = (items: FeedbackItem[], limit = 5) => {
    return items
      .filter(item => item.sentiment === 'Negative')
      .sort((a, b) => (a.sentimentScore || 0) - (b.sentimentScore || 0))
      .slice(0, limit)
  }

  const calculateAverageSentimentScore = (items: FeedbackItem[]) => {
    if (items.length === 0) return 0
    
    const totalScore = items.reduce((sum, item) => sum + (item.sentimentScore || 0), 0)
    return totalScore / items.length
  }

  return {
    getSentimentSummary,
    getSentimentTrends,
    getTopPositiveFeedback,
    getTopNegativeFeedback,
    calculateAverageSentimentScore
  }
}
