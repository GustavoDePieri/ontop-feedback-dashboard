# 🤖 BART Analysis Script - Usage Guide

## 📍 Storage Information

### **Where Data is Stored:**
- **Table**: `diio_transcripts`
- **Column**: `ai_analysis` (JSONB type)
- **Additional**: `ai_analysis_date` (timestamp updated)

See `BART_STORAGE_INFO.md` for detailed field breakdown.

---

## 🚀 How to Run the Script

### Prerequisites
1. ✅ Node.js 18+ installed
2. ✅ Environment variables set in `.env` file:
   ```env
   NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   HUGGINGFACE_API_KEY=your_hf_key
   ```

### Install Dependencies (if not already done)
```bash
npm install tsx @supabase/supabase-js @huggingface/inference
```

### Run the Script
```bash
# From project root
npx tsx scripts/run-bart-analysis.ts
```

Or with npm script:
```bash
npm run bart:analyze
```

---

## ⚙️ Script Configuration

Edit these constants in `scripts/run-bart-analysis.ts`:

```typescript
const BATCH_SIZE = 10              // Process 10 at a time
const DELAY_BETWEEN_BATCHES = 2000 // 2 second delay
```

**Recommendations:**
- **BATCH_SIZE**: Keep at 10-20 for optimal performance
- **DELAY**: 2-3 seconds to avoid rate limits (HuggingFace: 30 req/sec)

---

## 📊 What the Script Does

### Step-by-Step:
1. ✅ Connects to Supabase
2. ✅ Fetches all transcripts where `analyzed_status = 'finished'`
3. ✅ Shows count and waits 5 seconds for confirmation
4. ✅ Processes in batches of 10
5. ✅ For each transcript:
   - Generates BART summary (50-150 words)
   - Generates sentiment explanation
   - Extracts 10 keywords
   - Extracts 3 quotes per sentiment type
   - Enhances themes
   - Updates `ai_analysis` column
   - Updates `ai_analysis_date` timestamp
6. ✅ Shows progress and statistics
7. ✅ Reports final results

---

## 📈 Expected Output

```
🚀 Starting BART Analysis Script
============================================================
✅ Connected to Supabase
✅ HuggingFace API key loaded

📊 Fetching transcripts with analyzed_status = "finished"...
✅ Found 234 transcripts to process

📋 SCRIPT WILL:
   - Process 234 transcripts
   - Update table: diio_transcripts
   - Update column: ai_analysis (JSONB)
   - Batch size: 10 transcripts at a time
   - Estimated time: 47 seconds

⚠️  This will use HuggingFace API (FREE tier, no cost)
⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...

🔄 Starting processing...

📦 Batch 1/24 (10 transcripts)
   🤖 transcript_123 - Generating BART analysis...
   ✅ transcript_123 - Enhanced successfully
   🤖 transcript_124 - Generating BART analysis...
   ✅ transcript_124 - Enhanced successfully
   ...
   Progress: 10/234 (4.3%)

📦 Batch 2/24 (10 transcripts)
   ...

============================================================
✅ BART Analysis Complete!

📊 Final Statistics:
   Total Transcripts: 234
   ✅ Enhanced with BART: 234
   ⏭️  Skipped (already enhanced): 0
   ❌ Errors: 0
   ⏱️  Time taken: 47s

🎯 Next Steps:
   1. Refresh your DIIO Transcripts page
   2. Click "Sentiment" button on any transcript
   3. See the enhanced BART summaries and explanations!
```

---

## ⏱️ Performance Estimates

| Transcripts | Batch Size | Estimated Time |
|-------------|------------|----------------|
| 100 | 10 | ~20 seconds |
| 500 | 10 | ~100 seconds |
| 1,000 | 10 | ~200 seconds |
| 1,166 | 10 | ~4 minutes |

**Factors affecting speed:**
- Network latency to HuggingFace API
- Transcript length (longer = slower BART processing)
- Your internet speed

---

## 🔄 Re-Running the Script

### Safe to Re-Run!
The script checks if transcripts are already enhanced:
```typescript
if (transcript.ai_analysis?.enhancedWithAI === true) {
  console.log('Already enhanced, skipping')
  stats.skipped++
  return
}
```

### Force Re-Analysis
To force re-analysis of already-enhanced transcripts:
1. Manually set `enhancedWithAI` to `false` in database, OR
2. Delete the `ai_analysis` column data, OR
3. Modify the script to remove the skip check

