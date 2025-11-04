/**
 * GET /api/diio/exports/:id
 * 
 * ⚠️ LEGACY ENDPOINT - Currently unused
 * 
 * Get export status and download URL
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
        message: 'Export ID is required'
      })
    }

    const data = await diioRequest(`/v1/exports/${id}`)

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO export:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO export'
    })
  }
})

