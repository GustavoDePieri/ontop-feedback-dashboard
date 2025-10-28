-- Supabase Database Schema for Ontop Feedback Analytics
-- Run this in your Supabase SQL editor

-- Create saved_reports table
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_html TEXT NOT NULL,
  report_data JSONB NOT NULL,
  filters_applied JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) DEFAULT 'system'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_at ON saved_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_reports_title ON saved_reports(title);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_by ON saved_reports(created_by);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_reports_updated_at 
    BEFORE UPDATE ON saved_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on saved_reports" ON saved_reports
    FOR ALL USING (true);

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW saved_reports_summary AS
SELECT 
    id,
    title,
    description,
    created_at,
    updated_at,
    created_by,
    jsonb_array_length(report_data->'topRecurringRequests') as recurring_requests_count,
    jsonb_array_length(report_data->'emergingPatterns') as emerging_patterns_count,
    jsonb_array_length(report_data->'criticalRisks') as critical_risks_count,
    jsonb_array_length(report_data->'quickWins') as quick_wins_count
FROM saved_reports
ORDER BY created_at DESC;

-- ==============================================
-- DIIO INTEGRATION TABLES
-- ==============================================

-- Create diio_users table to store DIIO user information
CREATE TABLE IF NOT EXISTS diio_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's internal user ID
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diio_transcripts table to store all transcripts
CREATE TABLE IF NOT EXISTS diio_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_transcript_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's transcript ID
  transcript_text TEXT NOT NULL,
  transcript_type VARCHAR(50) NOT NULL CHECK (transcript_type IN ('meeting', 'phone_call')),
  source_id VARCHAR(255) NOT NULL, -- Meeting ID or Phone Call ID from DIIO
  source_name VARCHAR(500), -- Meeting name or call name
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  attendees JSONB, -- Store attendees as JSON
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  error_cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diio_meetings table to store meeting metadata
CREATE TABLE IF NOT EXISTS diio_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_meeting_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's meeting ID
  name VARCHAR(500) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  attendees JSONB, -- Store attendees as JSON
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  error_cause TEXT,
  last_transcript_id VARCHAR(255), -- Reference to latest transcript
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diio_phone_calls table to store phone call metadata
CREATE TABLE IF NOT EXISTS diio_phone_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_call_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's call ID
  name VARCHAR(500) NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  call_from_number VARCHAR(50),
  attendees JSONB, -- Store attendees as JSON
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  error_cause TEXT,
  last_transcript_id VARCHAR(255), -- Reference to latest transcript
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diio_users_diio_id ON diio_users(diio_id);
CREATE INDEX IF NOT EXISTS idx_diio_users_email ON diio_users(email);

CREATE INDEX IF NOT EXISTS idx_diio_transcripts_diio_id ON diio_transcripts(diio_transcript_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_type ON diio_transcripts(transcript_type);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_source_id ON diio_transcripts(source_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_occurred_at ON diio_transcripts(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_created_at ON diio_transcripts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_diio_meetings_diio_id ON diio_meetings(diio_meeting_id);
CREATE INDEX IF NOT EXISTS idx_diio_meetings_scheduled_at ON diio_meetings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_meetings_created_at ON diio_meetings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_diio_phone_calls_diio_id ON diio_phone_calls(diio_call_id);
CREATE INDEX IF NOT EXISTS idx_diio_phone_calls_occurred_at ON diio_phone_calls(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_phone_calls_created_at ON diio_phone_calls(created_at DESC);

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_diio_users_updated_at 
    BEFORE UPDATE ON diio_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diio_transcripts_updated_at 
    BEFORE UPDATE ON diio_transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diio_meetings_updated_at 
    BEFORE UPDATE ON diio_meetings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diio_phone_calls_updated_at 
    BEFORE UPDATE ON diio_phone_calls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for DIIO tables
ALTER TABLE diio_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diio_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE diio_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE diio_phone_calls ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on diio_users" ON diio_users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on diio_transcripts" ON diio_transcripts
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on diio_meetings" ON diio_meetings
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on diio_phone_calls" ON diio_phone_calls
    FOR ALL USING (true);

-- Create views for easier querying
CREATE OR REPLACE VIEW diio_transcripts_summary AS
SELECT 
    t.id,
    t.diio_transcript_id,
    t.transcript_type,
    t.source_id,
    t.source_name,
    t.occurred_at,
    t.duration,
    t.analyzed_status,
    t.created_at,
    t.updated_at,
    CASE 
        WHEN t.transcript_type = 'meeting' THEN m.name
        WHEN t.transcript_type = 'phone_call' THEN pc.name
        ELSE t.source_name
    END as source_display_name,
    jsonb_array_length(t.attendees->'sellers') + jsonb_array_length(t.attendees->'customers') as total_attendees
FROM diio_transcripts t
LEFT JOIN diio_meetings m ON t.source_id = m.diio_meeting_id AND t.transcript_type = 'meeting'
LEFT JOIN diio_phone_calls pc ON t.source_id = pc.diio_call_id AND t.transcript_type = 'phone_call'
ORDER BY t.created_at DESC;

-- Create a function to get transcript statistics
CREATE OR REPLACE FUNCTION get_diio_transcript_stats()
RETURNS TABLE (
    total_transcripts BIGINT,
    meeting_transcripts BIGINT,
    phone_call_transcripts BIGINT,
    pending_analysis BIGINT,
    finished_analysis BIGINT,
    error_analysis BIGINT,
    latest_transcript_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'meeting') as meeting_transcripts,
        COUNT(*) FILTER (WHERE transcript_type = 'phone_call') as phone_call_transcripts,
        COUNT(*) FILTER (WHERE analyzed_status = 'pending') as pending_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'finished') as finished_analysis,
        COUNT(*) FILTER (WHERE analyzed_status = 'error') as error_analysis,
        MAX(created_at) as latest_transcript_date
    FROM diio_transcripts;
END;
$$ LANGUAGE plpgsql;