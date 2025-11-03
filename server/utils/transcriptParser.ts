/**
 * Transcript Parser Utility
 * 
 * Extracts feedback-relevant segments from DIIO call transcripts
 * Uses keyword matching and context analysis to identify client concerns
 */

export interface FeedbackSegment {
  speaker: string
  text: string
  type: 'pain_point' | 'feature_request' | 'praise' | 'concern' | 'question'
  urgency: 'critical' | 'high' | 'medium' | 'low'
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface ParsedTranscript {
  feedbackSegments: FeedbackSegment[]
  metadata: {
    totalSegments: number
    feedbackSegments: number
    speakerCount: number
    dominantType: string
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
    'clients leaving', 'threatening to leave'
  ],
  urgency_high: [
    'soon', 'quickly', 'priority', 'important', 'need this', 'waiting for',
    'affecting business', 'costing us', 'losing time'
  ]
}

/**
 * Parse a transcript and extract feedback segments
 */
export function parseTranscript(
  transcript: string,
  metadata?: {
    callName?: string
    participants?: string[]
    date?: string
  }
): ParsedTranscript {
  // Split transcript into segments (by speaker or logical breaks)
  const segments = splitIntoSegments(transcript)
  
  // Extract feedback-relevant segments
  const feedbackSegments: FeedbackSegment[] = []
  
  for (const segment of segments) {
    const analysis = analyzeSegment(segment)
    
    // Only include segments that contain feedback
    if (analysis.isFeedback) {
      feedbackSegments.push({
        speaker: segment.speaker,
        text: segment.text,
        type: analysis.type,
        urgency: analysis.urgency,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment
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
  
  return {
    feedbackSegments,
    metadata: {
      totalSegments: segments.length,
      feedbackSegments: feedbackSegments.length,
      speakerCount: speakers.size,
      dominantType
    }
  }
}

/**
 * Split transcript into logical segments
 */
function splitIntoSegments(transcript: string): Array<{ speaker: string, text: string }> {
  const segments: Array<{ speaker: string, text: string }> = []
  
  // Try to parse transcript with speaker labels
  // Common formats:
  // - "Speaker Name: text"
  // - "[Speaker Name] text"
  // - "Speaker Name\ntext"
  
  const lines = transcript.split('\n')
  let currentSpeaker = 'Unknown'
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
          text: currentText.join(' ').trim()
        })
        currentText = []
      }
      
      // Start new segment
      currentSpeaker = speakerMatch[1].trim()
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
      text: currentText.join(' ').trim()
    })
  }
  
  // If no speaker labels found, treat as single segment
  if (segments.length === 0) {
    segments.push({
      speaker: 'Unknown',
      text: transcript.trim()
    })
  }
  
  return segments
}

/**
 * Analyze a segment to determine if it contains feedback
 */
function analyzeSegment(segment: { speaker: string, text: string }): {
  isFeedback: boolean
  type: FeedbackSegment['type']
  urgency: FeedbackSegment['urgency']
  keywords: string[]
  sentiment: FeedbackSegment['sentiment']
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
      sentiment: 'neutral'
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
  
  // Determine urgency
  let urgency: FeedbackSegment['urgency'] = 'medium'
  if (PATTERNS.urgency_critical.some(k => text.includes(k))) {
    urgency = 'critical'
  } else if (PATTERNS.urgency_high.some(k => text.includes(k))) {
    urgency = 'high'
  } else if (type === 'praise') {
    urgency = 'low'
  }
  
  // Determine sentiment
  let sentiment: FeedbackSegment['sentiment'] = 'neutral'
  const positiveScore = PATTERNS.praise.filter(k => text.includes(k)).length
  const negativeScore = [...PATTERNS.pain_point, ...PATTERNS.concern].filter(k => text.includes(k)).length
  
  if (positiveScore > negativeScore + 1) {
    sentiment = 'positive'
  } else if (negativeScore > positiveScore + 1) {
    sentiment = 'negative'
  }
  
  return {
    isFeedback,
    type,
    urgency,
    keywords: Array.from(new Set(matchedKeywords)),
    sentiment
  }
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
    lines.push(`[${segment.type.toUpperCase()}] ${segment.speaker}:`)
    lines.push(segment.text)
    lines.push(`→ Urgency: ${segment.urgency}, Sentiment: ${segment.sentiment}`)
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
  
  return {
    total: segments.length,
    byType: typeCounts,
    byUrgency: urgencyCounts,
    bySentiment: sentimentCounts
  }
}

