# 🎙️ DIIO Call Transcript AI Integration Plan

**Date:** November 3, 2025  
**Feature:** Extract feedback from DIIO call transcriptions and generate actionable items  
**Status:** 📋 Planning Phase

---

## 🎯 Objective

Integrate DIIO call transcriptions into the AI analysis pipeline to extract client feedback from meetings and calls, combining verbal and written feedback for comprehensive insights.

---

## 💡 Value Proposition

### **Why This Matters:**

1. **Richer Client Understanding**
   - Verbal feedback captures tone, urgency, and emotion
   - Clients often share concerns in calls they wouldn't write down
   - Real-time reactions to features/issues

2. **Complete Feedback Picture**
   - Written feedback: Deliberate, structured
   - Call feedback: Spontaneous, emotional, contextual
   - Combined: Holistic client sentiment

3. **Early Warning System**
   - Churn signals in client tone/language
   - Competitive threats mentioned casually
   - Escalation urgency in voice patterns

4. **Hidden Insights**
   - Feature requests mentioned conversationally
   - Pain points revealed through questions
   - Workflow issues described verbally

---

## 🏗️ Architecture Design

### **Data Flow:**

```
┌─────────────────┐
│  Google Sheets  │ Written Feedback
│   (Salesforce)  │
└────────┬────────┘
         │
         ▼
    ┌────────────────────┐
    │  Feedback Analyzer │
    │    (Combined)      │◄─────┐
    └────────┬───────────┘      │
             │                  │
             ▼                  │
      ┌──────────────┐          │
      │  Gemini AI   │          │
      │   Analysis   │          │
      └──────┬───────┘          │
             │                  │
             ▼                  │
    ┌─────────────────┐         │
    │  AI Insights    │         │
    │   Dashboard     │         │
    └─────────────────┘         │
                                │
┌──────────────────┐            │
│  DIIO API        │ Call Transcripts
│  (Transcripts)   │            │
└────────┬─────────┘            │
         │                      │
         ▼                      │
  ┌────────────────────┐        │
  │ Transcript Parser  │        │
  │ (Extract Feedback) │────────┘
  └────────────────────┘
```

---

## 📋 Implementation Plan

### **Phase 1: Backend Infrastructure** 🔧

#### **1.1 Create Transcript Fetcher**
**File:** `server/api/diio/feedback-transcripts.get.ts`

**Purpose:** Fetch recent call transcripts from DIIO

**Features:**
- Date range filtering (default: last 30 days)
- Pagination support
- Filter by user/team
- Return transcript text + metadata

**API Response:**
```typescript
{
  success: boolean
  transcripts: Array<{
    id: string
    date: string
    title: string
    participants: string[]
    duration: number
    transcript: string
    accountName?: string
    accountOwner?: string
  }>
  total: number
}
```

#### **1.2 Create Feedback Extraction Logic**
**File:** `server/utils/transcriptParser.ts`

**Purpose:** Extract feedback-relevant segments from transcripts

**Smart Extraction:**
- Identify client concerns (keywords: issue, problem, challenge, frustrated)
- Extract feature requests (keywords: want, need, would be great, wish)
- Detect urgency signals (keywords: urgent, critical, ASAP, blocker)
- Remove small talk and non-feedback content
- Preserve context (who said what)

**Example Output:**
```typescript
{
  feedbackSegments: [
    {
      speaker: "Client Name",
      text: "We're really struggling with the payment reports. Takes us 2 hours every week to reconcile manually.",
      type: "pain_point",
      urgency: "medium",
      keywords: ["payment", "reports", "manual", "reconcile"]
    },
    {
      speaker: "Client Name",
      text: "If you could add CSV export to the dashboard, that would save us so much time.",
      type: "feature_request",
      urgency: "low",
      keywords: ["CSV export", "dashboard", "time saving"]
    }
  ]
}
```

#### **1.3 Extend AI Recommendations Endpoint**
**File:** `server/api/ai/recommendations.post.ts`

**Changes:**
- Accept optional `includeTranscripts: boolean` parameter
- Accept optional `transcriptDateRange: { start: string, end: string }`
- Merge written feedback + transcript feedback
- Add source tracking (written vs call)

**Updated Request:**
```typescript
{
  feedbackItems: FeedbackItem[]
  includeTranscripts?: boolean  // NEW
  transcriptDateRange?: {       // NEW
    start: string
    end: string
  }
  segmentType?: string
  segmentValue?: string
  focusArea?: string
}
```

---

### **Phase 2: AI Prompt Enhancement** 🤖

#### **2.1 Update AI Prompt**

**Add to `createPrompt()` function:**

```typescript
const transcriptContext = includeTranscripts ? `
IMPORTANT: This analysis includes BOTH written feedback AND call transcripts.

