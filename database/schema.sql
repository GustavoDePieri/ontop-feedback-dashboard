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
