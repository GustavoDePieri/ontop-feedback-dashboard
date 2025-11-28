# 🗄️ Database Cleanup Migration Guide

**Date:** November 28, 2025  
**Purpose:** Clean up database structure and prepare for new sentiment analysis workflow

---

## 📋 Overview

This migration script (`cleanup_and_restructure.sql`) will:

1. ✅ **Drop unused tables** - Keep only `diio_transcripts`
2. ✅ **Add new sentiment columns** - For direct sentiment storage
3. ✅ **Remove old columns** - Clean up feedback extraction columns
4. ✅ **Clear AI analysis data** - Reset for fresh analysis
5. ✅ **Reset analyzed_status** - Set all to 'pending'

---

## ⚠️ Important Warnings

### Data Loss
- ❌ **Will DELETE data from:** `saved_reports`, `diio_users`, `diio_meetings`, `diio_phone_calls`
- ❌ **Will CLEAR data from:** `ai_analysis`, `ai_analysis_date` columns
- ❌ **Will RESET:** `analyzed_status` to 'pending' for all rows

### Backup Recommendation
**Before running this migration, create a backup:**
```sql
-- In Supabase, go to Settings > Database > Backups
-- Or export data manually:
-- Export diio_transcripts table data
```

---

## 📊 What Gets Deleted

### Tables to be Dropped
1. **`saved_reports`** - Saved report data (if you need this, export first!)
2. **`diio_meetings`** - Meeting metadata (data is in diio_transcripts)
3. **`diio_phone_calls`** - Phone call metadata (data is in diio_transcripts)
4. **`diio_users`** - User metadata (not being used)
5. **`diio_transcript_feedback`** - Old feedback extraction table (if exists)

### Columns to be Removed
From `diio_transcripts`:
- ❌ `feedback_extracted` (BOOLEAN)
- ❌ `feedback_extraction_date` (TIMESTAMP)
- ❌ `feedback_segments_count` (INTEGER)

### Data to be Cleared
From `diio_transcripts`:
- ❌ `ai_analysis` → Set to NULL
- ❌ `ai_analysis_date` → Set to NULL
- ❌ `analyzed_status` → Set to 'pending'

---

## ✨ What Gets Added

### New Columns in `diio_transcripts`

1. **`sentiment`** (VARCHAR(50))
   - Values: 'positive', 'neutral', 'negative', 'mixed', or NULL
   - Overall sentiment classification

2. **`sentiment_score`** (FLOAT)
   - Numeric score (typically -1.0 to 1.0)
   - Negative values = negative sentiment
   - Positive values = positive sentiment

3. **`positive_meetings`** (INTEGER, DEFAULT 0)
   - Count of positive meetings (for account-level aggregations)

4. **`neutral_meetings`** (INTEGER, DEFAULT 0)
   - Count of neutral meetings (for account-level aggregations)

5. **`negative_meetings`** (INTEGER, DEFAULT 0)
   - Count of negative meetings (for account-level aggregations)

6. **`avg_sentiment_meetings`** (FLOAT)
   - Average sentiment score across meetings (for account-level aggregations)

### New Indexes
- `idx_diio_transcripts_sentiment` - For filtering by sentiment
- `idx_diio_transcripts_sentiment_score` - For sorting/ranking
- `idx_diio_transcripts_sentiment_composite` - Combined index

### New Views
- `diio_transcripts_with_sentiment` - Transcripts with sentiment data
- `diio_transcripts_needs_sentiment` - Transcripts needing analysis

### Updated Function
- `get_diio_transcript_stats()` - Updated to use new sentiment columns

---

## 🚀 How to Run

### Step 1: Backup (Recommended)
1. Go to Supabase Dashboard
2. Navigate to **Settings > Database > Backups**
3. Create a manual backup
4. Or export `diio_transcripts` table data manually

### Step 2: Run Migration
1. Open Supabase SQL Editor
2. Copy the entire contents of `database/cleanup_and_restructure.sql`
3. Paste into SQL Editor
4. Click **Run** or press `Ctrl+Enter`
5. Wait for completion (should take < 1 minute)

### Step 3: Verify
Run these queries to verify:

