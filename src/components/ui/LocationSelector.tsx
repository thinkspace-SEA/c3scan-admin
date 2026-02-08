'use client'

import { useState } from 'react'
import { useTenant } from '@/providers/tenant-provider'
import { MapPin, ChevronDown, Check, Loader2, Building2 } from 'lucide-react'

export function LocationSelector() {
  const { 
    selectedOperator, 
    locations, 
    selectedLocation, 
    setSelectedLocation,
    isLoadingLocations 
  } = useTenant()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show if no operator selected or only one location
  if (!selectedOperator) return null
  if (locations.length <= 1 && !isLoadingLocations) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-700">
          {isLoadingLocations ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </span>
          ) : selectedLocation ? (
            selectedLocation.location_name
          ) : (
            'Select Location'
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Operator Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {selectedOperator.operator_name}
                </span>
              </div>
            </div>

            {/* Locations List */}
            <div className="max-h-64 overflow-y-auto py-1">
              {locations.map((location) => (
                <button
                  key={location.location_id}
                  onClick={() => {
                    setSelectedLocation(location)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                    selectedLocation?.location_id === location.location_id ? 'bg-yellow-50' : ''
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${
                      selectedLocation?.location_id === location.location_id 
                        ? 'text-gray-900' 
                        : 'text-gray-700'
                    }`}>
                      {location.location_name}
                    </p>
                    {location.city && location.state && (
                      <p className="text-xs text-gray-500">
                        {location.city}, {location.state}
                      </p>
                    )}
                  </div>
                  {selectedLocation?.location_id === location.location_id && (
                    <Check className="w-4 h-4 text-[#FFCC00]" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {locations.length} location{locations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
