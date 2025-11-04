/**
 * GET /api/diio/transcripts/:id
 * 
 * ⚠️ LEGACY ENDPOINT - Currently unused
 * 
 * Get a transcript by ID
 * 
 * Note: This endpoint was created during initial DIIO integration.
 * Current implementation uses sync-transcripts endpoint which stores data in database.
 * Transcripts are fetched from Supabase database, not directly from DIIO API.
 * Keep for potential future use or remove if not needed.
 * 
 * Last reviewed: December 2025
 */

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

