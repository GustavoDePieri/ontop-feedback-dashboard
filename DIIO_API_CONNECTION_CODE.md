# 🔌 DIIO API Connection Code - Complete Reference

This document contains all the code used to connect to and interact with the DIIO API.

---

## 📁 File Structure

```
server/
├── utils/
│   └── diio.ts                    # Core API connection utilities
└── api/
    └── diio/
        ├── sync-transcripts.post.ts    # Sync endpoint
        ├── sync-transcripts-daily.get.ts # Daily cron endpoint
        ├── transcripts/[id].get.ts     # Get single transcript
        ├── meetings.get.ts             # Get meetings
        ├── phone-calls.get.ts          # Get phone calls
        └── users.get.ts               # Get users
```

---

## 🔑 Configuration

### Environment Variables (`.env`)

```env
DIIO_CLIENT_ID=your-client-id
DIIO_CLIENT_SECRET=your-client-secret
DIIO_REFRESH_TOKEN=your-refresh-token
DIIO_SUBDOMAIN=getontop
```

### Runtime Config (`nuxt.config.ts`)

```typescript
runtimeConfig: {
  diioClientId: process.env.DIIO_CLIENT_ID,
  diioClientSecret: process.env.DIIO_CLIENT_SECRET,
  diioRefreshToken: process.env.DIIO_REFRESH_TOKEN,
  diioSubdomain: process.env.DIIO_SUBDOMAIN || 'getontop',
}
```

---

## 🔐 Core API Connection Utility

### File: `server/utils/diio.ts`

```typescript
/**
 * DIIO API Utility
 * 
 * Handles authentication and API requests to DIIO
 */

const config = useRuntimeConfig()

// In-memory token cache (expires in 1 hour per DIIO docs)
let cachedToken: string | null = null
let tokenExpiry: number = 0

/**
 * Get a valid access token (uses cache if valid)
 */
export async function getDiioAccessToken(): Promise<string> {
  // Check if cached token is still valid (with 5-minute buffer)
  const now = Date.now()
  if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
    return cachedToken
  }

  // Get new token
  const clientId = config.diioClientId
  const clientSecret = config.diioClientSecret
  const refreshToken = config.diioRefreshToken
  const subdomain = config.diioSubdomain || 'getontop'

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('DIIO credentials not configured')
  }

  const baseUrl = `https://${subdomain}.diio.com/api/external`
  
  try {
    const response = await $fetch<{ access_token: string }>(`${baseUrl}/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }
    })

    cachedToken = response.access_token
    // Tokens expire in 1 hour
    tokenExpiry = Date.now() + 60 * 60 * 1000

    return cachedToken
  } catch (error: any) {
    console.error('Failed to get DIIO access token:', error)
    throw new Error(`DIIO authentication failed: ${error.message}`)
  }
}

/**
 * Make an authenticated request to DIIO API
 */
export async function diioRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    params?: Record<string, any>
  } = {}
): Promise<T> {
  const token = await getDiioAccessToken()
  const subdomain = config.diioSubdomain || 'getontop'
  const baseUrl = `https://${subdomain}.diio.com/api/external`

  const url = `${baseUrl}${endpoint}`

  try {
    return await $fetch<T>(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: options.body,
      params: options.params
    })
  } catch (error: any) {
    console.error(`DIIO API request failed: ${endpoint}`, error)
    throw error
  }
}

/**
 * Clear cached token (useful for testing or error recovery)
 */
export function clearDiioToken() {
  cachedToken = null
  tokenExpiry = 0
}
```

---

## 📡 API Endpoints

### 1. Get Users

**File:** `server/api/diio/users.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1

    const data = await diioRequest('/v1/users', {
      params: { page }
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO users:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO users'
    })
  }
})
```

**Usage:**
```typescript
const users = await diioRequest('/v1/users', {
  params: { page: 1 }
})
```

---

### 2. Get Meetings (with Pagination)

**File:** `server/api/diio/meetings.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    const data = await diioRequest('/v1/meetings', {
      params: { page, limit }
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO meetings:', error)
    
    if (error.statusCode === 401 || error.statusCode === 404) {
      return {
        meetings: [],
        total: 0,
        next: null
      }
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO meetings'
    })
  }
})
```

**Usage:**
```typescript
// Single page
const meetings = await diioRequest('/v1/meetings', {
  params: { page: 1, limit: 100 }
})

