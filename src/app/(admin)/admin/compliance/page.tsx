'use client'

import { useEffect, useState, useCallback } from 'react'
import { api, type ComplianceCase, type Mailbox } from '@/lib/api'
import { StatusPill } from '@/components/ui/StatusPill'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ComplianceDetail } from '@/components/ui/ComplianceDetail'
import {
  ShieldCheck,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Building2
} from 'lucide-react'

interface ComplianceCaseWithMailbox extends ComplianceCase {
  mailbox?: Mailbox
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'compliant' | 'non_compliant'>('all')
  const [cases, setCases] = useState<ComplianceCaseWithMailbox[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<ComplianceCaseWithMailbox | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchComplianceCases = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const statusFilter = activeTab === 'all' ? undefined : activeTab
      const data = await api.getComplianceCases({
        status: statusFilter,
        search: searchQuery || undefined
      })

      // TODO: Fetch associated mailboxes for display
      // For now, just use the cases as-is
      setCases(data)
    } catch (err) {
      console.error('Error fetching compliance cases:', err)
      setError(err instanceof Error ? err.message : 'Failed to load compliance cases')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchQuery])

  useEffect(() => {
    fetchComplianceCases()
  }, [fetchComplianceCases])

  const compliantCount = cases.filter(c => c.status === 'compliant').length
  const nonCompliantCount = cases.filter(c =>
    c.status === 'non_compliant' || c.status === 'pending' || c.status === 'rejected'
  ).length
  const pendingReviewCount = cases.filter(c => c.status === 'under_review').length

  return (
    <>
      <CommandPalette />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
        <p className="text-gray-500 mt-1">
          Manage USPS Form 1583 compliance for mailboxes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
              <p className="text-sm text-gray-500">Total Cases</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{compliantCount}</p>
              <p className="text-sm text-gray-500">Compliant</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{nonCompliantCount}</p>
              <p className="text-sm text-gray-500">Non-Compliant</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingReviewCount}</p>
              <p className="text-sm text-gray-500">Under Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 flex-1">{error}</p>
          <button
            onClick={fetchComplianceCases}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-200">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#FFCC00] text-black'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('compliant')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'compliant'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Compliant
            </button>
            <button
              onClick={() => setActiveTab('non_compliant')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'non_compliant'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non-Compliant
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by mailbox..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
            </div>
          ) : cases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mailbox
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grace Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Reminder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cases.map((complianceCase) => (
                    <tr
                      key={complianceCase.case_id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(complianceCase)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {complianceCase.mailbox_id.substring(0, 8)}...
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={complianceCase.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complianceCase.grace_deadline ? (
                          <span className={`flex items-center gap-1.5 ${
                            new Date(complianceCase.grace_deadline) < new Date()
                              ? 'text-red-600 font-medium'
                              : ''
                          }`}>
                            {new Date(complianceCase.grace_deadline) < new Date() && (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            {new Date(complianceCase.grace_deadline).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {complianceCase.last_reminder_at
                          ? new Date(complianceCase.last_reminder_at).toLocaleDateString()
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(complianceCase.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCase(complianceCase)
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No compliance cases found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery || activeTab !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Compliance cases will appear when mailboxes are created'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Detail Panel */}
      {selectedCase && (
        <ComplianceDetail
          complianceCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={() => fetchComplianceCases()}
        />
      )}
    </>
  )
}
