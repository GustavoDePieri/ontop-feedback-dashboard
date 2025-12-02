-- Migration: Remove conclusion column from client_sentiment_summary table
-- This column is no longer needed as we want to keep the table clean

-- Drop the conclusion column
ALTER TABLE client_sentiment_summary 
DROP COLUMN IF EXISTS conclusion;

-- Verify the column has been removed
-- You can run this query to check:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'client_sentiment_summary' 
-- ORDER BY ordinal_position;

