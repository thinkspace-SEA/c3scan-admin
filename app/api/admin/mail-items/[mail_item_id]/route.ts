import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin: Get Mail Item Detail
 * 
 * GET /api/admin/mail-items/{mail_item_id}
 * 
 * Returns detailed mail item information including related requests.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { mail_item_id: string } }
) {
  try {
    const { mail_item_id } = params;
    const operatorId = request.headers.get('X-Effective-Operator-Id');
    const userId = request.headers.get('X-User-Id');
    const roles = JSON.parse(request.headers.get('X-User-Roles') || '[]');
    const userLocationIds = JSON.parse(request.headers.get('X-User-Location-Ids') || '[]');
    
    if (!operatorId) {
      return NextResponse.json(
        { error: { code: 'unauthorized', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Fetch mail item with related data
    const { data: mailItem, error: itemError } = await supabase
      .from('mail_item')
      .select(`
        *,
        mailbox:mailbox_id (*),
        company:company_id (*),
        location:location_id (*),
        mail_item_image (*),
        mail_request (*)
      `)
      .eq('mail_item_id', mail_item_id)
      .eq('operator_id', operatorId)
      .single();
    
    if (itemError || !mailItem) {
      return NextResponse.json(
        { error: { code: 'not_found', message: 'Mail item not found' } },
        { status: 404 }
      );
    }
    
    // Check location permissions for location_staff
    if (roles.includes('location_staff') && !roles.includes('operator_admin')) {
      if (userLocationIds.length > 0 && !userLocationIds.includes(mailItem.location_id)) {
        return NextResponse.json(
          { error: { code: 'forbidden', message: 'Access denied for this location' } },
          { status: 403 }
        );
      }
    }
    
    // Get envelope image signed URL
    const envelopeImage = (mailItem.mail_item_image as any[])?.find(
      (img: any) => img.image_type === 'envelope'
    );
    
    // Format response
    const response = {
      mail_item_id: mailItem.mail_item_id,
      mailbox_id: mailItem.mailbox_id,
      company_id: mailItem.company_id,
      location_id: mailItem.location_id,
      scanned_at: mailItem.received_at,
      status: mailItem.status,
      is_active: mailItem.is_active,
      ocr_text: mailItem.ocr_text,
      match_confidence: mailItem.match_confidence,
      match_method: mailItem.match_method,
      
      mailbox: mailItem.mailbox,
      company: mailItem.company,
      location: mailItem.location,
      
      envelope_image: envelopeImage ? {
        file_id: envelopeImage.mail_item_image_id,
        storage_path: envelopeImage.storage_path,
        // signed_url would be generated here in production
      } : null,
      
      requests: (mailItem.mail_request as any[])?.map((req: any) => ({
        request_id: req.request_id,
        type: req.request_type,
        status: req.request_status,
        requested_at: req.requested_at,
        completed_at: req.completed_at
      })) || []
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching mail item:', error);
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
