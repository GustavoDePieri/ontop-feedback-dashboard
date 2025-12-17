-- Performance Optimization Indexes
-- Run these in your Supabase SQL editor to improve query performance

-- Indexes for zendesk_conversations table
-- Optimizes client list queries with date filtering
CREATE INDEX IF NOT EXISTS idx_zendesk_client_created_external 
ON zendesk_conversations(client_id, created_at, is_external) 
WHERE is_external = true;

-- Index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_zendesk_client_id 
ON zendesk_conversations(client_id);

-- Index for date filtering
CREATE INDEX IF NOT EXISTS idx_zendesk_created_at 
ON zendesk_conversations(created_at);

-- Indexes for diio_transcripts table
-- Optimizes client list queries with date filtering
CREATE INDEX IF NOT EXISTS idx_diio_client_occurred 
ON diio_transcripts(client_platform_id, occurred_at) 
WHERE client_platform_id IS NOT NULL;

-- Index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_diio_client_platform_id 
ON diio_transcripts(client_platform_id) 
WHERE client_platform_id IS NOT NULL;

-- Index for date filtering
CREATE INDEX IF NOT EXISTS idx_diio_occurred_at 
ON diio_transcripts(occurred_at);

-- Index for Client ID sync queries
CREATE INDEX IF NOT EXISTS idx_diio_client_id_lookup 
ON diio_transcripts(client_platform_id, client_id_lookup_attempted_at) 
WHERE client_platform_id IS NULL OR client_platform_id = '';

-- Indexes for client_sentiment_summary table
-- Optimizes client list queries
CREATE INDEX IF NOT EXISTS idx_sentiment_summary_client_period 
ON client_sentiment_summary(client_id, period_start) 
WHERE period_start IS NULL;

-- Index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_sentiment_summary_client_id 
ON client_sentiment_summary(client_id);

-- Indexes for client_enrichment table
-- Optimizes enrichment status queries
CREATE INDEX IF NOT EXISTS idx_enrichment_client_status 
ON client_enrichment(client_id, enrichment_status);

-- Index for client_id lookups
CREATE INDEX IF NOT EXISTS idx_enrichment_client_id 
ON client_enrichment(client_id);

-- Composite index for account_name lookups in diio_transcripts
CREATE INDEX IF NOT EXISTS idx_diio_account_name 
ON diio_transcripts(account_name) 
WHERE account_name IS NOT NULL;

-- Analyze tables to update statistics (helps query planner)
ANALYZE zendesk_conversations;
ANALYZE diio_transcripts;
ANALYZE client_sentiment_summary;
ANALYZE client_enrichment;

