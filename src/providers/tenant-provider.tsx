'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, type Operator, type Location } from '@/lib/api'

interface TenantContextType {
  // Operators
  operators: Operator[]
  selectedOperator: Operator | null
  setSelectedOperator: (operator: Operator | null) => void
  
  // Locations
  locations: Location[]
  selectedLocation: Location | null
  setSelectedLocation: (location: Location | null) => void
  
  // Loading states
  isLoadingOperators: boolean
  isLoadingLocations: boolean
  
  // Errors
  error: string | null
  
  // Actions
  refreshOperators: () => Promise<void>
  refreshLocations: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

const STORAGE_KEY_OPERATOR = 'c3scan_selected_operator'
const STORAGE_KEY_LOCATION = 'c3scan_selected_location'

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

interface TenantProviderProps {
  children: React.ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [operators, setOperators] = useState<Operator[]>([])
  const [selectedOperator, setSelectedOperatorState] = useState<Operator | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null)
  const [isLoadingOperators, setIsLoadingOperators] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedOperator = localStorage.getItem(STORAGE_KEY_OPERATOR)
    const savedLocation = localStorage.getItem(STORAGE_KEY_LOCATION)
    
    if (savedOperator) {
      try {
        setSelectedOperatorState(JSON.parse(savedOperator))
      } catch {
        localStorage.removeItem(STORAGE_KEY_OPERATOR)
      }
    }
    
    if (savedLocation) {
      try {
        setSelectedLocationState(JSON.parse(savedLocation))
      } catch {
        localStorage.removeItem(STORAGE_KEY_LOCATION)
      }
    }
  }, [])

  // Fetch operators on mount
  const refreshOperators = useCallback(async () => {
    try {
      setIsLoadingOperators(true)
      setError(null)
      
      const data = await api.getUserOperators()
      setOperators(data)
      
      // If only one operator, auto-select it
      if (data.length === 1 && !selectedOperator) {
        setSelectedOperator(data[0])
      }
    } catch (err) {
      console.error('Error fetching operators:', err)
      setError(err instanceof Error ? err.message : 'Failed to load operators')
    } finally {
      setIsLoadingOperators(false)
    }
  }, [selectedOperator])

  useEffect(() => {
    refreshOperators()
  }, [refreshOperators])

  // Fetch locations when operator changes
  const refreshLocations = useCallback(async () => {
    if (!selectedOperator) {
      setLocations([])
      setSelectedLocation(null)
      return
    }
    
    try {
      setIsLoadingLocations(true)
      setError(null)
      
      const data = await api.getOperatorLocations(selectedOperator.operator_id)
      setLocations(data)
      
      // If only one location, auto-select it
      if (data.length === 1) {
        setSelectedLocation(data[0])
      } else if (selectedLocation && selectedLocation.operator_id !== selectedOperator.operator_id) {
        // Clear location if it doesn't belong to selected operator
        setSelectedLocation(null)
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load locations')
    } finally {
      setIsLoadingLocations(false)
    }
  }, [selectedOperator, selectedLocation])

  useEffect(() => {
    refreshLocations()
  }, [refreshLocations])

  // Wrapper functions to persist to localStorage
  const setSelectedOperator = useCallback((operator: Operator | null) => {
    setSelectedOperatorState(operator)
    if (operator) {
      localStorage.setItem(STORAGE_KEY_OPERATOR, JSON.stringify(operator))
    } else {
      localStorage.removeItem(STORAGE_KEY_OPERATOR)
    }
  }, [])

  const setSelectedLocation = useCallback((location: Location | null) => {
    setSelectedLocationState(location)
    if (location) {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location))
    } else {
      localStorage.removeItem(STORAGE_KEY_LOCATION)
    }
  }, [])

  return (
    <TenantContext.Provider
      value={{
        operators,
        selectedOperator,
        setSelectedOperator,
        locations,
        selectedLocation,
        setSelectedLocation,
        isLoadingOperators,
        isLoadingLocations,
        error,
        refreshOperators,
        refreshLocations,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}
