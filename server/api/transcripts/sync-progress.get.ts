/**
 * GET /api/transcripts/sync-progress
 * 
 * Returns current sync progress information
 */

import { getSyncProgress } from '~/server/utils/sync-progress'

export default defineEventHandler((event) => {
  return getSyncProgress()
})

