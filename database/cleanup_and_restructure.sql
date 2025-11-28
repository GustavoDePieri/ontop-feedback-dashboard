-- =====================================================
-- DATABASE CLEANUP AND RESTRUCTURE
-- =====================================================
-- This script will:
-- 1. Drop unused tables (keep only diio_transcripts)
-- 2. Add new sentiment columns to diio_transcripts
-- 3. Remove old feedback extraction columns
-- 4. Clear AI analysis data and reset analyzed_status
-- 
-- ⚠️ WARNING: This will delete data from unused tables!
-- ⚠️ This will clear all AI analysis data!
-- 
-- Run this in your Supabase SQL editor
-- =====================================================

-- =====================================================
-- STEP 1: DROP DEPENDENCIES (Views, Functions, Triggers)
-- =====================================================

-- Drop views that depend on tables we're deleting
DROP VIEW IF EXISTS diio_transcripts_summary CASCADE;
DROP VIEW IF EXISTS diio_transcripts_with_ai CASCADE;
DROP VIEW IF EXISTS diio_transcripts_needs_ai CASCADE;
DROP VIEW IF EXISTS saved_reports_summary CASCADE;

-- Drop functions that depend on tables we're deleting
DROP FUNCTION IF EXISTS get_diio_transcript_stats() CASCADE;
DROP FUNCTION IF EXISTS get_diio_transcript_feedback_stats() CASCADE;
DROP FUNCTION IF EXISTS get_transcript_feedback_by_date_range(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, VARCHAR, VARCHAR) CASCADE;

-- =====================================================
-- STEP 2: DROP UNUSED TABLES
-- =====================================================

-- Drop saved_reports table (not needed)
DROP TABLE IF EXISTS saved_reports CASCADE;

-- Drop metadata tables (data is in diio_transcripts)
DROP TABLE IF EXISTS diio_meetings CASCADE;
DROP TABLE IF EXISTS diio_phone_calls CASCADE;
DROP TABLE IF EXISTS diio_users CASCADE;

-- Drop old feedback extraction table if it exists
DROP TABLE IF EXISTS diio_transcript_feedback CASCADE;

-- =====================================================
-- STEP 3: REMOVE OLD COLUMNS FROM diio_transcripts
-- =====================================================

-- Drop indexes on columns we're removing
DROP INDEX IF EXISTS idx_diio_transcripts_feedback_extracted;

-- Remove old feedback extraction columns
ALTER TABLE diio_transcripts 
DROP COLUMN IF EXISTS feedback_extracted,
DROP COLUMN IF EXISTS feedback_extraction_date,
DROP COLUMN IF EXISTS feedback_segments_count;

-- =====================================================
-- STEP 4: ADD NEW SENTIMENT COLUMNS
-- =====================================================

-- Add sentiment column (overall sentiment: positive, neutral, negative)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50);

-- Add sentiment_score column (numeric score, typically -1.0 to 1.0)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS sentiment_score FLOAT;

-- Add positive_meetings count (for aggregations)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS positive_meetings INTEGER DEFAULT 0;

-- Add neutral_meetings count (for aggregations)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS neutral_meetings INTEGER DEFAULT 0;

-- Add negative_meetings count (for aggregations)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS negative_meetings INTEGER DEFAULT 0;

-- Add avg_sentiment_meetings (average sentiment score for aggregations)
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS avg_sentiment_meetings FLOAT;

-- Add constraints for sentiment column
ALTER TABLE diio_transcripts
DROP CONSTRAINT IF EXISTS chk_sentiment;

ALTER TABLE diio_transcripts
ADD CONSTRAINT chk_sentiment
CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed', NULL));

-- =====================================================
-- STEP 5: CREATE INDEXES FOR NEW COLUMNS
-- =====================================================

-- Index for sentiment column (for filtering)
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_sentiment
ON diio_transcripts(sentiment);

-- Index for sentiment_score (for sorting/ranking)
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_sentiment_score
ON diio_transcripts(sentiment_score);

-- Combined index for sentiment queries
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_sentiment_composite
ON diio_transcripts(sentiment, sentiment_score);

-- =====================================================
-- STEP 6: CLEAR AI ANALYSIS DATA
-- =====================================================

-- Clear ai_analysis column (set to NULL)
UPDATE diio_transcripts
SET ai_analysis = NULL
WHERE ai_analysis IS NOT NULL;

-- Clear ai_analysis_date column (set to NULL)
UPDATE diio_transcripts
SET ai_analysis_date = NULL
WHERE ai_analysis_date IS NOT NULL;

