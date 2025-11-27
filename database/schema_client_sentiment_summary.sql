-- =====================================================
-- CLIENT SENTIMENT SUMMARY TABLE
-- =====================================================
-- Table to store aggregated client-level sentiment analysis
-- Used by both Zendesk and transcript sentiment aggregators

CREATE TABLE IF NOT EXISTS client_sentiment_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Client identification
  client_id VARCHAR(255) NOT NULL,

  -- Time period (NULL for all-time aggregation)
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,

  -- Ticket/transcript counts
  total_tickets_analyzed INTEGER NOT NULL DEFAULT 0,
  positive_tickets INTEGER NOT NULL DEFAULT 0,
  negative_tickets INTEGER NOT NULL DEFAULT 0,
  neutral_tickets INTEGER NOT NULL DEFAULT 0,
  mixed_tickets INTEGER NOT NULL DEFAULT 0,

  -- Percentage breakdowns
  positive_percentage DECIMAL(5,2) DEFAULT 0.00,
  negative_percentage DECIMAL(5,2) DEFAULT 0.00,
  neutral_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Sentiment scores
  client_final_score DECIMAL(5,4), -- -1.0 to 1.0 range
  client_sentiment_category VARCHAR(50) CHECK (client_sentiment_category IN ('Positive', 'Neutral', 'Negative')),

  -- Aspect-level sentiment (JSONB for flexibility)
  aspect_sentiment JSONB,

  -- Negative aspects summary
  negative_aspects_summary TEXT,

  -- Natural language conclusion
  conclusion TEXT,

  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup by client
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_client_id
ON client_sentiment_summary(client_id);

-- Time period queries
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_period
ON client_sentiment_summary(period_start, period_end);

-- Sentiment category queries
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_category
ON client_sentiment_summary(client_sentiment_category);

-- Score-based queries
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_score
ON client_sentiment_summary(client_final_score);

-- Date-based queries
CREATE INDEX IF NOT EXISTS idx_client_sentiment_summary_updated
ON client_sentiment_summary(last_updated DESC);

-- =====================================================
-- TRIGGERS AND POLICIES
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_client_sentiment_summary_updated_at
    BEFORE UPDATE ON client_sentiment_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE client_sentiment_summary ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust security as needed)
CREATE POLICY "Allow all operations on client_sentiment_summary"
    ON client_sentiment_summary
    FOR ALL USING (true);

-- =====================================================
-- UNIQUE CONSTRAINT
-- =====================================================
-- Prevent duplicate entries for same client/period combination
ALTER TABLE client_sentiment_summary
ADD CONSTRAINT unique_client_period
UNIQUE (client_id, period_start, period_end);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE client_sentiment_summary IS 'Aggregated client-level sentiment analysis from tickets and transcripts';
COMMENT ON COLUMN client_sentiment_summary.client_final_score IS 'Weighted sentiment score from -1.0 (negative) to 1.0 (positive)';
COMMENT ON COLUMN client_sentiment_summary.aspect_sentiment IS 'JSON object with aspect names and their sentiment scores';
COMMENT ON COLUMN client_sentiment_summary.negative_aspects_summary IS 'Comma-separated list of aspects with negative sentiment';
