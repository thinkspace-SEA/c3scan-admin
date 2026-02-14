import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Companies API
 * 
 * GET /api/admin/companies
 * 
 * List companies for operator (used in alias approval dropdown)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    
    if (!operatorId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const search = searchParams.get('search');
    
    let query = supabase
      .from('company')
      .select(`
        company_id,
        company_name,
        mailbox:mailbox_id (mailbox_id, pmb_number)
      `)
      .eq('operator_id', operatorId)
      .eq('is_active', true)
      .order('company_name', { ascending: true })
      .limit(limit);
    
    if (search) {
      query = query.ilike('company_name', `%${search}%`);
    }
    
    const { data: companies, error } = await query;
    
    if (error) {
      console.error('Failed to fetch companies:', error);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to fetch companies' } },
        { status: 500 }
      );
    }
    
    // Format response
    const formatted = companies?.map(c => ({
      company_id: c.company_id,
      company_name: c.company_name,
      pmb_number: (c.mailbox as any)?.pmb_number || 'N/A'
    })) || [];
    
    return NextResponse.json({
      items: formatted
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
