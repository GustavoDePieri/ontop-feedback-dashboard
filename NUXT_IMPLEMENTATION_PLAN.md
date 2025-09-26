# 🚀 Nuxt.js Feedback Analytics Dashboard - Implementation Plan

## 📋 Project Overview

**Rebuild the Ontop Feedback Analytics Dashboard using:**
- **Frontend**: Vue 3 + Nuxt 3 + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Charts**: Chart.js + Vue-ChartJS
- **Data Source**: Google Sheets API (live Salesforce data)
- **Deployment**: Vercel or Netlify
- **State Management**: Pinia (Vue's official state manager)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Nuxt.js Application                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Vue 3 + TypeScript)                             │
│  ├── Pages (Dashboard, Analytics, Settings)                │
│  ├── Components (Charts, Cards, Tables)                    │
│  ├── Composables (Data fetching, State management)        │
│  └── Layouts (Main layout, Mobile responsive)             │
├─────────────────────────────────────────────────────────────┤
│  Server API (Nuxt Server Routes)                          │
│  ├── /api/sheets - Google Sheets data fetching            │
│  ├── /api/analytics - Data processing & ML analysis       │
│  └── /api/health - Health check endpoint                  │
├─────────────────────────────────────────────────────────────┤
│  External Services                                         │
│  ├── Google Sheets API (Live Salesforce data)            │
│  └── Google Service Account (Authentication)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Details

### **Core Framework**
- **Nuxt 3**: Meta-framework for Vue.js
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type safety and better DX
- **Vite**: Fast build tool and dev server

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful SVG icons
- **Vue Transitions**: Smooth animations

### **Data Visualization**
- **Chart.js**: Flexible charting library
- **Vue-ChartJS**: Vue.js wrapper for Chart.js
- **ApexCharts** (alternative): Advanced charts with animations

### **Data Management**
- **Pinia**: State management for Vue
- **Google APIs**: Sheets and Auth libraries
- **Zod**: Runtime type validation
- **Date-fns**: Date manipulation utilities

### **Development Tools**
- **ESLint + Prettier**: Code formatting
- **Husky**: Git hooks
- **Commitizen**: Conventional commits
- **Vitest**: Unit testing framework

---

## 📁 Project Structure

```
nuxt-feedback-dashboard/
├── 📁 assets/
│   ├── css/
│   │   └── main.css                 # Tailwind imports
│   └── images/
│       └── logo.png
├── 📁 components/
│   ├── charts/
│   │   ├── SentimentChart.vue       # Sentiment analysis chart
│   │   ├── TopicModelingChart.vue   # Topic modeling visualization
│   │   ├── TimeSeriesChart.vue      # Feedback trends over time
│   │   └── WordCloudChart.vue       # Word frequency visualization
│   ├── ui/
│   │   ├── AppButton.vue            # Reusable button component
│   │   ├── AppCard.vue              # Card container
│   │   ├── AppModal.vue             # Modal dialog
│   │   ├── AppTable.vue             # Data table
│   │   └── AppLoader.vue            # Loading spinner
│   ├── feedback/
│   │   ├── FeedbackList.vue         # Feedback items list
│   │   ├── FeedbackCard.vue         # Individual feedback card
│   │   ├── FeedbackFilters.vue      # Filter controls
│   │   └── FeedbackStats.vue        # Statistics summary
│   └── layout/
│       ├── AppHeader.vue            # Main header
│       ├── AppSidebar.vue           # Navigation sidebar
│       └── AppFooter.vue            # Footer
├── 📁 composables/
│   ├── useGoogleSheets.ts           # Google Sheets data fetching
│   ├── useSentimentAnalysis.ts      # Sentiment analysis logic
│   ├── useTopicModeling.ts          # Topic modeling logic
│   ├── useDataProcessing.ts         # Data transformation utilities
│   ├── useChartData.ts              # Chart data preparation
│   ├── useFilters.ts                # Filtering and search logic
│   ├── useReports.ts                # Weekly/Monthly report generation
│   └── useInsights.ts               # Advanced insights and trends
├── 📁 layouts/
│   └── default.vue                  # Main application layout
├── 📁 middleware/
│   └── auth.ts                      # Authentication middleware
├── 📁 pages/
│   ├── index.vue                    # Dashboard home page
│   ├── analytics.vue                # Advanced analytics page
│   ├── reports/
│   │   ├── index.vue                # Reports overview page
│   │   ├── weekly.vue               # Weekly reports page
│   │   ├── monthly.vue              # Monthly reports page
│   │   └── [id].vue                 # Individual report page
│   ├── feedback/
│   │   ├── index.vue                # Feedback list page
│   │   └── [id].vue                 # Individual feedback page
│   └── settings.vue                 # Configuration page
├── 📁 plugins/
│   ├── chartjs.client.ts            # Chart.js setup
│   └── pinia.ts                     # Pinia store setup
├── 📁 server/
│   └── api/
│       ├── sheets/
│       │   ├── data.get.ts          # Fetch Google Sheets data
│       │   ├── test.get.ts          # Test connection
│       │   └── refresh.post.ts      # Force refresh data
│       ├── analytics/
│       │   ├── sentiment.post.ts    # Sentiment analysis endpoint
│       │   ├── topics.post.ts       # Topic modeling endpoint
│       │   └── trends.get.ts        # Trends analysis
│       └── health.get.ts            # Health check
├── 📁 stores/
│   ├── feedback.ts                  # Feedback data store
│   ├── analytics.ts                 # Analytics data store
│   ├── filters.ts                   # Filter state store
│   └── ui.ts                        # UI state store
├── 📁 types/
│   ├── feedback.ts                  # Feedback data types
│   ├── analytics.ts                 # Analytics types
│   └── api.ts                       # API response types
├── 📁 utils/
│   ├── googleSheets.ts              # Google Sheets utilities
│   ├── sentimentAnalysis.ts         # Sentiment analysis utilities
│   ├── dateUtils.ts                 # Date formatting utilities
│   ├── chartUtils.ts                # Chart configuration utilities
│   └── constants.ts                 # Application constants
├── 📄 nuxt.config.ts                # Nuxt configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 package.json                  # Dependencies
└── 📄 README.md                     # Project documentation
```

---

## 🔧 Implementation Phases

### **Phase 1: Project Setup & Foundation (Week 1)**

#### **1.1 Initialize Project**
```bash
# Create new Nuxt project
npx nuxi@latest init nuxt-feedback-dashboard
cd nuxt-feedback-dashboard

# Install core dependencies
npm install @nuxtjs/tailwindcss @headlessui/vue @heroicons/vue
npm install @pinia/nuxt pinia
npm install chart.js vue-chartjs
npm install @google-cloud/sheets googleapis
npm install zod date-fns

# Install dev dependencies
npm install -D @nuxt/typescript-build
npm install -D eslint prettier @nuxtjs/eslint-config-typescript
npm install -D vitest @vitest/ui jsdom
```

#### **1.2 Configure Nuxt**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-side environment variables
    googleProjectId: process.env.GOOGLE_PROJECT_ID,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
    googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googlePrivateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
    googleSheetsId: '1VfTbd2J91PgIj5skhUbqOst1oLgXEuoyLTqxCOPLJ2Q',
    public: {
      // Client-side environment variables
      appName: 'Ontop Feedback Analytics'
    }
  },
  typescript: {
    strict: true
  }
})
```

#### **1.3 Setup TypeScript Types**
```typescript
// types/feedback.ts
export interface FeedbackItem {
  id: string
  platformClientId: string
  accountName: string
  createdDate: Date
  accountOwner: string
  feedbackDirectedTo: string
  recordType: string
  feedback: string
  sentiment?: 'Positive' | 'Neutral' | 'Negative'
  sentimentScore?: number
  topics?: string[]
}

