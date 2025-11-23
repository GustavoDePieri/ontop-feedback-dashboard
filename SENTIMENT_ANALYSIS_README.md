# 🎯 Sentiment Analysis for Target Accounts

This guide explains how to use the new sentiment analysis features for analyzing transcripts from your 117 target accounts.

## 🚀 Quick Start

### 1. Add Your Target Accounts

Edit `target_accounts.json` and add your 117 account IDs:

```json
{
  "description": "List of 117 target accounts for sentiment analysis",
  "accounts": [
    "CL001234",
    "CL005678",
    "CL009012"
    // ... add all 117 account IDs
  ],
  "lastUpdated": "2025-01-23",
  "totalAccounts": 117
}
```

### 2. Test the Current Model

1. Go to `/diio` page in your app
2. Click the **"🧪 Test Sentiment Analysis"** button
3. This will analyze 5 unanalyzed transcripts and show results

### 3. Run Bulk Analysis on Target Accounts

```bash
# Run analysis on all target accounts
python run_bulk_sentiment_analysis.py
```

## 📊 API Endpoints

### `/api/diio/bulk-sentiment-analysis` (POST)

Bulk sentiment analysis for multiple accounts.

**Request:**
```json
{
  "accountIds": ["CL001234", "CL005678"],
  "limit": 50,
  "skipAnalyzed": true,
  "forceReanalysis": false
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalAccounts": 2,
    "accountsWithTranscripts": 2,
    "totalTranscripts": 15,
    "transcriptsAnalyzed": 12,
    "transcriptsSkipped": 3,
    "analysisErrors": 0
  },
  "results": [
    {
      "accountId": "CL001234",
      "accountName": "Company A",
      "transcriptCount": 8,
      "analyzedCount": 6,
      "averageSentiment": 0.234,
      "churnRisk": "medium",
      "sentimentDistribution": {
        "positive": 3,
        "neutral": 2,
        "negative": 1
      },
      "transcripts": [...]
    }
  ]
}
```

### `/api/diio/analyze-transcript` (POST)

Analyze a single transcript.

**Request:**
```json
{
  "transcriptId": "uuid-of-transcript"
}
```

## 🎯 How It Works

### Current Model: `cardiffnlp/twitter-xlm-roberta-base-sentiment`

- **Architecture:** XLM-RoBERTa (multilingual transformer)
- **Training Data:** 198M tweets in 8 languages
- **Output:** 3-class sentiment (Positive/Neutral/Negative)
- **Limitations:** Trained on social media, not business transcripts

### Analysis Process

1. **Text Extraction:** Clean and format transcript text
2. **Sentiment Classification:** Run through Hugging Face model
3. **Risk Assessment:** Calculate churn risk based on sentiment patterns
4. **Caching:** Store results to avoid re-analysis
5. **Aggregation:** Combine transcript-level results into account-level insights

### Churn Risk Calculation

- **Low Risk:** Mostly positive sentiment
- **Medium Risk:** Some negative sentiment, average score > -0.1
- **High Risk:** Significant negative sentiment, average score < -0.3
- **Critical Risk:** Strong negative patterns, individual scores < -0.8

## 📈 Results Interpretation

### Account-Level Metrics
- **Average Sentiment:** -1.0 (very negative) to +1.0 (very positive)
- **Churn Risk:** Overall risk assessment for the account
- **Sentiment Distribution:** Breakdown of positive/neutral/negative transcripts

### Transcript-Level Insights
- **Overall Sentiment:** positive/neutral/negative
- **Sentiment Score:** Confidence-adjusted score
- **Churn Risk:** Individual transcript risk level
- **Customer Satisfaction:** satisfied/neutral/frustrated/at_risk

## 🖥️ Local Analysis (FREE & FAST!)

For processing your 117 accounts, **local analysis is recommended**:

### Why Local Analysis?
- ✅ **Completely FREE** - No API costs
- ✅ **No rate limits** - Process all 117 accounts at once
- ✅ **Much faster** - 10-50x faster than API calls
- ✅ **Privacy** - Data stays on your machine
- ✅ **Caching** - Uses existing cached results

### Setup Local Analysis

1. **Install dependencies:**
```bash
pip install transformers torch numpy scipy supabase python-dotenv
```

2. **(Optional) Pre-download the model:**
```bash
python download_model.py
```
This downloads the ~1.7GB model so you can run analysis offline later.

3. **Add your account IDs to `target_accounts.json`:**
```json
{
  "accounts": ["CL001234", "CL005678", "CL009012"],
  "lastUpdated": "2025-01-23",
  "totalAccounts": 117
}
```

4. **Run local analysis:**
```bash
python local_sentiment_db.py
```

## 📊 CSV Output Formats

### **Main Results CSV: `local_sentiment_analysis_results.csv`**

Contains both account-level summaries and individual transcript details:

**Account Summary Rows:**
- `account_id`: Client platform ID (e.g., CL001234)
- `account_name`: Account name
- `transcript_count`: Total transcripts for this account
- `analyzed_count`: Number of transcripts analyzed
- `average_sentiment`: Average sentiment score (-1 to +1)
- `churn_risk`: Account-level risk (low/medium/high/critical)
- `sentiment_positive`: Count of positive transcripts
- `sentiment_neutral`: Count of neutral transcripts
- `sentiment_negative`: Count of negative transcripts

