/**
 * POST /api/diio/exports
 * 
 * Create an export of phone calls or meetings
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { model, file_type, send_to } = body

    if (!model || !file_type) {
      throw createError({
        statusCode: 400,
        message: 'model and file_type are required'
      })
    }

    if (!['phone_call', 'meeting'].includes(model)) {
      throw createError({
        statusCode: 400,
        message: 'model must be "phone_call" or "meeting"'
      })
    }

    if (!['json', 'csv'].includes(file_type)) {
      throw createError({
        statusCode: 400,
        message: 'file_type must be "json" or "csv"'
      })
    }

    const data = await diioRequest('/v1/exports', {
      method: 'POST',
      body: {
        model,
        file_type,
        ...(send_to && { send_to })
      }
    })

    return data
  } catch (error: any) {
    console.error('Error creating DIIO export:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create DIIO export'
    })
  }
})

