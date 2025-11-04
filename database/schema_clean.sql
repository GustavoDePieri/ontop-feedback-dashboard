-- =====================================================
-- CLEAN DIIO TRANSCRIPTS SCHEMA
-- =====================================================
-- This is a streamlined schema focused on transcripts and AI analysis
-- Run this to drop old tables and create a clean structure

-- =====================================================
-- STEP 1: DROP OLD TABLES (if they exist)
-- =====================================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS diio_transcript_feedback_summary CASCADE;
DROP VIEW IF EXISTS diio_transcripts_summary CASCADE;
DROP VIEW IF EXISTS saved_reports_summary CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_diio_transcript_feedback_stats() CASCADE;
DROP FUNCTION IF EXISTS get_transcript_feedback_by_date_range(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_diio_transcript_stats() CASCADE;

-- Drop old feedback extraction tables (no longer needed with AI)
DROP TABLE IF EXISTS diio_transcript_feedback CASCADE;

-- Drop metadata tables (we store everything in diio_transcripts now)
DROP TABLE IF EXISTS diio_meetings CASCADE;
DROP TABLE IF EXISTS diio_phone_calls CASCADE;
DROP TABLE IF EXISTS diio_users CASCADE;

-- Keep saved_reports table (it's still useful)
-- DROP TABLE IF EXISTS saved_reports CASCADE;

-- Drop old transcripts table (we'll recreate it with AI analysis column)
DROP TABLE IF EXISTS diio_transcripts CASCADE;

-- =====================================================
-- STEP 2: CREATE CLEAN TRANSCRIPTS TABLE
-- =====================================================

CREATE TABLE diio_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- DIIO Reference
  diio_transcript_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Transcript Content
  transcript_text TEXT NOT NULL,
  transcript_type VARCHAR(50) NOT NULL CHECK (transcript_type IN ('meeting', 'phone_call')),
  
  -- Source Metadata
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(500),
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  
  -- Attendees (JSONB format: {sellers: [{name, email}], customers: [{name, email}]})
  attendees JSONB,
  
  -- AI Analysis (CACHED - stores the full AI analysis result)
  ai_analysis JSONB,
  ai_analysis_date TIMESTAMP WITH TIME ZONE,
  
  -- Legacy status field (can be deprecated later)
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookups
CREATE INDEX idx_diio_transcripts_diio_id ON diio_transcripts(diio_transcript_id);
CREATE INDEX idx_diio_transcripts_type ON diio_transcripts(transcript_type);
CREATE INDEX idx_diio_transcripts_source_id ON diio_transcripts(source_id);

-- Date-based queries
CREATE INDEX idx_diio_transcripts_occurred_at ON diio_transcripts(occurred_at DESC);
CREATE INDEX idx_diio_transcripts_created_at ON diio_transcripts(created_at DESC);

-- AI analysis queries
CREATE INDEX idx_diio_transcripts_ai_analysis_date ON diio_transcripts(ai_analysis_date DESC) 
  WHERE ai_analysis IS NOT NULL;

-- Attendee searches (GIN index for JSONB)
CREATE INDEX idx_diio_transcripts_attendees ON diio_transcripts USING GIN (attendees);

-- Full-text search on transcript text (optional, for future search feature)
CREATE INDEX idx_diio_transcripts_text_search ON diio_transcripts USING GIN (to_tsvector('english', transcript_text));

-- =====================================================
-- STEP 4: CREATE HELPER FUNCTION FOR updated_at
-- =====================================================

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_diio_transcripts_updated_at 
    BEFORE UPDATE ON diio_transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE diio_transcripts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust for your security needs)
CREATE POLICY "Allow all operations on diio_transcripts" ON diio_transcripts
    FOR ALL USING (true);

-- =====================================================
-- STEP 6: CREATE USEFUL VIEWS
-- =====================================================

-- View for transcripts with AI analysis
CREATE OR REPLACE VIEW diio_transcripts_with_ai AS
SELECT 
    id,
    diio_transcript_id,
    transcript_type,
    source_name,
    occurred_at,
    duration,
    attendees,
    ai_analysis,
    ai_analysis_date,
    created_at,
    updated_at,
    -- Extract key AI metrics for easy querying
    (ai_analysis->>'overallSentiment')::VARCHAR as sentiment,
    (ai_analysis->>'churnRisk')::VARCHAR as churn_risk,
    (ai_analysis->>'customerSatisfaction')::VARCHAR as customer_satisfaction,
    (ai_analysis->>'sentimentScore')::FLOAT as sentiment_score
FROM diio_transcripts
WHERE ai_analysis IS NOT NULL
ORDER BY occurred_at DESC;

-- View for transcripts without AI analysis (need analysis)
CREATE OR REPLACE VIEW diio_transcripts_needs_ai AS
SELECT 
    id,
    diio_transcript_id,
    transcript_type,
    source_name,
    occurred_at,
    attendees,
    created_at
FROM diio_transcripts
WHERE ai_analysis IS NULL
ORDER BY occurred_at DESC;

-- =====================================================
-- STEP 7: CREATE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_diio_transcript_stats()
RETURNS TABLE (
    total_transcripts BIGINT,
    meeting_transcripts BIGINT,
    phone_call_transcripts BIGINT,
    with_ai_analysis BIGINT,
    without_ai_analysis BIGINT,
    positive_sentiment BIGINT,
    negative_sentiment BIGINT,
    high_churn_risk BIGINT,
    critical_churn_risk BIGINT,
    latest_transcript_date TIMESTAMP WITH TIME ZONE,
    latest_analysis_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'meeting')::BIGINT as meeting_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'phone_call')::BIGINT as phone_call_transcripts,
        COUNT(*) FILTER (WHERE ai_analysis IS NOT NULL)::BIGINT as with_ai_analysis,
        COUNT(*) FILTER (WHERE ai_analysis IS NULL)::BIGINT as without_ai_analysis,
        COUNT(*) FILTER (WHERE ai_analysis->>'overallSentiment' = 'positive')::BIGINT as positive_sentiment,
        COUNT(*) FILTER (WHERE ai_analysis->>'overallSentiment' = 'negative')::BIGINT as negative_sentiment,
        COUNT(*) FILTER (WHERE ai_analysis->>'churnRisk' = 'high')::BIGINT as high_churn_risk,
        COUNT(*) FILTER (WHERE ai_analysis->>'churnRisk' = 'critical')::BIGINT as critical_churn_risk,
        MAX(occurred_at) as latest_transcript_date,
        MAX(ai_analysis_date) as latest_analysis_date
    FROM diio_transcripts;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE diio_transcripts IS 'Stores all call and meeting transcripts from DIIO with AI analysis caching';
COMMENT ON COLUMN diio_transcripts.attendees IS 'JSONB format: {sellers: [{name, email}], customers: [{name, email}]}';
COMMENT ON COLUMN diio_transcripts.ai_analysis IS 'Cached AI sentiment analysis result - full JSON response from Gemini AI';
COMMENT ON COLUMN diio_transcripts.ai_analysis_date IS 'When the AI analysis was performed (for cache invalidation)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check the new structure
SELECT 
    'diio_transcripts' as table_name,
    COUNT(*) as row_count
FROM diio_transcripts;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'diio_transcripts'
ORDER BY indexname;

-- =====================================================
-- NOTES
-- =====================================================

-- After running this schema:
-- 1. All old data will be deleted
-- 2. Run "Sync New Transcripts" in the UI to re-fetch from DIIO
-- 3. AI analysis will be cached in the ai_analysis column
-- 4. Re-analysis will only happen if:
--    - ai_analysis is NULL (never analyzed)
--    - User clicks "Re-analyze" button (future feature)
--    - ai_analysis_date is older than X days (future feature)

-- To check AI analysis cache:
-- SELECT COUNT(*) FROM diio_transcripts WHERE ai_analysis IS NOT NULL;

-- To find transcripts needing analysis:
-- SELECT * FROM diio_transcripts_needs_ai LIMIT 10;

-- To get transcript stats:
-- SELECT * FROM get_diio_transcript_stats();

-- =====================================================