CALL TRANSCRIPT ANALYSIS:
- Pay special attention to client tone and urgency in transcripts
- Verbal feedback often reveals deeper concerns than written feedback
- Look for patterns across both written and verbal channels
- Note if critical issues appear in calls but not in written feedback (escalation signal)
- Identify mismatches between what's written vs what's said (authenticity check)

When referencing insights from calls, note the source (e.g., "Mentioned in 3 client calls")
` : ''
```

**Enhanced Output Format:**
```json
{
  "topRecurringRequests": [
    {
      "request": "...",
      "sources": {
        "written": 5,
        "calls": 3,
        "total": 8
      },
      "evidence": "Mentioned in 5 written feedback items and 3 client calls...",
      // ... rest of fields
    }
  ]
}
```

---

### **Phase 3: Frontend Integration** 🎨

#### **3.1 Add Transcript Toggle to Dashboard**
**File:** `pages/index.vue`

**UI Addition:**
```vue
<!-- Add to AI Report filters section -->
<div class="filter-option">
  <label class="flex items-center gap-2">
    <input 
      type="checkbox" 
      v-model="aiFilters.includeTranscripts"
      class="form-checkbox"
    />
    <span>🎙️ Include Call Transcripts</span>
  </label>
  <p class="text-xs text-white/50 mt-1">
    Analyze verbal feedback from DIIO call recordings (last 30 days)
  </p>
</div>
```

#### **3.2 Add Source Indicators to Insights**
**File:** `pages/index.vue` (AI section HTML)

**Visual Enhancement:**
```html
<div class="priority-issue">
  <div class="flex items-center gap-2">
    <span class="priority-badge">High</span>
    
    <!-- NEW: Source indicators -->
    <div class="flex gap-1 text-xs">
      <span class="source-badge">📝 5 written</span>
      <span class="source-badge">🎙️ 3 calls</span>
    </div>
  </div>
  <h4>Request Title</h4>
  <!-- ... rest of content -->
</div>
```

#### **3.3 Update Report Metadata**
Show transcript statistics in AI report:
- "Analyzed 45 written feedback items + 12 call transcripts"
- "Date range: Oct 1 - Nov 3, 2025"
- "Calls included: CS team meetings + account review calls"

---

### **Phase 4: Advanced Features** 🚀

#### **4.1 Sentiment Analysis from Tone**
- Detect frustration in call transcripts
- Identify enthusiasm for features
- Flag potential churn signals

#### **4.2 Speaker Identification**
- Track which clients said what
- Link call feedback to account records
- Show per-client conversation history

#### **4.3 Call Type Filtering**
- Support calls only
- Sales/demo calls
- Account review meetings
- Onboarding sessions

#### **4.4 Keyword Search in Transcripts**
Allow searching for specific topics:
- "Find all mentions of 'payment delays' in calls"
- "Show transcript segments about API issues"

---

## 📊 Expected Insights Examples

### **Example 1: Pain Point Discovered in Calls**
**Before (written only):**
- "Payment reports need improvement (3 mentions)"

**After (written + calls):**
- "Payment reports cause significant manual work - mentioned in 3 written feedback items and raised urgently in 5 client calls including 2 high-value accounts ($65K MRR). Clients spending 2-3 hours weekly on manual reconciliation. **Action:** Product team to prioritize automated reconciliation feature."

### **Example 2: Hidden Churn Signal**
**From Transcript:**
- "During call with Acme Corp (Oct 28), client mentioned 'We're also evaluating [Competitor] because they have real-time notifications.' This was NOT captured in written feedback."

**AI Insight:**
- "⚠️ **Critical Risk:** 2 high-value clients ($80K combined MRR) mentioned competitor evaluation in calls but not in written feedback - suggests they're further along in switching process than written feedback indicates. Immediate retention call needed."

### **Example 3: Feature Request Validation**
**Combined Evidence:**
- Written: "CSV export would be helpful" (2 mentions, low priority)
- Calls: "We desperately need CSV export" (mentioned urgently in 8 calls)

**AI Insight:**
- "⚡ **Quick Win (URGENT):** CSV export appears as 'nice to have' in written feedback (2 mentions) but raised as critical in 8 client calls with strong urgency. Gap between written/verbal suggests clients are too polite in written feedback. **High impact opportunity** - Engineering: 2-day implementation."

---

## 🎯 Implementation Timeline

### **Week 1: Backend Foundation**
- [ ] Create transcript fetcher API
- [ ] Build transcript parser utility
- [ ] Test with sample DIIO data

### **Week 2: AI Integration**
- [ ] Extend AI recommendations endpoint
- [ ] Update AI prompt for transcripts
- [ ] Test combined analysis

### **Week 3: Frontend UI**
- [ ] Add transcript toggle
- [ ] Implement source indicators
- [ ] Update report metadata display

