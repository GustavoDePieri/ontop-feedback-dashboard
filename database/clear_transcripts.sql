-- ================================================
-- Clear All DIIO Transcripts
-- ================================================
-- Use this to delete all transcripts so they can be re-fetched
-- with updated participant email data

-- WARNING: This will permanently delete all transcript data
-- Make sure you want to do this before running!

-- Step 1: Delete all transcript records
DELETE FROM diio_transcripts;

-- Step 2: Reset the statistics (optional)
-- This ensures accurate counts after re-fetching

-- Step 3: Verify deletion
SELECT COUNT(*) as remaining_transcripts FROM diio_transcripts;
-- Should return 0

-- ================================================
-- Alternative: Delete only specific transcripts
-- ================================================

-- Delete transcripts from a specific date range
-- DELETE FROM diio_transcripts 
-- WHERE occurred_at >= '2024-01-01' 
-- AND occurred_at < '2024-02-01';

-- Delete transcripts of a specific type
-- DELETE FROM diio_transcripts 
-- WHERE transcript_type = 'meeting';

-- Delete transcripts for a specific meeting
-- DELETE FROM diio_transcripts 
-- WHERE source_diio_id = 'your-meeting-id-here';

-- ================================================
-- After deletion, you can:
-- 1. Go to /diio page
-- 2. Click "Check for New" button
-- 3. All transcripts will be re-fetched with updated data
-- ================================================

-- Check current transcript count before deletion
SELECT 
  transcript_type,
  COUNT(*) as count
FROM diio_transcripts 
GROUP BY transcript_type;

