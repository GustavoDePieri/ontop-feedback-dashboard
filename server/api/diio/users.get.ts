/**
 * GET /api/diio/users
 * 
 * ⚠️ LEGACY ENDPOINT - Currently unused
 * 
 * Get list of DIIO users
 * 
 * Note: This endpoint was created during initial DIIO integration.
 * Current implementation uses sync-transcripts endpoint which stores data in database.
 * Keep for potential future use or remove if not needed.
 * 
 * Last reviewed: December 2025
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : undefined

    const data = await diioRequest('/v1/users', {
      params: page ? { page } : {}
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO users:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO users'
    })
  }
})

