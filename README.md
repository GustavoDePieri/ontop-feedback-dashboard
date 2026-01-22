# Ontop Feedback Analytics Dashboard

AI-powered customer intelligence platform integrating Zendesk tickets, DIIO call transcripts, and OpenAI for comprehensive client insights.

## Tech Stack

- **Nuxt 3** - Vue.js framework with SSR
- **Supabase** - PostgreSQL database and backend
- **Tailwind CSS** - Utility-first styling
- **OpenAI GPT-4** - AI-powered client enrichment
- **HuggingFace** - Sentiment analysis
- **DIIO API** - Call transcription integration
- **Zendesk API** - Support ticket integration
- **n8n** - Workflow automation (Client ID sync)

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- OpenAI API key
- HuggingFace API key
- DIIO API credentials (optional)
- n8n webhook URL (optional, for Client ID sync)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Add your credentials to .env
# See env.example for required variables

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

Required variables (see `env.example` for full list):

**Core:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for client enrichment
- `HUGGINGFACE_API_KEY` - HuggingFace API key for sentiment analysis

**Optional:**
- `DIIO_CLIENT_ID` - DIIO API client ID
- `DIIO_CLIENT_SECRET` - DIIO API client secret
- `DIIO_REFRESH_TOKEN` - DIIO API refresh token
- `N8N_WEBHOOK_URL` - n8n webhook URL for Client ID sync
- `ADMIN_PASSWORD` - Admin password for login (default: ontop2026)

## Features

- **Unified Client View** - Aggregated client data from tickets and transcripts (655+ clients)
- **AI Enrichment** - Automated client analysis with pain points and churn signals
- **Payment Issue Detection** - Identifies and tracks payment-related complaints
- **Client ID Sync** - Automatic Salesforce Client ID matching for transcripts via n8n
- **Sentiment Analysis** - AI-powered sentiment scoring and insights
- **Transcript Management** - DIIO call/meeting transcript integration
- **Real-time Sync** - Progress tracking for long-running operations
- **Secure Authentication** - Password-protected access with input validation

## Project Structure

```
├── pages/              # Application routes
│   ├── index.vue      # Main dashboard
│   ├── clients.vue    # Unified client view
│   ├── diio.vue       # Transcript management
│   ├── zendesk.vue    # Ticket management
│   ├── sync.vue       # Client ID sync dashboard
│   └── analytics.vue  # Advanced analytics
├── components/         # Vue components
│   ├── ClientDetailModal.vue
│   └── ui/            # Reusable UI components
├── composables/       # Business logic composables
│   ├── useSupabase.ts
│   ├── useSentimentAnalysis.ts
│   └── ...
├── server/
│   ├── api/           # API endpoints
│   │   ├── clients/   # Client management
│   │   ├── diio/      # DIIO integration
│   │   ├── transcripts/ # Transcript operations
│   │   └── auth/      # Authentication
│   └── utils/         # Server utilities
│       ├── validation.ts  # Input validation
│       ├── logger.ts      # Centralized logging
│       └── ...
├── layouts/           # Page layouts
└── middleware/        # Route middleware
```

## Development

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard before deploying.

## Key Pages

- `/` - Main dashboard with quick stats
- `/clients` - Unified client view with AI insights
- `/diio` - Call transcript management and analysis
- `/zendesk` - Support ticket browser
- `/sync` - Client ID sync dashboard
- `/analytics` - Advanced analytics and trends
- `/feedback` - Feedback analytics dashboard
- `/login` - Authentication page

## Security Features

- **Input Validation** - All API endpoints validate and sanitize inputs
- **SQL Injection Prevention** - Parameterized queries via Supabase
- **XSS Protection** - String sanitization and HTML escaping
- **Authentication** - Password-protected access with secure cookies
- **Rate Limiting** - Built-in protection against DoS attacks

## Database Schema

Supabase PostgreSQL database with key tables:

- `client_sentiment_summary` - Aggregated client sentiment data (655+ records)
- `diio_transcripts` - Call/meeting transcripts
- `zendesk_conversations` - Support tickets
- `client_enrichment` - AI-enriched client analysis
- `diio_transcript_feedback` - Extracted feedback segments

## API Endpoints

**Clients:**
- `GET /api/clients/list` - Paginated client list with search
- `GET /api/clients/[id]/details` - Client details with tickets/transcripts
- `POST /api/clients/[id]/enrich` - Trigger AI enrichment
- `GET /api/clients/stats` - Client statistics

**Transcripts:**
- `POST /api/transcripts/sync-client-ids` - Sync Client IDs from Salesforce
- `GET /api/transcripts/sync-progress` - Real-time sync progress

**DIIO:**
- `POST /api/diio/sync-transcripts` - Sync transcripts from DIIO
- `POST /api/diio/analyze-transcript` - Analyze transcript sentiment
- `POST /api/diio/bulk-sentiment-analysis` - Bulk analysis

## License

Private project - Ontop
