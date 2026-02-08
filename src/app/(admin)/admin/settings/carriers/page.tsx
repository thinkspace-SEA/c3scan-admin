'use client'

import { useState } from 'react'
import { Truck, Package } from 'lucide-react'

interface Carrier {
  id: string
  name: string
  enabled: boolean
  icon: React.ReactNode
}

export default function CarriersSettingsPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([
    { id: 'usps', name: 'USPS', enabled: true, icon: <Truck className="w-5 h-5" /> },
    { id: 'ups', name: 'UPS', enabled: true, icon: <Package className="w-5 h-5" /> },
    { id: 'fedex', name: 'FedEx', enabled: true, icon: <Package className="w-5 h-5" /> },
  ])
  const [saving, setSaving] = useState(false)

  function toggleCarrier(id: string) {
    setCarriers(prev => prev.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ))
  }

  async function handleSave() {
    setSaving(true)
    // TODO: Save to API
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Carriers</h1>
        <p className="text-gray-500 mt-1">Enable or disable shipping carriers for forwarding</p>
      </div>

      <div className="space-y-3 mb-8">
        {carriers.map((carrier) => (
          <label 
            key={carrier.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                {carrier.icon}
              </div>
              <span className="font-medium text-gray-900">{carrier.name}</span>
            </div>
            <input
              type="checkbox"
              checked={carrier.enabled}
              onChange={() => toggleCarrier(carrier.id)}
              className="w-5 h-5 rounded border-gray-300 text-[#FFCC00] focus:ring-[#FFCC00]"
            />
          </label>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Apply Changes'}
        </button>
      </div>
    </div>
  )
}
