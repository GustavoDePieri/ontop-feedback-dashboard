/**
 * GET /api/diio/transcripts/:id
 * 
 * Get a transcript by ID
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

