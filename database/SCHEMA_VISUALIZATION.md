# Database Schema Visualization

## Complete Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                                    │
└─────────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│   Zendesk API    │                    │    DIIO API      │
│  (Tickets)       │                    │  (Transcripts)   │
└────────┬─────────┘                    └────────┬─────────┘
         │                                         │
         │ ETL                                     │ ETL
         │ (Python)                                │ (TypeScript)
         ▼                                         ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│ zendesk_conversations    │          │    diio_transcripts      │
│                          │          │                          │
│ • ticket_id (PK)         │          │ • id (UUID, PK)          │
│ • client_id              │          │ • diio_transcript_id     │
│ • conversation (JSONB)   │          │ • transcript_text        │
│ • is_external            │          │ • client_platform_id    │
│ • created_at             │          │ • occurred_at            │
│ • [sentiment fields]     │          │ • ai_analysis (JSONB)     │
│   - sentiment_score      │          │ • analyzed_status        │
│   - overall_sentiment    │          │                          │
│   - aspect_sentiment     │          │                          │
└──────────┬───────────────┘          └──────────┬───────────────┘
           │                                     │
           │ Sentiment Analysis                  │ Sentiment Analysis
           │ (Python: RoBERTa)                   │ (TypeScript: RoBERTa)
           │                                     │
           └─────────────────┬───────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  client_sentiment_aggregator  │
              │           .py                 │
              │                               │
              │ • Fetches tickets by client_id│
              │ • Fetches transcripts by      │
              │   client_platform_id          │
              │ • Calculates weighted score   │
              │ • Classifies sentiment        │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌──────────────────────────────┐
              │  client_sentiment_summary    │
              │                              │
              │ • client_id                  │
              │ • client_final_score         │
              │ • client_sentiment_category  │
              │ • total_zendesk_tickets      │
              │ • total_diio_transcripts     │
              │ • positive/negative/neutral   │
              │ • aspect_sentiment (JSONB)   │
              │ • conclusion                 │
              └──────────────────────────────┘
```

---

## Table Relationships

### zendesk_conversations
```
ticket_id (PK)
    │
    ├─ client_id ────────────┐
    │                        │
    ├─ conversation (JSONB)  │
    │   └─ messages[]         │
    │                        │
    └─ sentiment fields      │
        ├─ sentiment_score   │
        ├─ overall_sentiment  │
        └─ aspect_sentiment  │
                             │
                             │ Aggregated by
                             │ client_id
                             │
                             ▼
```

### diio_transcripts
```
id (UUID, PK)
    │
    ├─ client_platform_id ───┐
    │                        │
    ├─ transcript_text       │
    │                        │
    └─ ai_analysis (JSONB)   │
        ├─ sentimentScore    │
        └─ overallSentiment  │
                             │
                             │ Aggregated by
                             │ client_platform_id
                             │
                             ▼
```

### client_sentiment_summary
```
client_id (from Zendesk)
    │
    ├─ Aggregates from:
    │   ├─ zendesk_conversations (by client_id)
    │   └─ diio_transcripts (by client_platform_id)
    │
    └─ Stores:
        ├─ client_final_score (weighted aggregate)
        ├─ client_sentiment_category
        ├─ total_zendesk_tickets
        ├─ total_diio_transcripts
        └─ conclusion (natural language)
```

---

## Data Flow Details

### Zendesk ETL → Sentiment → Aggregation

**Step 1: ETL** (`etl_pipeline.py`)
```
Input: Zendesk API ticket IDs
Process:
  1. Extract conversation via extract_messaging_conversations.py
  2. Transform to database format
  3. Load to zendesk_conversations table
Output: Raw ticket data in database
```

**Step 2: Sentiment Analysis** (`zendesk_sentiment_analyzer.py`)
```
Input: zendesk_conversations (raw)
Process:
  1. Extract customer messages (author_type='end-user')
  2. Call HuggingFace API (RoBERTa model)
  3. Extract issue categories (payments, card_wallet, etc.)
  4. Apply business-aware adjustments
  5. Update zendesk_conversations table
Output: Analyzed tickets with sentiment scores
```

**Step 3: Client Aggregation** (`client_sentiment_aggregator.py`)
```
Input: 
  - zendesk_conversations (analyzed, by client_id)
  - diio_transcripts (analyzed, by client_platform_id)
Process:
  1. Fetch all tickets for client
  2. Fetch all transcripts for client
  3. Calculate weighted aggregate:
     - Recency weight (recent = 2.0x, old = 0.5x)
     - Sentiment weight (negative = 2.5x, positive = 1.2x)
     - Source weight (Zendesk = 1.0x, DIIO = 0.8x)
  4. Classify: Positive (>0.2) | Neutral (-0.2 to 0.2) | Negative (<-0.2)
  5. Generate conclusion
  6. Save to client_sentiment_summary
