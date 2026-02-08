'use client'

import { useState } from 'react'
import { ShieldCheck, Signature } from 'lucide-react'

export default function ComplianceSettingsPage() {
  const [enabled, setEnabled] = useState(true)
  const [frequency, setFrequency] = useState<'never' | 'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [gracePeriod, setGracePeriod] = useState(30)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Compliance</h1>
        <p className="text-gray-500 mt-1">USPS Form 1583 compliance settings</p>
      </div>

      <div className="space-y-8">
        {/* Enable Compliance */}
        <section>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#FFCC00] focus:ring-[#FFCC00]"
            />
            <span className="font-medium text-gray-900">Enable compliance workflow</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Require customers to complete USPS Form 1583
          </p>
        </section>

        {enabled && (
          <>
            {/* Follow-up Frequency */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Follow-up Email Frequency
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['never', 'weekly', 'biweekly', 'monthly'] as const).map((option) => (
                  <label
                    key={option}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      frequency === option 
                        ? 'border-[#FFCC00] bg-yellow-50' 
                        : 'border-gray-200 hover:bg-gray-50'
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
            </section>

            {/* Grace Period */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Grace Period
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                  min={0}
                  max={365}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                />
                <span className="text-gray-700">days</span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Days allowed before a mailbox becomes non-compliant
              </p>
            </section>

            {/* Agent Signature */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Signature className="w-4 h-4" />
                Agent Signature
              </h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FFCC00] transition-colors cursor-pointer bg-gray-50">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Signature className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Capture signature</p>
                <p className="text-xs text-gray-500">Required for Form 1583 completion</p>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
