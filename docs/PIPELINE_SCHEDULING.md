# Pipeline Scheduling Guide

This document explains how to schedule the sentiment analysis pipeline to run automatically.

## Pipeline Overview

The complete pipeline consists of 4 main steps:

1. **DIIO Transcript Sync** - Syncs new transcripts from DIIO API (already configured)
2. **Zendesk ETL** - Syncs tickets from Zendesk API
3. **Zendesk Sentiment Analysis** - Analyzes sentiment of Zendesk tickets
4. **Client Aggregation** - Combines Zendesk and DIIO sentiment into client-level summaries

## Scheduling Options

### Option 1: Vercel Cron (Recommended)

The pipeline is configured to run automatically using Vercel Cron. The schedule is defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/diio/sync-transcripts-daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/pipeline/zendesk-etl",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/pipeline/zendesk-sentiment",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/pipeline/aggregate-clients",
      "schedule": "0 5 * * *"
    }
  ]
}
```

**Schedule:**
- **2:00 AM UTC** - DIIO transcript sync
- **3:00 AM UTC** - Zendesk ETL (sync tickets)
- **4:00 AM UTC** - Zendesk sentiment analysis
- **5:00 AM UTC** - Client aggregation

**Note:** Vercel Cron requires a Pro plan. For Hobby plan, use external cron services.

### Option 2: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org) (free)
- [EasyCron](https://www.easycron.com) (free tier available)
- [GitHub Actions](https://github.com/features/actions) (free for public repos)

#### Setup with cron-job.org:

1. Create an account at cron-job.org
2. Add a new cron job for each endpoint:
   - **URL**: `https://your-domain.vercel.app/api/pipeline/zendesk-etl`
   - **Schedule**: `0 3 * * *` (3 AM UTC daily)
   - **Method**: GET
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET` (if configured)

3. Repeat for other endpoints:
   - `/api/pipeline/zendesk-sentiment` - 4 AM UTC
   - `/api/pipeline/aggregate-clients` - 5 AM UTC

### Option 3: Manual Trigger

You can manually trigger any step via API:

```bash
# Zendesk ETL
curl https://your-domain.vercel.app/api/pipeline/zendesk-etl

# Zendesk Sentiment Analysis
curl https://your-domain.vercel.app/api/pipeline/zendesk-sentiment?batch_size=100

# Client Aggregation
curl https://your-domain.vercel.app/api/pipeline/aggregate-clients

# Full Pipeline (runs all steps sequentially)
curl https://your-domain.vercel.app/api/pipeline/full-pipeline
```

### Option 4: Run Full Pipeline at Once

Use the full pipeline endpoint to run all steps sequentially:

```bash
curl https://your-domain.vercel.app/api/pipeline/full-pipeline
```

This endpoint:
1. Runs Zendesk ETL
2. Waits 5 seconds
3. Runs Zendesk Sentiment Analysis
4. Waits 5 seconds
5. Runs Client Aggregation

## Security

### Protecting Cron Endpoints

Add `CRON_SECRET` to your environment variables:

```bash
CRON_SECRET=your-secret-key-here
```

Then cron requests must include the Authorization header:

```bash
Authorization: Bearer your-secret-key-here
```

**For Vercel Cron:**
- Vercel automatically adds the `x-vercel-signature` header
- You can verify this instead of using CRON_SECRET

**For External Cron:**
- Use the `CRON_SECRET` in the Authorization header
- Format: `Authorization: Bearer YOUR_CRON_SECRET`

## API Endpoints

### `/api/pipeline/zendesk-etl`

Triggers Zendesk ETL to sync tickets.

**Query Parameters:**
- `max_tickets` (optional): Maximum tickets to process (default: 10000)

**Example:**
```
GET /api/pipeline/zendesk-etl?max_tickets=5000
```

### `/api/pipeline/zendesk-sentiment`

Triggers Zendesk sentiment analysis.

**Query Parameters:**
- `batch_size` (optional): Number of tickets to process (default: 50)
- `all_clients` (optional): Process all clients, not just those with client_id (default: false)

**Example:**
```
GET /api/pipeline/zendesk-sentiment?batch_size=100&all_clients=true
```

### `/api/pipeline/aggregate-clients`

Triggers client sentiment aggregation.

**Query Parameters:**
- `client_id` (optional): Process specific client only (default: all clients)

**Example:**
```
GET /api/pipeline/aggregate-clients?client_id=CL005778
```

### `/api/pipeline/full-pipeline`

Runs the complete pipeline (ETL → Sentiment → Aggregation).

**No parameters required.**

## Monitoring

### Check Pipeline Status

You can check if the pipeline ran successfully by:

1. **Checking Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter by cron job executions

2. **Checking Database:**
   ```sql
   -- Check last aggregation time
   SELECT MAX(last_calculated_at) FROM client_sentiment_summary;
   
   -- Check recent Zendesk tickets
   SELECT COUNT(*) FROM zendesk_conversations 
   WHERE created_at > NOW() - INTERVAL '1 day';
   
   -- Check analyzed tickets
   SELECT COUNT(*) FROM zendesk_conversations 
   WHERE sentiment_analyzed_at > NOW() - INTERVAL '1 day';
   ```

3. **API Health Check:**
   ```bash
   curl https://your-domain.vercel.app/api/pipeline/zendesk-etl
   ```

## Troubleshooting

### Python Scripts Not Found

If you get "script not found" errors:
- Ensure scripts are in the `scripts/` directory
- Check file permissions
- Verify Python 3 is available in the environment

### Timeout Issues

Vercel has execution time limits:
- **Hobby**: 10 seconds
- **Pro**: 60 seconds
- **Enterprise**: 300 seconds

If scripts timeout:
- Reduce batch sizes
- Run scripts in smaller chunks
- Consider using Vercel Functions with longer timeouts
- Or use external job queue (e.g., BullMQ, AWS Lambda)

### Environment Variables

Ensure all required environment variables are set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ZENDESK_EMAIL`
- `ZENDESK_API_TOKEN`
- `ZENDESK_SUBDOMAIN`
- `HUGGINGFACE_API_KEY`
- `CRON_SECRET` (optional, for security)

## Best Practices

1. **Stagger Execution Times**: Run steps sequentially with delays to avoid resource conflicts
2. **Monitor First Runs**: Check logs after first scheduled run to ensure everything works
3. **Set Up Alerts**: Configure error notifications for failed pipeline runs
4. **Regular Maintenance**: Periodically check that all steps are completing successfully
5. **Backup Strategy**: Keep backups of sentiment data before major pipeline changes

## Custom Schedules

To change the schedule, update `vercel.json` with cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Examples:**
- `0 2 * * *` - Daily at 2 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 1` - Every Monday at midnight
- `0 0 1 * *` - First day of every month

