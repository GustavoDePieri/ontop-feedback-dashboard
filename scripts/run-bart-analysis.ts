/**
 * Run BART Analysis on All Finished Transcripts
 * 
 * This script will:
 * 1. Fetch all transcripts where analyzed_status = 'finished'
 * 2. Re-analyze them with BART summarization
 * 3. Update the ai_analysis column with enhanced data
 * 4. Track progress and show detailed logs
 * 
 * STORAGE LOCATION:
 * - Table: diio_transcripts
 * - Column: ai_analysis (JSONB)
 * - Additional: ai_analysis_date (updated timestamp)
 * 
 * Run with: npx tsx scripts/run-bart-analysis.ts
 */

import { createClient } from '@supabase/supabase-js'
import { HfInference } from '@huggingface/inference'

// Configuration
const BATCH_SIZE = 10 // Process 10 transcripts at a time
const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds between batches to avoid rate limits

interface TranscriptRecord {
  id: string
  diio_transcript_id: string
  transcript_text: string
  transcript_type: string
  source_name: string
  ai_analysis: any
  analyzed_status: string
}

interface ProcessingStats {
  total: number
  processed: number
  enhanced: number
  skipped: number
  errors: number
  startTime: Date
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting BART Analysis Script')
  console.log('=' .repeat(60))
  
  // Load environment variables
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const hfApiKey = process.env.HUGGINGFACE_API_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in environment')
    console.error('Required: NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  if (!hfApiKey) {
    console.error('❌ Error: HuggingFace API key not found')
    console.error('Required: HUGGINGFACE_API_KEY')
    process.exit(1)
  }
  
  // Initialize clients
  const supabase = createClient(supabaseUrl, supabaseKey)
  const hf = new HfInference(hfApiKey)
  
  console.log('✅ Connected to Supabase')
  console.log('✅ HuggingFace API key loaded')
  console.log('')
  
  // Fetch transcripts with analyzed_status = 'finished'
  console.log('📊 Fetching transcripts with analyzed_status = "finished"...')
  
  const { data: transcripts, error: fetchError } = await supabase
    .from('diio_transcripts')
    .select('id, diio_transcript_id, transcript_text, transcript_type, source_name, ai_analysis, analyzed_status')
    .eq('analyzed_status', 'finished')
    .order('created_at', { ascending: true })
  
  if (fetchError) {
    console.error('❌ Error fetching transcripts:', fetchError.message)
    process.exit(1)
  }
  
  if (!transcripts || transcripts.length === 0) {
    console.log('ℹ️  No transcripts found with analyzed_status = "finished"')
    console.log('💡 Tip: Run sentiment analysis first using /api/diio/bulk-sentiment-analysis')
    process.exit(0)
  }
  
  console.log(`✅ Found ${transcripts.length} transcripts to process`)
  console.log('')
  
  // Ask for confirmation
  console.log('📋 SCRIPT WILL:')
  console.log(`   - Process ${transcripts.length} transcripts`)
  console.log(`   - Update table: diio_transcripts`)
  console.log(`   - Update column: ai_analysis (JSONB)`)
  console.log(`   - Batch size: ${BATCH_SIZE} transcripts at a time`)
  console.log(`   - Estimated time: ${Math.ceil(transcripts.length / BATCH_SIZE * (DELAY_BETWEEN_BATCHES / 1000))} seconds`)
  console.log('')
  console.log('⚠️  This will use HuggingFace API (FREE tier, no cost)')
  console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...')
  console.log('')
  
  await sleep(5000)
  
  // Initialize stats
  const stats: ProcessingStats = {
    total: transcripts.length,
    processed: 0,
    enhanced: 0,
    skipped: 0,
    errors: 0,
    startTime: new Date()
  }
  
  console.log('🔄 Starting processing...')
  console.log('')
  
