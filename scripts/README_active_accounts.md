# 🚀 Active Accounts Tracking - Complete Implementation Guide

This guide explains how to extend your existing churned accounts tracking to include active accounts using the same email-matching approach.

## 📋 Implementation Summary

✅ **Database Schema**: Added `account_status` column to track active vs churned accounts
✅ **Preservation**: Existing churned account tracking remains intact
✅ **Scripts**: Created scripts to update existing data and match new active accounts
✅ **UI**: Updated filtering and stats to show both account types

## 🔄 Implementation Steps

### 1. Database Migration (Run First)
```sql
-- Run this in your Supabase SQL editor
-- File: database/schema_add_account_status.sql

ALTER TABLE diio_transcripts
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50);

ALTER TABLE diio_transcripts
ADD CONSTRAINT chk_account_status
CHECK (account_status IN ('active', 'churned', 'trial', 'paused', NULL));

CREATE INDEX IF NOT EXISTS idx_diio_transcripts_account_status
ON diio_transcripts(account_status);

CREATE INDEX IF NOT EXISTS idx_diio_transcripts_status_platform
ON diio_transcripts(account_status, client_platform_id);
```

### 2. Preserve Existing Churned Accounts
```bash
# Update all existing transcripts with client_platform_id to have account_status = 'churned'
py scripts/update_churned_account_status.py
```

### 3. Match Active Accounts (When you have the CSV)
```bash
# Once you get the active accounts CSV, run:
py scripts/match_transcripts_with_active_accounts.py
```

## 📊 How It Works

### Database Structure
```sql
diio_transcripts:
├── client_platform_id    -- Account identifier
├── account_name         -- Account name
├── account_status       -- 'active', 'churned', or NULL
└── [other columns...]
```

### Filtering Logic
- **All Accounts**: No filter applied
- **Churned Accounts**: `account_status = 'churned'`
- **Active Accounts**: `account_status = 'active'`
- **Unmatched**: `account_status IS NULL`

### CSV Processing
The active accounts script processes the same CSV structure:
```csv
"Client Platform ID","Account Name","Email","Customer Success Path"
"CL001234","Company Name","email@company.com","Active"
```

It filters for accounts where `Customer Success Path` is NOT "Churned".

## 🎯 Expected Results

After implementation:

### Stats Dashboard
- **Churned Accounts**: Shows transcripts with `account_status = 'churned'`
- **Active Accounts**: Shows transcripts with `account_status = 'active'`
- **Total Matched**: Churned + Active transcripts
- **Unmatched**: Transcripts without account identification

### Filtering Options
- "All Accounts" - Shows everything
- "Churned Accounts" - Only churned transcripts
- "Active Accounts" - Only active transcripts

## 🔧 Files Modified/Created

### Database
- `database/schema_add_account_status.sql` - New schema migration

### Scripts
- `scripts/update_churned_account_status.py` - Preserve existing churned data
- `scripts/match_transcripts_with_active_accounts.py` - Match active accounts
- `scripts/README_active_accounts.md` - This documentation

### UI Updates
- `pages/diio.vue` - Updated filtering logic and added active accounts stats

## 🧪 Testing Steps

1. **Run database migration**
2. **Update existing churned transcripts**: `py scripts/update_churned_account_status.py`
3. **Verify in Supabase**: Check that existing churned transcripts have `account_status = 'churned'`
4. **Test UI**: Visit `/diio` page and verify filtering works
5. **When active CSV is ready**: Run `py scripts/match_transcripts_with_active_accounts.py`
6. **Verify results**: Check stats show both churned and active counts

## 📈 Benefits

✅ **Preserves existing churned functionality**
✅ **Extensible for future account types** (trial, paused, etc.)
✅ **Clear separation** between account statuses
✅ **Same email-matching logic** as existing system
✅ **Enhanced filtering** capabilities in UI
✅ **Better reporting** with separate active/churned insights

## 🚨 Important Notes

- **Backup first**: Always backup your database before running scripts
- **Existing data preserved**: Churned account transcripts remain tagged as churned
- **No breaking changes**: All existing functionality continues to work
- **CSV flexibility**: Scripts work with your existing CSV structure
- **Status constraints**: Database enforces valid status values

## 🎯 Next Steps

1. Run the database migration
2. Update existing churned transcripts
3. Test the UI changes
4. Wait for active accounts CSV
5. Run active accounts matching script
6. Verify everything works correctly

---

**Status**: Ready for implementation
**Risk Level**: Low (preserves existing functionality)
**Testing**: UI filtering and stats display updated
