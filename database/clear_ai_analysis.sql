-- =====================================================
-- CLEAR AI ANALYSIS FROM DIIO TRANSCRIPTS
-- =====================================================
-- This script clears all AI sentiment analysis results from diio_transcripts table
-- Useful for re-running sentiment analysis or resetting the data

-- Clear all ai_analysis fields
UPDATE diio_transcripts
SET
    ai_analysis = NULL,
    ai_analysis_date = NULL,
    analyzed_status = 'pending',
    updated_at = NOW();

-- Optional: Also clear any feedback extraction data if it exists
-- UPDATE diio_transcripts
-- SET feedback_extracted = FALSE,
--     feedback_extraction_date = NULL,
--     feedback_segments_count = 0
-- WHERE feedback_extracted IS NOT NULL;

-- Show results
SELECT
    COUNT(*) as total_transcripts,
    COUNT(*) FILTER (WHERE ai_analysis IS NULL) as cleared_analysis,
    COUNT(*) FILTER (WHERE ai_analysis IS NOT NULL) as remaining_analysis
FROM diio_transcripts;
