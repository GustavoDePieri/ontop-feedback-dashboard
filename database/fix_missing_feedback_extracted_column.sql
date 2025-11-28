-- =====================================================
-- FIX: Add missing feedback_extracted column
-- =====================================================
-- This adds the missing column that is causing the error:
-- "column diio_transcripts.feedback_extracted does not exist"
--
-- Run this in your Supabase SQL editor to fix the issue

-- Add the missing columns to diio_transcripts table
ALTER TABLE diio_transcripts 
ADD COLUMN IF NOT EXISTS feedback_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS feedback_extraction_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS feedback_segments_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_feedback_extracted 
ON diio_transcripts(feedback_extracted);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name IN ('feedback_extracted', 'feedback_extraction_date', 'feedback_segments_count')
ORDER BY column_name;
