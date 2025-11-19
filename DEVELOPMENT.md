# 🛠️ Development Documentation

**Last Updated:** January 2025
**Version:** 2.3

This comprehensive development guide contains all technical documentation, implementation details, and maintenance information for the Ontop Feedback Analytics system.

---

## 📋 Table of Contents

- [🏗️ System Architecture](#-system-architecture)
- [🎯 Transcript Features](#-transcript-features)
- [🗄️ Database Management](#️-database-management)
- [🔌 API Integration](#-api-integration)
- [🎨 UI Development](#-ui-development)
- [🔧 Maintenance & Cleanup](#-maintenance--cleanup)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🏗️ System Architecture

### System Overview

```mermaid
graph TB
    subgraph "Data Sources"
        GS[Google Sheets<br/>Salesforce Feedback]
        DIIO[DIIO API<br/>Call Transcripts]
    end

    subgraph "Data Ingestion Layer"
        GS_API[Google Sheets API<br/>/api/sheets/data]
        DIIO_SYNC[DIIO Sync Endpoint<br/>/api/diio/sync-transcripts]
    end

    subgraph "Processing Layer"
        PARSER[Transcript Parser<br/>Churn Signal Detection]
        AI[Gemini AI<br/>Feedback Analysis]
    end

    subgraph "Storage Layer - Supabase"
        FEEDBACK_TABLE[(Written Feedback<br/>feedback_items)]
        TRANSCRIPTS_TABLE[(DIIO Transcripts<br/>diio_transcripts)]
        FEEDBACK_SEGMENTS[(Feedback Segments<br/>diio_transcript_feedback)]
        MEETINGS_TABLE[(Meetings<br/>diio_meetings)]
        CALLS_TABLE[(Phone Calls<br/>diio_phone_calls)]
        REPORTS_TABLE[(Saved Reports<br/>saved_reports)]
    end

    subgraph "API Endpoints"
        SHEETS_API[Sheets API<br/>Data Fetch]
        SYNC_API[Sync API<br/>Transcript Sync]
        EXTRACT_API[Extract API<br/>Feedback Extraction]
        AI_API[AI API<br/>Recommendations]
    end

    subgraph "Frontend Pages"
        DASHBOARD[Dashboard<br/>/index]
        REPORTS[Reports<br/>/reports]
        DIIO_PAGE[DIIO Page<br/>/diio]
        ANALYTICS[Analytics<br/>/analytics]
    end

    GS --> GS_API
    DIIO --> DIIO_SYNC

    GS_API --> FEEDBACK_TABLE
    DIIO_SYNC --> TRANSCRIPTS_TABLE
    DIIO_SYNC --> MEETINGS_TABLE
    DIIO_SYNC --> CALLS_TABLE

    TRANSCRIPTS_TABLE --> EXTRACT_API
    EXTRACT_API --> PARSER
    PARSER --> FEEDBACK_SEGMENTS

    FEEDBACK_TABLE --> AI_API
    FEEDBACK_SEGMENTS --> AI_API
    AI_API --> AI
    AI --> REPORTS_TABLE

    FEEDBACK_TABLE --> DASHBOARD
    FEEDBACK_SEGMENTS --> DASHBOARD
    REPORTS_TABLE --> REPORTS
    TRANSCRIPTS_TABLE --> DIIO_PAGE
    FEEDBACK_SEGMENTS --> DIIO_PAGE

    DASHBOARD --> AI_API
    DIIO_PAGE --> SYNC_API
    DIIO_PAGE --> EXTRACT_API
```

### Data Flow Diagrams

#### 1. Written Feedback Flow (Google Sheets → Dashboard)

```
┌─────────────────┐
│  Google Sheets  │
│  (Salesforce)   │
└────────┬────────┘
         │
         │ 1. Fetch Data
         ▼
┌─────────────────┐
│ /api/sheets/    │
│ data.get.ts     │
└────────┬────────┘
         │
         │ 2. Store in DB
         ▼
┌─────────────────┐
│ Supabase        │
│ feedback_items  │
└────────┬────────┘
         │
         │ 3. Display
         ▼
┌─────────────────┐
│ Dashboard Page  │
│ /index          │
│ - Metrics       │
│ - Charts        │
│ - Recent Items  │
└─────────────────┘
```

#### 2. DIIO Transcript Flow (Sync → Extract → Analyze)

```
┌─────────────────┐
│  DIIO API       │
│  - Meetings     │
│  - Phone Calls  │
└────────┬────────┘
         │
         │ 1. Sync Process
         ▼
┌─────────────────────────────────┐
│ /api/diio/sync-transcripts      │
│ - Fetch all meetings/calls       │
│ - Get transcript IDs            │
│ - Check existing in DB          │
│ - Fetch & store new transcripts  │
└────────┬─────────────────────────┘
         │
         │ 2. Store Metadata
         ▼
┌─────────────────┐      ┌─────────────────┐
│ diio_meetings   │      │ diio_phone_calls│
│ - Participants  │      │ - Participants  │
│ - Emails        │      │ - Emails        │
└─────────────────┘      └─────────────────┘
         │                         │
         └──────────┬──────────────┘
                    │
                    │ 3. Store Transcripts
                    ▼
         ┌─────────────────┐
         │ diio_transcripts│
         │ - Full text     │
         │ - Metadata      │
         └────────┬────────┘
                  │
                  │ 4. Automatic Extraction
                  ▼
┌─────────────────────────────────┐
│ /api/diio/extract-feedback      │
│ - Parse transcript text         │
│ - Detect churn signals          │
│ - Identify sentiment            │
│ - Classify feedback type        │
│ - Match speakers (seller/cust)  │
└────────┬────────────────────────┘
         │
         │ 5. Store Segments
         ▼
┌─────────────────────────────────┐
│ diio_transcript_feedback         │
│ - Feedback segments              │
│ - Churn signals                  │
│ - Sentiment                      │
│ - Speaker info                   │
└─────────────────────────────────┘
```

### Component Architecture

```
                    ┌─────────────────┐
                    │   USER ACCESS   │
                    │  (Browser)      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Nuxt 3 App     │
                    │  (Frontend)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Pages      │    │  Composables │    │  Components  │
│  - index     │    │  - useAI     │    │  - Modals    │
│  - diio      │    │  - useSupabase│   │  - UI        │
│  - reports   │    │  - useSheets │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  API Endpoints  │
                    │  (Server)       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Supabase    │    │  External    │    │  AI Services │
│  Database    │    │  APIs        │    │              │
│              │    │  - Google    │    │  - Gemini    │
│              │    │  - DIIO      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Technical Stack

```
┌─────────────────────────────────┐
│      Frontend (Nuxt 3)          │
│  - Vue 3 Composition API       │
│  - Tailwind CSS                 │
│  - TypeScript                   │
└────────┬────────────────────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────────────────────┐
│      Backend (Nuxt Server)       │
│  - API Routes                    │
│  - Server Utils                  │
└────────┬────────────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Supabase    │   │ External APIs│
│  (Database)  │   │ - Google      │
│              │   │   Sheets     │
│              │   │ - DIIO       │
│              │   │ - Gemini AI  │
└──────────────┘   └──────────────┘
```

---

## 🎯 Transcript Features

### Attendee Information Display

**Problem**: Transcripts were not showing attendee names or emails, even though the data was available in the API.

**Solution**:
- Updated the UI to display attendees (sellers and customers) with names and emails
- Shows attendees in transcript list cards with badges
- Full attendee list with emails in the transcript detail modal
- Visual distinction between sellers (purple) and customers (blue)

**UI Changes**:
- Transcript cards now show:
  - 👔 **Sellers**: Up to 3 sellers with names, with "+ X more" if applicable
  - 🏢 **Customers**: Up to 3 customers with names, with "+ X more" if applicable
  - Hover tooltip shows email addresses
- Transcript detail modal shows:
  - Full list of all sellers with names and emails
  - Full list of all customers with names and emails

### AI Sentiment Analysis

**Features**:
- ✅ **Overall Sentiment**: Positive/Neutral/Negative/Mixed
- ✅ **Sentiment Score**: -100% to +100%
- ✅ **Customer Satisfaction**: Satisfied/Neutral/Frustrated/At Risk
- ✅ **Churn Risk**: Low/Medium/High/Critical (color-coded)
- ✅ **Churn Signals**: Specific phrases indicating risk
- ✅ **Key Themes**: Recurring topics with sentiment and urgency
- ✅ **Pain Points**: Customer frustrations
- ✅ **Positive Highlights**: Things they praised
- ✅ **Actionable Insights**: Prioritized recommendations

**How it works**:
- New API endpoint: `POST /api/diio/analyze-transcript`
- Uses Google Gemini 2.0 Flash model
- Analyzes full transcript text with context (attendees, date, type)
- Returns structured JSON with comprehensive analysis
- Cost: ~$0.01 per analysis

### Churn Signal Detection Process

```
Call Transcript
    ↓
Parse Text
    ↓
Detect Keywords
    ↓
Classify Signals:
  - Payment Issue
  - Worker Payout Issue
  - Recurring Problem
  - Price Negotiation
  - Customer Situation
  - Churn Categories (6 types)
    ↓
Calculate Risk Score (0-100)
    ↓
Store in Database
    ↓
Display in Dashboard
```

### Transcript Storage

#### Database Schema

```sql
CREATE TABLE IF NOT EXISTS diio_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diio_transcript_id VARCHAR(255) UNIQUE NOT NULL, -- DIIO's transcript ID
  transcript_text TEXT NOT NULL,
  transcript_type VARCHAR(50) NOT NULL CHECK (transcript_type IN ('meeting', 'phone_call')),
  source_id VARCHAR(255) NOT NULL, -- Meeting ID or Phone Call ID from DIIO
  source_name VARCHAR(500), -- Meeting name or call name
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  attendees JSONB, -- Store attendees as JSON: {sellers: [{name, email}], customers: [{name, email}]}
  ai_analysis JSONB, -- Full AI analysis result
  ai_analysis_date TIMESTAMP WITH TIME ZONE, -- When analyzed
  client_platform_id VARCHAR(255), -- Churned account platform ID
  account_name VARCHAR(500), -- Churned account name
  analyzed_status VARCHAR(50) DEFAULT 'pending' CHECK (analyzed_status IN ('pending', 'finished', 'error')),
  error_cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes for Performance

```sql
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_diio_id ON diio_transcripts(diio_transcript_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_type ON diio_transcripts(transcript_type);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_source_id ON diio_transcripts(source_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_occurred_at ON diio_transcripts(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_created_at ON diio_transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_ai_analysis_date ON diio_transcripts(ai_analysis_date DESC) WHERE ai_analysis IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_attendees ON diio_transcripts USING GIN (attendees);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_client_platform_id ON diio_transcripts(client_platform_id);
CREATE INDEX IF NOT EXISTS idx_diio_transcripts_account_name ON diio_transcripts(account_name);
```

---

## 🗄️ Database Management

### Database Schema Evolution

#### Current Clean Schema (with AI Caching)

```sql
-- Main transcript table
CREATE TABLE diio_transcripts (
  id UUID PRIMARY KEY,
  diio_transcript_id VARCHAR(255) UNIQUE NOT NULL,
  transcript_text TEXT NOT NULL,
  transcript_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(500),
  occurred_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  attendees JSONB,
  ai_analysis JSONB, -- NEW: AI analysis caching
  ai_analysis_date TIMESTAMP WITH TIME ZONE, -- NEW: When analyzed
  client_platform_id VARCHAR(255), -- NEW: Churned account platform ID
  account_name VARCHAR(500), -- NEW: Churned account name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Cleanup Process

#### What Was Removed (Streamlined Schema)
1. **`diio_transcript_feedback`** - Old pattern-matching feedback extraction system
2. **`diio_meetings`** - Redundant (data is in diio_transcripts)
3. **`diio_phone_calls`** - Redundant (data is in diio_transcripts)
4. **`diio_users`** - Not being used

#### Benefits of Streamlined Schema
- ✅ **Instant AI results** - No need to re-analyze (loads in <100ms instead of 5-10 seconds)
- ✅ **Cost savings** - Only pay for AI analysis once per transcript
- ✅ **Better UX** - Users see "⚡ Cached" badge for instant results
- ✅ **Simpler schema** - One table instead of five
- ✅ **Less confusion** - No more pattern-matching feedback tables

### AI Caching Implementation

#### First Time Analysis
```
User clicks "AI Analysis" button
  ↓
API checks: Does transcript have ai_analysis?
  ↓ NO
Call Gemini AI (~5-10 seconds, ~$0.01)
  ↓
Parse and validate AI response
  ↓
Store result in database (ai_analysis column)
  ↓
Return analysis to user
```

#### Subsequent Analysis (Cached)
```
User clicks "AI Analysis" button
  ↓
API checks: Does transcript have ai_analysis?
  ↓ YES
Return cached result from database (~100ms, $0)
  ↓
User sees "⚡ Cached" badge
```

#### Cost Savings
- **Before (No Caching)**: $0.01 per view (100 views = $1.00/day)
- **After (With Caching)**: $0.01 per unique transcript (50 unique, 100 views = $0.50/day)
- **Savings**: ~50% reduction in AI costs

### Useful Database Queries

#### Check AI Analysis Cache Status
```sql
SELECT
  COUNT(*) as total_transcripts,
  COUNT(ai_analysis) as analyzed,
  COUNT(*) - COUNT(ai_analysis) as needs_analysis,
  ROUND(100.0 * COUNT(ai_analysis) / COUNT(*), 2) as percent_analyzed
FROM diio_transcripts;
```

#### Find Transcripts Needing Analysis
```sql
SELECT * FROM diio_transcripts
WHERE ai_analysis IS NULL
ORDER BY occurred_at DESC;
```

#### Find High Churn Risk Transcripts
```sql
SELECT
  id, source_name, occurred_at,
  ai_analysis->>'churnRisk' as churn_risk,
  ai_analysis->'churnSignals' as signals
FROM diio_transcripts
WHERE ai_analysis->>'churnRisk' IN ('high', 'critical')
ORDER BY occurred_at DESC;
```

#### Get Statistics
```sql
SELECT
  COUNT(*) as total_transcripts,
  COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as analyzed,
  COUNT(CASE WHEN ai_analysis->>'churnRisk' = 'high' THEN 1 END) as high_risk,
  COUNT(CASE WHEN ai_analysis->>'churnRisk' = 'critical' THEN 1 END) as critical_risk
FROM diio_transcripts;
```

---

## 🔌 API Integration

### DIIO API Connection

#### Configuration
```env
DIIO_CLIENT_ID=your-client-id
DIIO_CLIENT_SECRET=your-client-secret
DIIO_REFRESH_TOKEN=your-refresh-token
DIIO_SUBDOMAIN=getontop
```

#### Core API Connection Utility (`server/utils/diio.ts`)

**Key Features**:
- In-memory token caching (expires in 1 hour per DIIO docs)
- Automatic token refresh
- Error handling and retry logic
- Type-safe API responses

**Authentication Flow**:
```typescript
// Get valid access token (uses cache if valid)
const token = await getDiioAccessToken()

// Make authenticated API request
const response = await $fetch(endpoint, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

#### Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/diio/sync-transcripts` | POST | Manual transcript sync |
| `/api/diio/sync-transcripts-daily` | GET | Daily cron job sync |
| `/api/diio/transcripts/[id]` | GET | Get single transcript |
| `/api/diio/meetings` | GET | Get meetings |
| `/api/diio/phone-calls` | GET | Get phone calls |
| `/api/diio/users` | GET | Get users |
| `/api/diio/analyze-transcript` | POST | AI sentiment analysis |

### Google Sheets API Integration

#### Configuration
```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR PRIVATE KEY]\n-----END PRIVATE KEY-----"
```

#### Key Features
- Service account authentication
- Automatic data fetching from Salesforce feedback sheets
- Error handling and retry logic
- Structured data validation

### Gemini AI Integration

#### Configuration
```env
NUXT_GEMINI_API_KEY=your-gemini-api-key
```

#### Usage in Code
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NUXT_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

const result = await model.generateContent(prompt)
const response = await result.response
const text = response.text()
```

#### Rate Limits & Cost
- **Model**: Gemini 2.0 Flash
- **Rate Limit**: 60 requests/minute
- **Cost**: ~$0.01 per analysis
- **Average Tokens**: ~1500 input, ~500 output per transcript

---

## 🎨 UI Development

### Report Styling Guide

#### ⚠️ CRITICAL: Where to Edit Report Styles

**PRIMARY FILE**: `composables/useReportTemplates.ts`
- Contains the complete HTML template with embedded CSS for ALL reports
- All styling is in the `<style>` tag within the template
- Used by both the main dashboard AI reports AND the Reports page

#### Key Areas for Styling

```javascript
const generateExecutiveHTML = (report: WeeklyReportData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* ALL YOUR STYLES GO HERE */
          body { ... }
          .section { ... }
          .metric-card { ... }
        </style>
      </head>
      <body>
        <!-- Report HTML structure -->
      </body>
    </html>
  `
}
```

#### Report Components
- **Header Gradient**: Modify `.header` class
- **Metric Cards**: Modify `.metric-card` class
- **Charts**: Modify `.chart-container` class
- **Tables**: Modify table styles
- **Typography**: Modify font sizes and colors

### Component Structure

#### Active Pages
| Page | Route | Purpose |
|------|-------|---------|
| `pages/index.vue` | `/` | Main dashboard with AI insights |
| `pages/analytics.vue` | `/analytics` | Advanced analytics (placeholder UI) |
| `pages/reports.vue` | `/reports` | Report generation |
| `pages/diio.vue` | `/diio` | DIIO transcript management |
| `pages/login.vue` | `/login` | Authentication |
| `pages/test.vue` | `/test` | Debug/testing page |

#### Active Composables
- `useSupabase.ts` - Database operations
- `useGoogleSheets.ts` - Google Sheets data fetching
- `useAIRecommendations.ts` - AI report generation
- `useReportTemplates.ts` - Report HTML generation
- `useReportGenerator.ts` - Report creation logic
- `useSentimentAnalysis.ts` - Sentiment analysis utilities
- `usePDFGenerator.ts` - PDF export functionality
- `useDarkMode.ts` - Dark mode toggle

#### UI Components
- `FeedbackDetailModal.vue` - Feedback detail modal
- `ReportDisplayModal.vue` - Report display modal
- `AppButton.vue` - Reusable button component
- `AppCard.vue` - Reusable card component
- `AppLoader.vue` - Loading spinner component

### Styling Guidelines

#### Colors
- Use Tailwind CSS classes
- Consistent color palette from design system
- Ensure high contrast for accessibility

#### Layout
- Prefer Tailwind utility classes over custom CSS
- Use responsive design (sm:, md:, lg: breakpoints)
- Avoid inline styles unless necessary

#### Components
- Use Vue 3 Composition API
- TypeScript for type safety
- Consistent naming conventions
- Proper error handling

---

## 🔧 Maintenance & Cleanup

### Project Status Review

#### ✅ Active Components
- **Pages**: 6 pages (all in navigation)
- **API Endpoints**: 20+ endpoints (most active)
- **Components**: 11 components (optimized)
- **Composables**: 8 composables (cleaned up)

#### Key Findings
- ✅ **Core functionality is well-maintained**
- ✅ **Legacy code removed** - Old DIIO integration code cleaned up
- ✅ **Documentation consolidated** - Multiple docs merged into this file
- ✅ **Debug infrastructure preserved** - Test pages kept for development

### Cleanup Actions Completed

#### Removed Unused Composables
- ❌ `composables/useDiio.ts` - Not imported anywhere
- ❌ `composables/useDiioStore.ts` - No usage found
- **Total Lines Removed**: ~595 lines

#### Removed Empty Directories
- ❌ `services/` - Empty directory

#### Documentation Consolidation
- ✅ Merged 9 technical documentation files into this single file
- ✅ Moved archived docs to `docs/archive/`
- ✅ Kept README.md as main project overview

### Verification Before Removal

#### Check for Hidden Usage
```bash
# Search for any imports
grep -r "from.*useDiio" .
grep -r "import.*useDiio" .

# Search for function names
grep -r "getUsers\|getPhoneCalls\|getMeetings\|getTranscript" pages/
grep -r "exportPhoneCalls\|createExport\|downloadExport" pages/

# Search for store usage
grep -r "useDiioStore" .
grep -r "DiioStore" .
```

#### Build Verification
```bash
npm run build
npm run test  # if tests exist
```

---

## 🐛 Troubleshooting

### Database Issues

#### Attendees Not Showing
**Check 1**: Verify data exists
```sql
SELECT id, source_name, attendees
FROM diio_transcripts
WHERE attendees IS NOT NULL
LIMIT 5;
```

**Check 2**: If NULL, re-sync transcripts

#### AI Analysis Cache Not Working
**Check 1**: Verify column exists
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'diio_transcripts'
AND column_name IN ('ai_analysis', 'ai_analysis_date');
```

**Check 2**: Verify data is being stored
```sql
SELECT id, ai_analysis_date,
  ai_analysis->>'overallSentiment' as sentiment
FROM diio_transcripts
WHERE ai_analysis IS NOT NULL
LIMIT 5;
```

#### Clear Cache for Testing
```sql
-- Clear cache for specific transcript
UPDATE diio_transcripts
SET ai_analysis = NULL, ai_analysis_date = NULL
WHERE id = 'transcript-uuid-here';

-- Clear all cache (re-analyze everything)
UPDATE diio_transcripts
SET ai_analysis = NULL, ai_analysis_date = NULL;
```

### AI Analysis Issues

#### "AI Analysis Failed" Error
**Common causes**:
1. Missing Gemini API key - Check `.env` has `NUXT_GEMINI_API_KEY`
2. Rate limit exceeded - Gemini: 60 requests/minute, wait 60 seconds
3. Network issues - Check Vercel function logs

#### Quota Exceeded Error
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [429 Too Many Requests]
```

**Solutions**:
1. **Upgrade Plan**: Visit https://makersuite.google.com/app/apikey for paid options
2. **Wait and Retry**: Free tier resets, retry after delay
3. **Monitor Usage**: Check https://ai.dev/usage?tab=rate-limit
4. **Implement Caching**: Store results to avoid re-analysis

### Sync Issues

#### Transcripts Not Syncing
**Check 1**: DIIO credentials
```env
DIIO_CLIENT_ID=your-client-id
DIIO_CLIENT_SECRET=your-client-secret
DIIO_REFRESH_TOKEN=your-refresh-token
```

**Check 2**: API connectivity
- Visit `/test` page
- Check "Test DIIO Connection" button
- Verify API responses

#### Sync Process Timing
- **Manual Sync**: 5-30 minutes depending on transcript count
- **Daily Sync**: Runs at 2 AM UTC via Vercel cron
- **Progress**: Monitor via UI progress indicators

### UI Issues

#### Hard Refresh for Cache Issues
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Or clear Nuxt cache
rm -rf .nuxt node_modules/.cache
npm run dev
```

#### Copy Button Issues
- Ensure `@click.stop` is used to prevent event propagation
- Check clipboard API support in browser
- Fallback to `document.execCommand('copy')` for older browsers

### Deployment Issues

#### Environment Variables Not Set
- Check Vercel Dashboard → Settings → Environment Variables
- Include BEGIN/END lines for private keys
- Set for Production, Preview, and Development
- Redeploy after setting variables

#### Build Failures
```bash
# Local build test
npm run build

# Check for TypeScript errors
npm run typecheck

# Clear caches
rm -rf node_modules/.cache .nuxt
npm install
```

---

## 📚 Additional Resources

- **README.md** - Main project overview and setup guide
- **docs/archive/** - Archived documentation and old implementation details
- **scripts/reset-transcripts.md** - Guide for resetting and re-syncing transcripts
- **database/** - All database schema files and SQL scripts

---

**Last Updated**: January 2025
**Status**: ✅ Active Development Documentation
