# 🔄 Client ID Sync - Setup & Usage

Automatically sync Client IDs from Salesforce to your DIIO transcripts.

---

## ✅ Setup (One-Time)

### 1. Add n8n Webhook URL to `.env`

```bash
N8N_WEBHOOK_URL=https://n8n.tools.getontop.com/webhook/lookup-client-ids
```

### 2. Restart Nuxt Server

```bash
npm run dev
```

### 3. Verify n8n Workflow is Active

Make sure your n8n workflow is **Active** and has these nodes:

```
Webhook → Extract Emails → Loop → Salesforce → Format Response → Aggregate → Respond
```

---

## 🚀 Usage

### Run the Sync

The sync will:
1. Find transcripts missing `client_platform_id`
2. Extract customer emails from `attendees`
3. Send emails to n8n → Salesforce lookup
4. Update transcripts with Client IDs

**To run manually:**

```bash
# Test endpoint (optional - to verify n8n connection)
curl -X POST http://localhost:3000/api/transcripts/test-n8n

# Run the sync
curl -X POST http://localhost:3000/api/transcripts/sync-client-ids
```

Or call from your app dashboard (you can add a button later).

---

## 🧪 Testing

### Test the n8n workflow directly:

```powershell
.\test-webhook-direct.ps1
```

**Expected response:**
```json
{
  "success": true,
  "processed": 2,
  "found": 1,
  "results": {
    "gdelpieri@getontop.com": {
      "client_platform_id": "CL000152343",
      "account_name": "Gerardo Consulting CCL"
    }
  },
  "notFound": ["unknown@email.com"]
}
```

---

## 📊 How It Works

```
┌──────────────────────────────────────────────────────┐
│  Transcript created (missing client_platform_id)    │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  API: /api/transcripts/sync-client-ids               │
│  • Finds transcripts without client_platform_id      │
│  • Extracts customer emails from attendees           │
│  • Batches emails (50 at a time)                     │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  POST to n8n webhook                                 │
│  Body: { "emails": ["email1@...", "email2@..."] }  │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  n8n Workflow                                        │
│  • Extract emails → Loop each email                  │
│  • Query Salesforce for Client ID                    │
│  • Format & aggregate results                        │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  Return JSON with Client IDs                         │
│  { "results": { "email": { "client_platform_id" }}} │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│  Update transcripts with Client IDs                  │
│  • Match emails to transcripts                       │
│  • Set client_platform_id & account_name             │
│  • Cache email → Client ID mapping                   │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Automatic Sync (Future)

You can set up automatic syncing by:

1. **Option A: Cron Job** - Run the sync API every hour/day
2. **Option B: Database Trigger** - Trigger sync when new transcripts are added
3. **Option C: n8n Scheduler** - Use n8n to schedule the sync

For now, run manually when needed.

---

## 📝 Files

- `server/api/transcripts/sync-client-ids.post.ts` - Main sync endpoint
- `server/api/transcripts/test-n8n.post.ts` - Test n8n connection
- `test-webhook-direct.ps1` - Test n8n workflow
- `CLIENT_ID_SYNC_IMPLEMENTATION.md` - Technical details

---

## ✅ Success Indicators

After running the sync, you should see:

- Transcripts now have `client_platform_id` populated
- Client names (`account_name`) are filled in
- Clients page shows all transcripts properly associated with clients
- No more transcripts with NULL `client_platform_id`

Check the database:
```sql
SELECT 
  COUNT(*) as total_transcripts,
  COUNT(client_platform_id) as with_client_id,
  COUNT(*) - COUNT(client_platform_id) as missing_client_id
FROM diio_transcripts;
```

---

**Need help?** Check the sync endpoint logs or test the n8n webhook directly.

