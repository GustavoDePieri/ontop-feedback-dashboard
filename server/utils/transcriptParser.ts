/**
 * Enhanced Transcript Parser Utility
 * 
 * Extracts feedback, sentiment, and churn signals from DIIO call transcripts
 * Designed for CS teams to detect deteriorating customer health before churn
 */

export interface FeedbackSegment {
  speaker: string
  speakerType: 'seller' | 'customer' | 'unknown'
  text: string
  type: 'pain_point' | 'feature_request' | 'praise' | 'concern' | 'question'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  churnSignals: ChurnSignal[]
}

export interface ChurnSignal {
  category: ChurnSignalCategory
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  keywords: string[]
}

export type ChurnSignalCategory =
  | 'payment_issue'
  | 'worker_payout_issue'
  | 'recurring_problem'
  | 'long_lasting_problem'
  | 'price_negotiation'
  | 'customer_situation'
  | 'opportunity'
  | 'churn_no_active_workforce'
  | 'churn_shutdown_operations'
  | 'churn_legal_compliance'
  | 'churn_price_value'
  | 'churn_product_fit'
  | 'churn_worker_experience'

export interface ParsedTranscript {
  feedbackSegments: FeedbackSegment[]
  metadata: {
    totalSegments: number
    feedbackSegments: number
    speakerCount: number
    dominantType: string
    churnRiskScore: number // 0-100, higher = more risk
    overallSentiment: 'positive' | 'neutral' | 'negative'
    criticalSignalsCount: number
  }
}

export interface TranscriptMetadata {
  callName?: string
  participants?: string[]
  sellerEmails?: string[]
  customerEmails?: string[]
  date?: string
  accountName?: string
}

// Enhanced keyword patterns for churn signal detection
const CHURN_SIGNALS: Record<ChurnSignalCategory, { keywords: string[], severity: 'critical' | 'high' | 'medium' | 'low' }> = {
  // Payment Issues
  payment_issue: {
    keywords: [
      'payment', 'invoice', 'billing', 'charge', 'fee', 'cost', 'price', 'expensive',
      'payment failed', 'payment error', 'payment issue', 'billing problem',
      'overcharged', 'wrong charge', 'unexpected fee', 'payment delay',
      'late payment', 'payment processing', 'payment method', 'credit card',
      'refund', 'chargeback', 'dispute', 'payment declined'
    ],
    severity: 'high'
  },
  
  // Worker Payout Issues
  worker_payout_issue: {
    keywords: [
      'payout', 'worker payment', 'contractor payment', 'freelancer payment',
      'payout delay', 'payout issue', 'payout problem', 'payout error',
      'workers not paid', 'payment to workers', 'contractor not paid',
      'late payout', 'payout missing', 'payout failed', 'payout processing'
    ],
    severity: 'high'
  },
  
  // Recurring Problems
  recurring_problem: {
    keywords: [
      'again', 'still', 'recurring', 'repeated', 'happening again',
      'keep happening', 'ongoing issue', 'persistent problem',
      'same issue', 'same problem', 'continues to', 'repeatedly'
    ],
    severity: 'medium'
  },
  
  // Long-lasting Problems
  long_lasting_problem: {
    keywords: [
      'months', 'weeks', 'long time', 'for a while', 'since',
      'ongoing', 'persistent', 'chronic', 'has been', 'still not fixed',
      'taking too long', 'delayed', 'waiting', 'unresolved'
    ],
    severity: 'high'
  },
  
  // Price Negotiation / Discount Requests
  price_negotiation: {
    keywords: [
      'discount', 'cheaper', 'lower price', 'reduce cost', 'reduce fee',
      'too expensive', 'cost too much', 'price too high', 'fees too high',
      'negotiate', 'better price', 'competitive', 'competitor pricing',
      'can\'t afford', 'budget', 'cost cutting', 'reduce expenses',
      'price match', 'lower rate', 'discount code', 'promo'
    ],
    severity: 'medium'
  },
  
  // Customer Situation Changes
  customer_situation: {
    keywords: [
      'layoff', 'layoffs', 'firing', 'fired', 'let go', 'reduction',
      'financial problem', 'financial issues', 'budget cuts', 'cutting costs',
      'company downsizing', 'reducing workforce', 'closing', 'shutting down',
      'bankruptcy', 'financial trouble', 'cash flow', 'revenue decline',
      'economic downturn', 'market conditions', 'business slow'
    ],
    severity: 'critical'
  },
  
  // Opportunities
  opportunity: {
    keywords: [
      'expand', 'growing', 'hiring', 'scaling', 'new project', 'new business',
      'upsell', 'upgrade', 'more features', 'additional', 'increase',
      'new needs', 'considering', 'interested in', 'potential',
      'opportunity', 'benefit', 'gym', 'insurance', 'new product'
    ],
    severity: 'low'
  },
  
  // Churn: No Active Workforce
  churn_no_active_workforce: {
    keywords: [
      'no workers', 'no contractors', 'no freelancers', 'no active workforce',
      'stopped hiring', 'not using', 'not active', 'inactive workers',
      'no activity', 'no usage', 'not utilizing', 'workforce inactive'
    ],
    severity: 'critical'
  },
  
  // Churn: Shutdown Operations
  churn_shutdown_operations: {
    keywords: [
      'shutting down', 'closing', 'ceasing operations', 'going out of business',
      'closing shop', 'ending operations', 'winding down', 'discontinuing',
      'no longer operating', 'shut down', 'closed', 'stopping business'
    ],
    severity: 'critical'
  },
  
  // Churn: Legal/Compliance Issues
  churn_legal_compliance: {
    keywords: [
      'legal', 'compliance', 'regulations', 'law', 'lawsuit', 'legal issue',
      'compliance issue', 'regulatory', 'audit', 'violation', 'non-compliant',
      'legal problem', 'compliance problem', 'regulatory issue'
    ],
    severity: 'high'
  },
  
  // Churn: Price Value Perception
  churn_price_value: {
    keywords: [
      'not worth it', 'not getting value', 'not worth the price', 'overpriced',
      'value proposition', 'roi', 'return on investment', 'not seeing value',
      'better value', 'more value', 'getting value', 'worth the cost'
    ],
    severity: 'high'
  },
  
  // Churn: Product Fit
  churn_product_fit: {
    keywords: [
      'not working', 'doesn\'t fit', 'not suitable', 'not right for us',
      'wrong product', 'not what we need', 'doesn\'t meet needs',
      'not aligned', 'not compatible', 'doesn\'t work for', 'not a fit'
    ],
    severity: 'high'
  },
  
  // Churn: Worker Experience
  churn_worker_experience: {
    keywords: [
      'worker complaint', 'worker issue', 'worker problem', 'worker unhappy',
      'contractor complaint', 'freelancer issue', 'worker experience',
      'workers not happy', 'worker dissatisfaction', 'worker feedback negative'
    ],
    severity: 'medium'
  }
}

