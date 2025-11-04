# Reset and Re-sync DIIO Transcripts

This guide explains how to drop all existing transcripts and re-sync them from DIIO with proper attendee data.

## ⚠️ Important Notes

1. **This will delete ALL existing transcript data** from your database
2. **Make sure you have DIIO API credentials configured** in your environment variables
3. **This process may take 15-30 minutes** depending on how many transcripts you have
4. **Rate limiting is in place** (1.5 seconds between transcript fetches)

## Step 1: Apply Schema Updates

First, run the schema updates to ensure your database has the latest fields for attendees and participant emails.

### Option A: Run in Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `database/schema_updates_transcript_feedback.sql`
5. Paste and **Run** the SQL

### Option B: Using psql or pgAdmin

```bash
psql -h <your-db-host> -U postgres -d postgres -f database/schema_updates_transcript_feedback.sql
```

## Step 2: Drop Existing Transcripts

**⚠️ WARNING: This is destructive and cannot be undone!**

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop all existing transcripts
DELETE FROM diio_transcript_feedback;
DELETE FROM diio_transcripts;
DELETE FROM diio_meetings;
DELETE FROM diio_phone_calls;

-- Optionally reset sequences if you want to start fresh with IDs
-- (UUID-based tables don't need this)

-- Verify deletion
SELECT COUNT(*) as remaining_transcripts FROM diio_transcripts;
SELECT COUNT(*) as remaining_meetings FROM diio_meetings;
SELECT COUNT(*) as remaining_calls FROM diio_phone_calls;
```

You should see:
```
remaining_transcripts | 0
remaining_meetings    | 0
remaining_calls       | 0
```

## Step 3: Re-sync Transcripts

### Option A: Using the UI (Recommended)

1. Go to your app: `http://localhost:3000/diio` (or your deployed URL)
2. Click the **"Sync New Transcripts"** button in the top right
3. Wait for the sync to complete (progress bar will show status)
4. Transcripts will be synced with full attendee information

### Option B: Using the API Endpoint

You can call the sync endpoint directly:

```bash
curl -X POST https://your-app-url.vercel.app/api/diio/sync-transcripts
```

Or using a tool like Postman:
- Method: POST
- URL: `https://your-app-url.vercel.app/api/diio/sync-transcripts`
- Headers: None required
- Body: Empty

### Option C: Using the Daily Cron (Wait for Auto-sync)

If you have the daily cron job set up in Vercel, it will automatically sync new transcripts once per day. Just wait for the next scheduled run.

## Step 4: Verify Attendee Data

After the sync completes, verify that attendees are being captured:

### SQL Check:

```sql
-- Check if attendees field is populated
SELECT 
  id,
  source_name,
  transcript_type,
  attendees,
  occurred_at
FROM diio_transcripts
WHERE attendees IS NOT NULL
LIMIT 5;

-- Count transcripts with attendees
SELECT 
  COUNT(*) as total_transcripts,
  COUNT(CASE WHEN attendees IS NOT NULL THEN 1 END) as transcripts_with_attendees,
  COUNT(CASE WHEN attendees->'sellers' IS NOT NULL THEN 1 END) as with_sellers,
  COUNT(CASE WHEN attendees->'customers' IS NOT NULL THEN 1 END) as with_customers
FROM diio_transcripts;
```

### UI Check:

1. Go to `/diio` page
2. Look at the transcript cards
3. You should see:
   - 👔 **Sellers** section with names/emails
   - 🏢 **Customers** section with names/emails
4. Click "View" on any transcript
5. The modal should show full attendee list with emails

## Step 5: Extract Feedback (Optional)

If you want to also extract feedback segments from transcripts:

1. Click the **"Extract Feedback"** button in the UI
2. Wait for extraction to complete
3. View extracted feedback by clicking the **"Feedback"** button on any transcript

## Troubleshooting

### Problem: Attendees field is NULL for all transcripts

**Possible causes:**
1. DIIO API might not be returning attendees data
2. The meeting/call objects don't have attendees populated

**Solution:**
```sql
-- Check what data is in meetings/calls
SELECT 
  diio_meeting_id, 
  name, 
  attendees 
FROM diio_meetings 
LIMIT 5;

SELECT 
  diio_call_id, 
  name, 
  attendees 
FROM diio_phone_calls 
LIMIT 5;
```

If attendees are NULL in these tables too, the DIIO API might not be providing this data. Contact DIIO support or check their API documentation.

### Problem: Only some transcripts have attendees

This is normal! Not all meetings/calls might have attendee information in DIIO's system.

### Problem: Sync is taking too long

The sync respects rate limits (1.5 seconds per transcript). For 100 transcripts:
- Expected time: ~2.5 minutes
- With additional API calls: ~5-10 minutes

For 500+ transcripts, expect 15-30 minutes.

### Problem: Sync fails with error

Common errors:
1. **"DIIO authentication failed"**: Check your `.env` file has correct DIIO credentials
2. **"Database connection failed"**: Check Supabase credentials
3. **"Rate limit exceeded"**: Wait a few minutes and try again

## Schema Updates Applied

The schema updates add:

1. **`participant_emails` column** to `diio_meetings` and `diio_phone_calls` tables
2. **`feedback_extracted` flag** to `diio_transcripts` table
3. **`diio_transcript_feedback` table** for storing extracted feedback segments
4. **Indexes** for better query performance
5. **Views and functions** for easier data access

## Post-Reset Verification Checklist

- [ ] All old transcripts deleted successfully
- [ ] New transcripts synced from DIIO
- [ ] Attendee data is visible in UI (sellers and customers)
- [ ] Emails are showing in transcript details modal
- [ ] Feedback extraction works (if using that feature)
- [ ] AI sentiment analysis button appears on transcripts
- [ ] No errors in browser console or server logs

## Next Steps

After reset and re-sync:

1. **Test AI Sentiment Analysis**: Click the "AI Analysis" button on any transcript
2. **Monitor for new transcripts**: Daily cron will keep syncing new transcripts
3. **Review attendee data**: Make sure customer and seller information is accurate
4. **Extract feedback**: Use the "Extract Feedback" button to analyze transcript content

## Support

If you encounter issues:

1. Check server logs in Vercel dashboard (Functions → View Logs)
2. Check browser console for frontend errors
3. Verify DIIO API credentials are correct
4. Ensure Supabase database is accessible
5. Review the sync summary returned by the API

---

**Created**: January 2025  
**Last Updated**: January 2025

