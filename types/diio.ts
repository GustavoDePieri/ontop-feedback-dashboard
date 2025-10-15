/**
 * DIIO API Type Definitions
 * 
 * Based on official DIIO API documentation
 * https://getontop.diio.com/api/external
 */

export interface DiioUser {
  id: string
  name: string
  email: string
}

export interface DiioAttendee {
  name: string
  email: string
  user_id?: string
  phone?: string
}

export interface DiioAttendees {
  sellers: DiioAttendee[]
  customers: DiioAttendee[]
}

export interface DiioPhoneCall {
  id: string
  name: string
  occurred_at: string
  created_at: string
  updated_at: string
  last_trancript_id?: string
  attendees: DiioAttendees
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string | null
  duration?: number
  call_from_number?: string
}

export interface DiioMeeting {
  id: string
  name: string
  scheduled_at: string
  created_at: string
  updated_at: string
  last_trancript_id?: string
  attendees: DiioAttendees
  analyzed_status?: 'pending' | 'finished' | 'error'
  error_cause?: string | null
}

export interface DiioTranscript {
  id: string
  transcript: string
}

export interface DiioExport {
  id: string
  file_url: string | null
  email: string
  status: 'pending' | 'in_progress' | 'finished' | 'error'
  created_at: string
}

export interface DiioCreateExportRequest {
  file_type: 'json' | 'csv'
  send_to?: string
  model: 'meeting' | 'phone_call'
}

export interface DiioCreatePhoneCallRequest {
  name: string
  media_url: string
  duration: number
  user_id: string
  call_from_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  occurred_at: string
}

// API Response types
export interface DiioUsersResponse {
  users: DiioUser[]
}

export interface DiioPhoneCallsResponse {
  phone_calls: DiioPhoneCall[]
  total: number
  next: number | null
}

export interface DiioMeetingsResponse {
  meetings: DiioMeeting[]
  total: number
  next: number | null
}

// Helper types for enriched data
export interface DiioPhoneCallWithTranscript extends DiioPhoneCall {
  transcript?: DiioTranscript
}

export interface DiioMeetingWithTranscript extends DiioMeeting {
  transcript?: DiioTranscript
}