export interface SentimentAnalysis {
  positive: number
  neutral: number
  negative: number
  totalItems: number
}

export interface TopicModel {
  id: number
  words: string[]
  description: string
  weight: number
}
```

### **Phase 2: Google Sheets Integration (Week 1-2)**

#### **2.1 Server API for Google Sheets**
```typescript
// server/api/sheets/data.get.ts
import { google } from 'googleapis'
import type { FeedbackItem } from '~/types/feedback'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Setup Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: config.googleProjectId,
        private_key_id: config.googlePrivateKeyId,
        private_key: config.googlePrivateKey.replace(/\\n/g, '\n'),
        client_email: config.googleClientEmail,
        client_id: config.googleClientId,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(config.googleClientEmail)}`
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetsId,
      range: 'Sheet1!A:H', // Adjust range as needed
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      throw new Error('No data found in spreadsheet')
    }

    // Convert rows to FeedbackItem objects
    const [headers, ...dataRows] = rows
    const feedbackItems: FeedbackItem[] = dataRows.map((row, index) => ({
      id: `feedback-${index}`,
      platformClientId: row[0] || '',
      accountName: row[1] || '',
      createdDate: new Date(row[2] || Date.now()),
      accountOwner: row[3] || '',
      feedbackDirectedTo: row[4] || '',
      recordType: row[5] || '',
      feedback: row[6] || ''
    }))

    return {
      success: true,
      data: feedbackItems,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch data: ${error.message}`
    })
  }
})
```

#### **2.2 Composable for Data Fetching**
```typescript
// composables/useGoogleSheets.ts
import type { FeedbackItem } from '~/types/feedback'

