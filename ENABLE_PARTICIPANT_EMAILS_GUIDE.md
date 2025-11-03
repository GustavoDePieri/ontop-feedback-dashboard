# Enable Participant Emails - Step by Step Guide

## ✅ Code Changes - DONE!

I've already re-enabled the participant email extraction code:
- ✅ `saveDiioMeetings()` - Now extracts emails from sellers & customers
- ✅ `saveDiioPhoneCalls()` - Now extracts emails from sellers & customers
- ✅ UI displays emails - Already built in `DiioMeetingCard.vue`

---

## 📋 Step-by-Step Instructions

### Step 1: Run Database Migration (Required)

**Open Supabase Dashboard:**
1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Open the file: `database/schema_updates_transcript_feedback.sql`
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **"Run"**

**What this does:**
- Adds `participant_emails` column to `diio_meetings` table
- Adds `participant_emails` column to `diio_phone_calls` table  
- Creates the `diio_transcript_feedback` table
- Adds indexes for performance
- Creates helper views and functions

**Verify it worked:**
```sql
-- Run this in Supabase SQL Editor to verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diio_meetings' 
AND column_name = 'participant_emails';

-- Should return:
-- column_name         | data_type
-- participant_emails  | ARRAY
```

---

### Step 2: Clear All Transcripts (Recommended)

**Why:** Existing transcripts don't have participant email data. By clearing them, you can re-fetch with the new email information.

**Option A: Using Supabase Dashboard (Easy)**
1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Select `diio_transcripts` table
4. Click the filter dropdown
5. Click **"Delete all rows"** (or use the SQL below)

**Option B: Using SQL (Recommended)**
1. Open Supabase SQL Editor
2. Copy contents from: `database/clear_transcripts.sql`
3. Run the script

**Or manually run:**
```sql
-- See current count
SELECT 
  transcript_type,
  COUNT(*) as count
FROM diio_transcripts 
GROUP BY transcript_type;

-- Delete all transcripts
DELETE FROM diio_transcripts;

-- Verify deletion (should return 0)
SELECT COUNT(*) FROM diio_transcripts;
```

**⚠️ Warning:** This permanently deletes all transcript data. Make sure you want to do this!

---

### Step 3: Re-fetch Transcripts with Emails

**In your app:**
1. Navigate to `/diio` page
2. Refresh the page (to get a fresh DIIO API token)
3. Click **"Check for New"** button
4. Wait for the process to complete

**Expected behavior:**
```
✅ Stored 23 users in database
✅ Meetings fetched
✅ Successfully stored X meetings in database
📊 Found X new transcripts to fetch
```

**First 3-4 transcripts will succeed, then you'll get 401 errors** (token expires).

**Workaround until token refresh is implemented:**
1. Refresh the page
2. Click "Check for New" again
3. Repeat until all transcripts are fetched

Each refresh gives you ~3-4 more transcripts before the token expires.

---

### Step 4: Verify Emails are Stored

**Check in Supabase:**
```sql
-- Check that meetings now have emails
SELECT 
  name,
  participant_emails,
  array_length(participant_emails, 1) as email_count
FROM diio_meetings
WHERE participant_emails IS NOT NULL
LIMIT 10;

-- Check transcripts have attendee data
SELECT 
  source_name,
  total_attendees,
  attendees
FROM diio_transcripts
LIMIT 10;
```

**Check in the UI:**
1. Go to `/diio` page
2. Scroll to "Recent Meetings" section
3. You should see:
   - **Sellers:** with names and emails
   - **Customers:** with names and emails

Example of what you should see:
```
Ontop Payroll
11/3/2025, 5:00:00 PM

Sellers:
Gary Chernicki
gchernicki@getontop.com

Customers:
andrea
andrea@even.biz

Mag Rodriguez
mag@even.biz
```

---

## 🎯 What Gets Updated

### Before (Without Emails)
```
Meetings table:
- name: "Ontop Payroll"
- attendees: { sellers: [...], customers: [...] }
- participant_emails: NULL  ❌
```

