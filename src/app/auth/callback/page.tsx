'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.search)
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
      } else {
        router.push('/admin')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCC00] mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
