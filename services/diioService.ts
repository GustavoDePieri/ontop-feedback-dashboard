/**
 * Diio Service - Improved API service with proper error handling
 * 
 * This service provides a clean interface to the Diio API with:
 * - Proper error handling
 * - Data validation
 * - Request deduplication
 * - Retry logic
 */

import { ErrorHandler, type AppError } from '~/utils/errorHandler'
import { validateApiResponse, sanitizeEmail } from '~/utils/dataValidation'
import type { DiioUser, DiioPhoneCall, DiioMeeting, DiioTranscript } from '~/types/diio'

interface RequestCache {
  [key: string]: {
    promise: Promise<any>
    timestamp: number
    ttl: number
  }
}

class DiioService {
  private cache: RequestCache = {}
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second

  /**
   * Make a cached request to prevent duplicate API calls
   */
  private async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const now = Date.now()
    const cached = this.cache[key]
    
    // Return cached result if still valid
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.promise
    }
    
    // Create new request
    const promise = this.retryRequest(requestFn)
    this.cache[key] = {
      promise,
      timestamp: now,
      ttl
    }
    
    return promise
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        // Don't retry on certain errors
        if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404) {
          throw error
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }

  /**
   * Get users with proper error handling and validation
   */
  async getUsers(page: number = 1): Promise<{ users: DiioUser[]; error: AppError | null }> {
    try {
      const cacheKey = `users-${page}`
      const response = await this.cachedRequest(cacheKey, async () => {
        const data = await $fetch<{ users: DiioUser[] }>('/api/diio/users', {
          params: { page }
        })
        return data
      })
      
      const users = validateApiResponse(response, 'users')
      return { users, error: null }
    } catch (error: any) {
      const appError = ErrorHandler.handleApiError(error, 'getUsers')
      ErrorHandler.logError(appError, 'getUsers')
      return { users: [], error: appError }
    }
  }

  /**
   * Get phone calls with proper error handling and validation
   */
  async getPhoneCalls(
    page: number = 1, 
    limit: number = 20
  ): Promise<{ calls: DiioPhoneCall[]; total: number; error: AppError | null }> {
    try {
      const cacheKey = `phone-calls-${page}-${limit}`
      const response = await this.cachedRequest(cacheKey, async () => {
        const data = await $fetch<{ phone_calls: DiioPhoneCall[]; total: number; next: number | null }>('/api/diio/phone-calls', {
          params: { page, limit }
        })
        return data
      })
      
      const calls = validateApiResponse(response, 'phone_calls')
      return { 
        calls, 
        total: response.total || 0, 
        error: null 
      }
    } catch (error: any) {
      const appError = ErrorHandler.handleApiError(error, 'getPhoneCalls')
      ErrorHandler.logError(appError, 'getPhoneCalls')
      return { calls: [], total: 0, error: appError }
    }
  }

  /**
   * Get meetings with proper error handling and validation
   */
  async getMeetings(
    page: number = 1, 
    limit: number = 20
  ): Promise<{ meetings: DiioMeeting[]; total: number; error: AppError | null }> {
    try {
      const cacheKey = `meetings-${page}-${limit}`
      const response = await this.cachedRequest(cacheKey, async () => {
        const data = await $fetch<{ meetings: DiioMeeting[]; total: number; next: number | null }>('/api/diio/meetings', {
          params: { page, limit }
        })
        return data
      })
      
      const meetings = validateApiResponse(response, 'meetings')
      return { 
        meetings, 
        total: response.total || 0, 
        error: null 
      }
    } catch (error: any) {
      const appError = ErrorHandler.handleApiError(error, 'getMeetings')
      ErrorHandler.logError(appError, 'getMeetings')
      return { meetings: [], total: 0, error: appError }
    }
  }

  /**
   * Get a specific meeting with proper error handling
   */
  async getMeeting(id: string): Promise<{ meeting: DiioMeeting | null; error: AppError | null }> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Meeting ID is required')
      }
      
      const cacheKey = `meeting-${id}`
      const meeting = await this.cachedRequest(cacheKey, async () => {
        const data = await $fetch<DiioMeeting>(`/api/diio/meetings/${id}`)
        return data
      })
      
      const validatedMeeting = validateApiResponse(meeting, 'meetings')[0]
      return { meeting: validatedMeeting, error: null }
    } catch (error: any) {
      const appError = ErrorHandler.handleApiError(error, 'getMeeting')
      ErrorHandler.logError(appError, 'getMeeting')
      return { meeting: null, error: appError }
    }
  }

  /**
   * Get a transcript with proper error handling
   */
  async getTranscript(id: string, email?: string): Promise<{ transcript: DiioTranscript | null; error: AppError | null }> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Transcript ID is required')
      }
      
      const cacheKey = `transcript-${id}-${email || 'default'}`
      const transcript = await this.cachedRequest(cacheKey, async () => {
        const data = await $fetch<DiioTranscript>(`/api/diio/transcripts/${id}`, {
          params: email ? { email: sanitizeEmail(email) } : {}
        })
        return data
      })
      
      const validatedTranscript = validateApiResponse(transcript, 'transcript')
      return { transcript: validatedTranscript, error: null }
    } catch (error: any) {
      const appError = ErrorHandler.handleApiError(error, 'getTranscript')
      ErrorHandler.logError(appError, 'getTranscript')
      return { transcript: null, error: appError }
    }
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: string) {
    if (key) {
      delete this.cache[key]
    } else {
      this.cache = {}
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now()
    const entries = Object.entries(this.cache)
    const validEntries = entries.filter(([_, cached]) => now - cached.timestamp < cached.ttl)
    
    return {
      total: entries.length,
      valid: validEntries.length,
      expired: entries.length - validEntries.length
    }
  }
}

// Export singleton instance
export const diioService = new DiioService()
