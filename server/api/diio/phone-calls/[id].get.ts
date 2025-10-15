/**
 * GET /api/diio/phone-calls/:id
 * 
 * Get details for a specific phone call
 */

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Phone call ID is required'
      })
    }

    const data = await diioRequest(`/v1/phone_calls/${id}`)

    return data
  } catch (error: any) {
    console.error('Error fetching DIIO phone call:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch DIIO phone call'
    })
  }
})

