/**
 * Sync Progress Tracking Utility
 * 
 * Tracks progress of Client ID sync operations
 */

interface SyncProgress {
  isRunning: boolean
  currentBatch: number
  totalBatches: number
  transcriptsProcessed: number
  emailsExtracted: number
  clientIdsMatched: number
  transcriptsUpdated: number
  errors: number
  currentStep: string
  lastActivity: string
  recentLogs: string[]
}

// In-memory progress store (in production, use Redis or similar)
let currentProgress: SyncProgress | null = null

export function updateSyncProgress(progress: Partial<SyncProgress>) {
  if (!currentProgress) {
    currentProgress = {
      isRunning: true,
      currentBatch: 0,
      totalBatches: 0,
      transcriptsProcessed: 0,
      emailsExtracted: 0,
      clientIdsMatched: 0,
      transcriptsUpdated: 0,
      errors: 0,
      currentStep: 'Starting...',
      lastActivity: new Date().toISOString(),
      recentLogs: []
    }
  }
  
  Object.assign(currentProgress, progress)
  currentProgress.lastActivity = new Date().toISOString()
  
  // Keep only last 20 log entries
  if (progress.currentStep) {
    currentProgress.recentLogs.push(`${new Date().toLocaleTimeString()}: ${progress.currentStep}`)
    if (currentProgress.recentLogs.length > 20) {
      currentProgress.recentLogs.shift()
    }
  }
}

export function getSyncProgress(): SyncProgress | null {
  return currentProgress
}

export function clearSyncProgress() {
  currentProgress = null
}


