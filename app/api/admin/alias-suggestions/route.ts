import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Alias Suggestions Management
 * 
 * GET /api/admin/alias-suggestions
 * 
 * List pending alias suggestions for admin review.
 * Staff can see suggestions for their locations.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const statusFilter = searchParams.get('status') || 'pending';
    
    // Build query using the admin view
    let query = supabase
      .from('v_admin_pending_alias_suggestions')
      .select(`
        alias_suggestion_id,
        operator_id,
        location_id,
        location_name,
        company_id,
        company_name,
        suggested_alias,
        suggested_alias_normalized,
        status,
        created_by_user_id,
        created_by_email,
        created_at,
        mail_item_id,
        envelope_image_path
      `)
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    // Apply cursor pagination
    if (cursor) {
      query = query.lt('alias_suggestion_id', cursor);
    }
    
    // Location scoping for location_staff
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (locationIds.length > 0) {
        query = query.in('location_id', locationIds);
      }
    }
    
    const { data: suggestions, error } = await query;
    
    if (error) {
      console.error('Failed to fetch alias suggestions:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to fetch suggestions' } },
        { status: 500 }
      );
    }
    
    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('alias_suggestion')
      .select('status', { count: 'exact' })
      .eq('operator_id', operatorId);
    
    const counts: Record<string, number> = {};
    statusCounts?.forEach((item: any) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    
    // Get next cursor
    const nextCursor = suggestions && suggestions.length === limit
      ? suggestions[suggestions.length - 1].alias_suggestion_id
      : null;
    
    return NextResponse.json({
      items: suggestions || [],
      summary: {
        total: Object.values(counts).reduce((a, b) => a + b, 0),
        by_status: counts
      },
      next_cursor: nextCursor
    });
    
  } catch (error) {
    console.error('Error fetching alias suggestions:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
