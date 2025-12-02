# Client Sentiment Aggregator Integration Guide

## Overview

The `client_sentiment_aggregator.py` script aggregates sentiment scores from both **Zendesk tickets** and **DIIO transcripts** into a unified `client_sentiment_summary` table.

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│  zendesk_conversations│         │   diio_transcripts   │
│  (Zendesk table)     │         │   (DIIO table)      │
└──────────┬──────────┘         └──────────┬──────────┘
           │                                │
           │ client_id                      │ client_platform_id
           │                                │
           └────────────┬───────────────────┘
                        │
                        ▼
           ┌────────────────────────────┐
           │ client_sentiment_aggregator │
           │      .py                    │
           └────────────┬────────────────┘
                        │
                        ▼
           ┌────────────────────────────┐
           │ client_sentiment_summary    │
           │      (Aggregated table)     │
           └────────────────────────────┘
```

## Setup Steps

### 1. Create Database Table

Run the schema file in your Supabase SQL Editor:

```sql
-- Run: database/schema_client_sentiment_summary.sql
```

This creates:
- `client_sentiment_summary` table
- Indexes for performance
- Views for easier querying
- RLS policies

### 2. Client ID Mapping

**Important:** The script needs to map between:
- **Zendesk**: `client_id` (e.g., `CL004114`)
- **DIIO**: `client_platform_id` (e.g., `CL004114` or different format)

**Current Behavior:**
- Script assumes `client_id` = `client_platform_id` by default
- If they differ, you need to provide a mapping

**Option A: If IDs match (recommended)**
- Ensure DIIO transcripts have `client_platform_id` set to match Zendesk `client_id`
- Run the matching scripts:
  ```bash
  python scripts/match_transcripts_with_churned_accounts.py
  python scripts/update_transcripts_with_churned_accounts.py
  python scripts/match_transcripts_with_active_accounts.py
  ```

**Option B: If IDs differ**
- Create a mapping table or CSV file
- Modify `process_client_sentiment()` to use the mapping
- Example mapping structure:
  ```json
  {
    "CL004114": "DIIO-PLATFORM-123",
    "CL004115": "DIIO-PLATFORM-456"
  }
  ```

### 3. Verify Data Sources

**Zendesk Requirements:**
- Table: `zendesk_conversations`
- Required columns:
  - `ticket_id` (unique)
  - `client_id` (not null)
  - `is_external` = true
  - `sentiment_analyzed_at` (not null)
  - `sentiment_score` (not null)
  - `overall_sentiment`
  - `aspect_sentiment` (JSONB)
  - `created_at`

**DIIO Requirements:**
- Table: `diio_transcripts`
- Required columns:
  - `id` (UUID)
  - `diio_transcript_id` (unique)
  - `client_platform_id` (not null for matching)
  - `occurred_at`
  - `ai_analysis` (JSONB with sentiment data)
  - `analyzed_status` = 'finished'

### 4. Run the Aggregator

**Process all clients:**
```bash
python scripts/client_sentiment_aggregator.py
```

**Process specific client:**
```bash
python scripts/client_sentiment_aggregator.py --client CL004114
```

**Process last 30 days:**
```bash
python scripts/client_sentiment_aggregator.py --period-days 30
```

**Recalculate all:**
```bash
python scripts/client_sentiment_aggregator.py --recalculate
```

## How It Works

### 1. Data Fetching

**Zendesk Tickets:**
```python
get_client_tickets(client_id)
  → Queries: zendesk_conversations
  → Filters: is_external=True, sentiment_analyzed_at IS NOT NULL
  → Returns: List of tickets with sentiment scores
```

**DIIO Transcripts:**
```python
get_client_diio_transcripts(client_platform_id)
  → Queries: diio_transcripts
  → Filters: analyzed_status='finished', ai_analysis IS NOT NULL
  → Extracts: sentimentScore, overallSentiment from ai_analysis JSONB
  → Returns: List of transcripts with sentiment scores
