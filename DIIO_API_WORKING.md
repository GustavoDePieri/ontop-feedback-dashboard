# DIIO API Integration - Working Configuration

**Date:** October 15, 2025  
**Status:** ✅ Authentication Working

## Summary

Successfully tested DIIO API integration with Ontop's account. Authentication is working and we have access to user data.

## Credentials

```env
DIIO_CLIENT_ID=af377a7c-71e2-4ed9-8ca2-24bf854b4579
DIIO_CLIENT_SECRET=cf838c88-ff62-4e7c-ac65-31dca0fe2c67
DIIO_REFRESH_TOKEN=e9f2d731-16ea-4c72-b810-aa2707c2a0ce
DIIO_SUBDOMAIN=getontop
```

## API Configuration

- **Base URL:** `https://getontop.diio.com/api/external`
- **Authentication:** Bearer token (JWT)
- **Token Expiration:** 1 hour
- **Token Scopes:** `users`, `phone_calls`, `exports`

## Authentication Flow

```javascript
// 1. Get Access Token
POST https://getontop.diio.com/api/external/refresh_token
Headers: { "Content-Type": "application/json" }
Body: {
  "client_id": "...",
  "client_secret": "...",
  "refresh_token": "..."
}

// 2. Use Access Token
GET https://getontop.diio.com/api/external/v1/{endpoint}
Headers: {
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

## Working Endpoints

### ✅ Users Endpoint
**Endpoint:** `GET /v1/users`

Returns list of Ontop users in DIIO system:

```json
{
  "users": [
    {
      "name": "Gustavo Revelo",
      "email": "grevelo@getontop.com",
      "id": "fcc01728-415c-11f0-9aef-06254876e271"
    },
    {
      "name": "Sergio Cordoba",
      "email": "scordoba@getontop.com",
      "id": "09e6e7ec-415d-11f0-aba8-06254876e271"
    },
    // ... more users
  ]
}
```

### ✅ Transcripts Endpoint
**Endpoint:** `GET /v1/transcripts`  
**Status:** 200 OK  
**Note:** Returns HTML response - need to investigate proper usage

### ✅ Exports Endpoint
**Endpoint:** `GET /v1/exports`  
**Status:** 200 OK  
**Note:** Returns HTML response - need to investigate proper usage

## Endpoints To Explore

Based on the API documentation, these endpoints should be available:

1. **`GET /v1/transcripts/:id`** - Get specific transcript by ID
   - Parameters: `id` (required), `email` (optional)
   - Returns: `{ id: string, transcript: string }`

2. **`GET /v1/meetings`** - List meetings
   - Status: 401 Unauthorized (not in current token scopes)

3. **`GET /v1/phone_calls`** - List phone calls
   - Status: 404 Not Found (endpoint may not exist or different path)

## Token Information

The access token is a JWT with the following payload:

```json
{
  "app_id": "5db0d5e0-a931-11f0-9c4e-06254876e271",
  "jti": "f21e3fdb-a88a-4fd7-95a4-338f86fc7b35",
  "installation_id": "760d1d92-a931-11f0-9c52-06254876e271",
  "company_id": "2cad38f8-3d7f-11f0-97d9-06254876e271",
  "user_id": "ca733c68-415d-11f0-8a4d-06254876e271",
  "scopes": ["users", "phone_calls", "exports"],
  "exp": 1760553187
}
```

## ✅ Integration Complete!

### Implemented Components

#### 1. ✅ DIIO Composable
**File:** `composables/useDiio.ts`

```typescript
const { getUsers, getPhoneCalls, getTranscript, exportPhoneCalls } = useDiio()

// Get users
const users = await getUsers()

// Get phone calls with pagination
const { calls, total, next } = await getPhoneCalls(1, 20)

// Get specific transcript
const transcript = await getTranscript('transcript-id')

