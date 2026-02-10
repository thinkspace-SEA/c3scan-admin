import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * POST /api/mobile/v1/images/upload-url
 * 
 * Returns presigned URL for direct upload to Supabase Storage.
 * Client uploads image bytes directly, then sends storage_path to /mail.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_type, filename, operator_id, requested_expiry_seconds } = body

    // Validate required fields
    if (!content_type || content_type !== 'image/jpeg') {
      return NextResponse.json(
        { error: 'invalid_content_type', message: 'Only image/jpeg is supported' },
        { status: 400 }
      )
    }

    if (!operator_id) {
      return NextResponse.json(
        { error: 'missing_operator', message: 'operator_id is required' },
        { status: 400 }
      )
    }

    // Calculate expiry (default 60s, max 300s)
    const expirySeconds = Math.min(
      Math.max(requested_expiry_seconds || 60, 30),
      300
    )

    const supabase = getSupabase()

    // Generate unique path: operator_id/YYYY/MM/DD/uuid.jpg
    const now = new Date()
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
    const uniqueId = uuidv4()
    const storagePath = `${operator_id}/${datePath}/${uniqueId}.jpg`

    // Create signed URL for upload
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('mail-items')
      .createSignedUploadUrl(storagePath)

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to create signed URL:', signedUrlError)
      return NextResponse.json(
        { error: 'storage_error', message: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      upload_url: signedUrlData.signedUrl,
      storage_path: storagePath,
      expires_in: expirySeconds,
      max_file_size: 5 * 1024 * 1024, // 5MB
    })

  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