// Paginate through all meetings
let currentPage = 1
let hasMore = true
const limit = 100
const allMeetings = []

while (hasMore) {
  const data = await diioRequest('/v1/meetings', {
    params: { page: currentPage, limit }
  })
  
  allMeetings.push(...(data.meetings || []))
  hasMore = data.next !== null && data.meetings.length === limit
  currentPage++
  
  // Small delay to avoid rate limiting
  if (hasMore) {
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}
```

---

### 3. Get Phone Calls

**File:** `server/api/diio/phone-calls.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    const data = await diioRequest('/v1/phone_calls', {
      params: { page, limit }
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO phone calls:', error)
    
    if (error.statusCode === 404) {
      return {
        phone_calls: [],
        total: 0,
        next: null
      }
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO phone calls'
    })
  }
})
```

---

### 4. Get Transcript

**File:** `server/api/diio/transcripts/[id].get.ts`

```typescript
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const email = query.email as string | undefined

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Transcript ID is required'
      })
    }

    const data = await diioRequest(`/v1/transcripts/${id}`, {
      params: email ? { email } : {}
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO transcript:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO transcript'
    })
  }
})
```

**Usage:**
```typescript
const transcript = await diioRequest(`/v1/transcripts/${transcriptId}`)

// Response structure can be:
// 1. String: "transcript text here"
// 2. Object with transcript field: { transcript: "text" }
// 3. Object with array of segments: { transcript: [{ text: "...", speaker: "..." }] }
```

---

## 🔄 Complete Sync Example

### File: `server/api/diio/sync-transcripts.post.ts` (Simplified)

```typescript
import { diioRequest } from '~/server/utils/diio'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

  // Step 1: Fetch all meetings with pagination
  let meetings: any[] = []
  let currentPage = 1
  let hasMore = true
  const limit = 100

  while (hasMore) {
    const meetingsData = await diioRequest('/v1/meetings', {
      params: { page: currentPage, limit }
    })
    
    const pageMeetings = meetingsData.meetings || []
    meetings.push(...pageMeetings)
    
    hasMore = meetingsData.next !== null && pageMeetings.length === limit
    currentPage++
    
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Step 2: Extract transcript IDs
  const transcriptIds = meetings
    .filter(m => m.last_transcript_id || m.last_trancript_id)
    .map(m => m.last_transcript_id || m.last_trancript_id)

  // Step 3: Check which already exist (in chunks of 100)
  let existingIds = new Set<string>()
  const chunkSize = 100
  
  for (let i = 0; i < transcriptIds.length; i += chunkSize) {
    const chunk = transcriptIds.slice(i, i + chunkSize)
    const { data } = await supabase
      .from('diio_transcripts')
      .select('diio_transcript_id')
      .in('diio_transcript_id', chunk)
    
    existingIds = new Set([
      ...existingIds,
      ...(data?.map(t => t.diio_transcript_id) || [])
    ])
  }

  // Step 4: Fetch new transcripts in batches
  const newIds = transcriptIds.filter(id => !existingIds.has(id))
  const batchSize = 100
  
  for (let i = 0; i < newIds.length; i += batchSize) {
    const batch = newIds.slice(i, i + batchSize)
    
    for (const transcriptId of batch) {
      // Fetch transcript
      const transcriptData = await diioRequest(`/v1/transcripts/${transcriptId}`)
      
      // Extract text (handle different structures)
      let transcriptText = ''
      if (typeof transcriptData === 'string') {
        transcriptText = transcriptData
      } else if (transcriptData?.transcript) {
        if (Array.isArray(transcriptData.transcript)) {
          transcriptText = transcriptData.transcript.map((s: any) => 
            s.text || s.content || JSON.stringify(s)
          ).join('\n')
        } else {
          transcriptText = transcriptData.transcript
        }
      }
      
      // Store in database
      await supabase.from('diio_transcripts').upsert({
        diio_transcript_id: transcriptId,
        transcript_text: transcriptText,
        // ... other fields
      })
      
      // Rate limiting: 1.5 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    // 2 second pause between batches
    if (i + batchSize < newIds.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
})
```

---

## 🔑 API Endpoints Reference

### Base URL
```
https://{subdomain}.diio.com/api/external
```

### Authentication
```
POST /refresh_token
Body: {
  client_id: string
  client_secret: string
  refresh_token: string
}
Response: { access_token: string }
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/users` | GET | List users |
| `/v1/meetings` | GET | List meetings (paginated) |
| `/v1/meetings/:id` | GET | Get specific meeting |
| `/v1/phone_calls` | GET | List phone calls (paginated) |
| `/v1/phone_calls/:id` | GET | Get specific phone call |
| `/v1/transcripts/:id` | GET | Get transcript |
| `/v1/exports` | POST | Create export |
| `/v1/exports/:id` | GET | Get export status |

---

## 📝 Usage Examples

### Example 1: Fetch All Meetings

```typescript
import { diioRequest } from '~/server/utils/diio'

async function fetchAllMeetings() {
  let allMeetings = []
  let page = 1
  let hasMore = true
  const limit = 100

  while (hasMore) {
    const data = await diioRequest('/v1/meetings', {
      params: { page, limit }
    })
    
    allMeetings.push(...(data.meetings || []))
    hasMore = data.next !== null && data.meetings.length === limit
    page++
    
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return allMeetings
}
```

### Example 2: Get a Transcript

```typescript
import { diioRequest } from '~/server/utils/diio'

async function getTranscript(transcriptId: string) {
  const data = await diioRequest(`/v1/transcripts/${transcriptId}`)
  
  // Handle different response structures
  let text = ''
  if (typeof data === 'string') {
    text = data
  } else if (data.transcript) {
    if (Array.isArray(data.transcript)) {
      text = data.transcript.map(s => s.text || s.content).join('\n')
    } else {
      text = data.transcript
    }
  }
  
  return text
}
```

### Example 3: Check Authentication

```typescript
import { getDiioAccessToken } from '~/server/utils/diio'

async function testConnection() {
  try {
    const token = await getDiioAccessToken()
    console.log('✅ Authentication successful')
    console.log('Token:', token.substring(0, 20) + '...')
    return true
  } catch (error) {
    console.error('❌ Authentication failed:', error)
    return false
  }
}
```

---

## ⚠️ Important Notes

### Rate Limiting
- **Between requests**: 1.5 seconds
- **Between batches**: 2 seconds
- **Between pages**: 0.5 seconds

### Token Management
- Tokens expire in **1 hour**
- Tokens are cached in memory
- Cache is cleared automatically when expired
- Use `clearDiioToken()` to force refresh

### Error Handling
- **401 Unauthorized**: Token expired, will auto-refresh
- **404 Not Found**: Resource doesn't exist (phone calls may not be available)
- **429 Rate Limited**: Wait and retry

### Pagination
- Meetings and phone calls support pagination
- Check `next` field to see if more pages exist
- Always fetch in batches to avoid timeouts

### Transcript Response Structure
The transcript endpoint can return different structures:
1. **String**: `"transcript text"`
2. **Object with string**: `{ transcript: "text" }`
3. **Object with array**: `{ transcript: [{ text: "...", speaker: "..." }] }`

Always handle all three cases!

---

## 🧪 Testing

### Test Authentication

```typescript
// In browser console or API endpoint
const response = await fetch('/api/diio/test-transcripts')
const result = await response.json()
console.log(result)
```

### Test Single Endpoint

```typescript
import { diioRequest } from '~/server/utils/diio'

// Test users endpoint
const users = await diioRequest('/v1/users', { params: { page: 1 } })
console.log('Users:', users)

// Test meetings endpoint
const meetings = await diioRequest('/v1/meetings', { 
  params: { page: 1, limit: 10 } 
})
console.log('Meetings:', meetings)
```

---

## 📚 Additional Resources

- **API Documentation**: See `diio_api_documentation.md`
- **Integration Guide**: See `DIIO_INTEGRATION_COMPLETE.md`
- **Sync Guide**: See `DIIO_SYNC_GUIDE.md`

---

**Last Updated**: 2025-01-15

