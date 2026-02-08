'use client'

import { useState, useEffect } from 'react'
import { StatusPill } from '@/components/ui/StatusPill'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Package,
  User,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  DollarSign,
  Download,
  ExternalLink
} from 'lucide-react'
import { getShipmentRates, buyShipmentLabel } from '@/lib/easypost-actions'

interface RequestDetailProps {
  requestId: string
  onClose: () => void
}

// Mock request data
const mockRequest = {
  request_id: 'req-002',
  request_type: 'forward',
  status: 'pending',
  mailbox_name: 'TechStart Inc',
  pmb: '1002',
  mail_item_id: 'mail-456',
  requested_by: 'sarah@techstart.com',
  requested_at: '2026-02-08T09:15:00Z',
  recipient_name: 'Sarah Johnson',
  address_line1: '123 Main Street',
  address_line2: 'Suite 100',
  city: 'Seattle',
  state: 'WA',
  postal_code: '98101',
  country: 'US',
  carrier: 'USPS',
  service: 'First Class',
}

// Mock from address (operator's address)
const mockFromAddress = {
  name: 'Thinkspace Mailroom',
  street1: '1201 3rd Avenue',
  street2: 'Suite 100',
  city: 'Seattle',
  state: 'WA',
  zip: '98101',
}

// Mock parcel dimensions
const mockParcel = {
  length: 9,
  width: 6,
  height: 1,
  weight: 3, // ounces
}

interface Rate {
  id: string
  carrier: string
  service: string
  rate: string
  delivery_days?: number
  delivery_date?: string
}

const mockEvents = [
  { id: 1, type: 'created', user: 'sarah@techstart.com', timestamp: '2026-02-08T09:15:00Z', message: 'Request created' },
  { id: 2, type: 'viewed', user: 'admin@thinkspace.com', timestamp: '2026-02-08T10:30:00Z', message: 'Request viewed by staff' },
]

const mockNotes: { id: number; user: string; text: string; timestamp: string; isStaffOnly: boolean }[] = []

