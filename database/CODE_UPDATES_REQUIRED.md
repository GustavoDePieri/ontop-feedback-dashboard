# 🔧 Code Updates Required After Database Migration

**Date:** November 28, 2025  
**Purpose:** List of code changes needed after running `cleanup_and_restructure.sql`

---

## ⚠️ Important

After running the database migration, you **must** update the application code to remove references to deleted tables and columns.

---

## 📋 Files That Need Updates

### 1. `composables/useSupabase.ts`

**Functions to Remove/Comment Out:**

#### A. Saved Reports Functions (Lines ~108-189)
- ❌ `saveReport()` - Uses `saved_reports` table
- ❌ `getSavedReports()` - Uses `saved_reports` table
- ❌ `getReportById()` - Uses `saved_reports` table
- ❌ `deleteReport()` - Uses `saved_reports` table
- ❌ `updateReport()` - Uses `saved_reports` table

**Action:** Comment out or remove these functions if reports feature is not needed.

#### B. DIIO Users Function (Lines ~196-218)
- ❌ `saveDiioUsers()` - Uses `diio_users` table

**Action:** Comment out or remove - users data is not being used.

#### C. DIIO Meetings Function (Lines ~221-282)
- ❌ `saveDiioMeetings()` - Uses `diio_meetings` table

**Action:** Comment out or remove - meeting metadata is in `diio_transcripts`.

#### D. DIIO Phone Calls Function (Lines ~285-348)
- ❌ `saveDiioPhoneCalls()` - Uses `diio_phone_calls` table

**Action:** Comment out or remove - call metadata is in `diio_transcripts`.

---

### 2. `server/api/diio/extract-feedback.post.ts`

**Code to Update:**

#### Lines ~131-169: Meeting Metadata Lookup
```typescript
// OLD CODE (needs to be removed):
if (transcript.transcript_type === 'meeting') {
  const { data: meeting } = await supabase
    .from('diio_meetings')  // ❌ Table will be deleted
    .select('*')
    .eq('diio_meeting_id', transcript.source_id)
    .single()
  // ... uses meeting data
}
```

**Action:** Remove this lookup. The `attendees` data is already in `diio_transcripts.attendees`.

#### Lines ~165-190: Phone Call Metadata Lookup
```typescript
// OLD CODE (needs to be removed):
else if (transcript.transcript_type === 'phone_call') {
  const { data: call } = await supabase
    .from('diio_phone_calls')  // ❌ Table will be deleted
    .select('*')
    .eq('diio_call_id', transcript.source_id)
    .single()
  // ... uses call data
}
```

**Action:** Remove this lookup. The `attendees` data is already in `diio_transcripts.attendees`.

**New Approach:**
- Use `transcript.attendees` directly (already in diio_transcripts table)
- No need to query separate tables

---

### 3. `server/api/diio/extract-feedback.post.ts`

**Already Handled:**
- ✅ References to `feedback_extracted`, `feedback_extraction_date`, `feedback_segments_count` are already commented out
- ✅ No action needed for these columns

---

## 🔄 Migration Steps

### Step 1: Run Database Migration
1. Run `database/cleanup_and_restructure.sql` in Supabase SQL Editor
2. Verify migration completed successfully

### Step 2: Update Code
1. Update `composables/useSupabase.ts` - Remove/comment out deleted table functions
2. Update `server/api/diio/extract-feedback.post.ts` - Remove table lookups, use `transcript.attendees` directly

### Step 3: Test Application
1. Test all pages load correctly
2. Test transcript display
3. Test sentiment analysis (if implemented)
4. Check for any errors in browser console

---

## 📝 Detailed Code Changes

### Change 1: Update `extract-feedback.post.ts`

**Before:**
```typescript
// Get source meeting/call data for metadata
let sourceData: any = null
let sellerEmails: string[] = []
let customerEmails: string[] = []

if (transcript.transcript_type === 'meeting') {
  const { data: meeting } = await supabase
    .from('diio_meetings')  // ❌ DELETE THIS
    .select('*')
    .eq('diio_meeting_id', transcript.source_id)
    .single()
  // ... extract from meeting
}
```

**After:**
```typescript
// Get attendee data directly from transcript (already stored)
let sellerEmails: string[] = []
let customerEmails: string[] = []

if (transcript.attendees) {
  if (transcript.attendees.sellers) {
    sellerEmails = transcript.attendees.sellers
      .map((s: any) => s.email)
      .filter((e: string) => e)
  }
  if (transcript.attendees.customers) {
    customerEmails = transcript.attendees.customers
      .map((c: any) => c.email)
      .filter((e: string) => e)
  }
}
```

---

## ✅ Verification Checklist

After updating code:

- [ ] No references to `saved_reports` table
- [ ] No references to `diio_users` table
- [ ] No references to `diio_meetings` table
- [ ] No references to `diio_phone_calls` table
- [ ] No references to `feedback_extracted` column
- [ ] No references to `feedback_extraction_date` column
- [ ] No references to `feedback_segments_count` column
- [ ] Application builds successfully (`npm run build`)
- [ ] Application runs without errors (`npm run dev`)
- [ ] Transcript pages load correctly
- [ ] No errors in browser console

---

## 🚨 Breaking Changes

### Features That Will Stop Working

1. **Saved Reports Feature**
   - If your app uses `saveReport()`, `getSavedReports()`, etc.
   - **Solution:** Either keep `saved_reports` table or implement alternative storage

2. **Meeting/Call Metadata Lookups**
   - Code that queries `diio_meetings` or `diio_phone_calls` separately
   - **Solution:** Use `diio_transcripts.attendees` directly

---

## 📚 Related Files

- **`database/cleanup_and_restructure.sql`** - Database migration script
- **`database/CLEANUP_MIGRATION_GUIDE.md`** - Migration guide
- **`composables/useSupabase.ts`** - Needs updates
- **`server/api/diio/extract-feedback.post.ts`** - Needs updates

---

**Next Step:** Review this document, then update the code files as described above.

---

*Code Updates Guide Created: November 28, 2025*
