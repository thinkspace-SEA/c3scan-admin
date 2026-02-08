'use client'

import { loadStripe, type Stripe as StripeType } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useEffect, useState, createContext, useContext } from 'react'

interface StripeContextType {
  stripe: StripeType | null
  isLoading: boolean
}

const StripeContext = createContext<StripeContextType>({ stripe: null, isLoading: true })

export function useStripeContext() {
  return useContext(StripeContext)
}

interface StripeProviderProps {
  children: React.ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripe, setStripe] = useState<StripeType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initStripe() {
      try {
        // Stripe public key should be in env
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey) {
          console.warn('Stripe publishable key not configured')
          setIsLoading(false)
          return
        }

        const stripeInstance = await loadStripe(stripeKey)
        setStripe(stripeInstance)
      } catch (error) {
        console.error('Error loading Stripe:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initStripe()
  }, [])

  return (
    <StripeContext.Provider value={{ stripe, isLoading }}>
      {children}
    </StripeContext.Provider>
  )
}

// Wrapper component that provides Elements when stripe is ready
interface StripeElementsWrapperProps {
  children: React.ReactNode
  clientSecret: string
}

export function StripeElementsWrapper({ children, clientSecret }: StripeElementsWrapperProps) {
  const { stripe } = useStripeContext()

  if (!stripe) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCC00]"></div>
      </div>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#FFCC00',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  )
}
