/**
 * GET /api/diio/meetings
 * 
 * Get list of meetings
 * Note: Requires 'meetings' scope in token
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    const data = await diioRequest('/v1/meetings', {
      params: { page, limit }
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO meetings:', error)
    
    // Return empty array if not authorized or no data
    if (error.statusCode === 401 || error.statusCode === 404) {
      return {
        meetings: [],
        total: 0,
        next: null
      }
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO meetings'
    })
  }
})

