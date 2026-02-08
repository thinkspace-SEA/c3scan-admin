'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/providers/tenant-provider'
import { Building2, Loader2, AlertCircle } from 'lucide-react'

export default function SelectAccountPage() {
  const router = useRouter()
  const { 
    operators, 
    selectedOperator, 
    setSelectedOperator, 
    isLoadingOperators, 
    error 
  } = useTenant()

  // Auto-redirect if only one operator or already selected
  useEffect(() => {
    if (!isLoadingOperators && operators.length === 1) {
      setSelectedOperator(operators[0])
      router.push('/admin')
    } else if (!isLoadingOperators && selectedOperator) {
      router.push('/admin')
    }
  }, [operators, selectedOperator, isLoadingOperators, setSelectedOperator, router])

  function handleSelectOperator(operator: typeof operators[0]) {
    setSelectedOperator(operator)
    router.push('/admin')
  }

  if (isLoadingOperators) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00] mx-auto mb-4" />
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Accounts</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-black text-xl">C3</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Account</h1>
          <p className="text-gray-500">
            Select an operator account to continue
          </p>
        </div>

        {/* Account List */}
        <div className="space-y-3">
          {operators.map((operator) => (
            <button
              key={operator.operator_id}
              onClick={() => handleSelectOperator(operator)}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#FFCC00] hover:shadow-sm transition-all text-left group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                <Building2 className="w-6 h-6 text-gray-500 group-hover:text-[#FFCC00] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{operator.operator_name}</p>
                <p className="text-sm text-gray-500">
                  {operator.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-[#FFCC00] transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* No accounts state */}
        {operators.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Found</h3>
            <p className="text-gray-500 text-sm">
              You don&apos;t have access to any operator accounts. Please contact your administrator.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need access to a different account?{' '}
            <button className="text-blue-600 hover:underline font-medium">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
