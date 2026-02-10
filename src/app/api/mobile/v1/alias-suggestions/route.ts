import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/mobile-auth'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * POST /api/mobile/v1/alias-suggestions
 * 
 * Submit new alias for admin review (via "ADD ALIAS" button).
 * Direct insert to alias_suggestions table.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      operator_id,
      location_id,
      location_detected_by,
      scanned_by_email,
      suggested_alias_name,
      suggested_mailbox_id,
      envelope_image,
      ocr_raw_text,
      ocr_confidence,
      scanned_at,
      client_scan_id,
    } = body

    // Validate required fields
    if (!operator_id || !location_id || !envelope_image) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Required fields: operator_id, location_id, envelope_image' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Insert into alias_suggestions
    const { data: suggestion, error } = await supabase
      .from('alias_suggestions')
      .insert({
        operator_id,
        location_id,
        location_detected_by: location_detected_by || 'gps',
        scanned_by_email: scanned_by_email || 'unknown',
        suggested_alias_name: suggested_alias_name || null,
        suggested_mailbox_id: suggested_mailbox_id || null,
        envelope_image,
        ocr_raw_text: ocr_raw_text || null,
        ocr_confidence: ocr_confidence || null,
        scanned_at: scanned_at || new Date().toISOString(),
        client_scan_id: client_scan_id || null,
        status: 'pending_review',
      })
      .select('suggestion_id, status, created_at')
      .single()

    if (error) {
      console.error('Alias suggestion error:', error)
      return NextResponse.json(
        { error: 'insert_failed', message: 'Failed to create alias suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      suggestion_id: suggestion.suggestion_id,
      status: suggestion.status,
      message: 'Alias suggestion submitted for admin review',
      submitted_at: suggestion.created_at,
    }, { status: 201 })

  } catch (error) {
    console.error('Alias suggestion error:', error)
    return NextResponse.json(
      { error: 'internal_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
