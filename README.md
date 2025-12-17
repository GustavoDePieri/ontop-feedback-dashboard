# Ontop Feedback Analytics Dashboard

AI-powered feedback analytics dashboard integrating Google Sheets, DIIO transcripts, and Gemini AI for intelligent insights.

## Tech Stack

- **Nuxt 3** - Vue.js framework with SSR
- **Supabase** - Database and backend
- **Tailwind CSS** - Styling
- **Gemini AI** - AI-powered analysis
- **DIIO API** - Call transcription integration
- **Google Sheets API** - Data source integration

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- Google Service Account credentials
- Gemini AI API key
- DIIO API credentials (optional)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your credentials to .env
# See .env.example for required variables

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

Required variables (see `.env.example` for full list):

- `NUXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NUXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NUXT_GEMINI_API_KEY` - Gemini AI API key
- `GOOGLE_PROJECT_ID` - Google Cloud project ID
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `GOOGLE_CLIENT_EMAIL` - Google service account email
- `DIIO_CLIENT_ID` - DIIO API client ID (optional)
- `DIIO_CLIENT_SECRET` - DIIO API client secret (optional)
- `DIIO_REFRESH_TOKEN` - DIIO API refresh token (optional)
- `N8N_WEBHOOK_URL` - n8n webhook URL for Client ID sync (optional)

## Features

- **Unified Client View** - Aggregated client data from tickets and transcripts
- **AI Enrichment** - Automated client analysis with pain points and churn signals
- **Payment Issue Detection** - Identifies payment-related complaints
- **Client ID Sync** - Automatic Salesforce Client ID matching for transcripts
- **Sentiment Analysis** - AI-powered sentiment scoring and insights
- **Transcript Management** - DIIO call/meeting transcript integration
- **Interactive Dashboard** - Real-time metrics and visualizations

## Project Structure

```
├── pages/              # Application routes
├── components/         # Vue components
├── composables/       # Business logic
├── server/api/        # API endpoints
├── database/          # Database migrations
└── nuxt.config.ts    # Nuxt configuration
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

- `/` - Main dashboard
- `/clients` - Unified client view
- `/diio` - Transcript management
- `/sync` - Client ID sync dashboard
- `/analytics` - Advanced analytics
- `/reports` - Report generation

## Database

Supabase PostgreSQL database. See `database/` folder for schema migrations.

Key tables:
- `client_sentiment_summary` - Aggregated client sentiment data
- `diio_transcripts` - Call/meeting transcripts
- `zendesk_conversations` - Support tickets
- `client_enrichment` - AI-enriched client analysis

## License

Private project - Ontop
