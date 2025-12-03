-- =====================================================
-- CLIENT ENRICHMENT TABLE
-- =====================================================
-- This table stores AI-enriched analysis for each client
-- combining data from both Zendesk tickets and DIIO transcripts

CREATE TABLE IF NOT EXISTS client_enrichment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Client Identification
  client_id VARCHAR(255) UNIQUE NOT NULL, -- Unified client ID (from zendesk/diio)
  client_name VARCHAR(500), -- Optional client name
  
  -- Data Sources Summary
  total_tickets INTEGER DEFAULT 0,
  total_transcripts INTEGER DEFAULT 0,
  last_interaction_date TIMESTAMP WITH TIME ZONE,
  
  -- AI Enrichment Fields (OpenAI Analysis)
  pain_points JSONB, -- Array of pain points with descriptions
  churn_signals JSONB, -- Array of churn risk indicators
  conclusion TEXT, -- Overall analysis summary
  recommended_action TEXT, -- Actionable recommendations
  
  -- Enrichment Metadata
  enriched_at TIMESTAMP WITH TIME ZONE, -- When AI analysis was performed
  enriched_by VARCHAR(100) DEFAULT 'openai', -- Which AI service was used
  enrichment_status VARCHAR(50) DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'processing', 'completed', 'error')),
  enrichment_error TEXT, -- Error message if enrichment failed
  
  -- Sentiment Summary (from existing analyses)
  overall_sentiment VARCHAR(50), -- Aggregated sentiment
  sentiment_score FLOAT, -- Average sentiment score
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_client_enrichment_client_id ON client_enrichment(client_id);
CREATE INDEX idx_client_enrichment_status ON client_enrichment(enrichment_status);
CREATE INDEX idx_client_enrichment_enriched_at ON client_enrichment(enriched_at DESC);
CREATE INDEX idx_client_enrichment_last_interaction ON client_enrichment(last_interaction_date DESC);

-- GIN indexes for JSONB fields (for searching within pain_points/churn_signals)
CREATE INDEX idx_client_enrichment_pain_points ON client_enrichment USING GIN (pain_points);
CREATE INDEX idx_client_enrichment_churn_signals ON client_enrichment USING GIN (churn_signals);

-- =====================================================
-- TRIGGER FOR updated_at
-- =====================================================

CREATE TRIGGER update_client_enrichment_updated_at 
    BEFORE UPDATE ON client_enrichment 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE client_enrichment ENABLE ROW LEVEL SECURITY;

-- Allow all operations (adjust based on your security requirements)
CREATE POLICY "Allow all operations on client_enrichment" ON client_enrichment
    FOR ALL USING (true);

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View: Clients needing enrichment
CREATE OR REPLACE VIEW clients_needing_enrichment AS
SELECT 
    client_id,
    client_name,
    total_tickets,
    total_transcripts,
    enrichment_status,
    created_at
FROM client_enrichment
WHERE enrichment_status IN ('pending', 'error')
ORDER BY last_interaction_date DESC;

-- View: Recently enriched clients
CREATE OR REPLACE VIEW recently_enriched_clients AS
SELECT 
    client_id,
    client_name,
    total_tickets,
    total_transcripts,
    enriched_at,
    overall_sentiment,
    sentiment_score,
    jsonb_array_length(pain_points) as pain_points_count,
    jsonb_array_length(churn_signals) as churn_signals_count
FROM client_enrichment
WHERE enrichment_status = 'completed'
ORDER BY enriched_at DESC
LIMIT 50;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get client statistics
CREATE OR REPLACE FUNCTION get_client_enrichment_stats()
RETURNS TABLE (
    total_clients BIGINT,
    enriched_clients BIGINT,
    pending_enrichment BIGINT,
    high_churn_risk BIGINT,
    clients_with_pain_points BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_clients,
        COUNT(*) FILTER (WHERE enrichment_status = 'completed')::BIGINT as enriched_clients,
        COUNT(*) FILTER (WHERE enrichment_status = 'pending')::BIGINT as pending_enrichment,
        COUNT(*) FILTER (WHERE jsonb_array_length(churn_signals) > 2)::BIGINT as high_churn_risk,
        COUNT(*) FILTER (WHERE jsonb_array_length(pain_points) > 0)::BIGINT as clients_with_pain_points
    FROM client_enrichment;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA STRUCTURE
-- =====================================================

-- Example of how pain_points should be structured (JSONB array):
-- [
--   {
--     "category": "billing",
--     "description": "Confusion about invoice charges",
--     "severity": "high",
--     "frequency": 5
--   },
--   {
--     "category": "product",
--     "description": "Missing feature for bulk payments",
--     "severity": "medium",
--     "frequency": 3
--   }
-- ]

-- Example of how churn_signals should be structured (JSONB array):
-- [
--   {
--     "signal": "competitor_mention",
--     "description": "Client mentioned comparing with Deel",
--     "risk_level": "high",
--     "detected_at": "2024-01-15"
--   },
--   {
--     "signal": "negative_sentiment",
--     "description": "Consistent negative feedback over 3 months",
--     "risk_level": "medium",
--     "detected_at": "2024-01-10"
--   }
-- ]

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE client_enrichment IS 'AI-enriched client analysis combining Zendesk tickets and DIIO transcripts';
COMMENT ON COLUMN client_enrichment.pain_points IS 'JSONB array of client pain points with category, description, severity, and frequency';
COMMENT ON COLUMN client_enrichment.churn_signals IS 'JSONB array of churn risk indicators with signal type, description, and risk level';
COMMENT ON COLUMN client_enrichment.conclusion IS 'Overall AI-generated analysis summary of the client relationship';
COMMENT ON COLUMN client_enrichment.recommended_action IS 'Actionable recommendations for account managers';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check the new table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client_enrichment'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'client_enrichment'
ORDER BY indexname;

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================

-- Get statistics
-- SELECT * FROM get_client_enrichment_stats();

-- Find clients needing enrichment
-- SELECT * FROM clients_needing_enrichment LIMIT 10;

-- Get recently enriched clients
-- SELECT * FROM recently_enriched_clients LIMIT 10;

-- =====================================================
