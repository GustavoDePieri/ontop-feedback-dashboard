/**
 * Data Validation Utilities
 * 
 * Provides validation functions for Diio API responses
 * and user inputs to ensure data integrity.
 */

import type { DiioUser, DiioMeeting, DiioPhoneCall, DiioTranscript } from '~/types/diio'

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validateDiioUser = (user: any): DiioUser => {
  if (!user || typeof user !== 'object') {
    throw new ValidationError('User data is required')
  }
  
  if (!user.id || typeof user.id !== 'string') {
    throw new ValidationError('User ID is required and must be a string', 'id')
  }
  
  if (!user.name || typeof user.name !== 'string') {
    throw new ValidationError('User name is required and must be a string', 'name')
  }
  
  if (!user.email || typeof user.email !== 'string') {
    throw new ValidationError('User email is required and must be a string', 'email')
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    throw new ValidationError('Invalid email format', 'email')
  }
  
  return {
    id: user.id,
    name: user.name,
    email: user.email
  }
}

export const validateDiioMeeting = (meeting: any): DiioMeeting => {
  if (!meeting || typeof meeting !== 'object') {
    throw new ValidationError('Meeting data is required')
  }
  
  if (!meeting.id || typeof meeting.id !== 'string') {
    throw new ValidationError('Meeting ID is required and must be a string', 'id')
  }
  
  if (!meeting.name || typeof meeting.name !== 'string') {
    throw new ValidationError('Meeting name is required and must be a string', 'name')
  }
  
  if (!meeting.scheduled_at || typeof meeting.scheduled_at !== 'string') {
    throw new ValidationError('Meeting scheduled_at is required and must be a string', 'scheduled_at')
  }
  
  // Validate date format
  const date = new Date(meeting.scheduled_at)
  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid date format for scheduled_at', 'scheduled_at')
  }
  
  // Validate attendees structure if present
  if (meeting.attendees) {
    if (typeof meeting.attendees !== 'object') {
      throw new ValidationError('Attendees must be an object', 'attendees')
    }
    
    if (meeting.attendees.sellers && !Array.isArray(meeting.attendees.sellers)) {
      throw new ValidationError('Sellers must be an array', 'attendees.sellers')
    }
    
    if (meeting.attendees.customers && !Array.isArray(meeting.attendees.customers)) {
      throw new ValidationError('Customers must be an array', 'attendees.customers')
    }
  }
  
  return {
    id: meeting.id,
    name: meeting.name,
    scheduled_at: meeting.scheduled_at,
    created_at: meeting.created_at || '',
    updated_at: meeting.updated_at || '',
    last_transcript_id: meeting.last_transcript_id,
    attendees: meeting.attendees || { sellers: [], customers: [] },
    analyzed_status: meeting.analyzed_status,
    error_cause: meeting.error_cause
  }
}

export const validateDiioPhoneCall = (call: any): DiioPhoneCall => {
  if (!call || typeof call !== 'object') {
    throw new ValidationError('Phone call data is required')
  }
  
  if (!call.id || typeof call.id !== 'string') {
    throw new ValidationError('Phone call ID is required and must be a string', 'id')
  }
  
  if (!call.name || typeof call.name !== 'string') {
    throw new ValidationError('Phone call name is required and must be a string', 'name')
  }
  
  if (!call.occurred_at || typeof call.occurred_at !== 'string') {
    throw new ValidationError('Phone call occurred_at is required and must be a string', 'occurred_at')
  }
  
  // Validate date format
  const date = new Date(call.occurred_at)
  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid date format for occurred_at', 'occurred_at')
  }
  
  // Validate duration if present
  if (call.duration !== undefined && (typeof call.duration !== 'number' || call.duration < 0)) {
    throw new ValidationError('Duration must be a positive number', 'duration')
  }
  
  return {
    id: call.id,
    name: call.name,
    occurred_at: call.occurred_at,
    duration: call.duration,
    call_from_number: call.call_from_number,
    attendees: call.attendees || { sellers: [], customers: [] },
    analyzed_status: call.analyzed_status,
    error_cause: call.error_cause,
    last_transcript_id: call.last_transcript_id
  }
}

export const validateDiioTranscript = (transcript: any): DiioTranscript => {
  if (!transcript || typeof transcript !== 'object') {
    throw new ValidationError('Transcript data is required')
  }
  
  if (!transcript.id || typeof transcript.id !== 'string') {
    throw new ValidationError('Transcript ID is required and must be a string', 'id')
  }
  
  if (!transcript.transcript || typeof transcript.transcript !== 'string') {
    throw new ValidationError('Transcript text is required and must be a string', 'transcript')
  }
  
  if (transcript.transcript.trim().length === 0) {
    throw new ValidationError('Transcript text cannot be empty', 'transcript')
  }
  
  return {
    id: transcript.id,
    transcript: transcript.transcript
  }
}

export const validateApiResponse = (response: any, expectedType: 'users' | 'meetings' | 'phone_calls' | 'transcript') => {
  if (!response || typeof response !== 'object') {
    throw new ValidationError('Invalid API response format')
  }
  
  switch (expectedType) {
    case 'users':
      if (!response.users || !Array.isArray(response.users)) {
        throw new ValidationError('Invalid users response format')
      }
      return response.users.map(validateDiioUser)
      
    case 'meetings':
      if (!response.meetings || !Array.isArray(response.meetings)) {
        throw new ValidationError('Invalid meetings response format')
      }
      return response.meetings.map(validateDiioMeeting)
      
    case 'phone_calls':
      if (!response.phone_calls || !Array.isArray(response.phone_calls)) {
        throw new ValidationError('Invalid phone calls response format')
      }
      return response.phone_calls.map(validateDiioPhoneCall)
      
    case 'transcript':
      return validateDiioTranscript(response)
      
    default:
      throw new ValidationError('Unknown response type')
  }
}

export const sanitizeString = (input: any): string => {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email).toLowerCase()
}
