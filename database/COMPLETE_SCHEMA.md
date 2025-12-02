# Complete Database Schema Documentation

## Overview

This document describes the complete database schema for the Churn Dashboard pipeline, including Zendesk, DIIO, and aggregated sentiment data.

---

## Table: `zendesk_conversations`

**Purpose**: Stores complete Zendesk ticket conversations with sentiment analysis results.

### Core Ticket Fields
- `ticket_id` (INTEGER, PRIMARY KEY) - Zendesk ticket ID
- `subject` (VARCHAR) - Ticket subject
- `status` (VARCHAR) - Ticket status (open, solved, closed, etc.)
- `priority` (VARCHAR) - Ticket priority
- `created_at` (TIMESTAMP) - When ticket was created
- `updated_at` (TIMESTAMP) - Last update time
- `via_channel` (VARCHAR) - Channel (messaging, web, email, etc.)

### Business Identifiers
- `client_id` (VARCHAR) - Client identifier (e.g., CL004114)
- `client_name` (VARCHAR) - Client name
- `worker_id` (VARCHAR) - Worker identifier (e.g., CR053531)
- `worker_name` (VARCHAR) - Worker name
- `worker_email` (VARCHAR) - Worker email
- `contract_id` (VARCHAR) - Contract identifier
- `requester_id` (INTEGER) - Zendesk requester ID
- `requester_name` (VARCHAR) - Requester name
- `requester_email` (VARCHAR) - Requester email
- `is_external` (BOOLEAN) - True if ticket from external user (worker/client)

### Assignment Fields
- `assignee_id` (INTEGER) - Assigned agent ID
- `assignee_name` (VARCHAR) - Assigned agent name
- `assignee_email` (VARCHAR) - Assigned agent email
- `group_id` (INTEGER) - Support group ID
- `group_name` (VARCHAR) - Support group name
- `organization_id` (INTEGER) - Organization ID

### Classification
- `category` (VARCHAR) - Issue category (from custom fields)
- `type_of_request` (VARCHAR) - Request type (from custom fields)
- `tags` (JSONB) - Array of tags

### Conversation Data
- `conversation` (JSONB) - Complete conversation array
  ```json
  [
    {
      "message_id": "...",
      "timestamp": "...",
      "author_name": "...",
      "author_type": "end-user" | "agent" | "system",
      "message_text": "...",
      "message_type": "text" | "image"
    }
  ]
  ```
- `conversation_source` (VARCHAR) - Source: 'messaging' | 'comments_api' | 'none'
- `total_messages` (INTEGER) - Total message count
- `customer_messages_count` (INTEGER) - Customer message count
- `agent_messages_count` (INTEGER) - Agent message count

### SLA Metrics
- `reply_time_in_minutes` (INTEGER) - Time to first reply
- `first_resolution_time_in_minutes` (INTEGER) - Time to first resolution
- `full_resolution_time_in_minutes` (INTEGER) - Time to full resolution
- `reply_time_breached` (BOOLEAN) - Reply SLA breached
- `first_resolution_time_breached` (BOOLEAN) - First resolution SLA breached
- `full_resolution_time_breached` (BOOLEAN) - Full resolution SLA breached
- `initially_assigned_at` (TIMESTAMP) - When first assigned
- `solved_at` (TIMESTAMP) - When solved

### Sentiment Analysis Fields
- `sentiment_analyzed_at` (TIMESTAMP) - When sentiment was analyzed
- `overall_sentiment` (VARCHAR) - 'positive' | 'neutral' | 'negative'
- `sentiment_score` (FLOAT) - Numerical score (-1.0 to 1.0)
- `sentiment_scores` (JSONB) - Detailed sentiment per message
- `aspect_sentiment` (JSONB) - Ontop-specific aspect sentiment
  ```json
  {
    "payments": 0.85,
    "card_wallet": 0.30,
    "contracts": 0.0,
    "compliance": 0.0,
    "support": 0.45
  }
  ```
