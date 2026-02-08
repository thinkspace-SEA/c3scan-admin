import { createClient } from '@/lib/supabase-browser'
import type { SupabaseClient } from '@supabase/supabase-js'

// Types from spec
export interface MailItem {
  mail_item_id: string
  mailbox_id: string
  location_id: string
  package_type: 'correspondence' | 'package'
  status: string
  uploaded_at: string
  received_at: string
  carrier?: string
  tracking_number?: string
  created_by: string
}

export interface Mailbox {
  mailbox_id: string
  operator_id: string
  location_id: string
  pmb: string
  mailbox_name: string
  status: 'active' | 'cancelled'
  offering_plan_id?: string
  created_at: string
}

export interface Request {
  request_id: string
  mail_item_id: string
  mailbox_id: string
  request_type: 'open_scan' | 'forward' | 'shred' | 'recycle' | 'pickup' | 'deposit' | 'weekly_forward' | 'biweekly_forward' | 'leave_at_office'
  request_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  requested_by_user_id: string
  requested_at: string
  completed_at?: string
  notes?: string
  metadata_json?: Record<string, unknown>
}

export interface AliasSubmission {
  submission_id: string
  company_id: string
  proposed_alias_name: string
  alias_type: string
  submission_reason: string
  employee_notes?: string
  source_ocr_text?: string
  submitter_email: string
  review_status: 'pending' | 'under_review' | 'approved' | 'rejected'
  created_at: string
}

// Browser API Client
class BrowserApiClient {
  private client: SupabaseClient

  constructor() {
    this.client = createClient()
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [pendingAliasesResult, todayScansResult] = await Promise.all([
      this.client.from('alias_submissions').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
      this.client.from('scanned_mail').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
    ])

    return {
      pendingAliases: pendingAliasesResult.count || 0,
      todayScans: todayScansResult.count || 0,
    }
  }

  // Recent Submissions
  async getRecentSubmissions(limit = 5) {
    const { data, error } = await this.client
      .from('alias_submissions')
      .select('*')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as AliasSubmission[]
  }

  // Recent Activity
  async getRecentActivity(limit = 10) {
    const { data, error } = await this.client
      .from('scanned_mail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // Alias Actions
  async approveAlias(submissionId: string) {
    const { error } = await this.client.rpc('approve_alias_submission', {
      p_submission_id: submissionId,
    })
    if (error) throw error
  }

  async rejectAlias(submissionId: string) {
    const { error } = await this.client.rpc('reject_alias_submission', {
      p_submission_id: submissionId,
    })
    if (error) throw error
  }

  // Mail Items
  async getMailItems(filters?: {
    status?: string
    packageType?: string
    search?: string
  }) {
    let query = this.client.from('mail_items').select('*')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.packageType) {
      query = query.eq('package_type', filters.packageType)
    }

    const { data, error } = await query.order('uploaded_at', { ascending: false })
    if (error) throw error
    return data as MailItem[]
  }

  // Requests
  async getRequests(status?: string) {
    let query = this.client.from('requests').select('*')

    if (status) {
      query = query.eq('request_status', status)
    }

    const { data, error } = await query.order('requested_at', { ascending: false })
    if (error) throw error
    return data as Request[]
  }
}

// Export singleton instance for browser
export const api = new BrowserApiClient()