-- =====================================================
-- STEP 7: RESET analyzed_status TO 'pending'
-- =====================================================

-- Set all analyzed_status to 'pending'
UPDATE diio_transcripts
SET analyzed_status = 'pending'
WHERE analyzed_status != 'pending' OR analyzed_status IS NULL;

-- =====================================================
-- STEP 8: ADD COMMENTS FOR NEW COLUMNS
-- =====================================================

COMMENT ON COLUMN diio_transcripts.sentiment IS 'Overall sentiment: positive, neutral, negative, or mixed';
COMMENT ON COLUMN diio_transcripts.sentiment_score IS 'Numeric sentiment score (typically -1.0 to 1.0, where negative = negative sentiment)';
COMMENT ON COLUMN diio_transcripts.positive_meetings IS 'Count of positive meetings (for account-level aggregations)';
COMMENT ON COLUMN diio_transcripts.neutral_meetings IS 'Count of neutral meetings (for account-level aggregations)';
COMMENT ON COLUMN diio_transcripts.negative_meetings IS 'Count of negative meetings (for account-level aggregations)';
COMMENT ON COLUMN diio_transcripts.avg_sentiment_meetings IS 'Average sentiment score across meetings (for account-level aggregations)';

-- =====================================================
-- STEP 9: RECREATE HELPFUL VIEWS
-- =====================================================

-- View for transcripts with sentiment data
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

-- View for transcripts needing sentiment analysis
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

-- =====================================================
-- STEP 10: RECREATE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_diio_transcript_stats()
RETURNS TABLE (
    total_transcripts BIGINT,
    meeting_transcripts BIGINT,
    phone_call_transcripts BIGINT,
    with_sentiment BIGINT,
    without_sentiment BIGINT,
    positive_sentiment BIGINT,
    neutral_sentiment BIGINT,
    negative_sentiment BIGINT,
    pending_analysis BIGINT,
    finished_analysis BIGINT,
    error_analysis BIGINT,
    latest_transcript_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'meeting')::BIGINT as meeting_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'phone_call')::BIGINT as phone_call_transcripts,
        COUNT(*) FILTER (WHERE sentiment IS NOT NULL)::BIGINT as with_sentiment,
        COUNT(*) FILTER (WHERE sentiment IS NULL)::BIGINT as without_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'positive')::BIGINT as positive_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'neutral')::BIGINT as neutral_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'negative')::BIGINT as negative_sentiment,
        COUNT(*) FILTER (WHERE analyzed_status = 'pending')::BIGINT as pending_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'finished')::BIGINT as finished_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'error')::BIGINT as error_analysis,
        MAX(occurred_at) as latest_transcript_date
    FROM diio_transcripts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check remaining tables (should only see diio_transcripts)
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'diio%' OR table_name LIKE 'saved%'
ORDER BY table_name;

-- Check diio_transcripts structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
ORDER BY ordinal_position;

-- Check new sentiment columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name IN ('sentiment', 'sentiment_score', 'positive_meetings', 'neutral_meetings', 'negative_meetings', 'avg_sentiment_meetings')
ORDER BY column_name;

-- Verify old columns are removed
SELECT 
    column_name
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name IN ('feedback_extracted', 'feedback_extraction_date', 'feedback_segments_count');

-- Check AI analysis data is cleared
SELECT 
    COUNT(*) as total_transcripts,
    COUNT(ai_analysis) as with_ai_analysis,
    COUNT(ai_analysis_date) as with_ai_analysis_date,
    COUNT(*) FILTER (WHERE analyzed_status = 'pending') as pending_status
FROM diio_transcripts;

-- Check sentiment data status
SELECT 
    COUNT(*) as total_transcripts,
    COUNT(sentiment) as with_sentiment,
    COUNT(sentiment_score) as with_sentiment_score
FROM diio_transcripts;

-- =====================================================
-- NOTES
-- =====================================================

-- After running this migration:
-- 1. ✅ Only diio_transcripts table remains
-- 2. ✅ New sentiment columns added
-- 3. ✅ Old feedback extraction columns removed
-- 4. ✅ AI analysis data cleared
-- 5. ✅ analyzed_status reset to 'pending'
-- 6. ✅ Ready for new sentiment analysis workflow

-- Next steps:
-- 1. Run sentiment analysis on transcripts
-- 2. Populate sentiment, sentiment_score columns
-- 3. Calculate aggregations (positive_meetings, etc.) per account
-- 4. Update avg_sentiment_meetings for account-level views

-- =====================================================