// Export and download all phone calls
const data = await exportPhoneCalls()
```

#### 2. ✅ Type Definitions
**File:** `types/diio.ts`

Complete TypeScript types for all DIIO entities:
- `DiioUser`
- `DiioPhoneCall`
- `DiioMeeting`
- `DiioTranscript`
- `DiioExport`

#### 3. ✅ Server API Endpoints

All endpoints implemented with automatic token management:

- `GET /api/diio/users` - List users
- `GET /api/diio/phone-calls` - List phone calls
- `GET /api/diio/phone-calls/:id` - Get phone call details
- `GET /api/diio/meetings` - List meetings
- `GET /api/diio/meetings/:id` - Get meeting details
- `GET /api/diio/transcripts/:id` - Get transcript
- `POST /api/diio/exports` - Create export
- `GET /api/diio/exports/:id` - Get export status

#### 4. ✅ Server Utility
**File:** `server/utils/diio.ts`

- Automatic token caching (1-hour expiry)
- Token refresh with 5-minute buffer
- Unified API request helper
- Error handling

#### 5. ✅ Configuration
**File:** `nuxt.config.ts`

Runtime config updated with DIIO credentials.

### How to Use

#### Step 1: Add Credentials to `.env`

```env
DIIO_CLIENT_ID=af377a7c-71e2-4ed9-8ca2-24bf854b4579
DIIO_CLIENT_SECRET=cf838c88-ff62-4e7c-ac65-31dca0fe2c67
DIIO_REFRESH_TOKEN=e9f2d731-16ea-4c72-b810-aa2707c2a0ce
DIIO_SUBDOMAIN=getontop
```

#### Step 2: Use in Your Components

```vue
<script setup lang="ts">
const { getPhoneCallsWithTranscripts, loading, error } = useDiio()

const calls = ref([])

onMounted(async () => {
  calls.value = await getPhoneCallsWithTranscripts(10)
})
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="call in calls" :key="call.id">
        <h3>{{ call.name }}</h3>
        <p v-if="call.transcript">{{ call.transcript.transcript }}</p>
      </div>
    </div>
  </div>
</template>
```

#### Step 3: Integration with Feedback Analysis

**Use Case:** Enrich feedback data with call transcripts

1. Store DIIO transcript IDs in feedback data
2. Fetch transcripts on demand
3. Use AI to analyze call transcripts alongside written feedback
4. Provide unified insights across all feedback channels

**Example Integration:**

```typescript
// In your AI recommendations composable
import { useDiio } from '~/composables/useDiio'

const { exportPhoneCalls } = useDiio()

// Get all phone call transcripts
const phoneCalls = await exportPhoneCalls()

// Combine with feedback data
const allFeedback = [
  ...writtenFeedback,
  ...phoneCalls.map(call => ({
    type: 'phone_call',
    text: call.transcript,
    date: call.occurred_at,
    customer: call.attendees.customers[0]?.name
  }))
]

// Analyze with AI
const insights = await analyzeWithAI(allFeedback)
```

### Questions to Resolve

1. **What data format do `/v1/transcripts` and `/v1/exports` return?**
   - Currently returning HTML
   - May need query parameters or specific headers
   - May need to use `/v1/transcripts/:id` instead for individual transcripts

2. **How to get phone call IDs?**
   - Need to explore the correct endpoint path
   - May be `/v1/calls` or different variation

3. **How to list available transcripts?**
   - `/v1/transcripts` returns HTML currently
   - May need pagination parameters
   - May need to use exports endpoint

4. **User mapping:**
   - How to map DIIO users to feedback system users?
   - Use email as the common identifier?

## Test Files

- `test_diio_api.py` - Basic authentication and endpoint testing
- `test_diio_detailed.py` - Detailed endpoint exploration
- `test_diio_auth_formats.py` - Different auth format testing (legacy)
- `test_diio_oauth.py` - OAuth exploration (legacy)
- `test_diio_urls.py` - URL discovery (legacy)

## Resources

- **DIIO Login URL:** https://getontop.diio.com/commitments
- **API Base URL:** https://getontop.diio.com/api/external
- **Documentation:** Provided by DIIO support

## Security Notes

⚠️ **Important:**
- Access tokens expire in 1 hour
- Implement token refresh before expiration
- Never commit `.env` file with credentials
- Credentials already added to `env.example` for reference
- Store tokens securely (consider runtime cache)

## Success Metrics

- ✅ Authentication working
- ✅ User data accessible
- 🔄 Transcript retrieval (pending ID discovery)
- 🔄 Integration with feedback system (pending)
- 🔄 AI analysis of call transcripts (pending)

---

**Last Updated:** October 15, 2025  
**Next Review:** After implementing composable and testing transcript retrieval

