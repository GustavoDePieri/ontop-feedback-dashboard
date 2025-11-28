# 🗄️ BART Analysis Storage Information

## Where Data is Stored

### **Table**: `diio_transcripts`

### **Columns Updated**:
1. **`ai_analysis`** (JSONB) - Main storage for all sentiment data
2. **`ai_analysis_date`** (TIMESTAMP) - When the analysis was performed
3. **`analyzed_status`** (VARCHAR) - Set to 'finished' after successful analysis

---

## 📦 What Gets Stored in `ai_analysis` Column

### **Before BART** (Old Structure):
```json
{
  "overallSentiment": "negative",
  "sentimentScore": -0.65,
  "customerSatisfaction": "frustrated",
  "churnRisk": "high",
  "churnSignals": ["Negative sentiment detected"],
  "keyThemes": [
    {
      "theme": "General concerns",
      "sentiment": "negative",
      "mentions": 1,
      "urgency": "medium"
    }
  ],
  "painPoints": ["Customer expressed dissatisfaction"],
  "positiveHighlights": [],
  "actionableInsights": [
    {
      "insight": "Schedule follow-up call",
      "priority": "high",
      "owner": "Customer Success",
      "estimatedImpact": "Improve satisfaction"
    }
  ],
  "summary": "This meeting showed negative sentiment."
}
```

### **After BART** (NEW Enhanced Structure):
```json
{
  // ORIGINAL FIELDS (kept)
  "overallSentiment": "negative",
  "sentimentScore": -0.65,
  "customerSatisfaction": "frustrated",
  "churnRisk": "high",
  "churnSignals": ["Negative sentiment detected", "Mention of competitors"],
  
  // ENHANCED THEMES (more detailed)
  "keyThemes": [
    {
      "theme": "Performance & Reliability",
      "sentiment": "negative",
      "mentions": 3,
      "urgency": "critical"
    },
    {
      "theme": "Customer Support",
      "sentiment": "negative",
      "mentions": 2,
      "urgency": "high"
    }
  ],
  
  // REAL CUSTOMER QUOTES (extracted)
  "painPoints": [
    "We've had three outages this month and it's affecting our operations",
    "The response time from support has been disappointing",
    "This is the second billing error we've had to correct"
  ],
  "positiveHighlights": [
    "The new dashboard is much easier to use"
  ],
  
  // BETTER ACTIONABLE INSIGHTS
  "actionableInsights": [
    {
      "insight": "URGENT: Schedule immediate follow-up call within 24 hours to address critical concerns",
      "priority": "critical",
      "owner": "Customer Success Manager",
      "estimatedImpact": "Prevent potential churn and rebuild customer confidence"
    },
    {
      "insight": "Address specific pain points mentioned: 3 key concerns identified",
      "priority": "high",
      "owner": "Account Management",
      "estimatedImpact": "Resolve customer issues and improve satisfaction"
    }
  ],
  
  // ⭐ NEW: BART-GENERATED SUMMARY
  "summary": "Customer discussed ongoing service disruptions affecting their operations. They expressed concerns about response time from support team and requested weekly status updates. Multiple outages were mentioned as impacting business operations. Team committed to addressing issues and improving communication going forward.",
  
  // ⭐ NEW: BART-GENERATED EXPLANATION
  "sentimentExplanation": "The meeting was classified as negative (score: -65.0%) due to customer concerns about service reliability and support responsiveness. Multiple outages were mentioned as impacting business operations, and the customer expressed frustration with billing errors and response times.",
  
  // ⭐ NEW: EXTRACTED KEYWORDS
  "keywords": [
    "outage",
    "support",
    "billing",
    "response",
    "service",
    "payment",
    "issues",
    "timeline",
    "contract",
    "dashboard"
  ],
  
  // ⭐ NEW: KEY QUOTES BY SENTIMENT
  "keyQuotes": {
    "negative": [
      "We've had three outages this month and it's affecting our operations",
      "The response time from support has been disappointing",
      "This is the second billing error we've had to correct"
    ],
    "positive": [
      "The new dashboard is much easier to use"
    ],
    "neutral": []
  },
  
  // ⭐ NEW: METADATA
  "enhancedWithAI": true,
  "generatedAt": "2025-11-28T10:30:45.123Z"
}
```

---

## 📊 Field-by-Field Breakdown

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `summary` | String | 50-150 word meeting summary | **BART AI** |
| `sentimentExplanation` | String | Why this sentiment? | **BART AI** |
| `keywords` | Array[String] | Top 10 topics discussed | Algorithmic |
| `keyQuotes` | Object | Actual customer quotes by sentiment | Algorithmic |
| `painPoints` | Array[String] | Real concerning quotes | Algorithmic |
| `positiveHighlights` | Array[String] | Real positive quotes | Algorithmic |
| `keyThemes` | Array[Object] | Categorized themes with urgency | Algorithmic |
| `actionableInsights` | Array[Object] | Smart recommendations | Algorithmic |
| `enhancedWithAI` | Boolean | Flag for BART enhancement | System |
| `generatedAt` | ISO Date | When analysis was done | System |

