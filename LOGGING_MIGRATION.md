# Logging Migration Guide

## Overview
Replaced `console.log` statements with a centralized logger utility to improve code quality and reduce log noise in production.

## Logger Utility
**Location:** `server/utils/logger.ts`

**Features:**
- Structured logging with log levels (error, warn, info, debug)
- Debug logs only shown in development
- Info logs suppressed in production (only errors/warnings shown)
- Contextual logging with structured data

## Usage

```typescript
import { logger } from '~/server/utils/logger'

// Error logging (always shown)
logger.error('Failed to process', { error: err, userId: 123 })

// Warning logging (always shown)
logger.warn('Rate limit approaching', { current: 95, limit: 100 })

// Info logging (development only)
logger.info('Processing started', { batchSize: 50 })

// Debug logging (development only)
logger.debug('Query executed', { query: 'SELECT * FROM...', duration: 120 })
```

## Migration Status

### ✅ Completed
- `server/api/transcripts/sync-client-ids.post.ts` - All console statements replaced
- `server/api/clients/list.get.ts` - Logger imported, partial replacement
- `server/api/clients/stats.get.ts` - Logger imported

### 🔄 Remaining (143 console statements across 26 files)
- `server/api/clients/[id]/details.get.ts`
- `server/api/transcripts/stats.get.ts`
- `server/api/transcripts/update-client-ids.post.ts`
- `server/api/clients/[id]/enrich.post.ts`
- `server/api/auth/login.post.ts`
- `server/api/diio/sync-transcripts.post.ts`
- `server/api/stats.get.ts`
- `server/api/diio/analyze-transcript.post.ts`
- `server/api/diio/bulk-sentiment-analysis.post.ts`
- `server/api/diio/extract-feedback.post.ts`
- `server/api/ai/recommendations.post.ts`
- And 15 more files...

## Migration Pattern

### Before
```typescript
console.log('Processing started')
console.error('Error:', error)
console.log(`Found ${count} items`)
```

### After
```typescript
import { logger } from '~/server/utils/logger'

logger.info('Processing started')
logger.error('Error occurred', { error })
logger.debug('Found items', { count })
```

## Guidelines

1. **Error logs**: Use `logger.error()` for exceptions and critical failures
2. **Warning logs**: Use `logger.warn()` for recoverable issues or important notices
3. **Info logs**: Use `logger.info()` for important operational messages (dev only)
4. **Debug logs**: Use `logger.debug()` for detailed debugging information (dev only)

## Next Steps

1. Replace console statements in remaining API endpoints
2. Remove emoji prefixes from log messages (logger handles formatting)
3. Add structured context data instead of string interpolation
4. Review and remove unnecessary debug logs

