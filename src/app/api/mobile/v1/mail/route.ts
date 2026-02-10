import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * POST /api/mobile/v1/mail
 * 
 * Accepts mail scan data into staging table for async processing.
 * Returns 202 Accepted immediately — fast response for iOS.
 * 
 * Background worker handles validation, duplicate detection,
 * and moving to mail_items table.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      operator_id,
      location_id,
      location_detected_by,
      mailbox_id,
      scanned_by_email,
      envelope_image,
      ocr_raw_text,
      ocr_normalized_text,
      ocr_confidence,
      match_confidence,
      match_method,
      package_type,
      carrier,
      tracking_number,
      scanned_at,
      client_scan_id,
      image_hash,
    } = body

    // Validate required fields
    if (!operator_id || !location_id || !mailbox_id || !envelope_image) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Required fields: operator_id, location_id, mailbox_id, envelope_image' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Insert into staging table
    const { data: staging, error } = await supabase
      .from('mail_item_staging')
      .insert({
        payload_json: {
          operator_id,
          location_id,
          location_detected_by: location_detected_by || 'gps',
          mailbox_id,
          scanned_by_email,
          envelope_image,
          ocr_raw_text,
          ocr_normalized_text,
          ocr_confidence,
          match_confidence,
          match_method,
          package_type: package_type || 'correspondence',
          carrier,
          tracking_number,
          scanned_at,
          client_scan_id,
          image_hash,
        },
        operator_id,
        scanned_by_email: scanned_by_email || 'unknown',
        validation_status: 'pending',
      })
      .select('staging_id')
      .single()

    if (error) {
      console.error('Staging insert error:', error)
      return NextResponse.json(
        { error: 'staging_failed', message: 'Failed to queue mail item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      staging_id: staging.staging_id,
      status: 'accepted',
      message: 'Upload received, processing in background',
      accepted_at: new Date().toISOString(),
    }, { status: 202 })

  } catch (error) {
    console.error('Mail upload error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
