import { createClient } from '@/lib/supabase-server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AliasSubmission, MailItem, Mailbox, Request } from '@/lib/api'

// Server API Client - Only use in Server Components or Server Actions
class ServerApiClient {
  private async getClient(): Promise<SupabaseClient> {
    return await createClient()
  }

  // Dashboard Stats
  async getDashboardStats() {
    const client = await this.getClient()
    
    const [pendingAliasesResult, todayScansResult] = await Promise.all([
      client.from('alias_submissions').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
      client.from('scanned_mail').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
    ])

    return {
      pendingAliases: pendingAliasesResult.count || 0,
      todayScans: todayScansResult.count || 0,
    }
  }

  // Recent Submissions
  async getRecentSubmissions(limit = 5) {
    const client = await this.getClient()
    const { data, error } = await client
      .from('alias_submissions')
      .select('*')
      .eq('review_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as AliasSubmission[]
  }

  // Get current user
  async getCurrentUser() {
    const client = await this.getClient()
    const { data: { user }, error } = await client.auth.getUser()
    if (error) throw error
    return user
  }
}

// Export singleton instance for server
export const serverApi = new ServerApiClient()
