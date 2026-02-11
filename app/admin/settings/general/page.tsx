"use client";

import { useState } from "react";

export default function GeneralSettingsPage() {
  const [formData, setFormData] = useState({
    supportEmail: "support@thinkspace.com",
    supportPhone: "(206) 555-0100",
    pmbFormat: "sequential",
  });

  const [pickupHours, setPickupHours] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "10:00", end: "14:00" },
    sunday: { enabled: false, start: "10:00", end: "14:00" },
  });

  const handleSave = () => {
    console.log("Saving settings:", { formData, pickupHours });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">General Settings</h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input
                type="tel"
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
              />
            </div>
          </div>
        </div>

        {/* PMB Format */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">PMB Format</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pmbFormat"
                value="sequential"
                checked={formData.pmbFormat === "sequential"}
                onChange={(e) => setFormData({ ...formData, pmbFormat: e.target.value })}
                className="text-[#FFCC00] focus:ring-[#FFCC00]"
              />
              <span className="text-sm text-gray-700">Sequential (001, 002, 003...)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pmbFormat"
                value="alphanumeric"
                checked={formData.pmbFormat === "alphanumeric"}
                onChange={(e) => setFormData({ ...formData, pmbFormat: e.target.value })}
                className="text-[#FFCC00] focus:ring-[#FFCC00]"
              />
              <span className="text-sm text-gray-700">Alphanumeric (A1, B2, C3...)</span>
            </label>
          </div>
        </div>

        {/* Pickup Hours */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Scheduled Pickup Hours</h3>
          <div className="space-y-2">
            {Object.entries(pickupHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <label className="flex items-center gap-2 w-28">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => setPickupHours({
                      ...pickupHours,
                      [day]: { ...hours, enabled: e.target.checked }
                    })}
                    className="rounded text-[#FFCC00] focus:ring-[#FFCC00]"
                  />
                  <span className="text-sm text-gray-700 capitalize">{day}</span>
                </label>
                {hours.enabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => setPickupHours({
                        ...pickupHours,
                        [day]: { ...hours, start: e.target.value }
                      })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => setPickupHours({
                        ...pickupHours,
                        [day]: { ...hours, end: e.target.value }
                      })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
          Save Changes
        </button>
      </div>
    </div>
  );
}
