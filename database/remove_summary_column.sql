-- =====================================================
-- Remove Summary Column from diio_transcripts
-- =====================================================
-- This script will:
-- 1. Clear all summary content (set to NULL)
-- 2. Remove the summary column entirely
--
-- ⚠️ WARNING: This will permanently delete all summary data!
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Clear all summary content
UPDATE diio_transcripts
SET summary = NULL
WHERE summary IS NOT NULL;

-- Step 2: Verify summaries are cleared
SELECT 
    COUNT(*) as total_transcripts,
    COUNT(summary) as transcripts_with_summary,
    COUNT(*) FILTER (WHERE summary IS NULL) as transcripts_without_summary
FROM diio_transcripts;

-- Step 3: Drop the summary column
ALTER TABLE diio_transcripts
DROP COLUMN IF EXISTS summary;

-- Step 4: Drop the summary index if it exists
DROP INDEX IF EXISTS idx_diio_transcripts_summary;

-- Step 5: Update views that might reference summary column
DROP VIEW IF EXISTS diio_transcripts_with_sentiment CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_sentiment CASCADE;

-- Recreate views without summary column
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

-- Step 6: Verify column was removed
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name = 'summary';

-- Should return 0 rows (column doesn't exist)

-- Step 7: Verify views are updated
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'diio_transcripts%'
ORDER BY table_name;

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
-- ✅ All summaries cleared
-- ✅ Summary column removed
-- ✅ Views updated
-- ✅ Indexes removed
-- =====================================================
