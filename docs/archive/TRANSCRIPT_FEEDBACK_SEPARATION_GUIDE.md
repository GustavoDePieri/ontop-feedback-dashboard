# 🎙️ Transcript Feedback Separation - Implementation Guide

**Date:** November 3, 2025  
**Status:** ✅ Complete - Ready for Database Migration  
**Impact:** Separates call transcript feedback from written feedback for better analytics

---

## 📋 Overview

This update separates feedback extracted from DIIO call transcripts from written feedback in Google Sheets, and adds proper storage for participant emails. This enables:

1. **Separate Analysis** - Analyze call feedback independently from written feedback
2. **Better Tracking** - Link feedback segments directly to specific meetings/calls
3. **Participant Management** - Store and query by participant emails
4. **Detailed Analytics** - Track feedback by type, urgency, sentiment per call

---

## 🗄️ Database Changes

### **New Table: `diio_transcript_feedback`**

Stores individual feedback segments extracted from call transcripts.

**Key Fields:**
- `transcript_id` - Links to the transcript
- `source_id` - DIIO meeting or call ID
- `segment_number` - Order in the transcript
- `speaker_name` - Who said it
- `speaker_type` - 'seller' or 'customer'
- `feedback_text` - The actual feedback
- `feedback_type` - pain_point, feature_request, praise, concern, question
- `urgency` - critical, high, medium, low
- `sentiment` - positive, neutral, negative
- `keywords` - Extracted keywords array
- `participant_emails` - All participants in the call
- `account_name` - Client account if identified

### **Updated Tables:**

**`diio_meetings`:**
- Added: `participant_emails` (TEXT[]) - Array of all participant emails

**`diio_phone_calls`:**
- Added: `participant_emails` (TEXT[]) - Array of all participant emails

**`diio_transcripts`:**
- Added: `feedback_extracted` (BOOLEAN) - Whether feedback was extracted
- Added: `feedback_extraction_date` (TIMESTAMP) - When it was extracted
- Added: `feedback_segments_count` (INTEGER) - Number of segments found

---

## 🔄 Migration Steps

### **Step 1: Run SQL Schema Updates**

```bash
# In your Supabase SQL Editor, run:
database/schema_updates_transcript_feedback.sql
```

This will:
- ✅ Create `diio_transcript_feedback` table
- ✅ Add `participant_emails` columns to meetings and calls tables
- ✅ Create indexes for performance
- ✅ Create views and functions for querying
- ✅ Set up RLS policies

### **Step 2: Deploy Code Changes**

The following files have been updated:

**`composables/useSupabase.ts`:**
- ✅ Added `DiioTranscriptFeedbackRecord` interface
- ✅ Updated `saveDiioMeetings()` to extract participant emails
- ✅ Updated `saveDiioPhoneCalls()` to extract participant emails
- ✅ Added `saveTranscriptFeedback()` function
- ✅ Added `getTranscriptFeedback()` function
- ✅ Added `getAllTranscriptFeedback()` function
- ✅ Added `getTranscriptFeedbackStats()` function

**Next Steps (to be implemented):**
- Update transcript parser to save feedback segments to database
- Create separate UI for viewing transcript feedback
- Update AI report generator to exclude transcript feedback from main analysis
- Add option to generate transcript-only reports

---

## 📊 How Data Flows Now

### **Before (Mixed):**
```
Written Feedback (Google Sheets) ─┐
                                   ├─> AI Analysis
Call Transcript Feedback ────────┘
```

### **After (Separated):**
```
Written Feedback (Google Sheets) ──> AI Report (Written)
                                   
Call Transcript Feedback ──────────> Transcript Feedback Analysis (Separate)
                                   
Optional: Combined Analysis ───────> Include both sources explicitly
```

---

## 🎯 Usage Examples

### **1. Save Transcript Feedback**

```typescript
import { useSupabase } from '~/composables/useSupabase'

const { saveTranscriptFeedback } = useSupabase()

// After parsing a transcript
const feedbackSegments = [
  {
    transcript_id: 'uuid-here',
    diio_transcript_id: 'diio-transcript-id',
    source_type: 'meeting',
    source_id: 'meeting-id',
    source_name: 'Client Review Call',
    segment_number: 1,
    speaker_name: 'John Smith',
    speaker_type: 'customer',
    feedback_text: 'The payment reports take us 3 hours weekly to reconcile',
    feedback_type: 'pain_point',
    urgency: 'high',
    sentiment: 'negative',
    keywords: ['payment', 'reports', 'reconcile'],
    occurred_at: '2025-11-03T10:00:00Z',
    participant_emails: ['john@client.com', 'sales@ontop.com'],
    account_name: 'Acme Corp'
  }
]

await saveTranscriptFeedback(feedbackSegments)
```

### **2. Get Feedback for a Transcript**

```typescript
const { getTranscriptFeedback } = useSupabase()

const { data: feedback } = await getTranscriptFeedback(transcriptId)

// feedback = array of all segments from that transcript
```

### **3. Query All Transcript Feedback**

```typescript
const { getAllTranscriptFeedback } = useSupabase()

const { data: feedback } = await getAllTranscriptFeedback({
  startDate: '2025-10-01',
  endDate: '2025-10-31',
  feedbackType: 'pain_point',
  urgency: 'high',
  limit: 50,
  offset: 0
})
```

### **4. Get Statistics**

```typescript
const { getTranscriptFeedbackStats } = useSupabase()

const { data: stats } = await getTranscriptFeedbackStats()

// stats = {
//   total_feedback_segments: 1234,
//   pain_points: 456,
//   feature_requests: 321,
//   critical_urgency: 89,
//   ...
// }
```

