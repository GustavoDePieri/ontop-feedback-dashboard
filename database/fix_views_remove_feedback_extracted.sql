-- =====================================================
-- Fix Views - Remove feedback_extracted References
-- =====================================================
-- This fixes any views that might be referencing the removed feedback_extracted column
-- Run this in your Supabase SQL Editor

-- Drop and recreate views that might reference feedback_extracted
DROP VIEW IF EXISTS diio_transcripts_with_ai CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_sentiment CASCADE;
DROP VIEW IF EXISTS diio_transcripts_summary CASCADE;

-- Recreate diio_transcripts_with_sentiment view (without feedback_extracted)
CREATE OR REPLACE VIEW diio_transcripts_with_sentiment AS
SELECT 
    id,
    diio_transcript_id,
    transcript_type,
    source_name,
    occurred_at,
    duration,
    attendees,
    sentiment,
    sentiment_score,
    positive_meetings,
    neutral_meetings,
    negative_meetings,
    avg_sentiment_meetings,
    client_platform_id,
    account_name,
    account_status,
    summary,
    analyzed_status,
    created_at,
    updated_at
FROM diio_transcripts
WHERE sentiment IS NOT NULL
ORDER BY occurred_at DESC;

-- Recreate diio_transcripts_needs_sentiment view (without feedback_extracted)
CREATE OR REPLACE VIEW diio_transcripts_needs_sentiment AS
SELECT 
    id,
    diio_transcript_id,
    transcript_type,
    source_name,
    occurred_at,
    attendees,
    analyzed_status,
    created_at
FROM diio_transcripts
WHERE sentiment IS NULL OR analyzed_status = 'pending'
ORDER BY occurred_at DESC;

-- Verify views were created
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'diio_transcripts%'
ORDER BY table_name;













