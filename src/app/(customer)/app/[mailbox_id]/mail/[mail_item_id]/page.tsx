'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { StatusPill } from '@/components/ui/StatusPill'
import { 
  ArrowLeft,
  Package,
  Mail,
  Scan,
  Send,
  User,
  Trash2,
  Recycle,
  Banknote,
  Home,
  CheckCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface MailItem {
  mail_item_id: string
  mailbox_id: string
  package_type: 'correspondence' | 'package'
  status: string
  uploaded_at: string
  received_at: string
  carrier?: string
  tracking_number?: string
  photo_url?: string
  has_active_request: boolean
  requests?: {
    request_id: string
    request_type: string
    request_status: string
    requested_at: string
  }[]
}

// Request types available to customers
const requestTypes: RequestType[] = [
  { 
    id: 'open_scan', 
    name: 'Open & Scan', 
    icon: Scan,
    description: 'We\'ll open and scan the contents for you to view',
    color: 'bg-blue-50 text-blue-600',
    fee: '$5.00'
  },
  { 
    id: 'forward', 
    name: 'Forward', 
    icon: Send,
    description: 'Ship this item to your specified address',
    color: 'bg-purple-50 text-purple-600',
    fee: 'From $8.50'
  },
  { 
    id: 'pickup', 
    name: 'Pickup', 
    icon: User,
    description: 'Schedule a time to pick up at the office',
    color: 'bg-orange-50 text-orange-600',
    fee: 'Free'
  },
  { 
    id: 'shred', 
    name: 'Shred', 
    icon: Trash2,
    description: 'Securely shred and dispose of this item',
    color: 'bg-red-50 text-red-600',
    fee: '$1.00'
  },
  { 
    id: 'recycle', 
    name: 'Recycle', 
    icon: Recycle,
    description: 'Eco-friendly disposal of this item',
    color: 'bg-green-50 text-green-600',
    fee: 'Free'
  },
  { 
    id: 'deposit', 
    name: 'Deposit', 
    icon: Banknote,
    description: 'Deposit any checks to your linked account',
    color: 'bg-emerald-50 text-emerald-600',
    fee: '$2.00'
  },
  { 
    id: 'leave_at_office', 
    name: 'Leave at Office', 
    icon: Home,
    description: 'Keep at office until you pick up',
    color: 'bg-gray-50 text-gray-600',
    fee: 'Free'
  },
]

export default function CustomerMailDetailPage() {
  const params = useParams()
  const mailboxId = params.mailbox_id as string
  const mailItemId = params.mail_item_id as string
  
  const [item, setItem] = useState<MailItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchMailItem = useCallback(async () => {
    if (!mailboxId || !mailItemId) return

    try {
      setLoading(true)
      setError(null)
      
      const data = await api.getCustomerMailItem(mailboxId, mailItemId)
      setItem(data as MailItem)
    } catch (err) {
      console.error('Error fetching mail item:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mail item')
    } finally {
      setLoading(false)
    }
  }, [mailboxId, mailItemId])

  useEffect(() => {
    fetchMailItem()
  }, [fetchMailItem])

  async function handleRequestSubmit() {
    if (!selectedRequestType || !item) return
    
    try {
      setSubmitting(true)
      // TODO: Implement create request API
      // await api.createRequest({
      //   mail_item_id: item.mail_item_id,
      //   mailbox_id: mailboxId,
      //   request_type: selectedRequestType,
      // })
      
      // Refresh data after request creation
      await fetchMailItem()
      setShowRequestModal(false)
      setSelectedRequestType(null)
    } catch (err) {
      console.error('Error creating request:', err)
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/app/${mailboxId}/mail`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </Link>
        
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Mail Item</h3>
          <p className="text-gray-500 mb-6">{error || 'Item not found'}</p>
          <button
            onClick={fetchMailItem}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/app/${mailboxId}/mail`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative">
              {item.photo_url ? (
                <img
                  src={item.photo_url}
                  alt="Mail envelope"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  {item.package_type === 'package' ? (
                    <Package className="w-16 h-16 mx-auto mb-2" />
                  ) : (
                    <Mail className="w-16 h-16 mx-auto mb-2" />
                  )}
                  <p>Envelope image preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mail Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Mail ID</span>
                <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {item.mail_item_id}
                </code>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 capitalize">{item.package_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <StatusPill status={item.status} />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Received</span>
                <span className="text-gray-900">
                  {new Date(item.received_at).toLocaleString()}
                </span>
              </div>
              {item.carrier && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Carrier</span>
                  <span className="text-gray-900">{item.carrier}</span>
                </div>
              )}
              {item.tracking_number && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Tracking</span>
                  <span className="text-gray-900 font-mono">{item.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scanned Contents (if available) */}
          {item.status === 'open_scan_completed' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Scanned Contents</h2>
              </div>
              <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Scanned document preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Request Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Action</h2>
            
            {item.has_active_request ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Action Pending</span>
                </div>
                <p className="text-sm text-blue-700">
                  You have an active request for this item. We&apos;ll notify you when it&apos;s processed.
                </p>
              </div>
            ) : item.status === 'uploaded' ? (
              <div className="space-y-2">
                {requestTypes.slice(0, 4).map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedRequestType(type.id)
                      setShowRequestModal(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#FFCC00] hover:bg-yellow-50 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{type.name}</p>
                      <p className="text-xs text-gray-500">{type.fee}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFCC00]" />
                  </button>
                ))}
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  View all actions →
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No actions available for this item
              </p>
            )}
          </div>

          {/* Request History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request History</h2>
            {item.requests && item.requests.length > 0 ? (
              <div className="space-y-3">
                {item.requests.map((req) => (
                  <div key={req.request_id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 capitalize">
                        {req.request_type.replace('_', ' ')}
                      </span>
                      <StatusPill status={req.request_status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(req.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No previous requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestModal
          requestTypes={requestTypes}
          selectedType={selectedRequestType}
          onSelect={setSelectedRequestType}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedRequestType(null)
          }}
          onSubmit={handleRequestSubmit}
          submitting={submitting}
        />
      )}
    </div>
  )
}

// Request Modal Component
interface RequestType {
  id: string
  name: string
  icon: typeof Scan
  description: string
  color: string
  fee: string
}

function RequestModal({
  requestTypes,
  selectedType,
  onSelect,
  onClose,
  onSubmit,
  submitting,
}: {
  requestTypes: RequestType[]
  selectedType: string | null
  onSelect: (type: string) => void
  onClose: () => void
  onSubmit: () => void
  submitting: boolean
}) {
  const selectedRequest = requestTypes.find(t => t.id === selectedType)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedRequest ? selectedRequest.name : 'Request Action'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!selectedRequest ? (
            <div className="space-y-2">
              {requestTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onSelect(type.id)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#FFCC00] hover:bg-yellow-50 transition-all text-left"
                >
                  <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{type.name}</p>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{type.fee}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`w-16 h-16 ${selectedRequest.color} rounded-2xl flex items-center justify-center mx-auto`}>
                <selectedRequest.icon className="w-8 h-8" />
              </div>
              
              <p className="text-gray-600 text-center">
                {selectedRequest.description}
              </p>

              {/* Request-specific fields would go here */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Fee: <span className="font-medium text-gray-900">{selectedRequest.fee}</span>
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 rounded border-gray-300" />
                <span className="text-sm text-gray-600">
                  I understand this action may incur fees and cannot be undone.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200">
          {selectedRequest && (
            <button
              onClick={() => onSelect('')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              disabled={submitting}
            >
              Back
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
            disabled={submitting}
          >
            Cancel
          </button>
          {selectedRequest && (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Request'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
