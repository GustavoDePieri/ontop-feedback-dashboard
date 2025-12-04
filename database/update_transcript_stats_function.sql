-- =====================================================
-- UPDATE get_diio_transcript_stats() FUNCTION
-- =====================================================
-- This adds account_status counts to the stats function

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
    active_accounts BIGINT,
    churned_accounts BIGINT,
    unknown_accounts BIGINT,
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
        COUNT(*) FILTER (WHERE account_status = 'active')::BIGINT as active_accounts,
        COUNT(*) FILTER (WHERE account_status = 'churned')::BIGINT as churned_accounts,
        COUNT(*) FILTER (WHERE account_status IS NULL)::BIGINT as unknown_accounts,
        MAX(occurred_at) as latest_transcript_date
    FROM diio_transcripts;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT * FROM get_diio_transcript_stats();