---

## 🐛 Troubleshooting

### Error: "Supabase credentials not found"
**Fix**: Check your `.env` file has:
```env
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Error: "HuggingFace API key not found"
**Fix**: Add to `.env`:
```env
HUGGINGFACE_API_KEY=hf_your_key_here
```
Get your key at: https://huggingface.co/settings/tokens

### Error: "Rate limit exceeded"
**Fix**: Increase `DELAY_BETWEEN_BATCHES` to 3000-5000ms

### Error: "BART summarization failed"
**Solution**: Script automatically falls back to extractive summarization

### Script stops midway
**Don't worry!** Already-processed transcripts keep their enhanced data.
Just re-run the script - it will skip completed ones.

---

## ✅ Verification After Running

### Check in Supabase:
```sql
-- Count enhanced transcripts
SELECT COUNT(*) 
FROM diio_transcripts 
WHERE ai_analysis->>'enhancedWithAI' = 'true';

-- View a sample
SELECT 
  source_name,
  ai_analysis->>'summary' as bart_summary,
  ai_analysis->>'sentimentExplanation' as explanation,
  ai_analysis_date
FROM diio_transcripts
WHERE ai_analysis->>'enhancedWithAI' = 'true'
LIMIT 5;

-- Check average summary length
SELECT 
  AVG(LENGTH(ai_analysis->>'summary')) as avg_length,
  MIN(LENGTH(ai_analysis->>'summary')) as min_length,
  MAX(LENGTH(ai_analysis->>'summary')) as max_length
FROM diio_transcripts
WHERE ai_analysis->>'enhancedWithAI' = 'true';
```

### Check in UI:
1. Go to DIIO Transcripts page
2. Find transcript with 🤖 **AI Analyzed** badge
3. Click **"Sentiment"** button
4. You should see:
   - 📄 Meeting Summary (blue box)
   - 💡 Why This Sentiment? (purple box)
   - 🏷️ Key Topics (keywords)
   - ❌ Concerning Quotes (if negative)
   - ✅ Positive Quotes (if positive)

---

## 📊 Before vs After

### Before Running Script:
```json
{
  "overallSentiment": "negative",
  "summary": "This meeting showed negative sentiment.",
  "painPoints": ["Customer expressed dissatisfaction"]
}
```

### After Running Script:
```json
{
  "overallSentiment": "negative",
  "summary": "Customer discussed service disruptions affecting operations. They expressed concerns about response time and requested weekly updates. Team committed to addressing issues.",
  "sentimentExplanation": "The meeting was classified as negative (score: -65%) due to customer concerns about service reliability...",
  "keywords": ["outage", "support", "billing", ...],
  "keyQuotes": {
    "negative": ["We've had three outages this month", ...],
    "positive": ["New dashboard is easier to use"]
  },
  "painPoints": ["We've had three outages this month", ...],
  "enhancedWithAI": true
}
```

---

## 🎯 What to Show Leadership

After running the script, pick 2-3 examples showing:

1. **Negative Meeting Example**:
   - Show the BART summary
   - Show "Why This Sentiment?" explanation
   - Show the concerning quotes
   - Show the actionable insights

2. **Positive Meeting Example**:
   - Show the BART summary
   - Show the positive quotes
   - Demonstrate clear value vs generic "positive sentiment"

3. **Comparison**:
   - Before: Generic sentiment labels
   - After: Full context with explanations

---

## 💾 Database Backup (Recommended)

Before running on production data:

```sql
-- Create backup of ai_analysis data
CREATE TABLE diio_transcripts_backup AS
SELECT id, diio_transcript_id, ai_analysis, ai_analysis_date
FROM diio_transcripts
WHERE analyzed_status = 'finished';
```

---

## 🔧 Advanced Usage

### Process Specific Transcripts Only:
Modify the fetch query in the script:
```typescript
const { data: transcripts } = await supabase
  .from('diio_transcripts')
  .select('...')
  .eq('analyzed_status', 'finished')
  .eq('account_status', 'churned')  // Add this filter
  .limit(50)  // Or limit to specific count
```

### Dry Run Mode:
Add a flag to preview without updating:
```typescript
const DRY_RUN = true  // Add at top of script

// In processTranscript(), skip the update:
if (!DRY_RUN) {
  await supabase.from('diio_transcripts').update(...)
}
```

---

**You're all set! Run the script and watch your sentiment analysis get supercharged! 🚀**
