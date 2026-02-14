import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Mailbox Management
 * 
 * GET /api/admin/mailboxes - List mailboxes
 * POST /api/admin/mailboxes - Create mailbox
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/mailboxes
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
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('mailbox')
      .select(`
        *,
        company:company_id (company_name),
        location:location_id (location_name)
      `)
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (statusFilter) {
      query = query.eq('is_active', statusFilter === 'active');
    }
    
    if (search) {
      query = query.or(`pmb_number.ilike.%${search}%,mailbox_label.ilike.%${search}%`);
    }
    
    // Location scoping
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (locationIds.length > 0) {
        query = query.in('location_id', locationIds);
      }
    }
    
    const { data: mailboxes, error } = await query;
    
    if (error) {
      console.error('Failed to fetch mailboxes:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to fetch mailboxes' } },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      items: mailboxes || []
    });
    
  } catch (error) {
    console.error('Error fetching mailboxes:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/mailboxes
 * Create new mailbox
 */
export async function POST(request: NextRequest) {
  try {
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    
    if (!operatorId || !userId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Only operator_admin can create mailboxes
    if (!roles.includes('operator_admin')) {
      return NextResponse.json(
        { error: { code: 'forbidden', message: 'Only operator_admin can create mailboxes' } },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.location_id || !body.company_id || !body.pmb_number) {
      return NextResponse.json(
        { 
          error: { 
            code: 'validation_failed', 
            message: 'location_id, company_id, and pmb_number are required' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Check if PMB already exists
    const { data: existing } = await supabase
      .from('mailbox')
      .select('mailbox_id')
      .eq('operator_id', operatorId)
      .eq('pmb_number', body.pmb_number)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: { code: 'conflict', message: 'PMB number already exists' } },
        { status: 409 }
      );
    }
    
    // Create mailbox
    const { data: mailbox, error } = await supabase
      .from('mailbox')
      .insert({
        operator_id: operatorId,
        location_id: body.location_id,
        company_id: body.company_id,
        pmb_number: body.pmb_number,
        mailbox_label: body.mailbox_label || body.pmb_number,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create mailbox:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to create mailbox' } },
        { status: 500 }
      );
    }
    
    // Log audit
    await supabase.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_user_id: userId,
      actor_roles: JSON.stringify(roles),
      effective_operator_id: operatorId,
      endpoint: '/api/admin/mailboxes',
      method: 'POST',
      event_type: 'RESOURCE_CREATE',
      resource_type: 'mailbox',
      resource_id: mailbox.mailbox_id,
      result: 'success'
    });
    
    return NextResponse.json(mailbox, { status: 201 });
    
  } catch (error) {
    console.error('Error creating mailbox:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