- `issue_category` (VARCHAR) - Extracted issue category

### Indexes
- Primary key on `ticket_id`
- Index on `client_id`
- Index on `is_external`
- Index on `created_at`
- Index on `sentiment_analyzed_at`

---

## Table: `diio_transcripts`

**Purpose**: Stores DIIO call/meeting transcripts with AI sentiment analysis.

### Core Fields
- `id` (UUID, PRIMARY KEY) - Internal database ID
- `diio_transcript_id` (VARCHAR, UNIQUE) - DIIO's transcript ID
- `transcript_text` (TEXT) - Full transcript text
- `transcript_type` (VARCHAR) - 'meeting' | 'phone_call'
- `source_id` (VARCHAR) - Meeting ID or call ID from DIIO
- `source_name` (VARCHAR) - Meeting/call name
- `occurred_at` (TIMESTAMP) - When the call/meeting occurred
- `duration` (INTEGER) - Duration in seconds
- `attendees` (JSONB) - Attendees structure
  ```json
  {
    "sellers": [
      {"name": "...", "email": "..."}
    ],
    "customers": [
      {"name": "...", "email": "..."}
    ]
  }
  ```

### Account Mapping
- `client_platform_id` (VARCHAR) - Client platform ID (maps to client_id)
- `account_name` (VARCHAR) - Account name
- `account_status` (VARCHAR) - 'active' | 'churned' | 'trial' | 'paused'

### AI Analysis
- `ai_analysis` (JSONB) - Cached AI sentiment analysis
  ```json
  {
    "overallSentiment": "positive" | "neutral" | "negative",
    "sentimentScore": -1.0 to 1.0,
    "customerSatisfaction": "satisfied" | "neutral" | "frustrated" | "at_risk",
    "churnRisk": "low" | "medium" | "high" | "critical",
    "churnSignals": ["..."],
    "keyThemes": [...],
    "painPoints": ["..."],
    "positiveHighlights": ["..."],
    "actionableInsights": [...],
    "summary": "..."
  }
  ```
- `ai_analysis_date` (TIMESTAMP) - When analysis was performed
- `analyzed_status` (VARCHAR) - 'pending' | 'finished' | 'error'

### Legacy Sentiment Fields (may not be used)
- `sentiment` (VARCHAR) - 'positive' | 'neutral' | 'negative' | 'mixed'
- `sentiment_score` (FLOAT) - Sentiment score
- `positive_meetings` (INTEGER)
- `neutral_meetings` (INTEGER)
- `negative_meetings` (INTEGER)
- `avg_sentiment_meetings` (FLOAT)

### Metadata
- `created_at` (TIMESTAMP) - When record was created
- `updated_at` (TIMESTAMP) - Last update time

### Indexes
- Primary key on `id`
- Unique index on `diio_transcript_id`
- Index on `client_platform_id`
- Index on `analyzed_status`
- Index on `occurred_at`
- Index on `account_status`

---

## Table: `client_sentiment_summary`

**Purpose**: Aggregated sentiment scores per client, combining Zendesk tickets and DIIO transcripts.

### Core Fields
- `id` (UUID, PRIMARY KEY) - Internal ID
- `client_id` (VARCHAR, NOT NULL) - Client identifier (from Zendesk)
- `period_start` (TIMESTAMP) - Period start (NULL = all-time)
- `period_end` (TIMESTAMP) - Period end (NULL = all-time)

### Counts
- `total_tickets_analyzed` (INTEGER) - Combined total (tickets + transcripts)
- `total_zendesk_tickets` (INTEGER) - Zendesk tickets only
- `total_diio_transcripts` (INTEGER) - DIIO transcripts only

### Sentiment Counts
- `positive_tickets` (INTEGER) - Count of positive items
- `negative_tickets` (INTEGER) - Count of negative items
- `neutral_tickets` (INTEGER) - Count of neutral items