---

## 🔍 How to Query the Data

### Get all BART-enhanced transcripts:
```sql
SELECT 
  id,
  diio_transcript_id,
  source_name,
  ai_analysis->>'summary' as bart_summary,
  ai_analysis->>'sentimentExplanation' as bart_explanation,
  ai_analysis->>'keywords' as keywords,
  ai_analysis->>'enhancedWithAI' as is_enhanced,
  ai_analysis_date
FROM diio_transcripts
WHERE ai_analysis->>'enhancedWithAI' = 'true'
ORDER BY ai_analysis_date DESC;
```

### Get transcripts with negative sentiment and their summaries:
```sql
SELECT 
  source_name,
  ai_analysis->>'overallSentiment' as sentiment,
  ai_analysis->>'summary' as summary,
  ai_analysis->>'sentimentExplanation' as explanation,
  ai_analysis->'painPoints' as concerning_quotes
FROM diio_transcripts
WHERE ai_analysis->>'overallSentiment' = 'negative'
  AND ai_analysis->>'enhancedWithAI' = 'true'
ORDER BY occurred_at DESC;
```

### Get keywords across all transcripts:
```sql
SELECT 
  jsonb_array_elements_text(ai_analysis->'keywords') as keyword,
  COUNT(*) as frequency
FROM diio_transcripts
WHERE ai_analysis->'keywords' IS NOT NULL
GROUP BY keyword
ORDER BY frequency DESC
LIMIT 20;
```

---

## 💾 Storage Size Estimate

### Before BART:
- Average `ai_analysis` size: ~500-800 bytes per transcript

### After BART:
- Average `ai_analysis` size: ~2,000-4,000 bytes per transcript
- Increase: ~3-4x

### For 1,000 transcripts:
- Additional storage: ~2-3 MB
- Supabase free tier: 500 MB database storage
- **Impact**: Negligible (< 1% of free tier)

---

## ⚠️ Important Notes

### 1. **No New Tables Created**
All BART data goes into existing `diio_transcripts` table, in the `ai_analysis` column.

### 2. **Backwards Compatible**
Old transcripts without BART enhancement will still work. The UI checks for `enhancedWithAI` flag.

### 3. **Can Re-Run Anytime**
You can re-analyze transcripts with `forceReanalysis: true` and it will update the same column with new BART data.

### 4. **Atomic Updates**
The script updates one transcript at a time, so if it fails midway, already-processed transcripts keep their enhanced data.

### 5. **Progress Tracking**
The script logs progress so you can see how many transcripts have been enhanced:
- Console logs: `✅ Analyzed transcript X of Y`
- Database: Check `ai_analysis_date` field for last update time

---

## 🎯 Verification Queries

### Check how many transcripts are BART-enhanced:
```sql
SELECT 
  COUNT(*) FILTER (WHERE ai_analysis->>'enhancedWithAI' = 'true') as bart_enhanced,
  COUNT(*) FILTER (WHERE ai_analysis->>'enhancedWithAI' IS NULL OR ai_analysis->>'enhancedWithAI' = 'false') as not_enhanced,
  COUNT(*) as total
FROM diio_transcripts
WHERE analyzed_status = 'finished';
```

### Check average summary length:
```sql
SELECT 
  AVG(LENGTH(ai_analysis->>'summary')) as avg_summary_length,
  MIN(LENGTH(ai_analysis->>'summary')) as min_length,
  MAX(LENGTH(ai_analysis->>'summary')) as max_length
FROM diio_transcripts
WHERE ai_analysis->>'enhancedWithAI' = 'true';
```

### Find transcripts with most keywords:
```sql
SELECT 
  source_name,
  jsonb_array_length(ai_analysis->'keywords') as keyword_count,
  ai_analysis->'keywords' as keywords
FROM diio_transcripts
WHERE ai_analysis->'keywords' IS NOT NULL
ORDER BY keyword_count DESC
LIMIT 10;
```

---

## 📊 Before Running the Script

### Current State Check:
```sql
-- How many transcripts are ready to analyze?
SELECT COUNT(*) FROM diio_transcripts WHERE analyzed_status = 'finished';

-- How much space do we currently use?
SELECT pg_size_pretty(pg_total_relation_size('diio_transcripts'));

-- Check a sample of current ai_analysis data
SELECT 
  id,
  source_name,
  jsonb_pretty(ai_analysis) as current_analysis
FROM diio_transcripts
WHERE analyzed_status = 'finished'
LIMIT 2;
```

---

**Ready to create the script! This document shows you exactly what will be stored and where.** 🎯