export const useGoogleSheets = () => {
  const data = ref<FeedbackItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/sheets/data')
      data.value = response.data
      lastUpdated.value = response.lastUpdated
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const testConnection = async () => {
    try {
      const response = await $fetch('/api/sheets/test')
      return response
    } catch (err) {
      throw new Error(`Connection test failed: ${err.message}`)
    }
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    fetchData,
    testConnection
  }
}
```

### **Phase 3: Data Processing & Analytics (Week 2)**

#### **3.1 Sentiment Analysis Composable**
```typescript
// composables/useSentimentAnalysis.ts
import type { FeedbackItem, SentimentAnalysis } from '~/types/feedback'

export const useSentimentAnalysis = () => {
  const analyzeSentiment = async (feedback: string): Promise<{
    sentiment: 'Positive' | 'Neutral' | 'Negative'
    score: number
  }> => {
    // Simple keyword-based sentiment analysis
    // In production, you might want to use a service like Google Cloud Natural Language API
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'happy', 'satisfied']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'poor', 'worst']
    
    const text = feedback.toLowerCase()
    let score = 0
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1
    })
    
    let sentiment: 'Positive' | 'Neutral' | 'Negative'
    if (score > 0) sentiment = 'Positive'
    else if (score < 0) sentiment = 'Negative'
    else sentiment = 'Neutral'
    
    return { sentiment, score: Math.abs(score) }
  }

  const processFeedbackItems = async (items: FeedbackItem[]): Promise<FeedbackItem[]> => {
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const analysis = await analyzeSentiment(item.feedback)
        return {
          ...item,
          sentiment: analysis.sentiment,
          sentimentScore: analysis.score
        }
      })
    )
    
    return processedItems
  }

  const getSentimentSummary = (items: FeedbackItem[]): SentimentAnalysis => {
    const summary = items.reduce(
      (acc, item) => {
        if (item.sentiment === 'Positive') acc.positive++
        else if (item.sentiment === 'Negative') acc.negative++
        else acc.neutral++
        return acc
      },
      { positive: 0, neutral: 0, negative: 0, totalItems: items.length }
    )
    
    return summary
  }

  return {
    analyzeSentiment,
    processFeedbackItems,
    getSentimentSummary
  }
}
```

### **Phase 4: UI Components (Week 2-3)**

#### **4.1 Main Dashboard Page**
```vue
<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Dashboard Header -->
      <div class="px-4 py-6 sm:px-0">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Feedback Analytics Dashboard
            </h1>
            <p class="mt-2 text-gray-600">
              Real-time insights from Salesforce feedback data
            </p>
          </div>
          
          <div class="flex space-x-3">
            <AppButton 
              @click="refreshData" 
              :loading="loading"
              variant="primary"
            >
              Refresh Data
            </AppButton>
            <AppButton 
              @click="testConnection"
              variant="secondary"
            >
              Test Connection
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChatBubbleLeftRightIcon class="h-8 w-8 text-blue-500" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Feedback
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ feedbackData.length }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>
        
        <!-- More stats cards... -->
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Sentiment Analysis
            </h3>
            <SentimentChart :data="sentimentData" />
          </div>
        </AppCard>
        
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Feedback Trends
            </h3>
            <TimeSeriesChart :data="trendsData" />
          </div>
        </AppCard>
      </div>

      <!-- Recent Feedback -->
      <AppCard>
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Recent Feedback
          </h3>
          <FeedbackList :items="recentFeedback" />
        </div>
      </AppCard>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'

// Page metadata
definePageMeta({
  title: 'Dashboard - Ontop Feedback Analytics'
})

// Composables
const { data: feedbackData, loading, fetchData } = useGoogleSheets()
const { processFeedbackItems, getSentimentSummary } = useSentimentAnalysis()

// Computed data
const processedData = computed(() => 
  processFeedbackItems(feedbackData.value)
)

const sentimentData = computed(() => 
  getSentimentSummary(processedData.value)
)

const recentFeedback = computed(() => 
  feedbackData.value
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 10)
)

// Methods
const refreshData = async () => {
  await fetchData()
}

const testConnection = async () => {
  // Implementation for testing connection
}

// Initialize data on mount
onMounted(() => {
  fetchData()
})
</script>
```

#### **4.2 Chart Components**
```vue
<!-- components/charts/SentimentChart.vue -->
<template>
  <div class="relative h-64">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: {
    positive: number
    neutral: number
    negative: number
    totalItems: number
  }
}

const props = defineProps<Props>()

