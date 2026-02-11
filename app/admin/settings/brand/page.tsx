"use client";

import { useState } from "react";
import Image from "next/image";

export default function BrandSettingsPage() {
  const [brandColor, setBrandColor] = useState("#FFCC00");

  return (
    <div className="space-y-6">
      {/* Brand Colors */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Brand Colors</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Brand Logo</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <Image
                src="/logo.png"
                alt="Current logo"
                width={80}
                height={80}
                className="rounded"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-4">
                Upload your brand logo. This will be displayed in the customer portal and email notifications.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                  Upload New Logo
                </button>
                <button className="px-4 py-2 text-gray-700 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Remove
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">Recommended: 512x512px PNG or SVG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Preview */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Portal Preview</h2>
        </div>
        <div className="p-6">
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: brandColor + "20" }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: brandColor }}
                >
                  <span className="font-bold text-gray-900">C3</span>
                </div>
                <span className="font-semibold text-gray-900">c3scan</span>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-20 bg-gray-50 rounded mt-4"></div>
              </div>
              <button 
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-gray-900 w-full"
                style={{ backgroundColor: brandColor }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
