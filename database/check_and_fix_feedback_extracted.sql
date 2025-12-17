-- =====================================================
-- Check and Fix feedback_extracted Column References
-- =====================================================
-- This script checks for any views or queries that reference feedback_extracted
-- and fixes them. Run this in your Supabase SQL Editor.

-- Step 1: Check if column exists (it shouldn't after cleanup)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name = 'feedback_extracted';

-- Step 2: Check all views that reference diio_transcripts
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND (view_definition LIKE '%feedback_extracted%' OR view_definition LIKE '%diio_transcripts%')
ORDER BY table_name;

-- Step 3: Drop any views that might reference feedback_extracted
DROP VIEW IF EXISTS diio_transcripts_summary CASCADE;
DROP VIEW IF EXISTS diio_transcripts_with_ai CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_ai CASCADE;
DROP VIEW IF EXISTS diio_transcript_feedback_summary CASCADE;

-- Step 4: Recreate clean views (from cleanup_and_restructure.sql)
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

-- Step 5: Verify views are clean
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'diio_transcripts%'
ORDER BY table_name;
