  // Process in batches
  for (let i = 0; i < transcripts.length; i += BATCH_SIZE) {
    const batch = transcripts.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(transcripts.length / BATCH_SIZE)
    
    console.log(`📦 Batch ${batchNumber}/${totalBatches} (${batch.length} transcripts)`)
    
    // Process batch in parallel
    await Promise.all(
      batch.map(async (transcript) => {
        try {
          await processTranscript(transcript, supabase, hf, stats)
        } catch (error: any) {
          console.error(`   ❌ Error processing ${transcript.diio_transcript_id}:`, error.message)
          stats.errors++
        }
      })
    )
    
    // Show batch progress
    const progress = ((stats.processed / stats.total) * 100).toFixed(1)
    console.log(`   Progress: ${stats.processed}/${stats.total} (${progress}%)`)
    console.log('')
    
    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < transcripts.length) {
      await sleep(DELAY_BETWEEN_BATCHES)
    }
  }
  
  // Show final stats
  console.log('=' .repeat(60))
  console.log('✅ BART Analysis Complete!')
  console.log('')
  console.log('📊 Final Statistics:')
  console.log(`   Total Transcripts: ${stats.total}`)
  console.log(`   ✅ Enhanced with BART: ${stats.enhanced}`)
  console.log(`   ⏭️  Skipped (already enhanced): ${stats.skipped}`)
  console.log(`   ❌ Errors: ${stats.errors}`)
  console.log(`   ⏱️  Time taken: ${getElapsedTime(stats.startTime)}`)
  console.log('')
  console.log('🎯 Next Steps:')
  console.log('   1. Refresh your DIIO Transcripts page')
  console.log('   2. Click "Sentiment" button on any transcript')
  console.log('   3. See the enhanced BART summaries and explanations!')
  console.log('')
}

/**
 * Process a single transcript
 */
async function processTranscript(
  transcript: TranscriptRecord,
  supabase: any,
  hf: HfInference,
  stats: ProcessingStats
) {
  stats.processed++
  
  // Check if already enhanced
  if (transcript.ai_analysis?.enhancedWithAI === true) {
    console.log(`   ⏭️  ${transcript.diio_transcript_id} - Already enhanced, skipping`)
    stats.skipped++
    return
  }
  
  console.log(`   🤖 ${transcript.diio_transcript_id} - Generating BART analysis...`)
  
  try {
    // Get existing sentiment data (should already exist)
    const existingAnalysis = transcript.ai_analysis || {}
    
    // If no sentiment analysis exists, skip (shouldn't happen with analyzed_status = finished)
    if (!existingAnalysis.overallSentiment) {
      console.log(`   ⚠️  ${transcript.diio_transcript_id} - No sentiment analysis found, skipping`)
      stats.skipped++
      return
    }
    
    // Generate BART summary
    const summary = await generateBARTSummary(transcript.transcript_text, hf)
    
    // Generate sentiment explanation
    const sentimentExplanation = await generateSentimentExplanation(
      transcript.transcript_text,
      existingAnalysis.overallSentiment,
      existingAnalysis.sentimentScore || 0,
      hf
    )
    
    // Extract keywords
    const keywords = extractKeywords(transcript.transcript_text, 10)
    
    // Extract key quotes
    const keyQuotes = extractKeyQuotes(
      transcript.transcript_text,
      existingAnalysis.overallSentiment,
      3
    )
    
    // Enhance themes
    const enhancedThemes = generateThemesFromKeywords(
      keywords,
      existingAnalysis.overallSentiment,
      existingAnalysis.churnRisk
    )
    
    // Update pain points and positive highlights with actual quotes
    const painPoints = keyQuotes.negative.length > 0
      ? keyQuotes.negative
      : existingAnalysis.painPoints || []
    
    const positiveHighlights = keyQuotes.positive.length > 0
      ? keyQuotes.positive
      : existingAnalysis.positiveHighlights || []
    
    // Create enhanced analysis
    const enhancedAnalysis = {
      ...existingAnalysis,
      summary,
      sentimentExplanation,
      keywords,
      keyQuotes,
      keyThemes: enhancedThemes,
      painPoints,
      positiveHighlights,
      enhancedWithAI: true,
      generatedAt: new Date().toISOString()
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('diio_transcripts')
      .update({
        ai_analysis: enhancedAnalysis,
        ai_analysis_date: new Date().toISOString()
      })
      .eq('id', transcript.id)
    
    if (updateError) {
      throw updateError
    }
    
    console.log(`   ✅ ${transcript.diio_transcript_id} - Enhanced successfully`)
    stats.enhanced++
    
  } catch (error: any) {
    console.error(`   ❌ ${transcript.diio_transcript_id} - Error:`, error.message)
    stats.errors++
    throw error
  }
}

/**
 * Generate BART summary
 */
async function generateBARTSummary(
  transcript: string,
  hf: HfInference,
  maxLength: number = 150,
  minLength: number = 50
): Promise<string> {
  try {
    // Truncate if too long
    let inputText = transcript
    if (transcript.length > 4000) {
      const firstPart = transcript.substring(0, 2000)
      const lastPart = transcript.substring(transcript.length - 2000)
      inputText = firstPart + '\n...\n' + lastPart
    }
    
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: inputText,
      parameters: {
        max_length: maxLength,
        min_length: minLength,
        do_sample: false
      }
    })
    
    return result.summary_text || extractFirstSentences(transcript, 3)
  } catch (error: any) {
    console.warn('   ⚠️  BART summarization failed, using fallback')
    return extractFirstSentences(transcript, 3)
  }
}

