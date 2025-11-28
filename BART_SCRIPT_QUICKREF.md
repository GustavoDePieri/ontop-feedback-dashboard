# 🚀 BART Script - Quick Reference Card

## ✅ Ready to Run!

### 📍 Storage Location
- **Table**: `diio_transcripts`  
- **Column**: `ai_analysis` (JSONB)
- **Also Updates**: `ai_analysis_date` (timestamp)

---

## 🎯 Run the Script

```bash
# From project root
npx tsx scripts/run-bart-analysis.ts
```

**What it does:**
1. Fetches all transcripts with `analyzed_status = 'finished'`
2. Generates BART summaries & explanations
3. Extracts keywords & quotes
4. Updates database with enhanced data
5. Shows progress & statistics

---

## ⏱️ Estimated Time

| Transcripts | Time |
|-------------|------|
| 100 | ~20s |
| 500 | ~2min |
| 1,000 | ~3min |
| Your 1,166 | ~4min |

---

## 📦 What Gets Added to `ai_analysis`

```json
{
  // Existing fields preserved
  "overallSentiment": "negative",
  "sentimentScore": -0.65,
  
  // NEW: BART-generated
  "summary": "Meeting summary (50-150 words)",
  "sentimentExplanation": "Why this sentiment?",
  
  // NEW: Extracted
  "keywords": ["keyword1", "keyword2", ...],
  "keyQuotes": {
    "negative": ["quote1", "quote2"],
    "positive": ["quote3"]
  },
  
  // Enhanced
  "painPoints": ["Real quote 1", "Real quote 2"],
  "positiveHighlights": ["Real quote 3"],
  
  // Metadata
  "enhancedWithAI": true,
  "generatedAt": "2025-11-28T..."
}
```

---

## ✅ Before Running Checklist

- [ ] `.env` file has `NUXT_PUBLIC_SUPABASE_URL`
- [ ] `.env` file has `NUXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env` file has `HUGGINGFACE_API_KEY`
- [ ] You have transcripts with `analyzed_status = 'finished'`
- [ ] (Optional) Database backup created

---

## 🔍 Verification Queries

### Count ready transcripts:
```sql
SELECT COUNT(*) FROM diio_transcripts 
WHERE analyzed_status = 'finished';
```

### After running, count enhanced:
```sql
SELECT COUNT(*) FROM diio_transcripts 
WHERE ai_analysis->>'enhancedWithAI' = 'true';
```

### View sample:
```sql
SELECT 
  source_name,
  ai_analysis->>'summary' as summary,
  ai_analysis->>'sentimentExplanation' as why
FROM diio_transcripts
WHERE ai_analysis->>'enhancedWithAI' = 'true'
LIMIT 3;
```

---

## 🎨 UI Changes to See

After running, click **"Sentiment"** on any transcript:

**NEW SECTIONS:**
- 📄 **Meeting Summary** (blue box) - BART-generated
- 💡 **Why This Sentiment?** (purple box) - AI explanation  
- 🏷️ **Key Topics** - Keyword tags
- ❌ **Concerning Quotes** - Real customer quotes
- ✅ **Positive Quotes** - Real customer quotes

---

## 💰 Cost: $0.00

- Uses HuggingFace free tier
- No API charges
- Unlimited transcripts

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "No env variables" | Check `.env` file exists |
| "No transcripts found" | Run sentiment analysis first |
| "Rate limit" | Increase delay to 3000ms |
| Script stops | Re-run (skips completed) |

---

## 📚 Full Documentation

- **`BART_STORAGE_INFO.md`** - Storage details & queries
- **`scripts/README_BART_SCRIPT.md`** - Complete guide
- **`BART_SUMMARIZATION_IMPLEMENTATION.md`** - Technical docs

---

## 🎯 After Running

1. ✅ Refresh DIIO Transcripts page
2. ✅ Click "Sentiment" on any transcript
3. ✅ See enhanced analysis with summaries!
4. ✅ Show 2-3 examples to leadership

---

**That's it! Ready to enhance all your transcripts! 🚀**
