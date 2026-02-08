'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Hash, Clock, Loader2, Check, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface GeneralSettings {
  support_email: string
  support_phone: string
  pmb_format: 'sequential' | 'alphanumeric'
  pickup_hours: {
    monday: { enabled: boolean; start: string; end: string }
    tuesday: { enabled: boolean; start: string; end: string }
    wednesday: { enabled: boolean; start: string; end: string }
    thursday: { enabled: boolean; start: string; end: string }
    friday: { enabled: boolean; start: string; end: string }
    saturday: { enabled: boolean; start: string; end: string }
    sunday: { enabled: boolean; start: string; end: string }
  }
}

const defaultSettings: GeneralSettings = {
  support_email: '',
  support_phone: '',
  pmb_format: 'sequential',
  pickup_hours: {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  }
}

const weekDays = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call when settings table exists
      // For now, simulate API delay and use defaults
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock: Try to fetch from localStorage for persistence during dev
      const saved = localStorage.getItem('c3scan_settings_general')
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setSaveStatus('idle')
      setError(null)
      
      // TODO: Replace with actual API call when settings table exists
      // await api.updateGeneralSettings(settings)
      
      // Mock: Save to localStorage for persistence during dev
      await new Promise(resolve => setTimeout(resolve, 800))
      localStorage.setItem('c3scan_settings_general', JSON.stringify(settings))
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  function updatePickupHours(
    day: keyof GeneralSettings['pickup_hours'],
    field: 'enabled' | 'start' | 'end',
    value: boolean | string
  ) {
    setSettings(prev => ({
      ...prev,
      pickup_hours: {
        ...prev.pickup_hours,
        [day]: {
          ...prev.pickup_hours[day],
          [field]: value
        }
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-500 mt-1">Configure basic operator settings and pickup hours</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Support Contact Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Support Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, support_email: e.target.value }))}
                  placeholder="support@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Shown to customers in the portal</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Support Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={settings.support_phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, support_phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Optional contact number</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* PMB Format Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            PMB Format
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="pmb_format"
                value="sequential"
                checked={settings.pmb_format === 'sequential'}
                onChange={(e) => setSettings(prev => ({ ...prev, pmb_format: e.target.value as 'sequential' | 'alphanumeric' }))}
                className="w-4 h-4 text-[#FFCC00] border-gray-300 focus:ring-[#FFCC00]"
              />
              <div>
                <p className="font-medium text-gray-900">Sequential</p>
                <p className="text-sm text-gray-500">Auto-incrementing numbers (1001, 1002, 1003...)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="pmb_format"
                value="alphanumeric"
                checked={settings.pmb_format === 'alphanumeric'}
                onChange={(e) => setSettings(prev => ({ ...prev, pmb_format: e.target.value as 'sequential' | 'alphanumeric' }))}
                className="w-4 h-4 text-[#FFCC00] border-gray-300 focus:ring-[#FFCC00]"
              />
              <div>
                <p className="font-medium text-gray-900">Alphanumeric</p>
                <p className="text-sm text-gray-500">Custom codes allowed (A101, B202, etc.)</p>
              </div>
            </label>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Pickup Hours Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Scheduled Pickup Hours
          </h2>
          <p className="text-sm text-gray-500 mb-4">Set when customers can pick up mail from your location</p>
          
          <div className="space-y-3">
            {weekDays.map(({ key, label }) => (
              <div 
                key={key} 
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  settings.pickup_hours[key].enabled 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <label className="flex items-center gap-3 min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={settings.pickup_hours[key].enabled}
                    onChange={(e) => updatePickupHours(key, 'enabled', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FFCC00] focus:ring-[#FFCC00]"
                  />
                  <span className={`font-medium ${
                    settings.pickup_hours[key].enabled ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={settings.pickup_hours[key].start}
                    onChange={(e) => updatePickupHours(key, 'start', e.target.value)}
                    disabled={!settings.pickup_hours[key].enabled}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={settings.pickup_hours[key].end}
                    onChange={(e) => updatePickupHours(key, 'end', e.target.value)}
                    disabled={!settings.pickup_hours[key].enabled}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Changes are saved to your browser for now
        </p>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <Check className="w-4 h-4" />
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
