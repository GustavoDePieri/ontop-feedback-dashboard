import { createClient } from '@supabase/supabase-js'

export interface SavedReport {
  id?: string
  title: string
  description?: string
  report_html: string
  report_data: any // JSON data for the report
  filters_applied: any // JSON of filters used
  created_at?: string
  updated_at?: string
  created_by?: string
}

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  // Initialize Supabase client
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  // Save a new report
  const saveReport = async (report: Omit<SavedReport, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .insert([report])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error saving report:', error)
      return { data: null, error }
    }
  }

  // Get all saved reports
  const getSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching reports:', error)
      return { data: null, error }
    }
  }

  // Get a specific report by ID
  const getReportById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching report:', error)
      return { data: null, error }
    }
  }

  // Delete a report
  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error deleting report:', error)
      return { error }
    }
  }

  // Update a report
  const updateReport = async (id: string, updates: Partial<SavedReport>) => {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating report:', error)
      return { data: null, error }
    }
  }

  return {
    supabase,
    saveReport,
    getSavedReports,
    getReportById,
    deleteReport,
    updateReport
  }
}
