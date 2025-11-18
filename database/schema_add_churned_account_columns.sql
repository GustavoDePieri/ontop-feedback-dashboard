-- =====================================================
-- Add Churned Account Columns to DIIO Transcripts
-- =====================================================
-- Run this in your Supabase SQL editor to add client_platform_id and account_name columns
-- to the diio_transcripts table for matching with churned accounts.

-- Add client_platform_id column
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS client_platform_id VARCHAR(255);

-- Add account_name column
ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS account_name VARCHAR(500);

-- Add index for client_platform_id for faster queries
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_client_platform_id
ON diio_transcripts(client_platform_id);

-- Add index for account_name for faster queries
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_account_name
ON diio_transcripts(account_name);

-- Add a combined index for both columns
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_client_and_account
ON diio_transcripts(client_platform_id, account_name);

COMMENT ON COLUMN diio_transcripts.client_platform_id IS 'Client Platform ID from churned accounts CSV for identifying churned customers';
COMMENT ON COLUMN diio_transcripts.account_name IS 'Account name from churned accounts CSV for identifying churned customers';
