/**
 * Summary Generation Script
 * 
 * This script generates summaries for ALL transcripts without summaries using GPT-4o-mini.
 * Set TEST_LIMIT to a number to limit processing, or 0 to process all.
 * 
 * Run with: npx tsx scripts/test-summary-generation.ts
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_LIMIT = 0 // 0 = process ALL transcripts without summaries (set to a number to limit)
const MODEL = 'gpt-4o-mini' // Using GPT-4o-mini (cost-effective model)

interface TranscriptRecord {
  id: string
  diio_transcript_id: string
  transcript_text: string
  transcript_type: string
  source_name: string
  summary: string | null
}

interface CostEstimate {
  totalInputTokens: number
  totalOutputTokens: number
  estimatedCost: number
  costPerTranscript: number
}

/**
 * Calculate cost based on GPT-4o-mini pricing
 * Pricing (as of Nov 2024):
 * - Input: $0.150 per 1M tokens
 * - Output: $0.600 per 1M tokens
 */
function calculateCost(inputTokens: number, outputTokens: number): CostEstimate {
  const INPUT_COST_PER_MILLION = 0.150
  const OUTPUT_COST_PER_MILLION = 0.600
  
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION
  const totalCost = inputCost + outputCost
  
  return {
    totalInputTokens: inputTokens,
    totalOutputTokens: outputTokens,
    estimatedCost: totalCost,
    costPerTranscript: totalCost / TEST_LIMIT
  }
}

/**
 * Generate summary using GPT-4o-mini
 */