### Percentages
- `positive_percentage` (NUMERIC) - Percentage positive
- `negative_percentage` (NUMERIC) - Percentage negative
- `neutral_percentage` (NUMERIC) - Percentage neutral

### Aggregated Scores
- `client_final_score` (NUMERIC) - Weighted sentiment score (-1.0 to 1.0)
- `client_sentiment_category` (VARCHAR) - 'Positive' | 'Neutral' | 'Negative'

### Analysis Data
- `aspect_sentiment` (JSONB) - Aspect-level sentiment from Zendesk
  ```json
  {
    "payments": -0.5,
    "card_wallet": -0.3,
    "support": 0.2
  }
  ```
- `negative_aspects_summary` (TEXT) - Comma-separated negative aspects
- `conclusion` (TEXT) - Natural language conclusion

### Timestamps
- `last_updated` (TIMESTAMP) - Last update time
- `last_calculated_at` (TIMESTAMP) - When aggregation was calculated

### Constraints
- Unique constraint on `(client_id, period_start, period_end)`

### Indexes
- Index on `client_id`
- Index on `client_sentiment_category`
- Index on `client_final_score`
- Index on `(period_start, period_end)`
- Index on `last_updated`

---

## Data Flow

### Zendesk Pipeline

```
1. ETL (etl_pipeline.py)
   Zendesk API → extract_messaging_conversations.py
   → zendesk_conversations table (raw data)

2. Sentiment Analysis (zendesk_sentiment_analyzer.py)
   zendesk_conversations (raw)
   → HuggingFace API (RoBERTa)
   → zendesk_conversations (with sentiment fields)

3. Client Aggregation (client_sentiment_aggregator.py)
   zendesk_conversations (analyzed)
   → client_sentiment_summary (aggregated)
```

### DIIO Pipeline

```
1. ETL (TypeScript: /api/diio/sync-transcripts)
   DIIO API → diio_transcripts table (raw data)

2. Sentiment Analysis (TypeScript: /api/diio/analyze-transcript)
   diio_transcripts (raw)
   → HuggingFace API (RoBERTa)
   → diio_transcripts (with ai_analysis JSONB)

3. Client Aggregation (client_sentiment_aggregator.py)
   diio_transcripts (analyzed)
   → client_sentiment_summary (aggregated)
```

### Combined Aggregation

```
client_sentiment_aggregator.py:
  ├─ Fetch Zendesk tickets (by client_id)
  ├─ Fetch DIIO transcripts (by client_platform_id)
  ├─ Calculate weighted aggregate score
  ├─ Classify sentiment category
  └─ Save to client_sentiment_summary
```

---

## Key Relationships

### Client ID Mapping

- **Zendesk**: Uses `client_id` (e.g., `CL004114`)
- **DIIO**: Uses `client_platform_id` (should match `client_id`)
- **Aggregation**: Maps `client_id` ↔ `client_platform_id` (assumes they match)

### Sentiment Score Normalization

- **Zendesk**: `sentiment_score` (-1.0 to 1.0)
- **DIIO**: `ai_analysis.sentimentScore` (-1.0 to 1.0)
- **Aggregation**: Both normalized to same scale for weighted calculation

---

## Query Examples

### Get all analyzed tickets for a client
```sql
SELECT * FROM zendesk_conversations
WHERE client_id = 'CL004114'
  AND is_external = true
  AND sentiment_analyzed_at IS NOT NULL;
```

### Get all analyzed transcripts for a client
```sql
SELECT * FROM diio_transcripts
WHERE client_platform_id = 'CL004114'
  AND analyzed_status = 'finished'
  AND ai_analysis IS NOT NULL;
```

### Get client sentiment summary
```sql
SELECT * FROM client_sentiment_summary
WHERE client_id = 'CL004114'
  AND period_start IS NULL  -- All-time summary
  AND period_end IS NULL;
```

### Get clients with negative sentiment
```sql
SELECT * FROM client_sentiment_summary
WHERE client_sentiment_category = 'Negative'
ORDER BY client_final_score ASC;
```

