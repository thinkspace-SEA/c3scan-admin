import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Approve or Reject Alias Suggestion
 * 
 * POST /api/admin/alias-suggestions/{alias_suggestion_id}/decision
 * 
 * Approve: Creates company_alias record
 * Reject: Updates status with reason
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AliasDecisionRequest {
  action: 'approve' | 'reject';
  company_id?: string;           // Required for approve
  alias_type?: 'dba' | 'authorized_member' | 'ocr_variant';  // Required for approve
  reject_reason?: string;        // Required for reject
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { alias_suggestion_id: string } }
) {
  try {
    const { alias_suggestion_id } = params;
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    const userLocationIds = JSON.parse(request.headers.get('X-User-Location-Ids') || '[]');
    
    if (!operatorId || !userId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Check permissions
    const allowedRoles = ['operator_admin', 'operator_staff'];
    if (!roles.some((role: string) => allowedRoles.includes(role))) {
      return NextResponse.json(
        { error: { code: 'forbidden', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body: AliasDecisionRequest = await request.json();
    
    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: { code: 'validation_failed', message: 'action must be approve or reject' } },
        { status: 400 }
      );
    }
    
    // Get the suggestion
    const { data: suggestion, error: suggestionError } = await supabase
      .from('alias_suggestion')
      .select('*')
      .eq('alias_suggestion_id', alias_suggestion_id)
      .eq('operator_id', operatorId)
      .single();
    
    if (suggestionError || !suggestion) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Alias suggestion not found' } },
        { status: 404 }
      );
    }
    
    // Check if already processed
    if (suggestion.status !== 'pending') {
      return NextResponse.json(
        { 
          error: { 
            code: 'conflict', 
            message: `Suggestion already ${suggestion.status}` 
          } 
        },
        { status: 409 }
      );
    }
    
    // Check location permissions
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (userLocationIds.length > 0 && !userLocationIds.includes(suggestion.location_id)) {
        return NextResponse.json(
          { error: { code: 'forbidden', message: 'Access denied for this location' } },
          { status: 403 }
        );
      }
    }
    
    const now = new Date().toISOString();
    
    if (body.action === 'approve') {
      // Validate required fields
      if (!body.company_id) {
        return NextResponse.json(
          { error: { code: 'validation_failed', message: 'company_id required for approval' } },
          { status: 400 }
      );
      }
      
      // Verify company exists and belongs to operator
      const { data: company, error: companyError } = await supabase
        .from('company')
        .select('company_id, operator_id')
        .eq('company_id', body.company_id)
        .eq('operator_id', operatorId)
        .single();
      
      if (companyError || !company) {
        return NextResponse.json(
          { error: { code: 'not_found', message: 'Company not found' } },
          { status: 404 }
        );
      }
      
      // Get mailbox for this company
      const { data: mailbox } = await supabase
        .from('mailbox')
        .select('mailbox_id, pmb_number')
        .eq('company_id', body.company_id)
        .eq('operator_id', operatorId)
        .eq('is_active', true)
        .single();
      
      // Create company_alias record
      const aliasType = body.alias_type || 'ocr_variant';
      const { data: alias, error: aliasError } = await supabase
        .from('company_alias')
        .insert({
          company_id: body.company_id,
          alias_type: aliasType,
          alias_name: suggestion.suggested_alias,
          alias_name_normalized: suggestion.suggested_alias_normalized || suggestion.suggested_alias.toLowerCase().trim(),
          mailbox_id: mailbox?.pmb_number || null,
          is_active: true,
          effective_from: now,
          created_at: now,
          updated_at: now
        })
        .select('company_alias_id')
        .single();
      
      if (aliasError) {
        console.error('Failed to create alias:', aliasError);
        return NextResponse.json(
          { error: { code: 'server_error', message: 'Failed to create alias' } },
          { status: 500 }
        );
      }
      
      // Update suggestion status
      const { error: updateError } = await supabase
        .from('alias_suggestion')
        .update({
          status: 'approved',
          company_id: body.company_id,
          decided_by_user_id: userId,
          decided_at: now,
          notes: body.notes || null
        })
        .eq('alias_suggestion_id', alias_suggestion_id);
      
      if (updateError) {
        console.error('Failed to update suggestion:', updateError);
      }
      
      // Log audit
      await supabase.from('audit_logs').insert({
        timestamp: now,
        actor_user_id: userId,
        actor_roles: JSON.stringify(roles),
        effective_operator_id: operatorId,
        endpoint: `/api/admin/alias-suggestions/${alias_suggestion_id}/decision`,
        method: 'POST',
        event_type: 'ALIAS_APPROVED',
        resource_type: 'alias_suggestion',
        resource_id: alias_suggestion_id,
        result: 'success',
        metadata: JSON.stringify({
          company_id: body.company_id,
          alias_id: alias.company_alias_id,
          alias_type: aliasType,
          suggested_alias: suggestion.suggested_alias
        })
      });
      
      return NextResponse.json({
        success: true,
        action: 'approved',
        alias_suggestion_id,
        company_alias_id: alias.company_alias_id,
        message: `Alias "${suggestion.suggested_alias}" approved and linked to company`
      });
      
    } else {
      // Reject
      if (!body.reject_reason) {
        return NextResponse.json(
          { error: { code: 'validation_failed', message: 'reject_reason required for rejection' } },
          { status: 400 }
        );
      }
      
      // Update suggestion status
      const { error: updateError } = await supabase
        .from('alias_suggestion')
        .update({
          status: 'rejected',
          decided_by_user_id: userId,
          decided_at: now,
          notes: body.reject_reason + (body.notes ? ` | ${body.notes}` : '')
        })
        .eq('alias_suggestion_id', alias_suggestion_id);
      
      if (updateError) {
        console.error('Failed to reject suggestion:', updateError);
        return NextResponse.json(
          { error: { code: 'server_error', message: 'Failed to reject suggestion' } },
          { status: 500 }
        );
      }
      
      // Log audit
      await supabase.from('audit_logs').insert({
        timestamp: now,
        actor_user_id: userId,
        actor_roles: JSON.stringify(roles),
        effective_operator_id: operatorId,
        endpoint: `/api/admin/alias-suggestions/${alias_suggestion_id}/decision`,
        method: 'POST',
        event_type: 'ALIAS_REJECTED',
        resource_type: 'alias_suggestion',
        resource_id: alias_suggestion_id,
        result: 'success',
        metadata: JSON.stringify({
          reject_reason: body.reject_reason,
          suggested_alias: suggestion.suggested_alias
        })
      });
      
      return NextResponse.json({
        success: true,
        action: 'rejected',
        alias_suggestion_id,
        message: `Alias suggestion rejected: ${body.reject_reason}`
      });
    }
    
  } catch (error) {
    console.error('Error processing alias decision:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