export function ForwardMailDetail({ requestId, onClose }: RequestDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'activity'>('details')
  const [newNote, setNewNote] = useState('')
  const [isStaffOnly, setIsStaffOnly] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRate, setSelectedRate] = useState<string | null>(null)
  const [shipmentId, setShipmentId] = useState<string | null>(null)
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)
  const [labelGenerated, setLabelGenerated] = useState(false)
  const [labelUrl, setLabelUrl] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)

  // Fetch rates when component mounts
  useEffect(() => {
    fetchRates()
  }, [])

  async function fetchRates() {
    setIsLoadingRates(true)
    setRateError(null)

    try {
      const result = await getShipmentRates({
        toAddress: {
          name: mockRequest.recipient_name,
          street1: mockRequest.address_line1,
          street2: mockRequest.address_line2,
          city: mockRequest.city,
          state: mockRequest.state,
          zip: mockRequest.postal_code,
          country: mockRequest.country,
        },
        fromAddress: mockFromAddress,
        parcel: mockParcel,
      })

      setShipmentId(result.shipmentId)
      setRates(result.rates.map((r: Rate) => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: r.rate,
        delivery_days: r.delivery_days,
        delivery_date: r.delivery_date,
      })))
    } catch (err) {
      console.error('Error fetching rates:', err)
      setRateError(err instanceof Error ? err.message : 'Failed to fetch shipping rates')
    } finally {
      setIsLoadingRates(false)
    }
  }

  const handleForward = async () => {
    if (!selectedRate || !shipmentId) return

    setIsProcessing(true)

    try {
      const result = await buyShipmentLabel(shipmentId, selectedRate)
      setTrackingNumber(result.trackingNumber)
      setLabelUrl(result.labelUrl || result.labelPdfUrl)
      setLabelGenerated(true)
      
      // TODO: Save label as request attachment
      // TODO: Update request status to 'in_progress' or 'completed'
      // TODO: Log request_event
    } catch (err) {
      console.error('Error generating label:', err)
      setRateError(err instanceof Error ? err.message : 'Failed to generate shipping label')
    } finally {
      setIsProcessing(false)
    }
  }

  function formatRate(rate: string): string {
    const cents = parseInt(rate, 10)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Detail Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Forward Mail</h2>
                <StatusPill status={labelGenerated ? 'completed' : mockRequest.status} />
              </div>
              <p className="text-sm text-gray-500">
                Request {mockRequest.request_id} • Mail {mockRequest.mail_item_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-[#FFCC00] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {rateError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700">{rateError}</p>
                <button 
                  onClick={fetchRates}
                  className="text-sm text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {labelGenerated && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">Label Generated!</h3>
              </div>
              {trackingNumber && (
                <p className="text-green-700 text-sm mb-3">
                  Tracking: <span className="font-mono font-medium">{trackingNumber}</span>
                </p>
              )}
              {labelUrl && (
                <a
                  href={labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Label
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Mail Preview */}
              <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center h-48">
                <div className="text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2" />
                  <p>Envelope image preview</p>
                </div>
              </div>

              {/* Mailbox Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mailbox</h3>
                <p className="font-medium text-gray-900">{mockRequest.mailbox_name}</p>
                <p className="text-sm text-gray-500">PMB {mockRequest.pmb}</p>
              </div>

              {/* Forward Destination */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Forward Destination</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-gray-900">{mockRequest.recipient_name}</p>
                  <p className="text-gray-600">{mockRequest.address_line1}</p>
                  {mockRequest.address_line2 && (
                    <p className="text-gray-600">{mockRequest.address_line2}</p>
                  )}
                  <p className="text-gray-600">
                    {mockRequest.city}, {mockRequest.state} {mockRequest.postal_code}
                  </p>
                  <p className="text-gray-600">{mockRequest.country}</p>
                </div>
              </div>

              {/* Shipping Rates */}
              {!labelGenerated && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Shipping Rates</h3>
                    <button 
                      onClick={fetchRates}
                      disabled={isLoadingRates}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {isLoadingRates && <Loader2 className="w-3 h-3 animate-spin" />}
                      Refresh
                    </button>
                  </div>

                  {isLoadingRates ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FFCC00]" />
                    </div>
                  ) : rates.length > 0 ? (
                    <div className="space-y-2">
                      {rates.slice(0, 5).map((rate) => (
                        <label
                          key={rate.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedRate === rate.id
                              ? 'border-[#FFCC00] bg-yellow-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping_rate"
                              value={rate.id}
                              checked={selectedRate === rate.id}
                              onChange={() => setSelectedRate(rate.id)}
                              className="w-4 h-4 text-[#FFCC00] border-gray-300 focus:ring-[#FFCC00]"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {rate.carrier} {rate.service}
                              </p>
                              {rate.delivery_days && (
                                <p className="text-sm text-gray-500">
                                  {rate.delivery_days} business days
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-gray-900 font-medium">
                            <DollarSign className="w-4 h-4" />
                            {formatRate(rate.rate)}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No rates available</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Make sure EasyPost is configured in Settings
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Requested By */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Requested by {mockRequest.requested_by}</span>
                <span className="text-gray-400">•</span>
                <Clock className="w-4 h-4" />
                <span>{new Date(mockRequest.requested_at).toLocaleString()}</span>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="border border-gray-200 rounded-lg p-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full resize-none outline-none text-gray-700"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isStaffOnly}
                      onChange={(e) => setIsStaffOnly(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Staff only
                  </label>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              {mockNotes.length > 0 ? (
                mockNotes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{note.user}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.text}</p>
                    {note.isStaffOnly && (
                      <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Staff only
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notes yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {labelGenerated && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Shipping label generated</p>
                    <p className="text-sm text-gray-500">
                      Tracking: {trackingNumber}
                    </p>
                  </div>
                </div>
              )}
              {mockEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {event.type === 'created' && <Send className="w-4 h-4 text-gray-500" />}
                    {event.type === 'viewed' && <User className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{event.message}</p>
                    <p className="text-sm text-gray-500">
                      by {event.user} • {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!labelGenerated && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button
              onClick={handleForward}
              disabled={isProcessing || !selectedRate || rates.length === 0}
              className="w-full py-3 bg-[#10B981] text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Label...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {selectedRate 
                    ? `Forward Mail (${formatRate(rates.find(r => r.id === selectedRate)?.rate || '0')})`
                    : 'Select a Shipping Rate'
                  }
                </>
              )}
            </button>
            {!selectedRate && rates.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Select a shipping rate above to continue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

