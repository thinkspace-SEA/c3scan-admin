import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: List and Manage Requests
 * 
 * GET /api/admin/requests - List requests
 * GET /api/admin/requests/{request_id} - Get request detail
 * POST /api/admin/requests/{request_id}/status - Update status
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/requests
 * List requests with filtering
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
    const statusFilter = searchParams.get('status');
    const typeFilter = searchParams.get('type');
    const mailboxFilter = searchParams.get('mailbox_id');
    
    // Build query
    let query = supabase
      .from('mail_request')
      .select(`
        *,
        mail_item:mail_item_id (
          mail_item_id,
          mailbox_id,
          received_at,
          mailbox:mailbox_id (pmb_number, mailbox_label)
        ),
        mailbox:mailbox_id (pmb_number, company:company_id (company_name))
      `)
      .eq('operator_id', operatorId)
      .order('requested_at', { ascending: false })
      .limit(limit);
    
    // Apply filters
    if (cursor) {
      query = query.lt('request_id', cursor);
    }
    
    if (statusFilter) {
      query = query.eq('request_status', statusFilter);
    }
    
    if (typeFilter) {
      query = query.eq('request_type', typeFilter);
    }
    
    if (mailboxFilter) {
      query = query.eq('mailbox_id', mailboxFilter);
    }
    
    // Location scoping for location_staff
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (locationIds.length > 0) {
        query = query.in('location_id', locationIds);
      }
    }
    
    const { data: requests, error } = await query;
    
    if (error) {
      console.error('Failed to fetch requests:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to fetch requests' } },
        { status: 500 }
      );
    }
    
    // Format response
    const formattedRequests = requests?.map(req => ({
      request_id: req.request_id,
      mail_item_id: req.mail_item_id,
      mailbox_id: req.mailbox_id,
      type: req.request_type,
      status: req.request_status,
      requested_at: req.requested_at,
      completed_at: req.completed_at,
      pmb_number: (req.mailbox as any)?.pmb_number,
      company_name: (req.mailbox as any)?.company?.company_name
    })) || [];
    
    const nextCursor = requests && requests.length === limit
      ? requests[requests.length - 1].request_id
      : null;
    
    return NextResponse.json({
      items: formattedRequests,
      next_cursor: nextCursor
    });
    
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
