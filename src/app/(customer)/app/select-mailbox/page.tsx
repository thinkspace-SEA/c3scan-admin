'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/providers/tenant-provider'
import { api, type Mailbox } from '@/lib/api'
import { useState, useCallback } from 'react'
import { Building2, Loader2, AlertCircle, Mail, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SelectMailboxPage() {
  const router = useRouter()
  const { selectedOperator } = useTenant()
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMailboxes = useCallback(async () => {
    if (!selectedOperator) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch mailboxes for this user
      const data = await api.getMailboxes({ status: 'active' })
      setMailboxes(data)
      
      // Auto-redirect if only one mailbox
      if (data.length === 1) {
        router.push(`/app/${data[0].mailbox_id}/mail`)
      }
    } catch (err) {
      console.error('Error fetching mailboxes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mailboxes')
    } finally {
      setLoading(false)
    }
  }, [selectedOperator, router])

  useEffect(() => {
    fetchMailboxes()
  }, [fetchMailboxes])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00] mx-auto mb-4" />
          <p className="text-gray-600">Loading your mailboxes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Mailboxes</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchMailboxes}
            className="px-4 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Mailbox</h1>
        <p className="text-gray-500">
          Select a mailbox to view your mail and manage your account
        </p>
      </div>

      {/* Mailbox Cards */}
      <div className="space-y-4">
        {mailboxes.map((mailbox) => (
          <Link
            key={mailbox.mailbox_id}
            href={`/app/${mailbox.mailbox_id}/mail`}
            className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-[#FFCC00] hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
              <Mail className="w-7 h-7 text-gray-500 group-hover:text-[#FFCC00] transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{mailbox.mailbox_name}</h3>
              <p className="text-gray-500">PMB {mailbox.pmb}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFCC00] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {mailboxes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mailboxes Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don&apos;t have access to any mailboxes yet. Please contact your administrator to get started.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need access to another mailbox?{' '}
          <button className="text-blue-600 hover:underline font-medium">
            Contact support
          </button>
        </p>
      </div>
    </div>
  )
}