### **Week 4: Testing & Refinement**
- [ ] User acceptance testing
- [ ] Refine extraction logic
- [ ] Performance optimization

---

## 🧪 Testing Strategy

### **Test Cases:**

1. **Written + Transcripts Combined**
   - Generate report with both sources
   - Verify insights reference both channels
   - Check source counts are accurate

2. **Transcripts Only**
   - Disable written feedback
   - Verify AI can analyze calls independently
   - Check for quality insights

3. **Edge Cases**
   - No transcripts available (fallback to written only)
   - Transcript parsing errors (graceful handling)
   - Very long transcripts (pagination/chunking)

4. **Performance**
   - Load time with 50+ transcripts
   - AI processing time comparison
   - Memory usage monitoring

---

## 📈 Success Metrics

### **Quantitative:**
- **Coverage:** % of client meetings captured in insights
- **Accuracy:** Feedback extraction precision (manual review sample)
- **Usage:** % of reports that include transcripts
- **Performance:** Report generation time with transcripts

### **Qualitative:**
- **Leadership Feedback:** Are insights more actionable?
- **Hidden Patterns:** New insights discovered only in calls
- **Churn Prevention:** Early warning signals caught from tone

---

## 🔒 Privacy & Compliance

### **Considerations:**
- DIIO transcripts may contain sensitive information
- Ensure GDPR/data protection compliance
- Add transcript data retention policies
- Option to exclude specific calls from analysis

### **Security:**
- Transcripts not stored permanently
- Processed in-memory only
- Access restricted to authorized users
- Audit log for transcript access

---

## 🎨 UI/UX Mockup

### **Dashboard Enhancement:**

```
┌─────────────────────────────────────────────────────┐
│  📊 Generate AI Report                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Filters:                                           │
│  ☐ Account Manager: [Select...]                    │
│  ☐ Date Period: [Last 30 days ▼]                   │
│  ☑ Include Call Transcripts 🎙️                     │
│     └─ Analyze verbal feedback from DIIO calls     │
│                                                     │
│  [Generate Report] 🚀                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🤖 AI-Powered Insights                             │
│                                                     │
│  📊 Analyzed: 45 written feedback + 12 calls        │
│  📅 Date Range: Oct 1 - Nov 3, 2025                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🎯 Top Recurring Requests                          │
│                                                     │
│  ┌───────────────────────────────────────┐          │
│  │ 🔴 HIGH PRIORITY                      │          │
│  │ Payment Report Automation             │          │
│  │                                       │          │
│  │ Sources: 📝 5 written | 🎙️ 8 calls   │          │
│  │ Evidence: Mentioned by 10 clients... │          │
│  │ Revenue Impact: $125K MRR affected   │          │
│  │ Urgency: Critical (flagged in calls) │          │
│  │                                       │          │
│  │ 💬 "We spend 3 hours every week on   │          │
│  │    manual reconciliation" - Acme Corp│          │
│  │    (Call, Oct 28)                    │          │
│  └───────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (When Implemented)

```bash
# 1. Ensure DIIO credentials are set in .env
DIIO_CLIENT_ID=your-client-id
DIIO_CLIENT_SECRET=your-client-secret
DIIO_REFRESH_TOKEN=your-refresh-token

# 2. Start development server
npm run dev

# 3. Navigate to dashboard
# 4. Click "Generate AI Report"
# 5. Check "Include Call Transcripts" ✅
# 6. Click "Generate Report"

# Result: AI analyzes both written feedback + call transcripts!
```

---

## 📚 Technical Dependencies

### **Required:**
- ✅ DIIO API access (already configured)
- ✅ Gemini AI API (already configured)
- ✅ Existing transcript fetching logic

### **New Dependencies:**
- ⚡ No new packages required!
- ⚡ Uses existing infrastructure

---

## 💭 Future Enhancements

### **Phase 5 (Future):**
1. **Real-time Alerts:** Notify when critical issues mentioned in calls
2. **Sentiment Trends:** Track sentiment changes over time from calls
3. **Competitor Mentions:** Auto-flag competitor comparisons in calls
4. **Action Item Tracking:** Convert AI insights to tracked action items
5. **Call Recording Links:** Link insights back to specific call timestamps
6. **Multi-language Support:** Analyze calls in different languages

---

## ✅ Next Steps

**Should we proceed with implementation?**

1. **Start with Phase 1** (Backend Infrastructure)
2. **Test with sample transcripts** 
3. **Refine extraction logic** based on real data
4. **Build frontend UI** once backend is solid

**Estimated Effort:** 2-3 weeks for full implementation

---

**Your thoughts?** Would you like me to start implementing this, or would you prefer to review/adjust the plan first?

---

_Document Created: November 3, 2025_  
_Status: Awaiting approval to proceed_  
_Estimated Completion: 3-4 weeks_

