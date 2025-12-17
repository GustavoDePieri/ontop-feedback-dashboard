# ⚡ Quick Start - Client ID Sync

Get your Client ID sync running in 3 steps!

---

## Step 1: Add Webhook URL to `.env`

Open your `.env` file and add:

```bash
N8N_WEBHOOK_URL=https://n8n.tools.getontop.com/webhook/lookup-client-ids
```

---

## Step 2: Restart Nuxt

```bash
npm run dev
```

---

## Step 3: Run the Sync

### Test the connection first (optional):

```powershell
.\test-webhook-direct.ps1
```

You should see Client IDs returned for the test emails.

### Run the full sync:

```bash
curl -X POST http://localhost:3000/api/transcripts/sync-client-ids
```

Or from browser console:
```javascript
fetch('/api/transcripts/sync-client-ids', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

---

## ✅ Done!

The sync will:
- ✅ Find all transcripts without Client IDs
- ✅ Extract customer emails
- ✅ Get Client IDs from Salesforce via n8n
- ✅ Update transcripts
- ✅ Keep processing until all done

Check your transcripts - they should now have `client_platform_id` populated!

---

**Need more details?** See `CLIENT_ID_SYNC_GUIDE.md`

