import type { FeedbackItem } from '~/types/feedback'

export const useGoogleSheets = () => {
  const data = ref<FeedbackItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/sheets/data')
      data.value = response.data
      lastUpdated.value = response.lastUpdated
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch data'
      console.error('Error fetching Google Sheets data:', err)
    } finally {
      loading.value = false
    }
  }

  const testConnection = async () => {
    try {
      const response = await $fetch('/api/sheets/test')
      return response
    } catch (err: any) {
      throw new Error(`Connection test failed: ${err.message}`)
    }
  }

  const refreshData = async () => {
    await fetchData()
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    fetchData,
    testConnection,
    refreshData
  }
}