// Keyword patterns for identifying feedback types
const PATTERNS = {
  pain_point: [
    'issue', 'problem', 'challenge', 'struggle', 'difficult', 'frustrating',
    'pain', 'blocker', 'broken', 'not working', 'failing', 'error',
    'slow', 'takes too long', 'manual', 'tedious', 'annoying'
  ],
  feature_request: [
    'want', 'need', 'would like', 'wish', 'could you', 'can you',
    'would be great', 'would help', 'if you had', 'missing', 'lacking',
    'add', 'include', 'integrate', 'support', 'enable'
  ],
  praise: [
    'love', 'great', 'awesome', 'excellent', 'perfect', 'happy',
    'satisfied', 'impressed', 'appreciate', 'thank you', 'helpful',
    'easy', 'simple', 'works well', 'pleased'
  ],
  concern: [
    'worried', 'concerned', 'afraid', 'risk', 'dangerous', 'unsure',
    'wondering', 'questioning', 'doubt', 'hesitant', 'considering',
    'evaluating', 'looking at', 'competitor'
  ],
  urgency_critical: [
    'urgent', 'critical', 'asap', 'immediately', 'emergency', 'blocker',
    'show stopper', 'can\'t continue', 'must have', 'losing money',
    'clients leaving', 'threatening to leave', 'going to cancel', 'switching'
  ],
  urgency_high: [
    'soon', 'quickly', 'priority', 'important', 'need this', 'waiting for',
    'affecting business', 'costing us', 'losing time', 'affecting operations'
  ]
}

/**
 * Parse a transcript and extract feedback segments with churn signals
 */
