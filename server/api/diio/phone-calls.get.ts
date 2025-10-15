/**
 * GET /api/diio/phone-calls
 * 
 * Get list of phone calls
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    const data = await diioRequest('/v1/phone_calls', {
      params: { page, limit }
    })

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO phone calls:', error)
    
    // Return empty array if no data exists (404)
    if (error.statusCode === 404) {
      return {
        phone_calls: [],
        total: 0,
        next: null
      }
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO phone calls'
    })
  }
})