Output: Aggregated client sentiment
```

### DIIO ETL → Sentiment → Aggregation

**Step 1: ETL** (`/api/diio/sync-transcripts`)
```
Input: DIIO API (meetings & phone calls)
Process:
  1. Fetch meetings and calls
  2. Extract transcript IDs
  3. Check which are new
  4. Fetch and store transcripts
  5. Load to diio_transcripts table
Output: Raw transcript data in database
```

**Step 2: Sentiment Analysis** (`/api/diio/analyze-transcript`)
```
Input: diio_transcripts (raw)
Process:
  1. Check for cached ai_analysis
  2. If not cached, call HuggingFace API
  3. Generate sentiment analysis
  4. Cache in ai_analysis JSONB column
  5. Update analyzed_status='finished'
Output: Analyzed transcripts with ai_analysis
```

**Step 3: Client Aggregation** (same as Zendesk)
```
Uses same client_sentiment_aggregator.py
Maps client_platform_id → client_id
Combines with Zendesk data
```

---

## Key Database Queries

### Get Client Sentiment Summary
```sql
SELECT 
    client_id,
    client_sentiment_category,
    client_final_score,
    total_zendesk_tickets,
    total_diio_transcripts,
    total_tickets_analyzed,
    positive_percentage,
    negative_percentage,
    conclusion
FROM client_sentiment_summary
WHERE period_start IS NULL  -- All-time summary
ORDER BY client_final_score ASC;
```

### Get Tickets for a Client
```sql
SELECT 
    ticket_id,
    subject,
    created_at,
    overall_sentiment,
    sentiment_score,
    issue_category
FROM zendesk_conversations
WHERE client_id = 'CL005778'
  AND is_external = true
  AND sentiment_analyzed_at IS NOT NULL
ORDER BY created_at DESC;
```

### Get Transcripts for a Client
```sql
SELECT 
    diio_transcript_id,
    transcript_type,
    occurred_at,
    ai_analysis->>'overallSentiment' as sentiment,
    ai_analysis->>'sentimentScore' as score
FROM diio_transcripts
WHERE client_platform_id = 'CL005778'
  AND analyzed_status = 'finished'
  AND ai_analysis IS NOT NULL
ORDER BY occurred_at DESC;
```

---

## Column Mapping Reference

### Zendesk → Aggregation
- `client_id` → `client_sentiment_summary.client_id`
- `sentiment_score` → Weighted in `client_final_score`
- `overall_sentiment` → Counted in `positive_tickets` / `negative_tickets` / `neutral_tickets`
- `aspect_sentiment` → Aggregated in `aspect_sentiment` (JSONB)
- `created_at` → Used for recency weighting

### DIIO → Aggregation
- `client_platform_id` → Maps to `client_sentiment_summary.client_id`
- `ai_analysis.sentimentScore` → Weighted in `client_final_score`
- `ai_analysis.overallSentiment` → Counted in sentiment buckets
- `occurred_at` → Used for recency weighting

---

## Indexes for Performance

### zendesk_conversations
- Primary key: `ticket_id`
- Index: `client_id`
- Index: `is_external`
- Index: `sentiment_analyzed_at`
- Index: `created_at`

### diio_transcripts
- Primary key: `id`
- Unique: `diio_transcript_id`
- Index: `client_platform_id`
- Index: `analyzed_status`
- Index: `occurred_at`
- GIN index: `ai_analysis` (JSONB)

### client_sentiment_summary
- Primary key: `id`
- Unique: `(client_id, period_start, period_end)`
- Index: `client_id`
- Index: `client_sentiment_category`
- Index: `client_final_score`
- Index: `last_updated`

---

## Data Volume Estimates

Based on current data:
- **Zendesk**: 3,324 analyzed tickets, 381 clients
- **DIIO**: 1,178 transcripts, 651 with client_platform_id
- **Aggregated**: 1 summary per client (all-time)

Expected growth:
- ~100-200 new Zendesk tickets per month
- ~50-100 new DIIO transcripts per month
- Aggregation runs daily/weekly

---

## Maintenance Queries

### Check Pipeline Health
```sql
-- Zendesk: Unanalyzed tickets
SELECT COUNT(*) as unanalyzed
FROM zendesk_conversations
WHERE is_external = true
  AND sentiment_analyzed_at IS NULL
  AND conversation IS NOT NULL;

-- DIIO: Unanalyzed transcripts
SELECT COUNT(*) as unanalyzed
FROM diio_transcripts
WHERE analyzed_status = 'pending'
  AND transcript_text IS NOT NULL;

-- Aggregation: Clients without summary
SELECT DISTINCT z.client_id
FROM zendesk_conversations z
LEFT JOIN client_sentiment_summary c ON z.client_id = c.client_id
WHERE z.is_external = true
  AND z.sentiment_analyzed_at IS NOT NULL
  AND c.id IS NULL;
```

---

**Schema Status**: ✅ **COMPLETE AND DOCUMENTED**