```sql
-- Check only diio_transcripts table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'diio%' OR table_name LIKE 'saved%');

-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diio_transcripts' 
AND column_name IN ('sentiment', 'sentiment_score', 'positive_meetings', 
                     'neutral_meetings', 'negative_meetings', 'avg_sentiment_meetings');

-- Check old columns are removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'diio_transcripts' 
AND column_name IN ('feedback_extracted', 'feedback_extraction_date', 'feedback_segments_count');

-- Verify AI data is cleared
SELECT 
    COUNT(*) as total,
    COUNT(ai_analysis) as with_ai_analysis,
    COUNT(*) FILTER (WHERE analyzed_status = 'pending') as pending
FROM diio_transcripts;
```

---

## 📝 After Migration

### What to Do Next

1. **Update Application Code**
   - Remove references to deleted tables (`saved_reports`, `diio_meetings`, etc.)
   - Update code to use new `sentiment` and `sentiment_score` columns
   - Remove references to `feedback_extracted`, `feedback_extraction_date`, `feedback_segments_count`
   - Update queries that use `ai_analysis` (now cleared)

2. **Run Sentiment Analysis**
   - Process transcripts to populate new sentiment columns
   - Calculate aggregations (positive_meetings, etc.) per account
   - Update avg_sentiment_meetings for account-level views

3. **Test Application**
   - Verify all pages load correctly
   - Test transcript display
   - Test sentiment analysis features
   - Check for any broken queries

---

## 🔍 Verification Checklist

After running the migration, verify:

- [ ] Only `diio_transcripts` table exists (other tables deleted)
- [ ] New sentiment columns exist in `diio_transcripts`
- [ ] Old feedback columns removed
- [ ] `ai_analysis` and `ai_analysis_date` are NULL
- [ ] `analyzed_status` is 'pending' for all rows
- [ ] New indexes created
- [ ] New views created
- [ ] Statistics function updated
- [ ] Application still works

---

## 🐛 Troubleshooting

### Error: "Cannot drop table because it is referenced by a view"
**Solution:** The script drops views first, but if you have custom views, drop them manually:
```sql
DROP VIEW IF EXISTS your_custom_view CASCADE;
```

### Error: "Column does not exist"
**Solution:** The column might already be removed. The script uses `IF EXISTS` clauses, so it should be safe to re-run.

### Error: "Constraint already exists"
**Solution:** The script uses `DROP CONSTRAINT IF EXISTS`, so re-running should be safe.

### Missing Data After Migration
**Solution:** If you need the deleted data, restore from backup:
1. Go to Supabase Dashboard > Settings > Database > Backups
2. Restore the backup
3. Export the data you need before re-running migration

---

## 📊 Migration Summary

| Action | Count | Details |
|--------|-------|---------|
| **Tables Dropped** | 4-5 | saved_reports, diio_meetings, diio_phone_calls, diio_users, diio_transcript_feedback |
| **Columns Added** | 6 | sentiment, sentiment_score, positive_meetings, neutral_meetings, negative_meetings, avg_sentiment_meetings |
| **Columns Removed** | 3 | feedback_extracted, feedback_extraction_date, feedback_segments_count |
| **Data Cleared** | 2 columns | ai_analysis, ai_analysis_date |
| **Status Reset** | All rows | analyzed_status → 'pending' |
| **Indexes Created** | 3 | For sentiment queries |
| **Views Created** | 2 | For easier querying |
| **Functions Updated** | 1 | get_diio_transcript_stats() |

---

## 📚 Related Files

- **`database/cleanup_and_restructure.sql`** - Main migration script
- **`database/schema_clean.sql`** - Previous clean schema (reference)
- **`database/schema.sql`** - Original schema (reference)

---

## ✅ Success Criteria

Migration is successful when:
1. ✅ Only `diio_transcripts` table exists
2. ✅ New sentiment columns are present
3. ✅ Old columns are removed
4. ✅ AI analysis data is cleared
5. ✅ All analyzed_status = 'pending'
6. ✅ Application runs without errors
7. ✅ New sentiment analysis can be run

---

**Ready to migrate?** Copy `database/cleanup_and_restructure.sql` into Supabase SQL Editor and run it!

---

*Migration Guide Created: November 28, 2025*
