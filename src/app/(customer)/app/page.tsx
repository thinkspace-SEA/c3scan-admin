'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CustomerAppPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a selected mailbox in localStorage
    const savedMailbox = localStorage.getItem('c3scan_selected_mailbox')
    
    if (savedMailbox) {
      try {
        const mailbox = JSON.parse(savedMailbox)
        router.push(`/app/${mailbox.mailbox_id}/mail`)
      } catch {
        // Invalid saved mailbox, redirect to selection
        router.push('/app/select-mailbox')
      }
    } else {
      // No saved mailbox, go to selection
      router.push('/app/select-mailbox')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00] mx-auto mb-4" />
        <p className="text-gray-600">Loading your account...</p>
      </div>
    </div>
  )
}
