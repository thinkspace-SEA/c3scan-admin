import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export type AliasSubmission = {
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

export type ScannedMail = {
  id: string
  user_id?: string
  location_id?: string
  raw_ocr_text?: string
  matched_company_id?: string
  confidence_score: number
  photo_url?: string
  photo_storage_path?: string
  scan_mode: string
  device_id?: string
  app_version: string
  created_at: string
}