```

### 2. Weighted Score Calculation

The script calculates a weighted aggregate score:

```
Weighted Score = Σ(ItemScore_i × WeightFactor_i) / Σ(WeightFactor_i)
```

**Weight Factors:**
- **Recency Weight:**
  - Last 7 days: 2.0x
  - Last 30 days: 1.5x
  - Last 90 days: 1.0x
  - Older: 0.5x

- **Sentiment Weight:**
  - Negative: 2.5x (issues matter more)
  - Neutral: 1.0x
  - Positive: 1.2x

- **Source Weight:**
  - Zendesk tickets: 1.0x (more structured)
  - DIIO transcripts: 0.8x (more conversational)

### 3. Classification

```
Positive:  score > 0.2
Neutral:   -0.2 <= score <= 0.2
Negative:  score < -0.2
```

### 4. Saving to Database

The script saves to `client_sentiment_summary` with:
- Aggregated scores
- Counts (tickets + transcripts)
- Percentages
- Aspect sentiment (from Zendesk)
- Natural language conclusion

## Troubleshooting

### Issue: "No clients found with analyzed tickets"

**Solution:**
1. Run Zendesk sentiment analysis first:
   ```bash
   python scripts/zendesk_sentiment_analyzer.py --all-clients
   ```

2. Verify tickets have `sentiment_analyzed_at` set:
   ```sql
   SELECT COUNT(*) FROM zendesk_conversations 
   WHERE is_external = true 
   AND sentiment_analyzed_at IS NOT NULL;
   ```

### Issue: "No analyzed transcripts found for client"

**Solution:**
1. Run DIIO sentiment analysis (via TypeScript API or create Python script)
2. Verify transcripts have `ai_analysis`:
   ```sql
   SELECT COUNT(*) FROM diio_transcripts 
   WHERE analyzed_status = 'finished' 
   AND ai_analysis IS NOT NULL;
   ```

3. Check `client_platform_id` matches `client_id`:
   ```sql
   SELECT DISTINCT client_platform_id FROM diio_transcripts 
   WHERE client_platform_id IS NOT NULL;
   ```

### Issue: "Table client_sentiment_summary does not exist"

**Solution:**
Run the schema file:
```sql
-- In Supabase SQL Editor
-- Copy and run: database/schema_client_sentiment_summary.sql
```

### Issue: Client IDs don't match between Zendesk and DIIO

**Solution:**
1. Check the mapping:
   ```sql
   -- Zendesk client IDs
   SELECT DISTINCT client_id FROM zendesk_conversations 
   WHERE client_id IS NOT NULL LIMIT 10;
   
   -- DIIO client platform IDs
   SELECT DISTINCT client_platform_id FROM diio_transcripts 
   WHERE client_platform_id IS NOT NULL LIMIT 10;
   ```

2. If they differ, create a mapping file and modify the script

## Testing

**Test with one client:**
```bash
python scripts/client_sentiment_aggregator.py --client CL004114
```

**Verify results:**
```sql
SELECT * FROM client_sentiment_summary 
WHERE client_id = 'CL004114';
```

**Check aggregation:**
```sql
SELECT 
    client_id,
    client_sentiment_category,
    client_final_score,
    total_zendesk_tickets,
    total_diio_transcripts,
    total_tickets_analyzed,
    last_calculated_at
FROM client_sentiment_summary
ORDER BY client_final_score ASC
LIMIT 10;
```

## Next Steps

1. ✅ Create `client_sentiment_summary` table
2. ✅ Run matching scripts to set `client_platform_id` in DIIO transcripts
3. ✅ Run Zendesk sentiment analysis
4. ✅ Run DIIO sentiment analysis
5. ✅ Run client sentiment aggregator
6. ✅ Verify results in database
7. ✅ Integrate with dashboard/UI

## Automation

You can schedule this to run periodically:

**Cron example (daily at 2 AM):**
```bash
0 2 * * * cd /path/to/project && python scripts/client_sentiment_aggregator.py
```

**Or use Vercel Cron:**
```json
{
  "crons": [{
    "path": "/api/cron/aggregate-sentiment",
    "schedule": "0 2 * * *"
  }]
}
```

