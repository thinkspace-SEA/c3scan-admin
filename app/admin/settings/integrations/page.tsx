"use client";

import { useState } from "react";

export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState({
    stripe: { enabled: false, accountId: "", publicKey: "", secretKey: "" },
    easypost: { enabled: false, apiKey: "" },
    officernd: { enabled: false, org: "", clientId: "", clientSecret: "" },
  });

  return (
    <div className="space-y-6">
      {[
        { id: "stripe", name: "Stripe", description: "Payment processing and billing" },
        { id: "easypost", name: "EasyPost", description: "Shipping labels and tracking" },
        { id: "officernd", name: "OfficeRnD", description: "Coworking space management" },
      ].map((integration) => (
        <div key={integration.id} className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFCC00]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-500">Configure {integration.name} integration settings here.</p>
          </div>
        </div>
      ))}
    </div>
  );
}
