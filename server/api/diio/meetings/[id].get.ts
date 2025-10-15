/**
 * GET /api/diio/meetings/:id
 * 
 * Get details for a specific meeting
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

