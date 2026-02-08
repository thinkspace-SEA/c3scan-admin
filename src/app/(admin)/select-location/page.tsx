'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/providers/tenant-provider'
import { MapPin, Loader2, AlertCircle, Building2 } from 'lucide-react'

export default function SelectLocationPage() {
  const router = useRouter()
  const { 
    selectedOperator,
    locations, 
    selectedLocation, 
    setSelectedLocation, 
    isLoadingLocations, 
    error 
  } = useTenant()

  // Redirect if no operator selected
  useEffect(() => {
    if (!selectedOperator) {
      router.push('/admin/select-account')
    }
  }, [selectedOperator, router])

  // Auto-redirect if location already selected
  useEffect(() => {
    if (!isLoadingLocations && selectedLocation) {
      router.push('/admin')
    }
  }, [selectedLocation, isLoadingLocations, router])

  // Auto-select if only one location
  useEffect(() => {
    if (!isLoadingLocations && locations.length === 1) {
      setSelectedLocation(locations[0])
      router.push('/admin')
    }
  }, [locations, isLoadingLocations, setSelectedLocation, router])

  function handleSelectLocation(location: typeof locations[0]) {
    setSelectedLocation(location)
    router.push('/admin')
  }

  if (isLoadingLocations) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00] mx-auto mb-4" />
          <p className="text-gray-600">Loading locations...</p>
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Locations</h1>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Location</h1>
          <p className="text-gray-500">
            Choose a location to work with for{' '}
            <span className="font-medium text-gray-700">{selectedOperator?.operator_name}</span>
          </p>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <button
              key={location.location_id}
              onClick={() => handleSelectLocation(location)}
              className="flex flex-col items-start p-6 border border-gray-200 rounded-xl hover:border-[#FFCC00] hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-50 transition-colors">
                <Building2 className="w-6 h-6 text-gray-500 group-hover:text-[#FFCC00] transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {location.location_name}
              </h3>
              {(location.city || location.state) && (
                <p className="text-sm text-gray-500">
                  {location.city}{location.city && location.state && ', '}{location.state}
                </p>
              )}
              {location.address_line1 && (
                <p className="text-xs text-gray-400 mt-2">
                  {location.address_line1}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* No locations state */}
        {locations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              This operator doesn&apos;t have any active locations. Please contact your administrator.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => router.push('/admin/select-account')}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ← Switch to a different account
          </button>
        </div>
      </div>
    </div>
  )
}
