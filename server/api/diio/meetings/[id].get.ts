/**
 * GET /api/diio/meetings/:id
 * 
 * ⚠️ LEGACY ENDPOINT - Currently unused
 * 
 * Get details for a specific meeting
 * 
 * Note: This endpoint was created during initial DIIO integration.
 * Current implementation uses sync-transcripts endpoint which stores data in database.
 * Keep for potential future use or remove if not needed.
 * 
 * Last reviewed: December 2025
 */

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Meeting ID is required'
      })
    }

    const data = await diioRequest(`/v1/meetings/${id}`)

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO meeting:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO meeting'
    })
  }
})

