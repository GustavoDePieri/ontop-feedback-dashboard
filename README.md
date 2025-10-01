# 📊 Ontop Feedback Analytics Dashboard - Complete Documentation

**Version:** 2.0  
**Last Updated:** October 1, 2025  
**Tech Stack:** Nuxt 3 + Tailwind CSS + Google Sheets + Gemini AI

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
- ✅ **AI-Powered Insights** - Gemini AI generates recommendations
- ✅ **Sentiment Analysis** - Automatic classification (Positive, Neutral, Negative)
- ✅ **Interactive Dashboard** - Metrics, charts, and visualizations
- ✅ **Unified Reports** - Generate and export comprehensive reports
- ✅ **Dark Mode** - Modern dark purple theme with Ontop branding
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Authentication** - Password-protected access

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Nuxt 3** | Vue.js framework with SSR |
| **Tailwind CSS** | Utility-first CSS framework |
| **Google Sheets API** | Data source integration |
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

# 4. Add your Google credentials to .env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-key-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[YOUR PRIVATE KEY]
-----END PRIVATE KEY-----"

# 5. Start development server
npm run dev

# 6. Open browser
# Visit: http://localhost:3000
# Default password: Ontop#2025
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
│   ├── useGoogleSheets.ts      # Google Sheets data fetching
│   ├── useReportGenerator.ts   # Report generation logic
│   ├── usePDFGenerator.ts      # PDF export functionality
│   └── useSentimentAnalysis.ts # Sentiment classification
│
├── 📁 layouts/                 # Page layouts
│   └── default.vue             # Main layout with sidebar
│
├── 📁 middleware/              # Route middleware
│   └── auth.global.ts          # Authentication guard
│
├── 📁 server/                  # Server-side code
│   └── api/                    # API endpoints
│       ├── sheets/             # Google Sheets endpoints
│       │   ├── data.get.ts     # Fetch feedback data
│       │   └── test.get.ts     # Test connection
│       └── ai/                 # AI endpoints
│           └── recommendations.post.ts  # Generate AI insights
│
├── 📁 types/                   # TypeScript type definitions
│   └── feedback.ts             # Feedback data types
│
├── 📄 nuxt.config.ts           # Nuxt configuration
├── 📄 tailwind.config.js       # Tailwind/Design system config
├── 📄 package.json             # Dependencies
└── 📄 vercel.json             # Deployment config
```

### Page Routes

| Route | File | Purpose | Authentication |
|-------|------|---------|----------------|
| `/` | `pages/index.vue` | Main dashboard | Required |
| `/analytics` | `pages/analytics.vue` | Advanced analytics | Required |
| `/reports` | `pages/reports.vue` | Report generation | Required |
| `/login` | `pages/login.vue` | Login page | Public |
| `/test` | `pages/test.vue` | Debug/testing | Required |

### Authentication

- **Global middleware** (`auth.global.ts`) protects all routes
- **Login password:** `Ontop#2025` (hardcoded in `pages/login.vue`)
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
- 🤖 **Generate AI Report** - Comprehensive AI analysis
- 🎯 **Priority Stack** - Most requested features
- ⚡ **Quick Wins** - Easy-to-implement improvements
- ⚠️ **Critical Risks** - Issues needing attention

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

### 3. Analytics Page (`pages/analytics.vue`)

**Features:**
- 📈 **Advanced Metrics** - Detailed statistics
- 📊 **Custom Charts** - Multiple visualization options
- 🎯 **Trend Analysis** - Historical performance
- 💰 **Revenue Impact** - MRR/TPV correlation

### 4. AI Intelligence (`Gemini AI`)

**Capabilities:**
- **Pattern Recognition** - Identifies recurring themes
- **Priority Ranking** - Sorts by frequency + revenue impact
- **Evidence-Based** - Provides specific data points
- **Actionable Recommendations** - Concrete next steps
- **Cross-Functional Ownership** - Assigns to correct teams
- **Quick Win Detection** - Identifies easy improvements

**API Endpoint:** `POST /api/ai/recommendations`

---

## 🎨 UI/UX Design System

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
GOOGLE_PROJECT_ID=omega-cosmos-469700-v8
GOOGLE_PRIVATE_KEY_ID=9a944fbca32d21390e1ce9f29f752d90f1367db4
GOOGLE_CLIENT_EMAIL=whatsappvalidaor@omega-cosmos-469700-v8.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=114119840940751151687
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[FULL PRIVATE KEY]
-----END PRIVATE KEY-----"
```

⚠️ **Important:**
- Include BEGIN/END lines
- Set for Production, Preview, and Development
- Redeploy after setting variables

### Post-Deployment Checks

1. ✅ Visit deployed URL
2. ✅ Test login (password: `Ontop#2025`)
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

**Solutions:**
- ✅ Check Gemini AI API key is set
- ✅ Verify `NUXT_GEMINI_API_KEY` in runtime config
- ✅ Check browser console for errors
- ✅ Test with smaller data set

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

### Default Password

```
Ontop#2025
```

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

_Last updated: October 1, 2025_

