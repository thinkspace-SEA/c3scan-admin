'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { StatusPill } from '@/components/ui/StatusPill'
import { 
  Search, 
  Filter, 
  Package, 
  Mail,
  Inbox,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Extended mail item type for customer view
interface CustomerMailItem {
  mail_item_id: string
  pmb: string
  mailbox_name: string
  package_type: 'correspondence' | 'package'
  status: string
  uploaded_at: string
  received_at: string
  carrier?: string
  tracking_number?: string
  photo_url?: string
  has_active_request: boolean
}

const statusOptions = [
  { value: 'all', label: 'All Mail' },
  { value: 'uploaded', label: 'New Mail' },
  { value: 'open_scan_requested', label: 'Open & Scan Requested' },
  { value: 'open_scan_completed', label: 'Open & Scan Completed' },
  { value: 'forward_requested', label: 'Forward Requested' },
  { value: 'forward_shipped', label: 'Forwarded' },
  { value: 'pickup_requested', label: 'Pickup Requested' },
  { value: 'deposited', label: 'Deposited' },
  { value: 'left_at_office', label: 'At Office' },
]

export default function CustomerInboxPage() {
  const params = useParams()
  const mailboxId = params.mailbox_id as string

  const [mailItems, setMailItems] = useState<CustomerMailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMailItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call for customer mail items
      // For now, simulate with scanned_mail data
      const data = await api.getScannedMail()
      
      // Transform to customer view
      const transformed: CustomerMailItem[] = (data || []).map((item: unknown) => ({
        mail_item_id: (item as { id: string }).id,
        pmb: '1001',
        mailbox_name: 'My Mailbox',
        package_type: (item as { scan_mode: string }).scan_mode === 'package' ? 'package' : 'correspondence',
        status: 'uploaded',
        uploaded_at: (item as { created_at: string }).created_at,
        received_at: (item as { created_at: string }).created_at,
        carrier: undefined,
        tracking_number: undefined,
        photo_url: (item as { photo_url?: string }).photo_url,
        has_active_request: false,
      }))
      
      setMailItems(transformed)
    } catch (err) {
      console.error('Error fetching mail items:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mail')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMailItems()
  }, [fetchMailItems])

  // Filter mail items
  const filteredMailItems = mailItems.filter(item => {
    const matchesSearch = 
      item.mail_item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.carrier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesArchived = showArchived || item.status !== 'archived'
    
    return matchesSearch && matchesStatus && matchesArchived
  })

  const newMailCount = mailItems.filter(item => item.status === 'uploaded').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500">
            {newMailCount > 0 ? `${newMailCount} new items` : 'No new mail'}
          </p>
        </div>
        
        {/* View Archived Toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#FFCC00] focus:ring-[#FFCC00]"
          />
          Show Archived
        </label>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 flex-1">{error}</p>
          <button 
            onClick={fetchMailItems}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mail..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compliance Banner (if needed) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-yellow-800">USPS Form 1583 Required</p>
          <p className="text-sm text-yellow-700 mt-1">
            Please complete your compliance documentation to ensure uninterrupted service.
          </p>
        </div>
        <Link
          href={`/app/${mailboxId}/compliance`}
          className="px-4 py-2 bg-[#FFCC00] text-black text-sm font-medium rounded-lg hover:bg-[#E6B800] transition-colors"
        >
          Complete
        </Link>
      </div>

      {/* Mail Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
        </div>
      ) : filteredMailItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMailItems.map((item) => (
            <Link
              key={item.mail_item_id}
              href={`/app/${mailboxId}/mail/${item.mail_item_id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#FFCC00] hover:shadow-md transition-all group"
            >
              {/* Image Preview */}
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
                      <Package className="w-12 h-12 mx-auto mb-2" />
                    ) : (
                      <Mail className="w-12 h-12 mx-auto mb-2" />
                    )}
                    <p className="text-sm">No preview</p>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <StatusPill status={item.status} />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </span>
                  {item.has_active_request && (
                    <span className="text-xs text-blue-600 font-medium">
                      Action Requested
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 capitalize mb-1">
                  {item.package_type === 'package' ? 'Package' : 'Correspondence'}
                </h3>
                {item.carrier && (
                  <p className="text-sm text-gray-500">
                    {item.carrier} {item.tracking_number && `• ${item.tracking_number}`}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mail Found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Your inbox is empty. New mail will appear here.'}
          </p>
        </div>
      )}
    </div>
  )
}
