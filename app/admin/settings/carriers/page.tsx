"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function CarriersSettingsPage() {
  const [carriers, setCarriers] = useState({
    usps: true,
    ups: true,
    fedex: true,
  });

  const handleSave = () => {
    console.log("Saving carriers:", carriers);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Carriers</h2>
        <p className="text-sm text-gray-600 mt-1">Select which carriers are available for forwarding</p>
      </div>
      
      <div className="p-6 space-y-4">
        {[
          { id: "usps", label: "USPS", description: "United States Postal Service" },
          { id: "ups", label: "UPS", description: "United Parcel Service" },
          { id: "fedex", label: "FedEx", description: "Federal Express" },
        ].map((carrier) => (
          <label
            key={carrier.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#FFCC00] transition-colors"
          >
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={carriers[carrier.id as keyof typeof carriers]}
                onChange={(e) => setCarriers({ ...carriers, [carrier.id]: e.target.checked })}
                className="w-5 h-5 rounded text-[#FFCC00] focus:ring-[#FFCC00]"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{carrier.label}</p>
              <p className="text-sm text-gray-600">{carrier.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
        <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