### After (With Emails)
```
Meetings table:
- name: "Ontop Payroll"  
- attendees: { sellers: [...], customers: [...] }
- participant_emails: ["gchernicki@getontop.com", "andrea@even.biz", "mag@even.biz"]  ✅
```

---

## 🔍 Benefits of Storing Emails

### 1. **Fast Queries**
```sql
-- Find all meetings where a specific person participated
SELECT * FROM diio_meetings 
WHERE 'gchernicki@getontop.com' = ANY(participant_emails);
```

### 2. **Analytics**
```sql
-- Most active participants
SELECT 
  unnest(participant_emails) as email,
  COUNT(*) as meeting_count
FROM diio_meetings
GROUP BY email
ORDER BY meeting_count DESC
LIMIT 10;
```

### 3. **Future Features**
- User-specific meeting dashboards
- Email notifications for participants
- Participant activity tracking
- Cross-reference with feedback submissions

---

## 📊 SQL Queries You Can Now Run

### Find meetings by participant
```sql
SELECT name, scheduled_at, participant_emails
FROM diio_meetings
WHERE 'andrea@even.biz' = ANY(participant_emails)
ORDER BY scheduled_at DESC;
```

### Count meetings per participant
```sql
SELECT 
  unnest(participant_emails) as participant,
  COUNT(*) as meetings
FROM diio_meetings
GROUP BY participant
ORDER BY meetings DESC;
```

### Find meetings with external participants
```sql
SELECT name, participant_emails
FROM diio_meetings
WHERE EXISTS (
  SELECT 1 FROM unnest(participant_emails) as email
  WHERE email NOT LIKE '%@getontop.com'
);
```

### Get customer engagement metrics
```sql
SELECT 
  (attendees->'customers'->>0)::jsonb->>'name' as customer_name,
  COUNT(*) as meeting_count,
  MIN(scheduled_at) as first_meeting,
  MAX(scheduled_at) as last_meeting
FROM diio_meetings
WHERE attendees->'customers' IS NOT NULL
GROUP BY customer_name
ORDER BY meeting_count DESC;
```

---

## ✅ Checklist

- [ ] Run SQL migration (`schema_updates_transcript_feedback.sql`)
- [ ] Verify `participant_emails` column exists
- [ ] Delete all transcripts (`clear_transcripts.sql`)
- [ ] Verify transcripts table is empty
- [ ] Refresh the `/diio` page
- [ ] Click "Check for New" button
- [ ] Verify emails appear in meeting cards
- [ ] Check Supabase to confirm emails are stored

---

## 🐛 Troubleshooting

### Error: "column participant_emails does not exist"
**Solution:** You didn't run the migration yet. Go to Step 1.

### Error: "401 Unauthorized"
**Solution:** DIIO token expired. Refresh the page and try again.

### Emails not showing in UI
**Check:**
1. Did the migration run successfully?
2. Did you re-fetch the meetings after the migration?
3. Check browser console for errors
4. Verify data in Supabase using the SQL queries above

### Some meetings have emails, some don't
**This is normal if:**
- Some meetings don't have attendee data in DIIO
- Some attendees don't have email addresses
- You're looking at old meetings fetched before the migration

**Solution:** Clear and re-fetch all meetings.

---

## 💡 Pro Tips

1. **Batch Processing:** Refresh the page every 3-4 transcripts to avoid token expiration
2. **Monitor Progress:** Watch the console logs for detailed progress
3. **Verify Often:** Check Supabase after each batch to ensure data is saving
4. **Keep Migration File:** Save `schema_updates_transcript_feedback.sql` for future reference

---

## 📞 Support

If you run into issues:
1. Check browser console for error messages
2. Check Supabase logs for database errors
3. Refer to `DIIO_FIXES_AND_NEXT_STEPS.md` for known issues
4. Review the SQL queries above to verify data

---

**Last Updated:** November 3, 2025  
**Status:** Code ready, waiting for database migration

