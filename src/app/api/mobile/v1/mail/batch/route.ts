import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * POST /api/mobile/v1/mail/batch
 * 
 * Upload multiple mail items from the upload queue.
 * Individual inserts — some may succeed while others fail.
 * Returns 207 Multi-Status with per-item results.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'invalid_items', message: 'Items array is required' },
        { status: 400 }
      )
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: 'too_many_items', message: 'Maximum 50 items per batch' },
        { status: 413 }
      )
    }

    const supabase = getSupabase()
    const results = []
    let accepted = 0
    let rejected = 0

    // Process each item individually
    for (const item of items) {
      const { client_id, ...payload } = item

      try {
        // Validate required fields
        if (!payload.operator_id || !payload.location_id || !payload.mailbox_id || !payload.envelope_image) {
          results.push({
            client_id,
            status: 'rejected',
            error: 'Missing required fields',
            error_code: 'MISSING_FIELDS',
          })
          rejected++
          continue
        }

        // Insert into staging
        const { data: staging, error } = await supabase
          .from('mail_item_staging')
          .insert({
            payload_json: {
              ...payload,
              location_detected_by: payload.location_detected_by || 'gps',
              package_type: payload.package_type || 'correspondence',
            },
            operator_id: payload.operator_id,
            scanned_by_email: payload.scanned_by_email || 'unknown',
            validation_status: 'pending',
          })
          .select('staging_id')
          .single()

        if (error) {
          console.error('Batch item error:', error)
          results.push({
            client_id,
            status: 'rejected',
            error: 'Database insert failed',
            error_code: 'DATABASE_ERROR',
          })
          rejected++
        } else {
          results.push({
            client_id,
            status: 'accepted',
            staging_id: staging.staging_id,
          })
          accepted++
        }

      } catch (itemError) {
        console.error('Item processing error:', itemError)
        results.push({
          client_id,
          status: 'rejected',
          error: 'Processing failed',
          error_code: 'PROCESSING_ERROR',
        })
        rejected++
      }
    }

    return NextResponse.json({
      summary: {
        total: items.length,
        accepted,
        rejected,
      },
      results,
    }, { status: 207 })

  } catch (error) {
    console.error('Batch upload error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
