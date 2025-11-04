# 🎙️ DIIO Transcript Sync Guide

## Overview

The DIIO page has been remade to focus on displaying stored transcripts from the database. The system automatically syncs transcripts from DIIO API and stores them locally.

## Features

### ✅ New Features

1. **Sync Endpoint** - `/api/diio/sync-transcripts` (POST)
   - Fetches meetings and phone calls from DIIO
   - Identifies new transcripts
   - Fetches and stores new transcripts in database
   - Returns detailed sync results

2. **Daily Sync Endpoint** - `/api/diio/sync-transcripts-daily` (GET)
   - Can be called by Vercel Cron or external scheduler
   - Automatically syncs new transcripts daily at 2 AM UTC

3. **New DIIO Page**
   - Displays stored transcripts from database
   - Search and filter functionality
   - Pagination for large transcript lists
   - Transcript viewer modal
   - Statistics dashboard
   - Manual sync button

## Usage

### Manual Sync

1. Go to `/diio` page
2. Click "Sync New Transcripts" button
3. Wait for sync to complete
4. Transcripts will be automatically loaded

### Daily Automatic Sync

The system is configured to automatically sync transcripts daily at 2 AM UTC using Vercel Cron.

#### Setup (if needed)

1. **Vercel Cron** (Already configured in `vercel.json`):
   ```json
   {
     "crons": [{
       "path": "/api/diio/sync-transcripts-daily",
       "schedule": "0 2 * * *"
     }]
   }
   ```

2. **Optional: Secure the endpoint**:
   - Add `CRON_SECRET` to your environment variables
   - The endpoint will require this secret in the Authorization header
   - Format: `Authorization: Bearer <CRON_SECRET>`

3. **External Cron** (Alternative):
   - Use a service like cron-job.org or EasyCron
   - Set up a GET request to: `https://your-domain.com/api/diio/sync-transcripts-daily`
   - Schedule: Daily at 2 AM UTC

## API Endpoints

### POST `/api/diio/sync-transcripts`

Manually sync transcripts from DIIO.

**Response:**
```json
{
  "success": true,
  "message": "Sync completed! Stored 5 new transcripts, skipped 2, 0 errors.",
  "summary": {
    "meetingsFetched": 10,
    "phoneCallsFetched": 0,
    "newTranscriptsFound": 7,
    "transcriptsStored": 5,
    "transcriptsSkipped": 2,
    "errors": 0
  },
  "details": {
    "meetingTranscriptIds": ["id1", "id2", ...],
    "phoneCallTranscriptIds": [],
    "storedTranscriptIds": ["id1", "id2", ...],
    "errors": []
  }
}
```

### GET `/api/diio/sync-transcripts-daily`

Daily sync endpoint for cron jobs.

**Security:** If `CRON_SECRET` is set, requires `Authorization: Bearer <CRON_SECRET>` header.

**Response:**
```json
{
  "success": true,
  "message": "Daily sync triggered",
  "timestamp": "2025-01-15T02:00:00.000Z",
  "result": { ... } // Same as POST endpoint response
}
```

## Database Schema

Transcripts are stored in the `diio_transcripts` table:

- `diio_transcript_id` - Unique DIIO transcript ID (primary key)
- `transcript_text` - Full transcript text
- `transcript_type` - 'meeting' or 'phone_call'
- `source_id` - Meeting/call ID from DIIO
- `source_name` - Meeting/call name
- `occurred_at` - When the meeting/call occurred
- `duration` - Duration in seconds
- `attendees` - JSON object with attendees
- `analyzed_status` - 'pending', 'finished', or 'error'
- `created_at` - When stored in database
- `updated_at` - Last update time

## Troubleshooting

### Sync Not Working

1. **Check DIIO credentials** in environment variables:
   - `DIIO_CLIENT_ID`
   - `DIIO_CLIENT_SECRET`
   - `DIIO_REFRESH_TOKEN`
   - `DIIO_SUBDOMAIN`

2. **Check database connection**:
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

3. **Check logs**:
   - Vercel function logs will show detailed error messages

### Daily Sync Not Running

1. **Verify Vercel Cron**:
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - Check if the cron job is enabled

2. **Check Vercel logs**:
   - View function execution logs for the sync endpoint

3. **Manual test**:
   - Call `/api/diio/sync-transcripts-daily` manually to verify it works

### Transcripts Not Appearing

1. **Refresh the page**:
   - Click "Refresh" button on the DIIO page

2. **Check database**:
   - Verify transcripts are in `diio_transcripts` table

3. **Check filters**:
   - Make sure no filters are active that might hide transcripts

## Rate Limiting

The sync endpoint includes rate limiting:
- 1.5 seconds delay between transcript fetches
- Prevents overwhelming the DIIO API

## Next Steps

- [ ] Set up daily sync monitoring/alerts
- [ ] Add email notifications for sync failures
- [ ] Implement transcript analysis automation
- [ ] Add export functionality for transcripts

