-- =====================================================
-- Migration: Add missing columns to client_sentiment_summary
-- =====================================================
-- This adds the total_zendesk_tickets and total_diio_transcripts columns
-- that are needed for the aggregator script
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add total_zendesk_tickets column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_sentiment_summary' 
        AND column_name = 'total_zendesk_tickets'
    ) THEN
        ALTER TABLE client_sentiment_summary 
        ADD COLUMN total_zendesk_tickets INTEGER DEFAULT 0;
        
        COMMENT ON COLUMN client_sentiment_summary.total_zendesk_tickets IS 'Number of Zendesk tickets analyzed for this client';
    END IF;
    
    -- Add total_diio_transcripts column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_sentiment_summary' 
        AND column_name = 'total_diio_transcripts'
    ) THEN
        ALTER TABLE client_sentiment_summary 
        ADD COLUMN total_diio_transcripts INTEGER DEFAULT 0;
        
        COMMENT ON COLUMN client_sentiment_summary.total_diio_transcripts IS 'Number of DIIO transcripts analyzed for this client';
    END IF;
END $$;

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'client_sentiment_summary' 
AND column_name IN ('total_zendesk_tickets', 'total_diio_transcripts')
ORDER BY column_name;

