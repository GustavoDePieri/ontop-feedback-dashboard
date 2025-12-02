-- =====================================================
-- Add Confidence Score Column to diio_transcripts
-- =====================================================
-- This adds a confidence_score column to store the model's
-- confidence score (0.0 to 1.0) for the sentiment prediction

-- Add confidence_score column
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS confidence_score FLOAT;

-- Add index for confidence score queries (optional)
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_confidence_score
ON diio_transcripts(confidence_score);

-- Add comment
COMMENT ON COLUMN diio_transcripts.confidence_score IS 'Model confidence score (0.0 to 1.0) for the sentiment prediction';

-- Verify column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name = 'confidence_score';

-- =====================================================
-- VERIFICATION COMPLETE
-- =====================================================
-- ✅ confidence_score column added
-- ✅ Index created
-- ✅ Ready to store confidence scores
-- =====================================================
