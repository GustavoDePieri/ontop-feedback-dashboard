/**
 * GET /api/transcripts/sync-progress
 * 
 * Returns current sync progress information
 */

import { getSyncProgress } from '~/server/utils/sync-progress'

export default defineEventHandler((event) => {
  const progress = getSyncProgress()
  
  // Always return a valid object, even if no sync is running
  if (!progress) {
    return {
      isRunning: false,
      currentBatch: 0,
      totalBatches: 0,
      transcriptsProcessed: 0,
      emailsExtracted: 0,
      clientIdsMatched: 0,
      transcriptsUpdated: 0,
      errors: 0,
      currentStep: '',
      lastActivity: '',
      recentLogs: []
    }
  }
  
  return progress
})

