/**
 * GET /api/diio/exports/:id
 * 
 * Get export status and download URL
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