/**
 * Generate sentiment explanation
 */
async function generateSentimentExplanation(
  transcript: string,
  sentiment: string,
  sentimentScore: number,
  hf: HfInference
): Promise<string> {
  try {
    const sentenceHighlights = extractSentimentSentences(transcript, sentiment)
    const highlightText = sentenceHighlights.join(' ')
    
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
    return `The meeting was classified as ${sentiment} (score: ${(sentimentScore * 100).toFixed(1)}%). ${explanation}`
  } catch (error: any) {
    // Fallback explanation
    return generateFallbackExplanation(transcript, sentiment, sentimentScore)
  }
}

/**
 * Extract keywords
 */
function extractKeywords(transcript: string, limit: number = 10): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'just', 'so', 'than', 'such'
  ])
  
  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

/**
 * Extract key quotes
 */
function extractKeyQuotes(transcript: string, sentiment: string, limit: number = 3): {
  positive: string[]
  negative: string[]
  neutral: string[]
} {
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200)
  
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
 * Generate themes from keywords
 */
function generateThemesFromKeywords(
  keywords: string[],
  sentiment: string,
  churnRisk: string
): Array<{ theme: string; sentiment: string; mentions: number; urgency: string }> {
  const themes: Array<{ theme: string; sentiment: string; mentions: number; urgency: string }> = []
  
  const serviceKeywords = ['support', 'service', 'help', 'team', 'response']
  const productKeywords = ['feature', 'product', 'platform', 'system', 'tool']
  const pricingKeywords = ['price', 'cost', 'billing', 'payment', 'plan']
  const performanceKeywords = ['performance', 'speed', 'slow', 'fast', 'downtime', 'outage']
  
  const hasServiceMention = keywords.some(kw => serviceKeywords.includes(kw))
  const hasProductMention = keywords.some(kw => productKeywords.includes(kw))
  const hasPricingMention = keywords.some(kw => pricingKeywords.includes(kw))
  const hasPerformanceMention = keywords.some(kw => performanceKeywords.includes(kw))
  
  if (hasServiceMention) {
    themes.push({
      theme: 'Customer Support',
      sentiment: sentiment,
      mentions: keywords.filter(kw => serviceKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'high' : 'medium'
    })
  }
  
  if (hasProductMention) {
    themes.push({
      theme: 'Product & Features',
      sentiment: sentiment,
      mentions: keywords.filter(kw => productKeywords.includes(kw)).length,
      urgency: 'medium'
    })
  }
  
  if (hasPricingMention) {
    themes.push({
      theme: 'Pricing & Billing',
      sentiment: sentiment,
      mentions: keywords.filter(kw => pricingKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' ? 'high' : 'medium'
    })
  }
  
  if (hasPerformanceMention) {
    themes.push({
      theme: 'Performance & Reliability',
      sentiment: sentiment,
      mentions: keywords.filter(kw => performanceKeywords.includes(kw)).length,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'critical' : 'high'
    })
  }
  
  if (themes.length === 0) {
    themes.push({
      theme: sentiment === 'positive' ? 'General Satisfaction' : 'General Discussion',
      sentiment: sentiment,
      mentions: 1,
      urgency: churnRisk === 'critical' || churnRisk === 'high' ? 'high' : 'low'
    })
  }
  
  return themes
}

/**
 * Helper functions
 */
function extractFirstSentences(text: string, count: number = 3): string {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
    .slice(0, count)
  
  return sentences.join('. ') + '.'
}

function extractSentimentSentences(transcript: string, sentiment: string): string[] {
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
  
  const negativeKeywords = ['issue', 'problem', 'concern', 'frustrated', 'outage']
  const positiveKeywords = ['great', 'excellent', 'good', 'happy', 'satisfied']
  
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
  
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.sentence)
}

function generateFallbackExplanation(transcript: string, sentiment: string, sentimentScore: number): string {
  if (sentiment === 'negative') {
    return `The meeting was classified as negative (score: ${(sentimentScore * 100).toFixed(1)}%) due to concerning topics discussed. Key issues mentioned include service problems, customer concerns, and areas needing improvement.`
  } else if (sentiment === 'positive') {
    return `The meeting showed positive sentiment (score: ${(sentimentScore * 100).toFixed(1)}%) with the customer expressing satisfaction. Positive topics included service appreciation, successful outcomes, and strong relationship indicators.`
  } else {
    return `The meeting had neutral sentiment (score: ${(sentimentScore * 100).toFixed(1)}%) with balanced discussion. The conversation covered routine topics without significant positive or negative indicators.`
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getElapsedTime(startTime: Date): string {
  const elapsed = Date.now() - startTime.getTime()
  const seconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
