'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

export default function BrandSettingsPage() {
  const [brandColor, setBrandColor] = useState('#FFCC00')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    // TODO: Save to API
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Brand</h1>
        <p className="text-gray-500 mt-1">Customize your portal appearance</p>
      </div>

      <div className="space-y-8">
        {/* Brand Color */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Brand Color
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-16 h-16 rounded-lg cursor-pointer border-0 p-0"
            />
            <div>
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm uppercase w-28"
              />
              <p className="text-xs text-gray-500 mt-1">Used for buttons, active states, and highlights</p>
            </div>
          </div>
        </section>

        {/* Logo Upload */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Logo
          </h2>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FFCC00] transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Upload your logo</p>
            <p className="text-xs text-gray-500">PNG or SVG, max 2MB</p>
          </div>
        </section>

        {/* Preview */}
        <section>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Preview
          </h2>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black"
                  style={{ backgroundColor: brandColor }}
                >
                  C3
                </div>
                <span className="font-semibold text-gray-900">C3Scan Portal</span>
              </div>
            </div>
          </div>
        </section>
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
