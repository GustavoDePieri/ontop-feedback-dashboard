/**
 * GET /api/diio/users
 * 
 * Get list of DIIO users
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

