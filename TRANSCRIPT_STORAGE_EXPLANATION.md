# How Transcripts Are Stored in the Database

## Overview

This document explains how the feedback analysis system stores and retrieves transcripts from DIIO in the database. The system handles large volumes of meeting and phone call transcripts efficiently with deduplication, batch processing, and rich metadata storage.

## Database Schema

### Main Transcript Table: `diio_transcripts`

```sql
CREATE TABLE IF NOT EXISTS diio_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_transcript_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's transcript ID
  transcript_text TEXT NOT NULL,
  transcript_type VARCHAR(50) NOT NULL CHECK (transcript_type IN ('meeting', 'phone_call')),
  source_id VARCHAR(255) NOT NULL, -- Meeting ID or Phone Call ID from DIIO
  source_name VARCHAR(500), -- Meeting name or call name
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  attendees JSONB, -- Store attendees as JSON
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  error_cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Supporting Tables

- `diio_users`: User information from DIIO
- `diio_meetings`: Meeting metadata
- `diio_phone_calls`: Phone call metadata
- `diio_transcript_feedback`: Extracted feedback segments

### Indexes for Performance

```sql
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_diio_id ON diio_transcripts(diio_transcript_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_type ON diio_transcripts(transcript_type);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_source_id ON diio_transcripts(source_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_occurred_at ON diio_transcripts(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_created_at ON diio_transcripts(created_at DESC);
```

## Data Flow: How Transcripts Get Stored

### 1. Sync Process Trigger (`/api/diio/sync-transcripts`)

The sync process runs in several steps:

#### Step 1: Fetch Source Data
```typescript
// Fetch all meetings from DIIO API (paginated)
const meetingsData = await diioRequest('/v1/meetings', {
  params: { page: currentPage, limit: 100 }
})

// Fetch all phone calls from DIIO API (paginated)
const phoneCallsData = await diioRequest('/v1/phone_calls', {
  params: { page: currentPage, limit: 100 }
})
```

#### Step 2: Extract Transcript IDs
```typescript
// Get transcript IDs from meetings and calls
const meetingTranscriptIds = meetings
  .filter(m => m.last_transcript_id || m.last_trancript_id)
  .map(m => m.last_transcript_id || m.last_trancript_id)

const phoneCallTranscriptIds = phoneCalls
  .filter(c => c.last_transcript_id || c.last_trancript_id)
  .map(c => c.last_transcript_id || c.last_trancript_id)
```

#### Step 3: Check for Existing Transcripts
```typescript
// Query database in chunks to avoid limits
const { data: existingTranscripts } = await supabase
  .from('diio_transcripts')
  .select('diio_transcript_id')
  .in('diio_transcript_id', chunkOfIds)

// Filter to only new transcripts
const newTranscriptIds = allTranscriptIds.filter(id => !existingIds.has(id))
```

#### Step 4: Fetch and Store New Transcripts
```typescript
for (const transcriptId of newTranscriptIds) {
  // Fetch transcript content from DIIO
  const transcriptData = await diioRequest(`/v1/transcripts/${transcriptId}`)

  // Extract text from various possible response formats
  let transcriptText = ''
  if (Array.isArray(transcriptData)) {
    transcriptText = transcriptData.map(segment => {
      return segment.text || segment.content || segment.transcript ||
             (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) ||
             JSON.stringify(segment)
    }).filter(text => text && text.trim().length > 0).join('\n')
  }

  // Prepare database record
  const transcriptRecord = {
    diio_transcript_id: transcriptId,
    transcript_text: transcriptText,
    transcript_type: source, // 'meeting' or 'phone_call'
    source_id: sourceData?.id || transcriptId,
    source_name: sourceData?.name || 'Unknown',
    occurred_at: sourceData?.scheduled_at || sourceData?.occurred_at || null,
    duration: sourceData?.duration || null,
    attendees: sourceData?.attendees || null,
    analyzed_status: 'pending'
  }

  // Store with upsert (prevents duplicates)
  const { error } = await supabase
    .from('diio_transcripts')
    .upsert(transcriptRecord, {
      onConflict: 'diio_transcript_id',
      ignoreDuplicates: false
    })
}
```

### 2. Batch Processing & Rate Limiting

- **Batch Size**: Processes transcripts in batches of 100
- **Rate Limiting**: 1.5-second delay between individual transcript fetches
- **Chunked Queries**: Database queries use chunks of 100 IDs to avoid Supabase limits
- **Error Handling**: Continues processing even if individual transcripts fail

## Data Retrieval: From Database to Frontend

### 1. Main Retrieval Function

```typescript
const getDiioTranscripts = async (limit = 50, offset = 0) => {
  // Handle large limits by chunking
  if (limit > 10000) {
    let allData = []
    let currentOffset = offset
    const chunkSize = 1000

    while (hasMore) {
      const { data, error } = await supabase
        .from('diio_transcripts')
        .select(`
          id, diio_transcript_id, transcript_text, transcript_type,
          source_id, source_name, occurred_at, duration, attendees,
          ai_analysis, ai_analysis_date, analyzed_status, created_at, updated_at
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + chunkSize - 1)

      allData.push(...(data || []))
      currentOffset += chunkSize
      hasMore = data && data.length === chunkSize
    }

    return { data: allData, error: null }
  }

  // Standard query for smaller limits
  const { data, error } = await supabase
    .from('diio_transcripts')
    .select(`...`) // Same fields as above
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}
```

### 2. Statistics Function

```typescript
const getDiioTranscriptStats = async () => {
  const { data, error } = await supabase.rpc('get_diio_transcript_stats')
  return { data: data?.[0] || null, error }
}
```

Database function returns:
```sql
CREATE OR REPLACE FUNCTION get_diio_transcript_stats()
RETURNS TABLE (
    total_transcripts BIGINT,
    meeting_transcripts BIGINT,
    phone_call_transcripts BIGINT,
    pending_analysis BIGINT,
    finished_analysis BIGINT,
    error_analysis BIGINT,
    latest_transcript_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'meeting') as meeting_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'phone_call') as phone_call_transcripts,
        COUNT(*) FILTER (WHERE analyzed_status = 'pending') as pending_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'finished') as finished_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'error') as error_analysis,
        MAX(created_at) as latest_transcript_date
    FROM diio_transcripts;
END;
$$ LANGUAGE plpgsql;
```

## Key Features & Benefits

### 1. **Deduplication**
- Uses `diio_transcript_id` as unique constraint
- Upsert operations prevent duplicate storage
- Efficient existence checking before fetching

### 2. **Rich Metadata Storage**
- **Attendees**: Stored as JSONB for flexible attendee structures
- **Timestamps**: Occurrence time, creation time, analysis time
- **Source Info**: Links back to original meetings/calls
- **Status Tracking**: Analysis state and error handling

### 3. **Performance Optimizations**
- **Pagination**: Frontend handles large datasets efficiently
- **Chunking**: Database queries avoid limits
- **Indexing**: Fast lookups on commonly queried fields
- **Views**: Pre-computed joins for complex queries

### 4. **Error Resilience**
- **Graceful Failures**: Individual transcript failures don't stop the sync
- **Status Tracking**: Clear indication of processing state
- **Retry Logic**: Failed transcripts can be retried

### 5. **Scalability**
- **Batch Processing**: Handles thousands of transcripts efficiently
- **Rate Limiting**: Respects API limits
- **Background Processing**: Non-blocking sync operations

## Integration Points

### Frontend Display (`pages/diio.vue`)
- Lists transcripts with filtering and pagination
- Shows full `diio_transcript_id` for easy identification
- Provides view, analysis, and feedback extraction actions

### AI Analysis (`/api/diio/analyze-transcript`)
- Processes stored transcripts for sentiment analysis
- Updates `ai_analysis` field with results
- Changes `analyzed_status` to 'finished'

### Feedback Extraction (`/api/diio/extract-feedback`)
- Automatically triggered after sync
- Creates detailed feedback segments
- Links back to source transcripts

## Data Flow Summary

```
DIIO API → Sync API → Database Storage → Frontend Display → AI Analysis → Feedback Extraction
     ↓          ↓            ↓              ↓              ↓              ↓
  Raw data   Batch fetch   diio_transcripts   UI views   Sentiment    Segments
  (JSON)     (rate limited)  (indexed)     (paginated)  analysis    extraction
```

This architecture ensures reliable, scalable, and efficient handling of large volumes of transcript data while maintaining data integrity and providing rich analytical capabilities.