export function parseTranscript(
  transcript: string,
  metadata?: TranscriptMetadata
): ParsedTranscript {
  // Split transcript into segments (by speaker or logical breaks)
  const segments = splitIntoSegments(transcript, metadata)
  
  // Extract feedback-relevant segments
  const feedbackSegments: FeedbackSegment[] = []
  
  for (const segment of segments) {
    const analysis = analyzeSegment(segment, metadata)
    
    // Only include segments that contain feedback
    if (analysis.isFeedback) {
      feedbackSegments.push({
        speaker: segment.speaker,
        speakerType: segment.speakerType,
        text: segment.text,
        type: analysis.type,
        urgency: analysis.urgency,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment,
        churnSignals: analysis.churnSignals
      })
    }
  }
  
  // Calculate metadata
  const typeCounts = feedbackSegments.reduce((acc, seg) => {
    acc[seg.type] = (acc[seg.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const dominantType = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown'
  
  const speakers = new Set(feedbackSegments.map(s => s.speaker))
  
  // Calculate churn risk score (0-100)
  const churnRiskScore = calculateChurnRiskScore(feedbackSegments)
  
  // Calculate overall sentiment
  const sentimentCounts = feedbackSegments.reduce((acc, seg) => {
    acc[seg.sentiment] = (acc[seg.sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const overallSentiment = sentimentCounts.negative > sentimentCounts.positive
    ? 'negative'
    : sentimentCounts.positive > sentimentCounts.negative
    ? 'positive'
    : 'neutral'
  
  const criticalSignalsCount = feedbackSegments.reduce((count, seg) => {
    return count + seg.churnSignals.filter(s => s.severity === 'critical').length
  }, 0)
  
  return {
    feedbackSegments,
    metadata: {
      totalSegments: segments.length,
      feedbackSegments: feedbackSegments.length,
      speakerCount: speakers.size,
      dominantType,
      churnRiskScore,
      overallSentiment,
      criticalSignalsCount
    }
  }
}

/**
 * Calculate churn risk score based on signals
 */
function calculateChurnRiskScore(segments: FeedbackSegment[]): number {
  let score = 0
  
  // Critical signals = 25 points each
  // High signals = 15 points each
  // Medium signals = 5 points each
  // Low signals = 1 point each
  
  for (const segment of segments) {
    for (const signal of segment.churnSignals) {
      switch (signal.severity) {
        case 'critical':
          score += 25
          break
        case 'high':
          score += 15
          break
        case 'medium':
          score += 5
          break
        case 'low':
          score += 1
          break
      }
    }
    
    // Negative sentiment adds to risk
    if (segment.sentiment === 'negative') {
      score += 3
    }
    
    // High urgency adds to risk
    if (segment.urgency === 'critical') {
      score += 10
    } else if (segment.urgency === 'high') {
      score += 5
    }
  }
  
  // Cap at 100
  return Math.min(100, score)
}

/**
 * Split transcript into logical segments with speaker identification
 */
function splitIntoSegments(
  transcript: string,
  metadata?: TranscriptMetadata
): Array<{ speaker: string, speakerType: 'seller' | 'customer' | 'unknown', text: string }> {
  const segments: Array<{ speaker: string, speakerType: 'seller' | 'customer' | 'unknown', text: string }> = []
  
  // Try to parse transcript with speaker labels
  // Common formats:
  // - "Speaker Name: text"
  // - "[Speaker Name] text"
  // - "Speaker Name\ntext"
  
  const lines = transcript.split('\n')
  let currentSpeaker = 'Unknown'
  let currentSpeakerType: 'seller' | 'customer' | 'unknown' = 'unknown'
  let currentText: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check for speaker label patterns
    const speakerMatch = 
      trimmed.match(/^([A-Z][a-zA-Z\s]+?):\s*(.*)$/) ||  // "Name: text"
      trimmed.match(/^\[([A-Z][a-zA-Z\s]+?)\]\s*(.*)$/) ||  // "[Name] text"
      trimmed.match(/^([A-Z][a-zA-Z\s]+?)\n(.*)$/s)  // "Name\ntext"
    
    if (speakerMatch) {
      // Save previous segment
      if (currentText.length > 0) {
        segments.push({
          speaker: currentSpeaker,
          speakerType: currentSpeakerType,
          text: currentText.join(' ').trim()
        })
        currentText = []
      }
      
      // Start new segment
      const speakerName = speakerMatch[1].trim()
      currentSpeaker = speakerName
      
      // Identify if speaker is seller or customer
      currentSpeakerType = identifySpeakerType(speakerName, metadata)
      
      if (speakerMatch[2]) {
        currentText.push(speakerMatch[2].trim())
      }
    } else {
      // Continue current segment
      currentText.push(trimmed)
    }
  }
  
  // Save last segment
  if (currentText.length > 0) {
    segments.push({
      speaker: currentSpeaker,
      speakerType: currentSpeakerType,
      text: currentText.join(' ').trim()
    })
  }
  
  // If no speaker labels found, treat as single segment
  if (segments.length === 0) {
    segments.push({
      speaker: 'Unknown',
      speakerType: 'unknown',
      text: transcript.trim()
    })
  }
  
  return segments
}

/**
 * Identify if speaker is a seller or customer based on metadata
 */
function identifySpeakerType(
  speakerName: string,
  metadata?: TranscriptMetadata
): 'seller' | 'customer' | 'unknown' {
  if (!metadata) return 'unknown'
  
  const nameLower = speakerName.toLowerCase()
  
  // Check if speaker matches any seller email or name
  if (metadata.sellerEmails && metadata.sellerEmails.length > 0) {
    for (const email of metadata.sellerEmails) {
      // Extract name from email (before @)
      const emailName = email.split('@')[0].toLowerCase()
      if (nameLower.includes(emailName) || emailName.includes(nameLower)) {
        return 'seller'
      }
    }
  }
  
  // Check if speaker matches any customer email or name
  if (metadata.customerEmails && metadata.customerEmails.length > 0) {
    for (const email of metadata.customerEmails) {
      // Extract name from email (before @)
      const emailName = email.split('@')[0].toLowerCase()
      if (nameLower.includes(emailName) || emailName.includes(nameLower)) {
        return 'customer'
      }
    }
  }
  
  // Try partial name matching (if we had participant names, we'd use them here)
  // This will be enhanced further in the extraction endpoint with full attendee data
  
  return 'unknown'
}

/**
 * Analyze a segment to determine if it contains feedback and detect churn signals
 */
function analyzeSegment(
  segment: { speaker: string, speakerType: 'seller' | 'customer' | 'unknown', text: string },
  metadata?: TranscriptMetadata
): {
  isFeedback: boolean
  type: FeedbackSegment['type']
  urgency: FeedbackSegment['urgency']
  keywords: string[]
  sentiment: FeedbackSegment['sentiment']
  churnSignals: ChurnSignal[]
} {
  const text = segment.text.toLowerCase()
  const words = text.split(/\s+/)
  
  // Skip very short segments (likely not feedback)
  if (words.length < 5) {
    return {
      isFeedback: false,
      type: 'question',
      urgency: 'low',
      keywords: [],
      sentiment: 'neutral',
      churnSignals: []
    }
  }
  
  // Check for feedback type
  let type: FeedbackSegment['type'] = 'question'
  let maxMatches = 0
  const matchedKeywords: string[] = []
  
  for (const [feedbackType, keywords] of Object.entries(PATTERNS)) {
    if (feedbackType.startsWith('urgency_')) continue
    
    let matches = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++
        matchedKeywords.push(keyword)
      }
    }
    
    if (matches > maxMatches) {
      maxMatches = matches
      type = feedbackType as FeedbackSegment['type']
    }
  }
  
  // Determine if this is feedback (at least 1 keyword match)
  const isFeedback = maxMatches > 0
  
  // Detect churn signals
  const churnSignals = detectChurnSignals(text)
  
  // Determine urgency
  let urgency: FeedbackSegment['urgency'] = 'medium'
  if (PATTERNS.urgency_critical.some(k => text.includes(k))) {
    urgency = 'critical'
  } else if (PATTERNS.urgency_high.some(k => text.includes(k))) {
    urgency = 'high'
  } else if (type === 'praise') {
    urgency = 'low'
  }
  
  // If we have critical churn signals, elevate urgency
  if (churnSignals.some(s => s.severity === 'critical')) {
    urgency = 'critical'
  } else if (churnSignals.some(s => s.severity === 'high')) {
    urgency = urgency === 'low' ? 'medium' : urgency
  }
  
  // Determine sentiment
  let sentiment: FeedbackSegment['sentiment'] = 'neutral'
  const positiveScore = PATTERNS.praise.filter(k => text.includes(k)).length
  const negativeScore = [...PATTERNS.pain_point, ...PATTERNS.concern].filter(k => text.includes(k)).length
  
  // Churn signals also indicate negative sentiment
  const churnNegativeScore = churnSignals.filter(s => 
    ['critical', 'high'].includes(s.severity)
  ).length
  
  if (positiveScore > negativeScore + churnNegativeScore + 1) {
    sentiment = 'positive'
  } else if (negativeScore + churnNegativeScore > positiveScore + 1) {
    sentiment = 'negative'
  }
  
  return {
    isFeedback,
    type,
    urgency,
    keywords: Array.from(new Set(matchedKeywords)),
    sentiment,
    churnSignals
  }
}

/**
 * Detect churn signals in text
 */
function detectChurnSignals(text: string): ChurnSignal[] {
  const signals: ChurnSignal[] = []
  
  for (const [category, config] of Object.entries(CHURN_SIGNALS)) {
    const matchedKeywords: string[] = []
    
    for (const keyword of config.keywords) {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(text)) {
        matchedKeywords.push(keyword)
      }
    }
    
    if (matchedKeywords.length > 0) {
      signals.push({
        category: category as ChurnSignalCategory,
        severity: config.severity,
        description: getChurnSignalDescription(category as ChurnSignalCategory),
        keywords: matchedKeywords
      })
    }
  }
  
  return signals
}

/**
 * Get human-readable description for churn signal
 */
function getChurnSignalDescription(category: ChurnSignalCategory): string {
  const descriptions: Record<ChurnSignalCategory, string> = {
    payment_issue: 'Payment or billing issue mentioned',
    worker_payout_issue: 'Worker payout problem reported',
    recurring_problem: 'Recurring or repeated problem identified',
    long_lasting_problem: 'Long-lasting unresolved issue',
    price_negotiation: 'Price negotiation or discount request',
    customer_situation: 'Customer situation change (layoffs, financial issues)',
    opportunity: 'Growth or upsell opportunity identified',
    churn_no_active_workforce: 'No active workforce - potential churn risk',
    churn_shutdown_operations: 'Customer shutting down operations',
    churn_legal_compliance: 'Legal or compliance issue',
    churn_price_value: 'Price value perception concern',
    churn_product_fit: 'Product fit concern',
    churn_worker_experience: 'Worker experience issue'
  }
  
  return descriptions[category] || 'Churn signal detected'
}

/**
 * Convert feedback segments to a format suitable for AI analysis
 */
export function formatSegmentsForAI(
  segments: FeedbackSegment[],
  metadata: {
    callName: string
    date: string
    participants?: string[]
    accountName?: string
  }
): string {
  const lines: string[] = []
  
  lines.push(`Call: ${metadata.callName}`)
  lines.push(`Date: ${metadata.date}`)
  if (metadata.accountName) {
    lines.push(`Account: ${metadata.accountName}`)
  }
  if (metadata.participants && metadata.participants.length > 0) {
    lines.push(`Participants: ${metadata.participants.join(', ')}`)
  }
  lines.push('')
  
  for (const segment of segments) {
    lines.push(`[${segment.type.toUpperCase()}] ${segment.speaker} (${segment.speakerType}):`)
    lines.push(segment.text)
    lines.push(`→ Urgency: ${segment.urgency}, Sentiment: ${segment.sentiment}`)
    if (segment.churnSignals.length > 0) {
      lines.push(`→ Churn Signals: ${segment.churnSignals.map(s => `${s.category} (${s.severity})`).join(', ')}`)
    }
    lines.push('')
  }
  
  return lines.join('\n')
}

/**
 * Get summary statistics for a set of segments
 */
export function getSegmentStats(segments: FeedbackSegment[]) {
  const typeCounts = segments.reduce((acc, seg) => {
    acc[seg.type] = (acc[seg.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const urgencyCounts = segments.reduce((acc, seg) => {
    acc[seg.urgency] = (acc[seg.urgency] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const sentimentCounts = segments.reduce((acc, seg) => {
    acc[seg.sentiment] = (acc[seg.sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const churnSignalCounts = segments.reduce((acc, seg) => {
    for (const signal of seg.churnSignals) {
      acc[signal.category] = (acc[signal.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  return {
    total: segments.length,
    byType: typeCounts,
    byUrgency: urgencyCounts,
    bySentiment: sentimentCounts,
    byChurnSignal: churnSignalCounts
  }
}
