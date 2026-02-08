'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Truck, Building, Briefcase, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react'
import { validateEasyPostApiKey } from '@/lib/easypost-actions'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  category: 'payment' | 'shipping' | 'workspace'
}

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage billing',
      icon: <CreditCard className="w-6 h-6" />,
      connected: true,
      category: 'payment'
    },
    {
      id: 'easypost',
      name: 'EasyPost',
      description: 'Generate shipping labels and track packages',
      icon: <Truck className="w-6 h-6" />,
      connected: false,
      category: 'shipping'
    },
    {
      id: 'officernd',
      name: 'OfficeRnD',
      description: 'Sync with coworking space management',
      icon: <Building className="w-6 h-6" />,
      connected: false,
      category: 'workspace'
    },
    {
      id: 'deskworks',
      name: 'Deskworks',
      description: 'Connect to Deskworks coworking platform',
      icon: <Briefcase className="w-6 h-6" />,
      connected: false,
      category: 'workspace'
    },
  ])

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">Connect third-party services</p>
      </div>

      {!selectedIntegration ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => setSelectedIntegration(integration)}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#FFCC00] hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                {integration.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  {integration.connected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <IntegrationConfig 
          integration={selectedIntegration} 
          onBack={() => setSelectedIntegration(null)}
          onUpdate={(connected) => {
            setIntegrations(prev => prev.map(i => 
              i.id === selectedIntegration.id ? { ...i, connected } : i
            ))
          }}
        />
      )}
    </div>
  )
}

// Separate component for integration configuration
function IntegrationConfig({ 
  integration, 
  onBack,
  onUpdate 
}: { 
  integration: Integration
  onBack: () => void
  onUpdate: (connected: boolean) => void
}) {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Load existing config on mount
  useEffect(() => {
    // TODO: Fetch existing config from API
  }, [integration.id])

  async function handleValidate() {
    if (!apiKey.trim()) return
    
    setIsValidating(true)
    setValidationStatus('idle')
    setError(null)

    try {
      const isValid = await validateEasyPostApiKey(apiKey)
      setValidationStatus(isValid ? 'valid' : 'invalid')
      if (!isValid) {
        setError('Invalid API key. Please check and try again.')
      }
    } catch (err) {
      setValidationStatus('invalid')
      setError(err instanceof Error ? err.message : 'Failed to validate API key')
    } finally {
      setIsValidating(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)

    try {
      // TODO: Save to integration_config table
      await new Promise(resolve => setTimeout(resolve, 500))
      onUpdate(true)
      onBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to integrations
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {integration.icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{integration.name}</h2>
            <p className="text-sm text-gray-500">{integration.description}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stripe Configuration */}
        {integration.id === 'stripe' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account ID
              </label>
              <input
                type="text"
                placeholder="acct_..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Public Key
              </label>
              <input
                type="text"
                placeholder="pk_..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Secret Key
              </label>
              <input
                type="password"
                placeholder="sk_..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
            <label className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#FFCC00] focus:ring-[#FFCC00]"
              />
              <span className="text-sm text-gray-700">Bill mailbox renters with Stripe</span>
            </label>
          </div>
        )}

        {/* EasyPost Configuration */}
        {integration.id === 'easypost' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setValidationStatus('idle')
                    setError(null)
                  }}
                  placeholder="EZ..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] pr-24 ${
                    validationStatus === 'valid' ? 'border-green-500 bg-green-50' :
                    validationStatus === 'invalid' ? 'border-red-500 bg-red-50' :
                    'border-gray-200'
                  }`}
                />
                <button
                  onClick={handleValidate}
                  disabled={!apiKey.trim() || isValidating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : validationStatus === 'valid' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Valid
                    </span>
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Your EasyPost API key from{' '}
                <a 
                  href="https://www.easypost.com/account/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  EasyPost Dashboard
                </a>
              </p>
            </div>

            {validationStatus === 'valid' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  API key is valid! You can now generate shipping labels.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Generate shipping labels for forward requests
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Track packages in real-time
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Compare rates across carriers (USPS, UPS, FedEx)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Print labels with tracking numbers
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* OfficeRnD/Deskworks Placeholder */}
        {(integration.id === 'officernd' || integration.id === 'deskworks') && (
          <div className="text-center py-8">
            <p className="text-gray-500">Configuration coming soon</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || (integration.id === 'easypost' && validationStatus !== 'valid')}
            className="px-4 py-2 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {integration.connected ? 'Update' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  )
}
