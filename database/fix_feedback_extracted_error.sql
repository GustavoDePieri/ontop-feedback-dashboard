-- =====================================================
-- Quick Fix: Remove feedback_extracted Column References
-- =====================================================
-- Run this in Supabase SQL Editor to fix the error:
-- "column diio_transcripts.feedback_extracted does not exist"

-- Step 1: Drop all views that might reference the column
DROP VIEW IF EXISTS diio_transcripts_summary CASCADE;
DROP VIEW IF EXISTS diio_transcripts_with_ai CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_ai CASCADE;
DROP VIEW IF EXISTS diio_transcript_feedback_summary CASCADE;
DROP VIEW IF EXISTS diio_transcripts_with_sentiment CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_sentiment CASCADE;

-- Step 2: Ensure the column doesn't exist (drop if it does)
ALTER TABLE diio_transcripts 
DROP COLUMN IF EXISTS feedback_extracted,
DROP COLUMN IF EXISTS feedback_extraction_date,
DROP COLUMN IF EXISTS feedback_segments_count;

-- Step 3: Recreate clean views (without feedback_extracted)
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

-- Step 4: Verify fix
SELECT 
    'Column check' as check_type,
    COUNT(*) as feedback_extracted_exists
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name = 'feedback_extracted';

-- Should return 0 (column doesn't exist)


