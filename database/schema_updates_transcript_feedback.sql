-- =====================================================
-- DIIO TRANSCRIPT FEEDBACK SEPARATION - Schema Updates
-- =====================================================
-- Run this in your Supabase SQL editor to add new tables and update existing ones

-- 1. Add participant_emails column to diio_meetings table
ALTER TABLE diio_meetings 
ADD COLUMN IF NOT EXISTS participant_emails TEXT[];

-- Add index for participant email searches
CREATE INDEX IF NOT EXISTS idx_diio_meetings_participant_emails 
ON diio_meetings USING GIN (participant_emails);

-- 2. Add participant_emails column to diio_phone_calls table
ALTER TABLE diio_phone_calls 
ADD COLUMN IF NOT EXISTS participant_emails TEXT[];

-- Add index for participant email searches
CREATE INDEX IF NOT EXISTS idx_diio_phone_calls_participant_emails 
ON diio_phone_calls USING GIN (participant_emails);

-- 3. Create new table for storing extracted feedback from transcripts
CREATE TABLE IF NOT EXISTS diio_transcript_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to the transcript
  transcript_id UUID NOT NULL REFERENCES diio_transcripts(id) ON DELETE CASCADE,
  diio_transcript_id VARCHAR(255) NOT NULL, -- DIIO's transcript ID for easier lookup
  
  -- Link to source (meeting or phone call)
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('meeting', 'phone_call')),
  source_id VARCHAR(255) NOT NULL, -- DIIO meeting ID or call ID
  source_name VARCHAR(500), -- Meeting/call name
  
  -- Feedback segment information (from transcript parser)
  segment_number INTEGER NOT NULL, -- Order of segment in transcript
  speaker_name VARCHAR(255), -- Who said this
  speaker_type VARCHAR(50), -- 'seller' or 'customer'
  feedback_text TEXT NOT NULL, -- The actual feedback segment
  
  -- Classification from parser
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('pain_point', 'feature_request', 'praise', 'concern', 'question')),
  urgency VARCHAR(50) NOT NULL CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  sentiment VARCHAR(50) NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keywords TEXT[], -- Extracted keywords
  
  -- Metadata
  occurred_at TIMESTAMP WITH TIME ZONE, -- When the call/meeting happened
  participant_emails TEXT[], -- All participants in the call/meeting
  account_name VARCHAR(500), -- Client account name if identified
  
  -- Processing status
  analyzed_by_ai BOOLEAN DEFAULT FALSE, -- Whether this was included in AI analysis
  ai_analysis_date TIMESTAMP WITH TIME ZONE, -- When it was analyzed
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_transcript_id 
ON diio_transcript_feedback(transcript_id);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_diio_transcript_id 
ON diio_transcript_feedback(diio_transcript_id);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_source 
ON diio_transcript_feedback(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_type 
ON diio_transcript_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_urgency 
ON diio_transcript_feedback(urgency);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_sentiment 
ON diio_transcript_feedback(sentiment);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_occurred_at 
ON diio_transcript_feedback(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_keywords 
ON diio_transcript_feedback USING GIN (keywords);

CREATE INDEX IF NOT EXISTS idx_diio_transcript_feedback_participant_emails 
ON diio_transcript_feedback USING GIN (participant_emails);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_diio_transcript_feedback_updated_at 
    BEFORE UPDATE ON diio_transcript_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE diio_transcript_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations
CREATE POLICY "Allow all operations on diio_transcript_feedback" ON diio_transcript_feedback
    FOR ALL USING (true);

-- 4. Create view for easy querying of transcript feedback with source details
CREATE OR REPLACE VIEW diio_transcript_feedback_summary AS
SELECT 
    tf.id,
    tf.transcript_id,
    tf.diio_transcript_id,
    tf.source_type,
    tf.source_id,
    tf.source_name,
    tf.segment_number,
    tf.speaker_name,
    tf.speaker_type,
    tf.feedback_text,
    tf.feedback_type,
    tf.urgency,
    tf.sentiment,
    tf.keywords,
    tf.occurred_at,
    tf.participant_emails,
    tf.account_name,
    tf.analyzed_by_ai,
    tf.ai_analysis_date,
    tf.created_at,
    tf.updated_at,
    -- Join with transcript for additional context
    t.analyzed_status as transcript_analyzed_status,
    -- Add meeting/call participant details
    CASE 
        WHEN tf.source_type = 'meeting' THEN m.participant_emails
        WHEN tf.source_type = 'phone_call' THEN pc.participant_emails
        ELSE tf.participant_emails
    END as source_participant_emails
FROM diio_transcript_feedback tf
LEFT JOIN diio_transcripts t ON tf.transcript_id = t.id
LEFT JOIN diio_meetings m ON tf.source_id = m.diio_meeting_id AND tf.source_type = 'meeting'
LEFT JOIN diio_phone_calls pc ON tf.source_id = pc.diio_call_id AND tf.source_type = 'phone_call'
ORDER BY tf.occurred_at DESC, tf.segment_number ASC;

-- 5. Create function to get transcript feedback statistics
CREATE OR REPLACE FUNCTION get_diio_transcript_feedback_stats()
RETURNS TABLE (
    total_feedback_segments BIGINT,
    pain_points BIGINT,
    feature_requests BIGINT,
    praise BIGINT,
    concerns BIGINT,
    questions BIGINT,
    critical_urgency BIGINT,
    high_urgency BIGINT,
    positive_sentiment BIGINT,
    negative_sentiment BIGINT,
    analyzed_by_ai BIGINT,
    latest_feedback_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_feedback_segments,
        COUNT(*) FILTER (WHERE feedback_type = 'pain_point') as pain_points,
        COUNT(*) FILTER (WHERE feedback_type = 'feature_request') as feature_requests,
        COUNT(*) FILTER (WHERE feedback_type = 'praise') as praise,
        COUNT(*) FILTER (WHERE feedback_type = 'concern') as concerns,
        COUNT(*) FILTER (WHERE feedback_type = 'question') as questions,
        COUNT(*) FILTER (WHERE urgency = 'critical') as critical_urgency,
        COUNT(*) FILTER (WHERE urgency = 'high') as high_urgency,
        COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_sentiment,
        COUNT(*) FILTER (WHERE analyzed_by_ai = true) as analyzed_by_ai,
        MAX(occurred_at) as latest_feedback_date
    FROM diio_transcript_feedback;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get transcript feedback by date range
CREATE OR REPLACE FUNCTION get_transcript_feedback_by_date_range(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    feedback_type_filter VARCHAR DEFAULT NULL,
    urgency_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_name VARCHAR,
    speaker_name VARCHAR,
    feedback_text TEXT,
    feedback_type VARCHAR,
    urgency VARCHAR,
    sentiment VARCHAR,
    occurred_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tf.id,
        tf.source_name,
        tf.speaker_name,
        tf.feedback_text,
        tf.feedback_type,
        tf.urgency,
        tf.sentiment,
        tf.occurred_at
    FROM diio_transcript_feedback tf
    WHERE 
        tf.occurred_at BETWEEN start_date AND end_date
        AND (feedback_type_filter IS NULL OR tf.feedback_type = feedback_type_filter)
        AND (urgency_filter IS NULL OR tf.urgency = urgency_filter)
    ORDER BY tf.occurred_at DESC, tf.segment_number ASC;
END;
$$ LANGUAGE plpgsql;

-- 7. Update diio_transcripts table to add a flag indicating if feedback was extracted
ALTER TABLE diio_transcripts 
ADD COLUMN IF NOT EXISTS feedback_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feedback_extraction_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS feedback_segments_count INTEGER DEFAULT 0;

-- Create index
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_feedback_extracted 
ON diio_transcripts(feedback_extracted);

-- =====================================================
-- MIGRATION NOTES:
-- =====================================================
-- After running this schema, you need to:
-- 1. Update existing meetings/calls to populate participant_emails
-- 2. Process existing transcripts to extract and store feedback
-- 3. Update the application code to use the new tables
-- =====================================================

COMMENT ON TABLE diio_transcript_feedback IS 'Stores feedback segments extracted from DIIO call/meeting transcripts, separate from written feedback';
COMMENT ON COLUMN diio_transcript_feedback.segment_number IS 'Order of this feedback segment within the transcript';
COMMENT ON COLUMN diio_transcript_feedback.speaker_type IS 'Whether this is from a seller or customer';
COMMENT ON COLUMN diio_transcript_feedback.feedback_type IS 'Classification: pain_point, feature_request, praise, concern, or question';
COMMENT ON COLUMN diio_transcript_feedback.urgency IS 'Urgency level: critical, high, medium, or low';
COMMENT ON COLUMN diio_transcript_feedback.analyzed_by_ai IS 'Whether this feedback was included in AI analysis';

