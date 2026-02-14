import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Admin: Create Mail Item
 * 
 * POST /api/admin/mail-items
 * 
 * Creates a mail item intake record from scanner workflow or manual upload.
 * Requires operator_staff or operator_admin role.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreateMailItemRequest {
  location_id: string;
  mailbox_id: string;
  scanned_at?: string;
  client_scan_id?: string;
  ocr_raw_text?: string;
  envelope_image?: {
    file_id: string;
    storage_key: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get operator context from headers (set by middleware)
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    
    if (!operatorId || !userId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Check role permissions
    const allowedRoles = ['operator_admin', 'operator_staff', 'location_staff'];
    if (!roles.some((role: string) => allowedRoles.includes(role))) {
      return NextResponse.json(
        { error: { code: 'forbidden', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body: CreateMailItemRequest = await request.json();
    
    // Validate required fields
    if (!body.location_id || !body.mailbox_id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'validation_failed', 
            message: 'location_id and mailbox_id are required',
            details: { fields: ['location_id', 'mailbox_id'] }
          } 
        },
        { status: 400 }
      );
    }
    
    // Verify mailbox exists and belongs to operator
    const { data: mailbox, error: mailboxError } = await supabase
      .from('mailbox')
      .select('mailbox_id, operator_id, location_id, company_id')
      .eq('mailbox_id', body.mailbox_id)
      .eq('operator_id', operatorId)
      .single();
    
    if (mailboxError || !mailbox) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Mailbox not found' } },
        { status: 404 }
      );
    }
    
    // Verify location belongs to operator
    const { data: location, error: locationError } = await supabase
      .from('location')
      .select('location_id')
      .eq('location_id', body.location_id)
      .eq('operator_id', operatorId)
      .single();
    
    if (locationError || !location) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Location not found' } },
        { status: 404 }
      );
    }
    
    // Create mail item
    const { data: mailItem, error: createError } = await supabase
      .from('mail_item')
      .insert({
        operator_id: operatorId,
        location_id: body.location_id,
        mailbox_id: body.mailbox_id,
        company_id: mailbox.company_id,
        received_at: body.scanned_at || new Date().toISOString(),
        status: 'uploaded',
        ocr_text: body.ocr_raw_text,
        scan_mode: 'admin_upload',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('mail_item_id')
      .single();
    
    if (createError) {
      console.error('Failed to create mail item:', createError);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to create mail item' } },
        { status: 500 }
      );
    }
    
    // If envelope image provided, create mail_item_image record
    if (body.envelope_image) {
      const { error: imageError } = await supabase
        .from('mail_item_image')
        .insert({
          operator_id: operatorId,
          mail_item_id: mailItem.mail_item_id,
          image_type: 'envelope',
          storage_path: body.envelope_image.storage_key,
          created_at: new Date().toISOString()
        });
      
      if (imageError) {
        console.error('Failed to create image record:', imageError);
        // Don't fail the whole request, just log
      }
    }
    
    // Log audit event
    await supabase.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_user_id: userId,
      actor_roles: JSON.stringify(roles),
      effective_operator_id: operatorId,
      endpoint: '/api/admin/mail-items',
      method: 'POST',
      event_type: 'RESOURCE_CREATE',
      resource_type: 'mail_item',
      resource_id: mailItem.mail_item_id,
      result: 'success',
      metadata: JSON.stringify({
        location_id: body.location_id,
        mailbox_id: body.mailbox_id
      })
    });
    
    return NextResponse.json(
      { mail_item_id: mailItem.mail_item_id },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating mail item:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/mail-items
 * 
 * List mail items with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    const locationIds = JSON.parse(request.headers.get('X-User-Location-Ids') || '[]');
    
    if (!operatorId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const cursor = searchParams.get('cursor');
    const locationFilter = searchParams.get('location_id');
    const statusFilter = searchParams.get('status');
    const mailboxFilter = searchParams.get('mailbox_id');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('mail_item')
      .select(`
        mail_item_id,
        mailbox_id,
        location_id,
        company_id,
        received_at,
        status,
        is_active,
        ocr_text,
        mailbox:mailbox_id (pmb_number, mailbox_label),
        company:company_id (company_name)
      `)
      .eq('operator_id', operatorId)
      .eq('is_active', true)
      .order('received_at', { ascending: false })
      .limit(limit);
    
    // Apply cursor pagination
    if (cursor) {
      query = query.lt('mail_item_id', cursor);
    }
    
    // Apply location filter
    if (locationFilter) {
      query = query.eq('location_id', locationFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    // Apply mailbox filter
    if (mailboxFilter) {
      query = query.eq('mailbox_id', mailboxFilter);
    }
    
    // Apply search (on OCR text or company name)
    if (search) {
      // Note: This is simplified. In production, use full-text search
      query = query.or(`ocr_text.ilike.%${search}%`);
    }
    
    // Location staff can only see their assigned locations
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (locationIds.length > 0) {
        query = query.in('location_id', locationIds);
      }
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      console.error('Failed to fetch mail items:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to fetch mail items' } },
        { status: 500 }
      );
    }
    
    // Format response
    const formattedItems = items?.map(item => ({
      mail_item_id: item.mail_item_id,
      mailbox_id: item.mailbox_id,
      company_id: item.company_id,
      location_id: item.location_id,
      scanned_at: item.received_at,
      status: item.status,
      is_archived: !item.is_active,
      pmb_number: (item.mailbox as any)?.pmb_number,
      company_name: (item.company as any)?.company_name,
      ocr_preview: item.ocr_text?.substring(0, 100)
    })) || [];
    
    // Get next cursor
    const nextCursor = items && items.length === limit 
      ? items[items.length - 1].mail_item_id 
      : null;
    
    return NextResponse.json({
      items: formattedItems,
      next_cursor: nextCursor
    });
    
  } catch (error) {
    console.error('Error fetching mail items:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