async function generateSummary(
  openai: OpenAI,
  transcriptText: string,
  sourceName: string,
  transcriptType: string
): Promise<{ summary: string; inputTokens: number; outputTokens: number }> {
  const prompt = `Generate a concise summary of this ${transcriptType} transcript. 
Focus on:
- Key topics discussed
- Main decisions or outcomes
- Important concerns or feedback
- Action items mentioned

Keep the summary to 100-150 words.

Transcript:
${transcriptText.substring(0, 8000)}` // Limit to ~8000 chars to stay within token limits

  try {
      const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, professional summaries of business meetings and calls.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300, // Limit output to ~300 tokens (~225 words)
      temperature: 0.3 // Lower temperature for more consistent summaries
    })

    // Debug: Log full response structure
    console.log(`   🔍 API Response structure:`, {
      hasChoices: !!response.choices,
      choicesLength: response.choices?.length || 0,
      firstChoiceContent: response.choices?.[0]?.message?.content?.substring(0, 50) || 'NO CONTENT',
      usage: response.usage
    })

    const summary = response.choices[0]?.message?.content || ''
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0

    // Validate summary was generated
    if (!summary || summary.trim().length === 0) {
      console.error(`   ❌ Summary is empty! Response:`, JSON.stringify(response, null, 2))
      throw new Error('Generated summary is empty')
    }

    console.log(`   🔍 Summary preview: ${summary.substring(0, 50)}...`)
    console.log(`   🔍 Full summary length: ${summary.length} chars`)
    return { summary: summary.trim(), inputTokens, outputTokens }
  } catch (error: any) {
    console.error(`❌ Error generating summary: ${error.message}`)
    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Summary Generation')
  console.log('='.repeat(60))
  if (TEST_LIMIT > 0) {
    console.log(`📊 Processing ${TEST_LIMIT} transcripts`)
  } else {
    console.log(`📊 Processing ALL transcripts without summaries`)
  }
  console.log(`🤖 Using model: ${MODEL}`)
  console.log('')

  // Load environment variables
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found')
    console.error('Required: NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  if (!openaiApiKey) {
    console.error('❌ Error: OpenAI API key not found')
    console.error('Required: OPENAI_API_KEY')
    console.error('Get your key at: https://platform.openai.com/api-keys')
    process.exit(1)
  }

  // Initialize clients
  const supabase = createClient(supabaseUrl, supabaseKey)
  const openai = new OpenAI({ apiKey: openaiApiKey })

  console.log('✅ Connected to Supabase')
  console.log('✅ OpenAI API key loaded')
  console.log('')

  // Fetch transcripts (without summaries)
  if (TEST_LIMIT > 0) {
    console.log(`📊 Fetching ${TEST_LIMIT} transcripts without summaries...`)
  } else {
    console.log(`📊 Fetching ALL transcripts without summaries...`)
  }
  
  let query = supabase
    .from('diio_transcripts')
    .select('id, diio_transcript_id, transcript_text, transcript_type, source_name, summary')
    .or('summary.is.null,summary.eq.')
    .order('created_at', { ascending: false })
  
  if (TEST_LIMIT > 0) {
    query = query.limit(TEST_LIMIT)
  }
  
  const { data: transcripts, error: fetchError } = await query

  if (fetchError) {
    console.error('❌ Error fetching transcripts:', fetchError)
    process.exit(1)
  }

  if (!transcripts || transcripts.length === 0) {
    console.error('❌ No transcripts found without summaries')
    process.exit(1)
  }

  console.log(`✅ Found ${transcripts.length} transcripts to process`)
  console.log('')

  // Process transcripts
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let successCount = 0
  let errorCount = 0
  const startTime = Date.now()

  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i]
    console.log(`\n[${i + 1}/${transcripts.length}] Processing: ${transcript.source_name || transcript.diio_transcript_id}`)
    console.log(`   Type: ${transcript.transcript_type}`)
    console.log(`   Text length: ${transcript.transcript_text.length} characters`)

    try {
      // Generate summary
      console.log('   🤖 Generating summary...')
      const { summary, inputTokens, outputTokens } = await generateSummary(
        openai,
        transcript.transcript_text,
        transcript.source_name || 'Unknown',
        transcript.transcript_type
      )

      // Double-check summary is not empty
      if (!summary || summary.trim().length === 0) {
        throw new Error('Summary is empty after generation')
      }

      totalInputTokens += inputTokens
      totalOutputTokens += outputTokens

      console.log(`   ✅ Summary generated (${summary.length} chars)`)
      console.log(`   📊 Tokens: ${inputTokens} input, ${outputTokens} output`)
      console.log(`   📝 Preview: ${summary.substring(0, 100)}...`)

      // Save to database
      console.log(`   💾 Saving to database (transcript ID: ${transcript.id.substring(0, 8)}...)`)
      const { data: updateData, error: updateError } = await supabase
        .from('diio_transcripts')
        .update({ summary: summary.trim() })
        .eq('id', transcript.id)
        .select('id, summary')

      if (updateError) {
        console.error(`   ❌ Error saving summary: ${updateError.message}`)
        console.error(`   ❌ Full error:`, updateError)
        errorCount++
      } else if (!updateData || updateData.length === 0) {
        console.error(`   ❌ No rows updated - check if transcript ID exists`)
        errorCount++
      } else {
        const savedSummary = updateData[0].summary
        if (savedSummary && savedSummary.trim().length > 0) {
          console.log('   ✅ Summary saved and verified in database')
          console.log(`   ✅ Saved summary length: ${savedSummary.length} chars`)
          successCount++
        } else {
          console.error(`   ❌ Summary was saved but is empty in database!`)
          console.error(`   ❌ Saved value: "${savedSummary}"`)
          errorCount++
        }
      }

      // Small delay to avoid rate limits (reduced for batch processing)
      if (i < transcripts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay for faster processing
      }
      
      // Progress update every 50 transcripts (or every 10% for large batches)
      const progressInterval = transcripts.length > 100 ? Math.max(50, Math.floor(transcripts.length / 10)) : 50
      if ((i + 1) % progressInterval === 0 || i === transcripts.length - 1) {
        const percent = Math.round((i + 1) / transcripts.length * 100)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
        const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1)
        const remaining = transcripts.length - (i + 1)
        const eta = remaining > 0 ? Math.round(remaining / parseFloat(rate)) : 0
        console.log(`\n📊 Progress: ${i + 1}/${transcripts.length} (${percent}%) | ✅ ${successCount} | ❌ ${errorCount} | ⏱️ ${elapsed}s | 🚀 ${rate}/s | ⏳ ~${eta}s remaining`)
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`)
      errorCount++
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  // Calculate costs
  const costEstimate = calculateCost(totalInputTokens, totalOutputTokens)

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('📊 PROCESSING RESULTS')
  console.log('='.repeat(60))
  console.log(`✅ Successfully processed: ${successCount}/${transcripts.length}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`⏱️  Total time: ${duration}s`)
  console.log(`📊 Average time per transcript: ${(parseFloat(duration) / transcripts.length).toFixed(2)}s`)
  console.log('')
  console.log('💰 COST ESTIMATE')
  console.log('-'.repeat(60))
  console.log(`Total input tokens: ${totalInputTokens.toLocaleString()}`)
  console.log(`Total output tokens: ${totalOutputTokens.toLocaleString()}`)
  console.log(`Total tokens: ${(totalInputTokens + totalOutputTokens).toLocaleString()}`)
  console.log('')
  console.log(`Estimated cost for ${transcripts.length} transcripts: $${costEstimate.estimatedCost.toFixed(6)}`)
  console.log(`Cost per transcript: $${costEstimate.costPerTranscript.toFixed(6)}`)
  console.log('')
  console.log('📈 PROJECTED COSTS (based on test)')
  console.log('-'.repeat(60))
  const costPer100 = costEstimate.costPerTranscript * 100
  const costPer1000 = costEstimate.costPerTranscript * 1000
  const costPer10000 = costEstimate.costPerTranscript * 10000
  console.log(`100 transcripts: $${costPer100.toFixed(2)}`)
  console.log(`1,000 transcripts: $${costPer1000.toFixed(2)}`)
  console.log(`10,000 transcripts: $${costPer10000.toFixed(2)}`)
  console.log('')
  console.log('💡 RECOMMENDATION')
  console.log('-'.repeat(60))
  if (costEstimate.costPerTranscript < 0.01) {
    console.log('✅ Cost is very low - highly viable!')
  } else if (costEstimate.costPerTranscript < 0.05) {
    console.log('✅ Cost is reasonable - viable for production')
  } else if (costEstimate.costPerTranscript < 0.10) {
    console.log('⚠️  Cost is moderate - consider for high-value transcripts only')
  } else {
    console.log('❌ Cost is high - may not be viable for all transcripts')
  }
  console.log('')
  console.log('='.repeat(60))
  console.log('✅ Test completed!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Review the generated summaries in the database')
  console.log('2. Run sentiment analysis on the summaries')
  console.log('3. If needed, process remaining transcripts')
}

// Execute main function
main().catch(console.error)