**Transcript Detail Rows:**
- `transcript_id`: Individual transcript UUID
- `source_name`: Call/meeting name
- `occurred_at`: Date/time of transcript
- `sentiment_label`: positive/neutral/negative
- `sentiment_score`: Confidence score (-1 to +1)
- `confidence`: Model confidence (0-1)
- `churn_risk_individual`: Individual transcript risk
- `customer_satisfaction`: satisfied/neutral/frustrated/at_risk
- `cached`: Whether result was from cache

### **High-Risk Report CSV: `high_risk_accounts_report.csv`**

Focused report for urgent action items:

**Columns:**
- `priority`: Ranking (1 = highest priority)
- `account_id`: Client platform ID
- `account_name`: Account name
- `churn_risk_level`: CRITICAL/HIGH
- `average_sentiment`: Average sentiment score
- `transcript_count`: Total transcripts
- `negative_transcripts`: Number of negative transcripts
- `most_negative_transcript`: Name of most negative interaction
- `most_negative_score`: Lowest sentiment score
- `recommendation`: Actionable next steps

### **CSV Usage Tips**

**Open in Excel/Google Sheets:**
```bash
# The CSV files can be opened directly in Excel or Google Sheets
# Filter by churn_risk to focus on high-priority accounts
# Sort by average_sentiment to find most dissatisfied customers
```

**Power BI/Tableau Analysis:**
- Use `sentiment_positive/neutral/negative` for stacked bar charts
- Filter by `churn_risk` for risk heatmaps
- Create dashboards showing sentiment trends over time

## 📥 Model Download Details

### Automatic Download
- **When:** First time you run `local_sentiment_db.py` or `download_model.py`
- **Size:** ~1.7GB (XLM-RoBERTa model)
- **Time:** 5-15 minutes (depends on internet speed)
- **Location:** `~/.cache/huggingface/transformers/`

### Manual Download (Recommended)
```bash
python download_model.py
```
**Benefits:**
- ✅ Download once, use forever (even offline)
- ✅ See progress and any errors
- ✅ Verify model works before processing data
- ✅ No surprises during analysis

### What Gets Downloaded
- **Tokenizer:** Text preprocessing (~400MB)
- **Model:** XLM-RoBERTa sentiment classifier (~1.3GB)
- **Config:** Model settings and label mappings
- **Total:** ~1.7GB one-time download

### Local Results
- **JSON Output:** `local_sentiment_analysis_results.json` (full detailed data)
- **CSV Output:** `local_sentiment_analysis_results.csv` (spreadsheet-friendly)
- **High-Risk Report:** `high_risk_accounts_report.csv` (prioritized action items)
- **Speed:** ~5-10 transcripts per second
- **Memory:** ~3-4GB RAM required
- **Storage:** ~1.7GB for model (downloaded once)

## 🛠️ Configuration

### Environment Variables (for both local and API)
```env
HUGGINGFACE_API_KEY=your-huggingface-api-key  # Only needed for API version
VERCEL_URL=https://your-app.vercel.app         # Only needed for API version
SUPABASE_URL=your-supabase-url                # Needed for local database access
SUPABASE_ANON_KEY=your-supabase-anon-key      # Needed for local database access
```

### Model Configuration
The model settings are hardcoded in the API endpoints. To change models:

1. Update `server/api/diio/bulk-sentiment-analysis.post.ts`
2. Update `server/api/diio/analyze-transcript.post.ts`
3. Test with sample data before deploying

## 🚨 Troubleshooting

### Common Issues

**"HuggingFace API key not configured"**
- Check that `HUGGINGFACE_API_KEY` is set in Vercel environment variables

**"No transcripts found for account"**
- Verify account IDs are correct in `target_accounts.json`
- Check that transcripts exist in the database for those accounts

**Timeout errors**
- Reduce the number of accounts per request
- Increase Vercel's function timeout limit

**Low accuracy**
- Model was trained on Twitter data, not call transcripts
- Consider fine-tuning on domain-specific data

### Performance Optimization

- **Caching:** Results are cached to avoid re-analysis
- **Batching:** Process accounts in reasonable batches
- **Rate Limiting:** Hugging Face has API limits (60 req/min free tier)

## 🔄 Next Steps

### Phase 2: Model Improvement
1. **Fine-tune** the model on call center transcripts
2. **Evaluate accuracy** against human-labeled data
3. **Consider alternatives** like domain-specific models

### Phase 3: Advanced Features
1. **Aspect-based sentiment** (sentiment per topic)
2. **Speaker identification** (customer vs. agent sentiment)
3. **Temporal analysis** (sentiment changes over time)
4. **Integration** with existing churn prediction models

## 📞 Support

For issues with sentiment analysis:
1. Check Vercel function logs
2. Test with individual transcripts first
3. Verify account IDs and data availability
4. Review model limitations and accuracy expectations

---

**Status:** ✅ Deployed and ready for testing
**Model:** cardiffnlp/twitter-xlm-roberta-base-sentiment
**Coverage:** 117 target accounts sentiment analysis
