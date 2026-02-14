import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper to verify JWT token
function verifyToken(token: string): { user_id: string; operator_id: string; email: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    if (decoded.exp < Date.now()) return null
    return decoded
  } catch {
    return null
  }
}

// POST /api/mobile/v1/mail
// Create a mail item in staging table (no constraints) for post-processing
// 
// SECURITY: Follows c3scan Tenancy Isolation Contract
// Compound Key: operator_id + location_id + mailbox_id (all required for uniqueness)
// Reference: docs/architecture/auth-tenancy-contract.md
export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const tokenData = verifyToken(token)

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      operator_id,
      location_id,
      mailbox_id,        // STRING (e.g., "1614", "Suite 200")
      scanned_by_email,
      envelope_image,
      ocr_raw_text,
      ocr_confidence,
      match_confidence,  // From matching service
      match_method,      // 'fuzzy_ocr', 'manual_search', etc.
      package_type,
      carrier,
      tracking_number,
      scanned_at,
      image_hash,
      client_scan_id,
      company_id,        // UUID - resolved company
      company_name,      // Human-readable company name
      app_version
    } = body

    // Validate required fields
    if (!operator_id || !scanned_by_email || !envelope_image) {
      return NextResponse.json(
        { error: 'Missing required fields: operator_id, scanned_by_email, envelope_image' },
        { status: 400 }
      )
    }

    // Validate operator_id matches token (Tenancy Isolation)
    if (operator_id !== tokenData.operator_id) {
      return NextResponse.json(
        { error: 'Operator mismatch - token does not match request operator_id' },
        { status: 403 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert into STAGING table
    // Note: mailbox_id is stored as TEXT (string), not UUID
    const { data: stagingItem, error: insertError } = await supabase
      .from('mail_item_staging')
      .insert({
        // Tenancy scope (compound key)
        operator_id,
        location_id: location_id || null,
        mailbox_id: mailbox_id || null,       // STRING value (e.g., "1614")
        
        // Company reference
        company_id: company_id || null,
        company_name: company_name || null,
        
        // Scan metadata
        received_at: scanned_at || new Date().toISOString(),
        scanned_by_email: scanned_by_email.toLowerCase(),
        status: 'pending_processing',
        
        // Image storage
        envelope_image: envelope_image.replace('storage_path:', ''),
        
        // OCR/Matching data
        ocr_text: ocr_raw_text || null,
        ocr_confidence: ocr_confidence || 0,
        match_confidence: match_confidence || ocr_confidence || 0,
        match_method: match_method || (ocr_raw_text ? 'fuzzy_ocr' : 'manual'),
        
        // Package info
        package_type: package_type || null,
        carrier: carrier || null,
        tracking_number: tracking_number || null,
        
        // Client tracking
        client_scan_id: client_scan_id || null,
        image_hash: image_hash || null,
        app_version: app_version || '1.0.0',
        
        // Debug payload
        raw_payload: body
      })
      .select('staging_id')
      .single()

    if (insertError) {
      console.error('Staging insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to stage mail item', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      mail_item_id: stagingItem.staging_id,  // For backward compatibility with iOS app
      staging_id: stagingItem.staging_id,
      status: 'pending_processing',
      message: 'Mail item staged successfully - will be processed into mail_item table'
    }, { status: 201 })

  } catch (error) {
    console.error('Mail staging error:', error)
    return NextResponse.json(
      { error: 'Failed to stage mail item' },
      { status: 500 }
    )
  }
}