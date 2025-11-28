/**
 * BART Summarization Utility
 * Uses facebook/bart-large-cnn model from HuggingFace (FREE)
 * 
 * Features:
 * - Generates concise meeting summaries
 * - Extracts key points automatically
 * - Zero cost (uses HuggingFace Inference API)
 */

import { HfInference } from '@huggingface/inference'

interface SummarizationOptions {
  maxLength?: number
  minLength?: number
  doSample?: boolean
}

/**
 * Generate a summary of a meeting transcript using BART
 */
export async function generateBARTSummary(
  transcript: string,
  apiKey: string,
  options: SummarizationOptions = {}
): Promise<string> {
  try {
    const hf = new HfInference(apiKey)
    
    // Truncate if transcript is too long (BART has token limits)
    const maxInputLength = 1024 // tokens (roughly 4000 characters)
    let inputText = transcript
    
    if (transcript.length > 4000) {
      // Take first and last parts to capture opening and conclusion
      const firstPart = transcript.substring(0, 2000)
      const lastPart = transcript.substring(transcript.length - 2000)
      inputText = firstPart + '\n...\n' + lastPart
      console.log('⚠️ Transcript truncated for summarization (too long)')
    }
    
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: inputText,
      parameters: {
        max_length: options.maxLength || 150,
        min_length: options.minLength || 50,
        do_sample: options.doSample || false
      }
    })
    
    const summary = result.summary_text || ''
    console.log(`✅ BART summary generated (${summary.length} chars)`)
    
    return summary
  } catch (error: any) {
    console.error('❌ BART summarization error:', error.message)
    
    // Fallback: extract first few sentences
    return extractFirstSentences(transcript, 3)
  }
}

/**
 * Generate a summary explanation of why sentiment is positive/negative/neutral
 */
export async function generateSentimentExplanation(
  transcript: string,
  sentiment: string,
  sentimentScore: number,
  apiKey: string
): Promise<string> {
  try {
    const hf = new HfInference(apiKey)
    
    // Create a focused prompt for explanation
    const sentenceHighlights = extractSentimentSentences(transcript, sentiment)
    const highlightText = sentenceHighlights.join(' ')
    
    // Truncate if needed
    let inputText = highlightText.length > 2000 
      ? highlightText.substring(0, 2000) 
      : highlightText
    
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: inputText,
      parameters: {
        max_length: 100,
        min_length: 30,
        do_sample: false
      }
    })
    
    const explanation = result.summary_text || ''
    
    // Enhance with sentiment context
    const enhancedExplanation = `The meeting was classified as ${sentiment} (score: ${(sentimentScore * 100).toFixed(1)}%). ${explanation}`
    
    console.log(`✅ Sentiment explanation generated`)
    
    return enhancedExplanation
  } catch (error: any) {
    console.error('❌ Explanation generation error:', error.message)
    
    // Fallback: template-based explanation
    return generateFallbackExplanation(transcript, sentiment, sentimentScore)
  }
}

/**
 * Extract sentences that match the overall sentiment
 */
function extractSentimentSentences(transcript: string, sentiment: string): string[] {
  // Split into sentences
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
  
  // Keywords for each sentiment type
  const negativeKeywords = [
    'issue', 'problem', 'concern', 'disappointed', 'frustrated', 'difficult',
    'outage', 'down', 'error', 'bug', 'slow', 'not working', 'complaint',
    'unhappy', 'dissatisfied', 'worse', 'broken', 'failed', 'wrong'
  ]
  
  const positiveKeywords = [
    'great', 'excellent', 'good', 'happy', 'satisfied', 'impressed',
    'love', 'amazing', 'perfect', 'wonderful', 'fantastic', 'better',
    'improved', 'helpful', 'efficient', 'appreciate', 'thank'
  ]
  
  // Score sentences based on keyword matches
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase()
    let score = 0
    
    if (sentiment === 'negative') {
      negativeKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) score++
      })
    } else if (sentiment === 'positive') {
      positiveKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) score++
      })
    }
    
    return { sentence, score }
  })
  
  // Return top 5 relevant sentences
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.sentence)
}

/**
 * Fallback: Extract first N sentences
 */
function extractFirstSentences(text: string, count: number = 3): string {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
    .slice(0, count)
  
  return sentences.join('. ') + '.'
}

/**
 * Fallback: Template-based explanation
 */
function generateFallbackExplanation(
  transcript: string,
  sentiment: string,
  sentimentScore: number
): string {
  const highlights = extractSentimentSentences(transcript, sentiment)
  
  if (sentiment === 'negative') {
    return `The meeting was classified as negative (score: ${(sentimentScore * 100).toFixed(1)}%) due to concerning topics discussed. Key issues mentioned include service problems, customer concerns, and areas needing improvement.`
  } else if (sentiment === 'positive') {
    return `The meeting showed positive sentiment (score: ${(sentimentScore * 100).toFixed(1)}%) with the customer expressing satisfaction. Positive topics included service appreciation, successful outcomes, and strong relationship indicators.`
  } else {
    return `The meeting had neutral sentiment (score: ${(sentimentScore * 100).toFixed(1)}%) with balanced discussion. The conversation covered routine topics without significant positive or negative indicators.`
  }
}

/**
 * Extract key quotes from transcript that support the sentiment
 */
export function extractKeyQuotes(transcript: string, sentiment: string, limit: number = 3): {
  positive: string[]
  negative: string[]
  neutral: string[]
} {
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200) // Good quote length
  
  const negativeKeywords = [
    'issue', 'problem', 'concern', 'disappointed', 'frustrated', 'difficult',
    'outage', 'down', 'error', 'bug', 'slow', 'not working', 'complaint',
    'unhappy', 'dissatisfied', 'worse', 'broken', 'failed', 'wrong', 'cancel'
  ]
  
  const positiveKeywords = [
    'great', 'excellent', 'good', 'happy', 'satisfied', 'impressed',
    'love', 'amazing', 'perfect', 'wonderful', 'fantastic', 'better',
    'improved', 'helpful', 'efficient', 'appreciate', 'thank', 'pleased'
  ]
  
  const negativeQuotes: string[] = []
  const positiveQuotes: string[] = []
  const neutralQuotes: string[] = []
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase()
    
    const negScore = negativeKeywords.filter(kw => lowerSentence.includes(kw)).length
    const posScore = positiveKeywords.filter(kw => lowerSentence.includes(kw)).length
    
    if (negScore > posScore && negScore > 0) {
      negativeQuotes.push(sentence)
    } else if (posScore > negScore && posScore > 0) {
      positiveQuotes.push(sentence)
    } else if (sentence.length > 50) {
      neutralQuotes.push(sentence)
    }
  })
  
  return {
    positive: positiveQuotes.slice(0, limit),
    negative: negativeQuotes.slice(0, limit),
    neutral: neutralQuotes.slice(0, limit)
  }
}

/**
 * Extract keywords from transcript (simple TF-IDF-like approach)
 */
export function extractKeywords(transcript: string, limit: number = 10): string[] {
  // Common stop words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'just', 'so', 'than', 'such'
  ])
  
  // Extract words
  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  // Count frequency
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}