const chartData = computed(() => ({
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [
    {
      data: [props.data.positive, props.data.neutral, props.data.negative],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}
</script>
```

### **Phase 5: Advanced Features (Week 3-4)**

#### **5.1 Real-time Data Updates**
```typescript
// composables/useRealTimeUpdates.ts
export const useRealTimeUpdates = () => {
  const { fetchData } = useGoogleSheets()
  
  const startPolling = (intervalMs: number = 300000) => { // 5 minutes
    const interval = setInterval(() => {
      fetchData()
    }, intervalMs)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
    
    return interval
  }
  
  return {
    startPolling
  }
}
```

#### **5.2 Export Functionality**
```typescript
// composables/useExport.ts
export const useExport = () => {
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = convertToCSV(data)
    downloadFile(csvContent, filename, 'text/csv')
  }
  
  const exportChartAsPNG = (chartRef: any, filename: string) => {
    const canvas = chartRef.chart.canvas
    const url = canvas.toDataURL('image/png')
    downloadFile(url, filename, 'image/png')
  }
  
  return {
    exportToCSV,
    exportChartAsPNG
  }
}
```

### **Phase 6: Deployment & DevOps (Week 4)**

#### **6.1 Environment Configuration**
```bash
# .env.example
GOOGLE_PROJECT_ID=omega-cosmos-469700-v8
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### **6.2 Deployment to Vercel**
```json
// vercel.json
{
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder"
    }
  ]
}
```

#### **6.3 GitHub Actions CI/CD**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test
      
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🚀 Migration Strategy

### **Data Migration**
1. **Keep Current Streamlit Running**: Parallel development approach
2. **API Compatibility**: Ensure same Google Sheets integration
3. **Feature Parity**: Implement all current features first
4. **A/B Testing**: Deploy to staging for comparison
5. **Gradual Rollout**: Switch users gradually

### **Development Workflow**
1. **Week 1**: Setup + Google Sheets integration
2. **Week 2**: Core UI + Basic analytics
3. **Week 3**: Advanced features + Charts
4. **Week 4**: Testing + Deployment + Polish

---

## 📊 Performance Expectations

### **Improvements Over Streamlit**
- **Load Time**: 2-3x faster initial load
- **Interactivity**: Real-time updates without page refresh
- **Mobile Experience**: Responsive design
- **SEO**: Better search engine optimization
- **Caching**: Smart data caching strategies

### **Metrics to Track**
- Page load time < 2 seconds
- Time to interactive < 3 seconds
- Mobile performance score > 90
- Accessibility score > 95

---

## 🔒 Security Considerations

### **Environment Variables**
- All Google API credentials in environment variables
- No sensitive data in client-side code
- Secure server-side API endpoints

### **Data Protection**
- HTTPS everywhere
- Input validation with Zod
- Rate limiting on API endpoints
- CORS configuration

---

## 🧪 Testing Strategy

### **Unit Tests**
- Composables testing with Vitest
- Component testing with Vue Test Utils
- API endpoint testing

### **E2E Tests**
- Critical user journeys
- Chart rendering tests
- Data flow validation

### **Performance Tests**
- Lighthouse CI integration
- Bundle size monitoring
- API response time monitoring

---

## 📈 Future Enhancements

### **Phase 2 Features**
- **Real-time Notifications**: WebSocket integration
- **Advanced ML**: Topic modeling with better algorithms
- **User Management**: Multi-tenant support
- **Custom Dashboards**: Drag & drop dashboard builder
- **API Access**: REST API for external integrations
- **Automated Reports**: Email delivery of weekly/monthly reports
- **Advanced Analytics**: Cohort analysis, retention metrics
- **Predictive Insights**: Forecast feedback trends

### **Technical Improvements**
- **PWA Support**: Offline capabilities
- **Micro-frontends**: Modular architecture
- **GraphQL**: More efficient data fetching
- **Edge Computing**: Vercel Edge Functions

---

## 💰 Cost Comparison

### **Current Streamlit + Render**
- Render hosting: ~$7-25/month
- Development time: Maintenance heavy

### **New Nuxt + Vercel**
- Vercel hosting: $0-20/month (more generous free tier)
- Development time: More efficient, modern tooling
- Performance: Better user experience
- Scalability: Auto-scaling, global CDN

---

## 🎯 Success Metrics

### **Technical KPIs**
- [ ] Page load time < 2s
- [ ] Mobile performance score > 90
- [ ] Zero runtime errors
- [ ] 99.9% uptime

### **User Experience KPIs**
- [ ] Feature parity with current dashboard
- [ ] Improved mobile experience
- [ ] Real-time data updates
- [ ] Export functionality

### **Business KPIs**
- [ ] Reduced hosting costs
- [ ] Faster feature development
- [ ] Better user engagement
- [ ] Improved data insights

---

**Ready to start building? Let's begin with Phase 1: Project Setup! 🚀**
