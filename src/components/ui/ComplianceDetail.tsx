'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, ShieldCheck, Building2, Users, FileText, CheckCircle, AlertTriangle, Clock, Mail, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import type { ComplianceCase, Mailbox, Renter } from '@/lib/api'
import { api } from '@/lib/api'

interface ComplianceDetailProps {
  complianceCase: ComplianceCase
  onClose: () => void
  onUpdate: () => void
}

interface ComplianceDocument {
  document_id: string
  document_type: string
  verified_at?: string
  storage_path: string
}

export function ComplianceDetail({ complianceCase, onClose, onUpdate }: ComplianceDetailProps) {
  const [mailbox, setMailbox] = useState<Mailbox | null>(null)
  const [renters, setRenters] = useState<Renter[]>([])
  const [documents, setDocuments] = useState<ComplianceDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchComplianceData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch associated mailbox
      const mailboxData = await api.getMailboxById(complianceCase.mailbox_id)
      setMailbox(mailboxData)

      // TODO: Fetch renters and documents when APIs are ready
      setRenters([])
      setDocuments([])
    } catch (err) {
      console.error('Error fetching compliance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load compliance details')
    } finally {
      setLoading(false)
    }
  }, [complianceCase.mailbox_id])

  useEffect(() => {
    fetchComplianceData()
  }, [fetchComplianceData])

  async function handleStatusUpdate(newStatus: string) {
    try {
      setActionLoading(newStatus)
      await api.updateComplianceStatus(complianceCase.case_id, newStatus)
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error updating compliance status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const isOverdue = complianceCase.grace_deadline &&
    new Date(complianceCase.grace_deadline) < new Date()

  const missingDocuments = documents.length === 0
  const missingRenters = renters.length === 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Compliance Case</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {mailbox?.mailbox_name || 'Mailbox'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-gray-500">PMB {mailbox?.pmb || '—'}</code>
              <StatusPill status={complianceCase.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Alert */}
              {isOverdue && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Grace Period Expired</p>
                      <p className="text-sm text-red-700 mt-1">
                        This mailbox is past the grace deadline. Service restrictions may apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {complianceCase.status === 'compliant' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Fully Compliant</p>
                      <p className="text-sm text-green-700 mt-1">
                        This mailbox has completed all USPS Form 1583 requirements.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {complianceCase.status === 'under_review' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Under Review</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Documents have been submitted and are awaiting staff review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Metrics */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Renters</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{renters.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Documents</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                </div>
              </section>

              {/* Missing Items Alert */}
              {(missingRenters || missingDocuments) && complianceCase.status !== 'compliant' && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Missing Requirements
                  </h3>
                  <div className="space-y-2">
                    {missingRenters && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-700">At least one renter required</span>
                      </div>
                    )}
                    {missingDocuments && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-700">Identity verification documents required</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Documents Section */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Documents
                </h3>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.document_type}</p>
                            {doc.verified_at && (
                              <p className="text-sm text-gray-500">
                                Verified: {new Date(doc.verified_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No documents uploaded</p>
                    <p className="text-sm text-gray-400 mt-1">
                      ID verification documents are required for compliance
                    </p>
                  </div>
                )}
              </section>

              {/* Details */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Case ID</span>
                    <code className="text-sm text-gray-900">{complianceCase.case_id.substring(0, 8)}...</code>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Mailbox ID</span>
                    <code className="text-sm text-gray-900">{complianceCase.mailbox_id.substring(0, 8)}...</code>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Grace Deadline</span>
                    <span className={`text-gray-900 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      {complianceCase.grace_deadline
                        ? new Date(complianceCase.grace_deadline).toLocaleDateString()
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Last Reminder</span>
                    <span className="text-gray-900">
                      {complianceCase.last_reminder_at
                        ? new Date(complianceCase.last_reminder_at).toLocaleDateString()
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
                      {new Date(complianceCase.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">Send Reminder Email</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">View Mailbox</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </section>

              {/* Admin Override Actions */}
              {complianceCase.status !== 'compliant' && (
                <section className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    Admin Override
                  </h3>
                  <div className="space-y-2">
                    {complianceCase.status === 'under_review' && (
                      <button
                        onClick={() => handleStatusUpdate('compliant')}
                        disabled={actionLoading === 'compliant'}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'compliant' && <Loader2 className="w-4 h-4 animate-spin" />}
                        <CheckCircle className="w-4 h-4" />
                        Approve as Compliant
                      </button>
                    )}
                    {complianceCase.status === 'under_review' && (
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={actionLoading === 'rejected'}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'rejected' && <Loader2 className="w-4 h-4 animate-spin" />}
                        <AlertTriangle className="w-4 h-4" />
                        Reject Documents
                      </button>
                    )}
                    {complianceCase.status !== 'under_review' && (
                      <button
                        onClick={() => handleStatusUpdate('compliant')}
                        disabled={actionLoading === 'compliant'}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-[#FFCC00] text-black rounded-lg hover:bg-[#E6B800] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'compliant' && <Loader2 className="w-4 h-4 animate-spin" />}
                        <CheckCircle className="w-4 h-4" />
                        Mark as Compliant
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    These actions bypass normal verification流程 and should only be used when necessary.
                  </p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
