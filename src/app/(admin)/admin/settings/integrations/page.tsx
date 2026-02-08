'use client'

import { useState } from 'react'
import { CreditCard, Truck, Building, Briefcase, ChevronRight, Check } from 'lucide-react'

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
        <div className="max-w-lg">
          <button
            onClick={() => setSelectedIntegration(null)}
            className="text-sm text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to integrations
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                {selectedIntegration.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedIntegration.name}</h2>
                <p className="text-sm text-gray-500">{selectedIntegration.description}</p>
              </div>
            </div>

            {/* Stripe Configuration */}
            {selectedIntegration.id === 'stripe' && (
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
            {selectedIntegration.id === 'easypost' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder="EZ..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  />
                </div>
              </div>
            )}

            {/* OfficeRnD/Deskworks Placeholder */}
            {(selectedIntegration.id === 'officernd' || selectedIntegration.id === 'deskworks') && (
              <div className="text-center py-8">
                <p className="text-gray-500">Configuration coming soon</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors">
                {selectedIntegration.connected ? 'Update' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
