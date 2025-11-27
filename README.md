# 📊 Ontop Feedback Analytics Dashboard - Complete Documentation

**Version:** 2.3
**Last Updated:** January 2025  
**Tech Stack:** Nuxt 3 + Tailwind CSS + Google Sheets + DIIO + Gemini AI + Supabase

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Architecture & Structure](#architecture--structure)
4. [Features & Capabilities](#features--capabilities)
5. [UI/UX Design System](#uiux-design-system)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is this?

A modern, AI-powered feedback analytics dashboard that connects to Google Sheets (pulling Salesforce data) and provides intelligent insights using Google's Gemini AI.

### Key Features

- ✅ **Real-time Google Sheets Integration** - Live Salesforce feedback data
- ✅ **DIIO Call Transcription Integration** - Access to phone call and meeting transcripts
- ✅ **AI-Powered Insights** - Gemini AI generates recommendations from **raw feedback text only**
- ✅ **Unbiased Analysis** - AI reads actual client words, not pre-labeled categories/sentiment
- ✅ **Interactive Dashboard** - Metrics, charts, and visualizations
- ✅ **Unified Reports** - Generate and export comprehensive reports
- ✅ **Dark Mode** - Modern dark purple theme with Ontop branding
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Authentication** - Password-protected access

### ⚠️ IMPORTANT: Report Styling Architecture

> **📖 See [REPORT_STYLING_GUIDE.md](./REPORT_STYLING_GUIDE.md) for complete documentation!**

**Quick Reference - When styling AI reports, you MUST edit these files:**

1. **`composables/useReportTemplates.ts`** ⭐ **PRIMARY FILE**
   - Contains the CSS styles and HTML structure for ALL reports
   - Used by BOTH the Reports page and the AI reports on the main dashboard
   - Any style changes here affect the downloadable HTML reports

2. **`pages/index.vue`** (lines ~2847-2900) - AI insights section only
   - Contains inline styles for the AI-powered insights section that gets injected
   - These styles are added dynamically to the report HTML
   - Must match the dark theme defined in `useReportTemplates.ts`

**❌ DO NOT edit `components/ReportDisplayModal.vue` for AI report styling!**
- This component is ONLY used for the Reports page side panel UI
- It displays structured data, NOT the AI report HTML
- The AI report on `pages/index.vue` uses `v-html` to render HTML from `useReportTemplates.ts`

**See the styling guide for detailed explanations, examples, and troubleshooting!**

### 🧠 AI Analysis Philosophy: Unbiased Pattern Discovery

> **🎯 CRITICAL DESIGN DECISION: The AI reads ONLY raw client feedback text**

**Why this matters:**
- ❌ **Old approach**: AI received pre-labeled categories and sentiment → Generic, biased insights
- ✅ **New approach**: AI reads actual client words → Discovers real patterns naturally

**What the AI receives:**
- ✅ **Raw feedback text** (full, untruncated)
- ✅ **Business context** (account name, MRR, TPV, manager, date)
- ✅ **Metadata** (feedback directed to, account stats)
- ❌ **NO categories** (removed to prevent bias)
- ❌ **NO sentiment labels** (AI infers from text)
- ❌ **NO subcategories** (AI discovers patterns itself)

**Benefits:**
1. **More specific insights** - AI finds exact client language patterns
2. **No confirmation bias** - AI doesn't just echo pre-existing labels
3. **Deeper analysis** - AI reads actual pain points, not summaries
4. **Urgency detection** - AI picks up on client tone and language
5. **Real priorities** - Ranked by actual frequency in text, not labels

**Files involved:**
- `server/api/ai/recommendations.post.ts` - Sends only raw text to AI
- `composables/useAIRecommendations.ts` - Frontend interface
- `pages/index.vue` - Displays urgency + inferred sentiment

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Nuxt 3** | Vue.js framework with SSR |
| **Tailwind CSS** | Utility-first CSS framework |
| **Google Sheets API** | Data source integration |
| **DIIO API** | Call transcription integration |
| **Gemini AI** | AI-powered recommendations |
| **Pinia** | State management |
| **Chart.js** | Data visualizations |
| **Vercel** | Hosting & deployment |

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ installed
- Google Service Account credentials
- Vercel account (for deployment)

### Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd feedbackAnalysis

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Add your credentials to .env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-key-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[YOUR PRIVATE KEY]
-----END PRIVATE KEY-----"

# DIIO credentials (optional - for call transcription integration)
DIIO_CLIENT_ID=your-diio-client-id
DIIO_CLIENT_SECRET=your-diio-client-secret
DIIO_REFRESH_TOKEN=your-diio-refresh-token
DIIO_SUBDOMAIN=getontop

# 5. Start development server
npm run dev

# 6. Open browser
# Visit: http://localhost:3000
# Use the default password configured in the application
```

### Project Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
npm run generate   # Generate static site
```

---

## 📁 Architecture & Structure

### Project Structure

```
feedbackAnalysis/
├── 📁 pages/                    # Application pages (routes)
│   ├── index.vue               # Main dashboard (/)
│   ├── analytics.vue           # Advanced analytics (/analytics)
│   ├── reports.vue             # Reports page (/reports)
│   ├── diio.vue                # DIIO transcript management (/diio)
│   ├── login.vue               # Login page (/login)
│   └── test.vue                # Debug/test page (/test)
│
├── 📁 components/              # Reusable components
│   ├── ui/                     # UI components
│   │   ├── AppButton.vue       # Button component
│   │   ├── AppCard.vue         # Card container
│   │   └── AppLoader.vue       # Loading spinner
│   ├── FeedbackDetailModal.vue # Feedback details modal
│   └── ReportDisplayModal.vue  # AI Report modal
│
├── 📁 composables/             # Business logic & utilities
│   ├── useAIRecommendations.ts # AI insights generation
│   ├── useDarkMode.ts          # Dark mode management
│   ├── useGoogleSheets.ts      # Google Sheets data fetching
│   ├── usePDFGenerator.ts      # PDF export functionality
│   ├── useReportGenerator.ts   # Report generation logic
│   ├── useReportTemplates.ts   # Report HTML templates
│   ├── useSentimentAnalysis.ts # Sentiment classification
│   └── useSupabase.ts          # Supabase database operations
│
├── 📁 layouts/                 # Page layouts
│   └── default.vue             # Main layout with sidebar
│
├── 📁 middleware/              # Route middleware
│   └── auth.global.ts          # Authentication guard
│
├── 📁 server/                  # Server-side code
│   ├── api/                    # API endpoints
│   │   ├── ai/                 # AI endpoints
│   │   │   └── recommendations.post.ts
│   │   ├── diio/               # DIIO integration endpoints
│   │   │   ├── sync-transcripts.post.ts # Main sync endpoint (ACTIVE)
│   │   │   ├── sync-transcripts-daily.get.ts # Daily cron (ACTIVE)
│   │   │   ├── feedback-transcripts.get.ts # AI analysis (ACTIVE)
│   │   │   ├── fix-transcripts.post.ts # Admin fix (ACTIVE)
│   │   │   ├── test-transcripts.get.ts # Debug (ACTIVE)
│   │   │   └── [legacy endpoints] # ⚠️ Marked as unused, see comments
│   │   └── sheets/             # Google Sheets endpoints
│   │       ├── data.get.ts     # Fetch feedback data
│   │       └── test.get.ts     # Test connection
│   └── utils/                   # Server utilities
│       ├── diio.ts             # DIIO token management
│       └── transcriptParser.ts # Transcript parsing for AI
│
├── 📁 types/                   # TypeScript type definitions
│   ├── diio.ts                 # DIIO API types
│   └── feedback.ts             # Feedback data types
│
├── 📁 database/                # Database schema
│   └── schema.sql              # Supabase schema
│
├── 📁 docs/                    # Documentation
│   └── archive/                # Archived historical documentation
│       └── [10 archived files] # See docs/archive/ for historical docs
│
├── 📄 nuxt.config.ts           # Nuxt configuration
├── 📄 tailwind.config.js       # Tailwind/Design system config
├── 📄 package.json             # Dependencies
├── 📄 vercel.json             # Deployment config
├── 📄 README.md                # This file - Main documentation
├── 📄 DIIO_API_CONNECTION_CODE.md # Complete DIIO API reference
├── 📄 REPORT_STYLING_GUIDE.md  # Report styling documentation
├── 📄 PROJECT_REVIEW_AND_CLEANUP.md # Codebase review & cleanup status
└── 📄 COMPOSABLES_REVIEW.md    # Composables review documentation
```

### Page Routes

| Route | File | Purpose | Authentication |
|-------|------|---------|----------------|
| `/` | `pages/index.vue` | Main dashboard | Required |
| `/analytics` | `pages/analytics.vue` | Advanced analytics | Required |
| `/reports` | `pages/reports.vue` | Report generation | Required |
| `/diio` | `pages/diio.vue` | DIIO integration test | Required |
| `/login` | `pages/login.vue` | Login page | Public |
| `/test` | `pages/test.vue` | Debug/testing | Required |

### Authentication

- **Global middleware** (`auth.global.ts`) protects all routes
- **Login password:** Configured in `pages/login.vue`
- **Session:** Stored in `localStorage` and server cookie

---

## ✨ Features & Capabilities

### 1. Main Dashboard (`pages/index.vue`)

**Features:**
- 📊 **Executive Summary** - Total feedback, sentiment breakdown
- 📈 **Metrics Cards** - MRR, TPV, high-value accounts
- 📅 **Interactive Calendar** - Feedback timeline visualization
- 🎯 **Sentiment Analysis** - Visual charts and percentages
- 📝 **Recent Feedback** - Filterable feedback list
- 🔍 **Search & Filters** - By sentiment, manager, account
- 👤 **Account Manager Stats** - Performance tracking
- 💡 **Weekly Insights** - Auto-generated summary

**AI Features:**
- 🤖 **Generate AI Report** - Comprehensive AI analysis with 2+ actionable insights per area
- 🎯 **Top Recurring Requests** - Most requested features ranked by frequency
- 📈 **Emerging Patterns** - Early warning signs (minimum 2 specific insights)
- ⚠️ **Critical Risks** - Urgent issues needing attention (minimum 2 specific insights)
- ⚡ **Quick Wins** - Low-effort, high-impact improvements (minimum 2 specific insights)

### 2. Reports Page (`pages/reports.vue`)

**Features:**
- 📋 **Unified Report System** - Configurable report generation
- 🎨 **Custom Templates** - Multiple report formats
- 📊 **AI Insights** - Gemini-powered recommendations
- 📄 **Export Options** - HTML, PDF, Text
- 🔄 **Report History** - Previously generated reports
- ⚙️ **Advanced Filters** - Date range, team, manager

**Report Types:**
- Weekly summaries
- Team performance reports
- Manager-specific reports
- Custom date range reports

### 3. Call Transcripts Page (`pages/diio.vue`)

**Features:**
- 📞 **Transcript Management** - Access and analyze call/meeting transcripts
- 👥 **Attendee Display** - View participants (sellers & customers) with emails
- ⚠️ **Churned Account Tagging** - Automatic identification of churned customer transcripts
- 📋 **Copy Buttons** - One-click copying of transcript IDs, account names, and client IDs
- 📊 **Churned Accounts Report** - Generate detailed reports on churned customer interactions
- 🤖 **AI Sentiment Analysis** - Deep analysis powered by Gemini AI
  - Overall sentiment and satisfaction scoring
  - Churn risk assessment with signal detection
  - Key themes, pain points, and positive feedback
  - Actionable insights with priority and ownership
- 📊 **Feedback Extraction** - Pattern-based feedback segment extraction
- 🔄 **Sync from DIIO** - Manual and automatic daily sync
- 🔍 **Advanced Filtering** - By type, date range, account status, and keyword search
- 🚨 **Smart Quota Management** - Intelligent handling of AI API limits with user guidance

**AI Sentiment Analysis Capabilities:**
- Sentiment scoring (-100% to +100%)
- Customer satisfaction assessment
- Churn risk levels (Low/Medium/High/Critical)
- Churn signal detection (competitors, pricing, escalation)
- Theme identification with urgency classification
- Pain point and highlight extraction
- Prioritized recommendations with team ownership

**Churned Account Features:**
- 🔍 **Churned Account Filtering** - Filter to show only transcripts from churned customers
- 📈 **Churned Account Stats** - Dashboard showing churned transcript counts and percentages
- 🏷️ **Visual Churned Badges** - Red/orange badges marking churned customer transcripts
- 📋 **Churned Report Generation** - Interactive modal with detailed churned account analytics
- 💾 **Account Data Export** - Copy individual account info or complete reports

### 4. Analytics Page (`pages/analytics.vue`)

**Features:**
- 📈 **Advanced Metrics** - Detailed statistics
- 📊 **Custom Charts** - Multiple visualization options
- 🎯 **Trend Analysis** - Historical performance
- 💰 **Revenue Impact** - MRR/TPV correlation

### 5. AI Intelligence (`Gemini AI`)

**Capabilities:**
- **Pattern Recognition** - Identifies recurring themes
- **Priority Ranking** - Sorts by frequency + revenue impact
- **Evidence-Based** - Provides specific data points
- **Actionable Recommendations** - Concrete next steps with clear ownership
- **Cross-Functional Ownership** - Assigns to correct teams
- **Quick Win Detection** - Identifies easy improvements
- **Transcript Sentiment Analysis** - Individual transcript analysis with churn detection
- **Smart Quota Management** - Intelligent handling of API limits with user guidance

**Quota Management Features:**
- 🚨 **Automatic Quota Detection** - Recognizes rate limit errors (429, "Too Many Requests")
- 📊 **Detailed Error Messages** - Shows current limits, retry timing, and upgrade options
- ⏱️ **Auto-Recovery** - Automatically re-enables features after quota reset
- 💡 **User Guidance** - Direct links to billing and usage monitoring
- 🎯 **Rate Limiting** - Prevents excessive API calls during quota periods

**Quality Standards:**
- ✅ **Minimum 2 insights per area** - Emerging Patterns, Critical Risks, Quick Wins
- ✅ **Specific data points** - Includes counts, revenue impact, affected accounts
- ✅ **Actionable format** - Each insight includes WHAT, WHO, WHY, and ACTION
- ✅ **No generic advice** - Every recommendation tied to specific feedback data
- ✅ **Clear ownership** - Assigns team/person responsible for each action

### Transcript Sentiment CLI

- **Stage 1 (`transcript_sentiment_analyzer.py`)** — Processes pending DIIO transcripts (or re-runs them when `--re-analyze` is set), breaks the text into 400-character chunks, runs `cardiffnlp/twitter-xlm-roberta-base-sentiment`, applies the Ontop-specific issue/aspect extraction rules, and caches the chunk-level sentiment + adjusted score in `diio_transcripts.ai_analysis`.
- **Stage 2 (`transcript_sentiment_aggregator.py`)** — Reads all transcripts that already have cached analysis (optionally filtered by `target_accounts.json`), gives negative transcripts 2.5× weight, neutral 0.5×, and positive 1.0×, boosts recent transcripts (2.0× for ≤7 days, 1.5× for ≤30 days, 1.0× for ≤90 days, 0.5× older), calculates a client score from -1.0 to +1.0, classifies it (positive if >0.2, neutral if between -0.2 and 0.2, negative if < -0.2), and upserts the summary into `client_sentiment_summary`.

#### Scoring Summary

| Score Range | Meaning |
| ----------- | ------- |
| -1.0 to -0.2 | Negative sentiment |
| -0.2 to +0.2 | Neutral sentiment |
| +0.2 to +1.0 | Positive sentiment |

**Quick explanation:**

1. Each transcript chunk returns Positive/Neutral/Negative + confidence. Give each chunk a value (+1/0/-1) weighted by confidence and average across the transcript.
2. Apply business rules: billing/refund keywords force negative, polite technical requests pull scores toward neutral.
3. Aggregate per client: negative transcripts count 2.5×, neutral 0.5×, positive 1.0×; recent transcripts are boosted according to age tiers.
4. The final client score (>0.2 → positive, between -0.2 and 0.2 → neutral, < -0.2 → negative) is saved with aspect summaries and recommendations.

#### CLI Examples

- `python transcript_sentiment_analyzer.py --limit 30`
- `python transcript_sentiment_analyzer.py --client CL005639 --chunk-size 500`
- `python transcript_sentiment_aggregator.py --filter-target --period-days 30`
- `python transcript_sentiment_aggregator.py --client CL005639`

#### Dependencies

Ensure `transformers`, `torch`, and `scipy` are installed (they are now listed in `requirements.txt`) before running the transcript analyzer.

#### GitHub Action

- A scheduled workflow (`.github/workflows/transcript-sentiment.yml`) runs every six hours to execute the analyzer and aggregator back-to-back. It requires `SUPABASE_URL`, `SUPABASE_KEY`, and `HUGGINGFACE_API_KEY` to be stored in the repository secrets.

**API Endpoint:** `POST /api/ai/recommendations`

---

## 🎨 UI/UX Design System

### Logo & Branding

**Ontop Logo:**
- **File Location:** `/public/ontop-logo-ai.jpg`
- **Alt Logo:** `/public/onto-logo.jpg` (alternative version)
- **Usage:** Import via `<img src="/ontop-logo-ai.jpg" alt="Ontop Logo" />`
- **Logo Component:** Use `<AppLogo />` for consistent branding across pages

**Logo Component (`components/ui/AppLogo.vue`):**

The `AppLogo` component provides flexible, reusable branding across the application.

**Props:**
```typescript
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'  // Logo size (default: 'md')
  showText?: boolean                        // Show text next to logo (default: true)
  title?: string                            // Title text (default: 'Ontop')
  subtitle?: string                         // Subtitle text (default: 'Analytics AI')
  logoSrc?: string                          // Logo image path (default: '/ontop-logo-ai.jpg')
  altText?: string                          // Alt text (default: 'Ontop Logo')
  shadow?: boolean                          // Add shadow effect (default: true)
}
```

**Usage Examples:**
```vue
<!-- Full logo with text (sidebar) -->
<AppLogo size="md" :show-text="true" />

<!-- Logo only (compact header) -->
<AppLogo size="sm" :show-text="false" />

<!-- Custom title (mobile header) -->
<AppLogo size="sm" :show-text="true" title="Ontop Analytics" :subtitle="null" />

<!-- Large logo (login page) -->
<AppLogo size="xl" :show-text="true" />
```

**Logo Characteristics:**
- **Design:** Purple-pink gradient "A" shape with "AI" badge on dark navy background
- **Colors:** Matches Ontop brand gradient (purple #8b5cf6 → pink #ec4899 → coral #fb7185)
- **Style:** Modern, professional, AI-focused branding
- **Responsive:** Scales beautifully from xs (24px) to xl (80px)

**Where the Logo Appears:**
- ✅ Sidebar header (desktop navigation)
- ✅ Mobile top bar (mobile navigation)
- ✅ Login page (large centered logo)
- ✅ Dashboard header (with analytics icon wrapper)
- ✅ Can be added to any page using `<AppLogo />`

### Color System (Dark Mode)

**Primary Colors:**
```javascript
// Defined in tailwind.config.js
ontop: {
  navy: '#1a0d2e',           // Main background
  'navy-dark': '#0f0819',    // Deeper background
  'navy-light': '#2a1b3d',   // Card backgrounds
  
  purple: { /* scales 50-900 */ },
  pink: { /* scales 50-900 */ },
  coral: { /* scales 50-900 */ }, // Accent color
}
```

**Usage Examples:**
```html
<div class="bg-ontop-navy-dark">
  <h1 class="text-white">Title</h1>
  <button class="bg-gradient-cta">Click Me</button>
</div>
```

### Gradients

**Defined in `tailwind.config.js`:**
```javascript
backgroundImage: {
  'gradient-ontop': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f43f5e 100%)',
  'gradient-ontop-hero': 'linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #fb7185 100%)',
  'gradient-dark': 'linear-gradient(135deg, #0f0819 0%, #1a0d2e 50%, #2a1b3d 100%)',
  'gradient-cta': 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
  'gradient-cta-hover': 'linear-gradient(90deg, #e11d48 0%, #db2777 100%)',
}
```

### Typography

- **Font:** Inter (system fallback to sans-serif)
- **Headings:** White (`text-white`)
- **Body:** White with opacity (`text-white/70`, `text-white/80`)
- **Links:** Coral accent (`text-ontop-coral-400`)

### Components

#### Buttons (`components/ui/AppButton.vue`)

**Variants:**
- `primary` - Coral/pink gradient, white text
- `secondary` - Translucent white, white text
- `danger` - Red gradient
- `success` - Green gradient

**Sizes:**
- `xs`, `sm`, `md` (default), `lg`, `xl`

**States:**
- Loading (spinner)
- Disabled (grayed out)
- Icon support

#### Cards (`components/ui/AppCard.vue`)

**Features:**
- Glass morphism effect (`bg-ontop-navy-light/30 backdrop-blur-sm`)
- Optional header/footer
- Hover effects
- Border with opacity (`border-white/5`)

### Design Patterns

**Glass Morphism:**
```html
bg-white/5 backdrop-blur-sm border border-white/10
```

**Sentiment Colors:**
- Positive: Green (`bg-green-500/10`, `text-green-400`)
- Neutral: Yellow (`bg-yellow-500/10`, `text-yellow-400`)
- Negative: Red (`bg-red-500/10`, `text-red-400`)

**Hover Effects:**
```html
hover:shadow-xl hover:border-white/20 transition-all duration-200
```

---

## 🛠️ Development Guide

### How to Edit Colors

**Edit `tailwind.config.js`:**
```javascript
extend: {
  colors: {
    ontop: {
      navy: '#YOUR_COLOR',  // Change here
      // All components update automatically
    }
  }
}
```

### How to Edit Layout

**Global Layout:** Edit `layouts/default.vue`
- Sidebar navigation
- Mobile top bar
- Logout button

**Page Layout:** Edit respective `pages/*.vue` file
- Each page controls its own layout

### How to Add a New Page

```bash
# 1. Create page file
touch pages/newpage.vue

# 2. Add to navigation (layouts/default.vue)
<NuxtLink to="/newpage">New Page</NuxtLink>

# 3. Page will be auto-routed to /newpage
```

### How to Add a New API Endpoint

```bash
# 1. Create endpoint file
touch server/api/myendpoint.get.ts

# 2. Implement handler
export default defineEventHandler(async (event) => {
  return { data: 'Hello' }
})

# 3. Access at /api/myendpoint
```

### How to Use Composables

```vue
<script setup>
// Import composable
const { data, loading, error } = useGoogleSheets()

// Access state
console.log(data.value)
</script>
```

### Adding New Components

```bash
# 1. Create component
touch components/MyComponent.vue

# 2. Auto-import (no explicit import needed)
<template>
  <MyComponent />
</template>
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option 2: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Nuxt.js
5. Click "Deploy"

### Environment Variables (Production)

Set in Vercel Dashboard → Settings → Environment Variables:

```bash
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[YOUR PRIVATE KEY]
-----END PRIVATE KEY-----"
```

⚠️ **Important:**
- Include BEGIN/END lines
- Set for Production, Preview, and Development
- Redeploy after setting variables

### Post-Deployment Checks

1. ✅ Visit deployed URL
2. ✅ Test login with configured password
3. ✅ Click "Test Connection" in /test page
4. ✅ Generate AI Report to verify Gemini AI
5. ✅ Refresh data to verify Google Sheets

---

## 📡 API Documentation

### Google Sheets Endpoints

#### GET `/api/sheets/data`

Fetches feedback data from Google Sheets.

**Response:**
```typescript
{
  success: boolean
  itemsCount: number
  data: FeedbackItem[]
  summary: {
    total: number
    positive: number
    neutral: number
    negative: number
  }
}
```

#### GET `/api/sheets/test`

Tests Google Sheets connection.

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

### AI Endpoints

#### POST `/api/ai/recommendations`

Generates AI insights using Gemini AI.

**Request:**
```typescript
{
  feedbackData: FeedbackItem[]
  segmentType?: string
  segmentValue?: string
}
```

**Response:**
```typescript
{
  summary: string
  topRecurringRequests: RecurringRequest[]
  quickWins: string[]
  emergingPatterns: string[]
  criticalRisks: string[]
  metadata: {
    generatedAt: string
    itemsAnalyzed: number
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Google Sheets Connection Failed

**Symptoms:**
- Error loading data
- "Authentication failed" message

**Solutions:**
- ✅ Check `.env` file has all variables
- ✅ Verify private key includes BEGIN/END lines
- ✅ Confirm service account has sheet access
- ✅ Test at `/test` page

#### 2. AI Report Not Generating

**Symptoms:**
- Spinner keeps loading
- Error: "Failed to generate report"
- Error: "AI Quota Exceeded"

**Solutions:**
- ✅ Check Gemini AI API key is set
- ✅ Verify `NUXT_GEMINI_API_KEY` in runtime config
- ✅ Check browser console for errors
- ✅ Test with smaller data set

#### 2.5. AI Quota Exceeded

**Symptoms:**
- Error: "🤖 AI Quota Exceeded"
- AI Analysis buttons show "Quota Exceeded" (grayed out)
- Detailed error message with upgrade links

**Solutions:**
- ✅ **Wait for reset** - Free tier resets hourly, paid tier has higher limits
- ✅ **Upgrade plan** - Visit https://makersuite.google.com/app/apikey for paid options
- ✅ **Check usage** - Monitor at https://ai.google.dev/aistudio
- ✅ **Reduce usage** - Space out AI analysis requests to stay within limits
- ✅ **Auto-recovery** - System automatically re-enables after quota reset

#### 3. Dark Mode Not Applied

**Symptoms:**
- Light background instead of dark

**Solutions:**
- ✅ Check `app.vue` has dark mode script
- ✅ Verify `document.documentElement.classList.add('dark')` runs
- ✅ Clear browser cache

#### 4. Build Errors

```bash
# Clear and rebuild
rm -rf .nuxt node_modules package-lock.json
npm install
npm run build
```

### Debug Mode

Visit `/test` page for:
- Google Sheets connection test
- API endpoint testing
- Data fetch verification
- Error details

### Logs

**Local Development:**
- Check terminal output
- Browser console (F12)

**Production (Vercel):**
- Vercel Dashboard → Project → Functions → View Logs
- Real-time function execution logs

---

## 📞 DIIO Integration

### What is DIIO?

DIIO is a call transcription service that records and transcribes sales calls and meetings. The integration allows you to:
- Fetch call transcripts from DIIO
- View users and their calls
- Combine call transcripts with written feedback for comprehensive AI analysis
- Export call data in JSON or CSV format

### Setup

1. **Get DIIO credentials** from your DIIO account
2. **Add to `.env`:**
   ```env
   DIIO_CLIENT_ID=your-client-id
   DIIO_CLIENT_SECRET=your-client-secret
   DIIO_REFRESH_TOKEN=your-refresh-token
   DIIO_SUBDOMAIN=getontop
   ```
3. **Test integration:** Visit `/diio-test` page

### Usage

### DIIO Integration

**Current Implementation:**
- Transcripts are synced from DIIO API and stored in Supabase database
- Manual sync via `/diio` page or automatic daily sync via Vercel Cron
- Transcripts are fetched from database for display and AI analysis

**Documentation:**
- 📘 **Complete API Reference:** See `DIIO_API_CONNECTION_CODE.md`
- 📘 **Project Review:** See `PROJECT_REVIEW_AND_CLEANUP.md` for codebase status
- 📘 **Historical Docs:** See `docs/archive/` for archived implementation guides

**API Endpoints:**
- ✅ `/api/diio/sync-transcripts` (POST) - Manual sync
- ✅ `/api/diio/sync-transcripts-daily` (GET) - Daily cron sync
- ✅ `/api/diio/feedback-transcripts` (GET) - Fetch for AI analysis
- ✅ `/api/diio/fix-transcripts` (POST) - Admin fix endpoint
- ⚠️ Legacy endpoints marked with `⚠️ LEGACY ENDPOINT` comments (see code)

**Test Page:**
Visit `/test` to test Google Sheets connection and DIIO transcript access

---

## 📝 Additional Notes

### Security

- **Authentication:** Password-protected (change in `pages/login.vue`)
- **Environment Variables:** Never commit `.env` to git
- **API Keys:** Stored securely in runtime config
- **HTTPS:** Automatic on Vercel

### Performance

- **SSR:** Server-side rendering for fast initial load
- **Code Splitting:** Automatic per-page bundles
- **CDN:** Global edge network on Vercel
- **Caching:** Smart caching of API responses

### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

### Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- High contrast dark mode
- Responsive font scaling

---

## 🎉 Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `tailwind.config.js` | **ALL color/design system** |
| `nuxt.config.ts` | App configuration |
| `layouts/default.vue` | Global layout/sidebar |
| `pages/index.vue` | Main dashboard |
| `composables/useGoogleSheets.ts` | Data fetching logic |


### Ports

- Development: `http://localhost:3000`
- Production: Vercel-assigned URL

### Support

For issues or questions:
1. Check this documentation
2. Visit `/test` page for debugging
3. Check Vercel function logs
4. Review browser console errors

---

**End of Documentation** 🚀

_Last updated: December 2025_

---

## 📚 Documentation Archive

Historical documentation has been archived to `docs/archive/` for reference:

- `DIIO_INTEGRATION_COMPLETE.md` - Original integration guide
- `DIIO_INTEGRATION_SUMMARY.md` - Integration summary
- `DIIO_FIXES_AND_NEXT_STEPS.md` - Historical fixes and plans
- `DIIO_AI_INTEGRATION_PLAN.md` - AI integration planning doc
- `DIIO_SYNC_GUIDE.md` - Sync guide (info now in README)
- `TRANSCRIPT_FEEDBACK_SEPARATION_GUIDE.md` - Implementation guide
- `AI_INSIGHTS_IMPROVEMENTS.md` - Historical improvements
- `PRD_SIMPLE.md` - Original product requirements
- `diio_api_documentation.md` - Replaced by DIIO_API_CONNECTION_CODE.md
- `ENABLE_PARTICIPANT_EMAILS_GUIDE.md` - Feature implementation guide

**Active Documentation:**
- `README.md` - This file (main documentation)
- `DIIO_API_CONNECTION_CODE.md` - Complete DIIO API reference
- `REPORT_STYLING_GUIDE.md` - Report styling guide
- `PROJECT_REVIEW_AND_CLEANUP.md` - Codebase review and cleanup status
- `COMPOSABLES_REVIEW.md` - Composables review documentation
- `TRANSCRIPT_IMPROVEMENTS.md` - ⭐ **NEW**: Transcript attendee display and AI sentiment analysis
- `scripts/reset-transcripts.md` - Guide for dropping and re-syncing transcripts

---

## 🧹 Recent Changes

### ⭐ Latest: Churned Accounts & Enhanced UX (January 2025)

**New Features:**
- ✅ **Churned Account Tagging** - Automatic identification and tagging of churned customer transcripts
- ✅ **Interactive Churned Report** - Detailed analytics modal showing churned account statistics
- ✅ **Copy Buttons** - One-click copying of transcript IDs, account names, and client platform IDs
- ✅ **Advanced Filtering** - Filter by account status (churned/active) in transcript view
- ✅ **Smart Quota Management** - Intelligent handling of Gemini AI API limits with user guidance
- ✅ **Enhanced Error Handling** - Comprehensive AI quota error messages with upgrade guidance
- ✅ **Visual Churned Badges** - Red/orange badges marking churned customer transcripts
- ✅ **Attendee Display** - Sellers and customers with names and emails
- ✅ **AI Sentiment Analysis** - Individual transcript analysis with churn risk detection

**New API Endpoints:**
- ✅ `POST /api/diio/analyze-transcript` - AI sentiment analysis endpoint
- ✅ `GET /api/diio/reports/churned-accounts` - Churned accounts report generation

**Database Schema Updates:**
- ✅ Added `client_platform_id` and `account_name` columns to `diio_transcripts` table
- ✅ Enhanced transcript storage with churned account metadata

**User Experience Improvements:**
- ✅ **Copy-to-Clipboard** functionality throughout transcript interface
- ✅ **Auto-Recovery** from AI quota limits with smart timing
- ✅ **Interactive Report Modals** replacing simple alerts
- ✅ **Visual Feedback** for all user actions and states

**Documentation:**
- ✅ Created `TRANSCRIPT_IMPROVEMENTS.md` - Complete implementation guide
- ✅ Created `scripts/reset-transcripts.md` - Reset and re-sync guide
- ✅ Updated README.md with all new features and capabilities

**See `TRANSCRIPT_IMPROVEMENTS.md` for complete details and deployment instructions.**

### ⭐ Database Cleanup & AI Caching (January 2025)

**Schema Improvements:**
- ✅ Removed old feedback extraction tables (pattern-matching system)
- ✅ Removed redundant metadata tables (meetings, phone_calls, users)
- ✅ Added `ai_analysis` JSONB column for caching AI results
- ✅ Added `ai_analysis_date` timestamp for cache tracking
- ✅ Created clean, streamlined schema focused on essentials

**Performance Improvements:**
- ✅ AI analysis results cached in database (50-100x faster on repeat views)
- ✅ Cost savings: ~50% reduction in AI API calls
- ✅ UX improvement: "⚡ Cached" badge shows instant results
- ✅ Removed distracting feedback stats cards from UI

**See `DATABASE_CLEANUP_GUIDE.md` for schema migration instructions.**

### Cleanup (December 2025)

**Removed Unused Code:**
- ✅ Removed `components/diio/` directory (5 unused components)
- ✅ Removed `services/diioService.ts` (unused service)
- ✅ Removed `composables/useDiio.ts` (unused composable)
- ✅ Removed `composables/useDiioStore.ts` (unused composable)

**Archived Documentation:**
- ✅ Moved 10 outdated documentation files to `docs/archive/`

**API Endpoint Review:**
- ✅ Added `⚠️ LEGACY ENDPOINT` comments to unused endpoints
- ✅ All unused endpoints marked for future review/removal

See `PROJECT_REVIEW_AND_CLEANUP.md` for complete details.

