'use client'

import { useEffect, useState } from 'react'
import { supabase, type AliasSubmission } from '@/lib/supabase'
import { StatusPill } from '@/components/ui/StatusPill'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Check, X, Search, Filter, ArrowLeft } from 'lucide-react'

export default function AliasSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AliasSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      let query = supabase
        .from('alias_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('review_status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveSubmission(submissionId: string) {
    try {
      const { error } = await supabase
        .rpc('approve_alias_submission', {
          p_submission_id: submissionId,
          p_review_notes: 'Approved via admin dashboard'
        })

      if (error) throw error
      
      fetchSubmissions()
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission')
    }
  }

  async function rejectSubmission(submissionId: string) {
    try {
      const { error } = await supabase
        .rpc('reject_alias_submission', {
          p_submission_id: submissionId,
          p_rejection_reason: 'Rejected via admin dashboard'
        })

      if (error) throw error
      
      fetchSubmissions()
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission')
    }
  }

  const filteredSubmissions = submissions.filter(sub =>
    sub.proposed_alias_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.submitter_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.source_ocr_text?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  return (
    <>
      <CommandPalette />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <a
            href="/admin"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Alias Submissions</h1>
        <p className="text-gray-500 mt-1">
          Review and approve new company aliases submitted by field staff
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCC00]"></div>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Alias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.submission_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {submission.proposed_alias_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Type: {submission.alias_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {submission.company_id.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{submission.submitter_email}</div>
                      <div className="text-sm text-gray-500">
                        Reason: {submission.submission_reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={submission.review_status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {submission.review_status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveSubmission(submission.submission_id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectSubmission(submission.submission_id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No submissions found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try adjusting your search' : 'New submissions will appear here'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