---

## 🔍 Querying by Participant Email

With the new `participant_emails` array field, you can:

```sql
-- Find all meetings with a specific participant
SELECT * FROM diio_meetings
WHERE 'john@client.com' = ANY(participant_emails);

-- Find all feedback from calls with a specific participant
SELECT * FROM diio_transcript_feedback
WHERE 'john@client.com' = ANY(participant_emails);

-- Find all high-urgency feedback from specific account
SELECT * FROM diio_transcript_feedback
WHERE account_name = 'Acme Corp'
  AND urgency IN ('critical', 'high')
ORDER BY occurred_at DESC;
```

---

## 📈 New Database Views

### **`diio_transcript_feedback_summary`**

Combines transcript feedback with source details:

```sql
SELECT * FROM diio_transcript_feedback_summary
WHERE feedback_type = 'pain_point'
  AND urgency = 'critical'
ORDER BY occurred_at DESC;
```

---

## 🎨 UI Implications

### **Current State:**
- AI Intelligence Report Generator shows mixed feedback
- No separation between written and verbal feedback

### **Planned Updates:**

1. **Separate Transcript Feedback Page** (`/transcript-feedback`)
   - View all feedback extracted from calls
   - Filter by type, urgency, sentiment
   - Search by participant, account, keywords
   - Link to original transcript

2. **Updated AI Report Generator** (`/`)
   - **Option 1:** Written feedback only (default)
   - **Option 2:** Include transcript feedback (toggle)
   - **Option 3:** Transcript feedback only
   - Clear indicators showing data source

3. **Transcript Detail Page** (`/diio`)
   - Show extracted feedback segments inline with transcript
   - Highlight feedback sections
   - Edit/classify feedback manually

---

## 🚀 Next Implementation Steps

### **Phase 1: Database Setup** ✅ **COMPLETE**
- [x] Create SQL schema
- [x] Update TypeScript interfaces
- [x] Add database functions
- [x] Extract participant emails

### **Phase 2: Data Processing** 🔄 **NEXT**
- [ ] Update transcript parser to save feedback to database
- [ ] Process existing transcripts to extract feedback
- [ ] Batch migration script for historical data

### **Phase 3: UI Updates** 📋 **PLANNED**
- [ ] Create `/transcript-feedback` page
- [ ] Add toggle to AI report for transcript inclusion
- [ ] Update `/diio` page to show extracted feedback
- [ ] Add feedback management interface

### **Phase 4: Analytics** 📊 **PLANNED**
- [ ] Transcript-only AI reports
- [ ] Combined analysis with source tracking
- [ ] Trend analysis over time
- [ ] Account-specific feedback views

---

## 🧪 Testing the Changes

### **After SQL Migration:**

```typescript
// 1. Test participant email extraction
const { saveDiioMeetings } = useSupabase()
await saveDiioMeetings(meetings)
// Check: Do meetings now have participant_emails populated?

// 2. Test feedback storage
const { saveTranscriptFeedback } = useSupabase()
const testFeedback = [/* ...feedback segments... */]
const { data, error } = await saveTranscriptFeedback(testFeedback)
// Check: Was feedback saved successfully?

// 3. Test querying
const { getAllTranscriptFeedback } = useSupabase()
const { data: feedback } = await getAllTranscriptFeedback({
  feedbackType: 'pain_point',
  limit: 10
})
// Check: Does it return feedback?

// 4. Test statistics
const { getTranscriptFeedbackStats } = useSupabase()
const { data: stats } = await getTranscriptFeedbackStats()
// Check: Are stats populated?
```

---

## 📝 Migration Checklist

- [ ] **Backup database** before running schema updates
- [ ] **Run SQL migration** in Supabase
- [ ] **Verify tables created** - Check `diio_transcript_feedback` exists
- [ ] **Deploy code changes** to production
- [ ] **Test participant emails** - Check they're being extracted
- [ ] **Process historical transcripts** - Run batch extraction
- [ ] **Update documentation** - Reflect new data structure
- [ ] **Update AI report logic** - Separate transcript feedback
- [ ] **Create new UI pages** - Transcript feedback viewer

---

## 🔐 Security & Performance

### **Indexes Created:**
- ✅ `participant_emails` (GIN index for array searches)
- ✅ `feedback_type`, `urgency`, `sentiment` (for filtering)
- ✅ `occurred_at` (for date range queries)
- ✅ `keywords` (GIN index for text search)

### **RLS Policies:**
- ✅ All operations allowed (adjust based on security requirements)

### **Performance Considerations:**
- Array columns indexed with GIN for fast lookups
- Views created for common queries
- Batch processing recommended for large data sets

---

## 💡 Benefits of This Separation

1. **Cleaner Analytics**
   - Written feedback = deliberate, structured
   - Call feedback = spontaneous, emotional
   - Analyze separately for better insights

2. **Better Tracking**
   - Link feedback to specific calls
   - Track who said what
   - Identify patterns by participant

3. **Flexible Reporting**
   - Generate written-only reports
   - Generate call-only reports
   - Combine both when needed

4. **Improved Search**
   - Find all feedback from specific participant
   - Search by keywords across all calls
   - Filter by urgency, type, sentiment

---

## 📞 Support

**Questions?** See:
- `database/schema_updates_transcript_feedback.sql` - Full SQL schema
- `composables/useSupabase.ts` - Updated functions
- `server/utils/transcriptParser.ts` - Feedback extraction logic

---

**Status: Ready for Database Migration** 🚀

Run the SQL schema file, deploy the code, and the infrastructure is ready!

---

_Created: November 3, 2025_  
_Project: Ontop Feedback Analytics Dashboard v2.4_

