/**
 * GET /api/diio/download
 * 
 * ⚠️ LEGACY ENDPOINT - Currently unused
 * 
 * Proxy for downloading DIIO export files from S3
 * This avoids CORS issues when accessing S3 URLs directly
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
    const fileUrl = query.url as string

    if (!fileUrl) {
      throw createError({
        statusCode: 400,
        message: 'File URL is required'
      })
    }

    // Validate that it's a DIIO S3 URL
    if (!fileUrl.includes('diio-production-files.s3.us-west-2.amazonaws.com')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid file URL'
      })
    }

    console.log('📥 Proxying download request for:', fileUrl)

    // Fetch the file from S3
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to download file: ${response.statusText}`
      })
    }

    // Get the content type and filename
    const contentType = response.headers.get('content-type') || 'application/json'
    const contentDisposition = response.headers.get('content-disposition')
    
    // Extract filename from content-disposition header
    let filename = 'export.json'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    // Get the file data
    const data = await response.text()

    // Set response headers
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    setHeader(event, 'Cache-Control', 'no-cache')

    console.log(`✅ Successfully proxied download: ${filename} (${data.length} bytes)`)

    return data
  } catch (error: any) {
    console.error('Error proxying download:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to download file'
    })
  }
})
