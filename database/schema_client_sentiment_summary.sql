-- =====================================================
-- Client Sentiment Summary Table Schema
-- =====================================================
-- This table stores aggregated sentiment scores for clients
-- combining data from both Zendesk tickets and DIIO transcripts
-- =====================================================

CREATE TABLE IF NOT EXISTS client_sentiment_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Client identifier (from Zendesk)
  client_id VARCHAR(255) NOT NULL,
  
  -- Period (NULL = all-time summary)
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- Total counts
  total_tickets_analyzed INTEGER DEFAULT 0,  -- Combined total (tickets + transcripts)
  total_zendesk_tickets INTEGER DEFAULT 0,   -- Zendesk tickets only
  total_diio_transcripts INTEGER DEFAULT 0,  -- DIIO transcripts only
  
  -- Sentiment counts
  positive_tickets INTEGER DEFAULT 0,
  negative_tickets INTEGER DEFAULT 0,
  neutral_tickets INTEGER DEFAULT 0,
  
  -- Sentiment percentages
  positive_percentage NUMERIC(5, 2) DEFAULT 0.0,
  negative_percentage NUMERIC(5, 2) DEFAULT 0.0,
  neutral_percentage NUMERIC(5, 2) DEFAULT 0.0,
  
  -- Aggregated scores
  client_final_score NUMERIC(10, 4) NOT NULL,  -- Weighted sentiment score (-1.0 to 1.0)
  client_sentiment_category VARCHAR(50) NOT NULL CHECK (client_sentiment_category IN ('Positive', 'Neutral', 'Negative')),
  
  -- Aspect sentiment (JSONB) - from Zendesk tickets
  aspect_sentiment JSONB DEFAULT '{}'::jsonb,
  
  -- Summary fields
  negative_aspects_summary TEXT,
  conclusion TEXT NOT NULL,
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one summary per client per period
  -- Note: NULL periods (all-time) need special handling
  CONSTRAINT unique_client_period UNIQUE (client_id, period_start, period_end)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_client_id 
  ON client_sentiment_summary(client_id);

CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_category 
  ON client_sentiment_summary(client_sentiment_category);

CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_score 
  ON client_sentiment_summary(client_final_score);

CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_period 
  ON client_sentiment_summary(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_updated 
  ON client_sentiment_summary(last_updated DESC);

-- Create trigger to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_client_sentiment_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_sentiment_summary_updated_at 
    BEFORE UPDATE ON client_sentiment_summary 
    FOR EACH ROW 
    EXECUTE FUNCTION update_client_sentiment_summary_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE client_sentiment_summary ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on client_sentiment_summary" 
  ON client_sentiment_summary
  FOR ALL USING (true);

-- Create a view for easier querying
CREATE OR REPLACE VIEW client_sentiment_summary_view AS
SELECT 
    id,
    client_id,
    period_start,
    period_end,
    total_tickets_analyzed,
    total_zendesk_tickets,
    total_diio_transcripts,
    positive_tickets,
    negative_tickets,
    neutral_tickets,
    positive_percentage,
    negative_percentage,
    neutral_percentage,
    client_final_score,
    client_sentiment_category,
    aspect_sentiment,
    negative_aspects_summary,
    conclusion,
    last_updated,
    last_calculated_at,
    -- Calculated fields
    CASE 
        WHEN client_final_score > 0.2 THEN 'Positive'
        WHEN client_final_score < -0.2 THEN 'Negative'
        ELSE 'Neutral'
    END as calculated_category,
    -- Risk level
    CASE 
        WHEN client_final_score < -0.3 THEN 'High Risk'
        WHEN client_final_score < -0.1 THEN 'Medium Risk'
        WHEN client_final_score < 0.1 THEN 'Low Risk'
        ELSE 'Positive'
    END as churn_risk_level
FROM client_sentiment_summary
ORDER BY client_final_score ASC, last_updated DESC;

-- Comments for documentation
COMMENT ON TABLE client_sentiment_summary IS 'Aggregated sentiment scores for clients, combining Zendesk tickets and DIIO transcripts';
COMMENT ON COLUMN client_sentiment_summary.client_id IS 'Client identifier from Zendesk (e.g., CL004114)';
COMMENT ON COLUMN client_sentiment_summary.client_final_score IS 'Weighted sentiment score from -1.0 (negative) to 1.0 (positive)';
COMMENT ON COLUMN client_sentiment_summary.total_tickets_analyzed IS 'Total items analyzed (Zendesk tickets + DIIO transcripts)';
COMMENT ON COLUMN client_sentiment_summary.aspect_sentiment IS 'JSONB object with aspect-level sentiment scores from Zendesk tickets';

