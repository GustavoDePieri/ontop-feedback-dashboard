-- =====================================================
-- Add Account Status Column to DIIO Transcripts
-- =====================================================
-- Run this in your Supabase SQL editor to add account_status column
-- to the diio_transcripts table for tracking active vs churned accounts.

-- Add account_status column
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50);

-- Add constraint to limit valid values
ALTER TABLE diio_transcripts
ADD CONSTRAINT chk_account_status
CHECK (account_status IN ('active', 'churned', 'trial', 'paused', NULL));

-- Add index for account_status for faster queries
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_account_status
ON diio_transcripts(account_status);

-- Add combined index for status and platform_id
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_status_platform
ON diio_transcripts(account_status, client_platform_id);

COMMENT ON COLUMN diio_transcripts.account_status IS 'Account status: active, churned, trial, paused, or NULL for unmatched transcripts';
