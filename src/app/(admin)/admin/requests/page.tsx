'use client'

import { useEffect, useState, useCallback } from 'react'
import { api, type Request } from '@/lib/api'
import { StatusPill } from '@/components/ui/StatusPill'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ForwardMailDetail } from '@/components/ui/ForwardMailDetail'
import { OpenScanDetail } from '@/components/ui/OpenScanDetail'
import { 
  Scan, 
  Trash2, 
  Recycle, 
  Send, 
  Package, 
  Banknote, 
  Calendar, 
  Home,
  Clock,
  CheckCircle,
  List,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

// Request types for display
interface RequestType {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  color: string
}

const requestTypeDefs: Omit<RequestType, 'count'>[] = [
  { id: 'open_scan', name: 'Open & Scan', icon: <Scan className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
  { id: 'shred', name: 'Shred', icon: <Trash2 className="w-5 h-5" />, color: 'bg-red-50 text-red-600' },
  { id: 'recycle', name: 'Recycle', icon: <Recycle className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
  { id: 'forward', name: 'Forward', icon: <Send className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  { id: 'pickup', name: 'Pickup', icon: <Package className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
  { id: 'deposit', name: 'Deposit', icon: <Banknote className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'weekly_forward', name: 'Weekly Forward', icon: <Calendar className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'biweekly_forward', name: 'Biweekly Forward', icon: <Calendar className="w-5 h-5" />, color: 'bg-pink-50 text-pink-600' },
  { id: 'leave_at_office', name: 'Leave at Office', icon: <Home className="w-5 h-5" />, color: 'bg-gray-50 text-gray-600' },
]

// Transform API request to display format
interface DisplayRequest {
  request_id: string
  request_type: string
  mailbox_name: string
  pmb: string
  requested_by: string
  requested_at: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

function transformRequests(data: Request[]): DisplayRequest[] {
  return data.map(item => ({
    request_id: item.request_id,
    request_type: item.request_type,
    mailbox_name: `Mailbox ${item.mailbox_id.substring(0, 4)}`, // TODO: Get actual mailbox name
    pmb: item.mailbox_id.substring(0, 4), // TODO: Get actual PMB
    requested_by: 'customer@example.com', // TODO: Get actual user email
    requested_at: item.requested_at,
    status: item.request_status
  }))
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending')
  const [requestCounts, setRequestCounts] = useState<RequestType[]>(requestTypeDefs.map(rt => ({ ...rt, count: 0 })))
  const [requests, setRequests] = useState<DisplayRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<DisplayRequest | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRequestData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get requests from API
      const statusFilter = activeTab === 'pending' ? 'pending' : activeTab === 'completed' ? 'completed' : undefined
      const data = await api.getRequests(statusFilter)
      
      // Transform for display
      const transformedRequests = transformRequests(data)
      
      // Calculate counts (for now, all pending since we filter on API)
      const counts = requestTypeDefs.map(rt => ({
        ...rt,
        count: transformedRequests.filter(r => r.request_type === rt.id).length
      }))
      
      setRequestCounts(counts)
      setRequests(transformedRequests)
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchRequestData()
  }, [fetchRequestData])

  const totalPending = requestCounts.reduce((sum, rt) => sum + rt.count, 0)

  return (
    <>
      <CommandPalette />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <p className="text-gray-500 mt-1">
          Manage customer action requests
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 flex-1">{error}</p>
          <button 
            onClick={fetchRequestData}
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

      {/* Request Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {requestCounts.slice(0, 5).map((type) => (
          <button
            key={type.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
              {type.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{type.count}</p>
            <p className="text-sm text-gray-500">{type.name}</p>
          </button>
        ))}
      </div>

      {/* Secondary Request Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {requestCounts.slice(5).map((type) => (
          <button
            key={type.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
              {type.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{type.count}</p>
            <p className="text-sm text-gray-500">{type.name}</p>
          </button>
        ))}
      </div>

      {/* Requests List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
            {totalPending > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                {totalPending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Completed
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            All Requests
          </button>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mailbox
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {requestTypeDefs.find(rt => rt.id === request.request_type)?.icon}
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {request.request_type.replace(/_/g, ' ')}
                          </p>
                          <code className="text-xs text-gray-500">
                            {request.request_id}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.mailbox_name}</p>
                      <p className="text-sm text-gray-500">PMB {request.pmb}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.requested_by}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
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
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {activeTab === 'pending' 
                ? 'No pending requests'
                : activeTab === 'completed'
                ? 'No completed requests yet'
                : 'No requests found'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Requests will appear here when customers submit them
            </p>
          </div>
        )}
      </div>

      {/* Request Detail Panels */}
      {selectedRequest?.request_type === 'forward' && (
        <ForwardMailDetail
          requestId={selectedRequest.request_id}
          onClose={() => setSelectedRequest(null)}
        />
      )}
      {selectedRequest?.request_type === 'open_scan' && (
        <OpenScanDetail
          requestId={selectedRequest.request_id}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  )
}
