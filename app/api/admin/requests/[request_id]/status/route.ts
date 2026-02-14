import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Update Request Status
 * 
 * POST /api/admin/requests/{request_id}/status
 * 
 * Update request status and add completion details.
 * Valid transitions: pending -> in_progress -> completed, or pending -> canceled
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UpdateStatusRequest {
  new_status: 'in_progress' | 'completed' | 'canceled';
  note_internal?: string;
  completion?: {
    carrier?: string;
    tracking_number?: string;
    label_file_id?: string;
    scan_file_ids?: string[];
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { request_id: string } }
) {
  try {
    const { request_id } = params;
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
    const body: UpdateStatusRequest = await request.json();
    
    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'pending': ['in_progress', 'canceled'],
      'in_progress': ['completed', 'canceled'],
      'completed': [],
      'canceled': []
    };
    
    // Get current request
    const { data: existingRequest, error: fetchError } = await supabase
      .from('mail_request')
      .select('*')
      .eq('request_id', request_id)
      .eq('operator_id', operatorId)
      .single();
    
    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Request not found' } },
        { status: 404 }
      );
    }
    
    // Check location permissions
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (userLocationIds.length > 0 && !userLocationIds.includes(existingRequest.location_id)) {
        return NextResponse.json(
          { error: { code: 'forbidden', message: 'Access denied for this location' } },
          { status: 403 }
        );
      }
    }
    
    // Validate transition
    const currentStatus = existingRequest.request_status;
    if (!validTransitions[currentStatus]?.includes(body.new_status)) {
      return NextResponse.json(
        { 
          error: { 
            code: 'validation_failed', 
            message: `Invalid status transition from ${currentStatus} to ${body.new_status}`,
            details: { current_status: currentStatus, requested_status: body.new_status }
          } 
        },
        { status: 400 }
      );
    }
    
    // Validate completion requirements
    if (body.new_status === 'completed') {
      if (existingRequest.request_type === 'forward_mail') {
        if (!body.completion?.carrier || !body.completion?.tracking_number) {
          return NextResponse.json(
            { 
              error: { 
                code: 'validation_failed', 
                message: 'Forward mail completion requires carrier and tracking_number',
                details: { required_fields: ['carrier', 'tracking_number'] }
              } 
            },
            { status: 400 }
          );
        }
      }
      
      if (existingRequest.request_type === 'open_scan') {
        if (!body.completion?.scan_file_ids || body.completion.scan_file_ids.length === 0) {
          return NextResponse.json(
            { 
              error: { 
                code: 'validation_failed', 
                message: 'Open scan completion requires at least one scan_file_id',
                details: { required_fields: ['scan_file_ids'] }
              } 
            },
            { status: 400 }
          );
        }
      }
    }
    
    // Build update data
    const updateData: any = {
      request_status: body.new_status,
      updated_at: new Date().toISOString()
    };
    
    if (body.new_status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completion_metadata = JSON.stringify(body.completion);
    }
    
    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('mail_request')
      .update(updateData)
      .eq('request_id', request_id)
      .eq('operator_id', operatorId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Failed to update request:', updateError);
      return NextResponse.json(
        { error: { code: 'server_error', message: 'Failed to update request' } },
        { status: 500 }
      );
    }
    
    // Log audit event
    await supabase.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_user_id: userId,
      actor_roles: JSON.stringify(roles),
      effective_operator_id: operatorId,
      endpoint: `/api/admin/requests/${request_id}/status`,
      method: 'POST',
      event_type: 'RESOURCE_UPDATE',
      resource_type: 'mail_request',
      resource_id: request_id,
      result: 'success',
      previous_state: JSON.stringify({ status: currentStatus }),
      new_state: JSON.stringify({ status: body.new_status }),
      metadata: JSON.stringify({
        note_internal: body.note_internal,
        completion: body.completion
      })
    });
    
    return NextResponse.json({
      request: updatedRequest,
      message: `Request status updated to ${body.new_status}`
    });
    
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
