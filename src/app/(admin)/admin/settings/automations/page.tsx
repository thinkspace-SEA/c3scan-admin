'use client'

import { useState } from 'react'
import { Zap, Calendar } from 'lucide-react'

interface Automation {
  id: string
  name: string
  description: string
  enabled: boolean
}

export default function AutomationsSettingsPage() {
  const [automations, setAutomations] = useState<Automation[]>([
    { 
      id: 'auto_open_scan', 
      name: 'Auto Open and Scan', 
      description: 'Automatically open and scan mail for premium customers',
      enabled: false 
    },
    { 
      id: 'auto_leave_office', 
      name: 'Auto Leave at Office', 
      description: 'Mark mail as "leave at office" after 30 days',
      enabled: false 
    },
    { 
      id: 'auto_recurrent_forward', 
      name: 'Auto Recurrent Forward', 
      description: 'Forward accumulated mail on a schedule',
      enabled: true 
    },
  ])

  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [saving, setSaving] = useState(false)

  function toggleAutomation(id: string) {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Automations</h1>
        <p className="text-gray-500 mt-1">Configure automatic mail processing rules</p>
      </div>

      <div className="space-y-6 mb-8">
        {automations.map((automation) => (
          <div 
            key={automation.id}
            className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-[#FFCC00]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{automation.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{automation.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automation.enabled}
                onChange={() => toggleAutomation(automation.id)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Frequency Setting */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Recurrent Forward Frequency
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(['weekly', 'biweekly', 'monthly'] as const).map((option) => (
            <label
              key={option}
              className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                frequency === option 
                  ? 'border-[#FFCC00] bg-yellow-50' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option}
                checked={frequency === option}
                onChange={(e) => setFrequency(e.target.value as typeof frequency)}
                className="sr-only"
              />
              <span className="font-medium text-gray-900 capitalize">{option}</span>
            </label>
          ))}
        </div>
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
