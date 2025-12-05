# Environment Variables Documentation

This document clarifies all environment variables used in the Ontop Feedback Analysis application.

## 📋 Quick Setup

1. Copy `env.example` to `.env` in the project root
2. Fill in your actual values
3. **Never commit `.env` to version control**

## 🔐 Required Environment Variables

### Google Sheets API Configuration

Used for Google Sheets integration and data exports.

```bash
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
```

**How to get these:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON key file
6. Extract the values from the JSON file

### Supabase Configuration

Database and backend services.

```bash
# For Python scripts (sentiment analyzers, ETL pipelines)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here

# For Nuxt frontend (same values, different names)
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**⚠️ Important:** The Supabase configuration uses different environment variable names depending on the context:

- **Python scripts** (`sentiment_analyzer_*.py`, ETL scripts):
  - Use `SUPABASE_URL` and `SUPABASE_KEY`
  - Fallback: Also check `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_ANON_KEY`

- **Nuxt/TypeScript** (frontend, server API):
  - Use `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  - Auto-exposed to client as `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_ANON_KEY`

**Recommendation:** Set both to be safe:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_ANON_KEY=your-supabase-anon-key
```

**How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

### DIIO API Configuration

For call transcription service integration.

```bash
DIIO_CLIENT_ID=your-diio-client-id-here
DIIO_CLIENT_SECRET=your-diio-client-secret-here
DIIO_REFRESH_TOKEN=your-diio-refresh-token-here
DIIO_SUBDOMAIN=your-subdomain
```

**How to get these:**
1. Contact DIIO support to get API credentials
2. Your subdomain is typically your company name (e.g., "getontop")

### OpenAI API Configuration

For AI-powered client enrichment and analysis.

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**How to get this:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new secret key

### Authentication Configuration

For secure user authentication.

```bash
JWT_SECRET=your-secure-jwt-secret-key-change-in-production
ADMIN_PASSWORD=your-admin-password-here
```

**Security Requirements:**
- `JWT_SECRET`: Use a strong, random string (min 32 characters)
  - Generate with: `openssl rand -base64 32`
- `ADMIN_PASSWORD`: Use a strong password for admin access

## 📦 Optional Environment Variables

### Hugging Face API (Alternative to local model)

```bash
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

Only needed if using Hugging Face Inference API instead of local sentiment model.

### Cron Job Security

```bash
CRON_SECRET=your-cron-secret-for-scheduled-tasks
```

Used to secure scheduled task endpoints (e.g., daily DIIO sync).

## 🔄 Environment-Specific Configuration

### Development (.env.development)

```bash
NODE_ENV=development
NUXT_PUBLIC_API_BASE=/api
```

### Production (.env.production)

```bash
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://your-domain.com/api
```

## 🐛 Troubleshooting

### "SUPABASE_URL and SUPABASE_KEY must be set"

**Problem:** Python scripts can't find Supabase credentials.

**Solution:** Ensure you have both set in your `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### "transformers not installed"

**Problem:** Python sentiment analysis libraries missing.

**Solution:** 
```bash
pip install -r requirements.txt
```

### "Authentication required"

**Problem:** JWT authentication is not configured.

**Solution:** Set in `.env`:
```bash
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-password
```

## 📚 Related Documentation

- [Supabase Setup Guide](database/COMPLETE_SCHEMA.md)
- [DIIO Integration](docs/DIIO_INTEGRATION_COMPLETE.md)
- [Development Guide](DEVELOPMENT.md)

## ⚠️ Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use different credentials** for development and production
4. **Limit API key permissions** to only what's needed
5. **Monitor API usage** for unusual activity
6. **Use strong JWT secrets** (min 32 characters, random)
7. **Enable 2FA** on all service accounts where possible

## 🔄 Migration Notes

If you're upgrading from an older version:

1. **Old auth system** (`ontop_authenticated` localStorage):
   - Migrate to new JWT-based authentication
   - Users will need to log in again after upgrade

2. **Old Supabase env vars**:
   - If you only had `NUXT_PUBLIC_*` vars, add the non-prefixed versions:
   ```bash
   SUPABASE_URL=$NUXT_PUBLIC_SUPABASE_URL
   SUPABASE_KEY=$NUXT_PUBLIC_SUPABASE_ANON_KEY
   ```

## 📞 Support

If you encounter issues with environment configuration:
1. Check this documentation first
2. Verify all required variables are set
3. Check the application logs for specific error messages
4. Contact the development team with log output


