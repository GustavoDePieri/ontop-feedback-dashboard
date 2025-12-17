-- Add client_id_lookup_attempted_at field to track which transcripts have been attempted
-- This prevents re-sending the same emails to n8n workflow

ALTER TABLE diio_transcripts 
ADD COLUMN IF NOT EXISTS client_id_lookup_attempted_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN diio_transcripts.client_id_lookup_attempted_at IS 
'Timestamp when Client ID lookup was attempted for this transcript. Set when lookup fails to prevent retrying the same emails.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_client_id_lookup_attempted 
ON diio_transcripts(client_id_lookup_attempted_at) 
WHERE client_id_lookup_attempted_at IS NOT NULL;

-- Create index for finding transcripts that need lookup (no Client ID and not attempted)
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_need_client_id_lookup 
ON diio_transcripts(client_platform_id, client_id_lookup_attempted_at) 
WHERE client_platform_id IS NULL AND client_id_lookup_attempted_at IS NULL;

