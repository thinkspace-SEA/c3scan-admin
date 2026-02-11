'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Camera, FileImage, ChevronDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface UploadMailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Mailbox {
  mailbox_id: string
  pmb: string
  mailbox_name: string
}

const carriers = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other']

export function UploadMailModal({ isOpen, onClose, onSuccess }: UploadMailModalProps) {
  const [selectedMailbox, setSelectedMailbox] = useState('')
  const [packageType, setPackageType] = useState<'correspondence' | 'package'>('correspondence')
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
  const [internalNotes, setInternalNotes] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showMailboxDropdown, setShowMailboxDropdown] = useState(false)
  const [mailboxSearch, setMailboxSearch] = useState('')
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [loadingMailboxes, setLoadingMailboxes] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Fetch mailboxes from Supabase
  useEffect(() => {
    if (!isOpen) return
    
    async function fetchMailboxes() {
      setLoadingMailboxes(true)
      try {
        const { data, error } = await supabase
          .from('mailbox')
          .select('mailbox_id, pmb, mailbox_name')
          .eq('status', 'active')
          .order('pmb', { ascending: true })
        
        if (error) throw error
        setMailboxes(data || [])
      } catch (err) {
        console.error('Error fetching mailboxes:', err)
      } finally {
        setLoadingMailboxes(false)
      }
    }
    
    fetchMailboxes()
  }, [isOpen, supabase])

  if (!isOpen) return null

  const filteredMailboxes = mailboxes.filter(mb => 
    mb.pmb.includes(mailboxSearch) || 
    mb.mailbox_name.toLowerCase().includes(mailboxSearch.toLowerCase())
  )

  const selectedMailboxData = mailboxes.find(mb => mb.mailbox_id === selectedMailbox)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setImages(Array.from(e.dataTransfer.files))
    }
  }

  const handleSubmit = async () => {
    if (!selectedMailbox || images.length === 0) return
    
    setIsUploading(true)
    setUploadError(null)
    
    try {
      // Get current operator from session
      const { data: { session } } = await supabase.auth.getSession()
      const operatorId = session?.user?.user_metadata?.operator_id
      const locationId = session?.user?.user_metadata?.location_id
      const userEmail = session?.user?.email
      
      if (!operatorId) {
        throw new Error('No operator context found')
      }
      
      // 1. Get signed URL for image upload
      const imageFile = images[0] // Handle first image
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('mail-items')
        .createSignedUploadUrl(`${operatorId}/${Date.now()}_${imageFile.name}`)
      
      if (signedUrlError) throw signedUrlError
      
      // 2. Upload image to Supabase Storage
      const uploadResponse = await fetch(signedUrlData.signedUrl, {
        method: 'PUT',
        body: imageFile,
        headers: { 'Content-Type': imageFile.type }
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }
      
      // 3. Create mail_item record in staging
      const { error: insertError } = await supabase
        .from('mail_item_staging')
        .insert({
          payload_json: {
            operator_id: operatorId,
            location_id: locationId,
            mailbox_id: selectedMailbox,
            scanned_by_email: userEmail,
            envelope_image: signedUrlData.path,
            package_type: packageType,
            carrier: carrier || null,
            tracking_number: trackingNumber || null,
            scanned_at: new Date().toISOString(),
            ocr_raw_text: null, // Admin upload - no OCR
            ocr_confidence: null,
          },
          operator_id: operatorId,
          scanned_by_email: userEmail || 'admin',
          validation_status: 'pending',
        })
      
      if (insertError) throw insertError
      
      // Success
      onSuccess()
      onClose()
      
      // Reset form
      setSelectedMailbox('')
      setPackageType('correspondence')
      setCarrier('')
      setTrackingNumber('')
      setReceivedDate(new Date().toISOString().split('T')[0])
      setInternalNotes('')
      setImages([])
      
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const isValid = selectedMailbox && images.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Mail</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Mailbox Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mailbox <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowMailboxDropdown(!showMailboxDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent bg-white"
                >
                  <span className={selectedMailboxData ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedMailboxData 
                      ? `${selectedMailboxData.pmb} - ${selectedMailboxData.mailbox_name}` 
                      : 'Search by PMB or mailbox name...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {showMailboxDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={mailboxSearch}
                        onChange={(e) => setMailboxSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {loadingMailboxes ? (
                      <div className="p-4 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Loading mailboxes...
                      </div>
                    ) : filteredMailboxes.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No mailboxes found
                      </div>
                    ) : (
                      filteredMailboxes.map((mb) => (
                        <button
                          key={mb.mailbox_id}
                          onClick={() => {
                            setSelectedMailbox(mb.mailbox_id)
                            setShowMailboxDropdown(false)
                            setMailboxSearch('')
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <span className="font-medium text-gray-900">{mb.pmb}</span>
                          <span className="text-gray-500">{mb.mailbox_name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPackageType('correspondence')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    packageType === 'correspondence'
                      ? 'border-[#FFCC00] bg-[#FFF4BF] text-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileImage className="w-4 h-4" />
                  Correspondence
                </button>
                <button
                  onClick={() => setPackageType('package')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    packageType === 'package'
                      ? 'border-[#FFCC00] bg-[#FFF4BF] text-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Package
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FFCC00] hover:bg-[#FFF4BF] transition-colors cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  At least one image required (envelope front)
                </p>
              </div>
              
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      {img.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setImages(images.filter((_, i) => i !== idx))
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Carrier & Tracking */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
                >
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking #"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
                />
              </div>
            </div>

            {/* Received Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Date
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
              />
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add any internal notes about this mail item..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{uploadError}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isUploading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isValid && !isUploading
                ? 'bg-[#0F172A] text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Mail'}
          </button>
        </div>
      </div>
    </div>
  )
}
