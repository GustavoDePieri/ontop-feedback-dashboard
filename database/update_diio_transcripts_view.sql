-- =====================================================
-- UPDATE: Enhanced diio_transcripts_with_ai view
-- =====================================================
-- This view extracts AI analysis fields for easy querying
-- Run this in your Supabase SQL editor to update the view

-- Drop and recreate the view with enhanced AI analysis fields
DROP VIEW IF EXISTS diio_transcripts_with_ai CASCADE;

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
    client_platform_id,
    account_name,
    account_status,
    created_at,
    updated_at,
    
    -- Extract key AI metrics for easy querying
    (ai_analysis->>'overallSentiment')::VARCHAR as sentiment,
    (ai_analysis->>'sentimentScore')::FLOAT as sentiment_score,
    (ai_analysis->>'churnRisk')::VARCHAR as churn_risk,
    (ai_analysis->>'customerSatisfaction')::VARCHAR as customer_satisfaction,
    (ai_analysis->>'summary')::TEXT as ai_summary,
    
    -- Extract array fields (for advanced queries)
    ai_analysis->'churnSignals' as churn_signals,
    ai_analysis->'keyThemes' as key_themes,
    ai_analysis->'painPoints' as pain_points,
    ai_analysis->'positiveHighlights' as positive_highlights,
    ai_analysis->'actionableInsights' as actionable_insights
    
FROM diio_transcripts
WHERE ai_analysis IS NOT NULL
ORDER BY occurred_at DESC;

-- Add helpful comment
COMMENT ON VIEW diio_transcripts_with_ai IS 'View of transcripts with AI analysis, with extracted fields for easy querying';

-- Verify the view was created
SELECT COUNT(*) as transcripts_with_ai FROM diio_transcripts_with_ai;

-- Sample query to check the data
SELECT 
    source_name,
    sentiment,
    sentiment_score,
    churn_risk,
    customer_satisfaction,
    ai_analysis_date
FROM diio_transcripts_with_ai
LIMIT 5;
