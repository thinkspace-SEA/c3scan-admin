"use client";

import { Plus } from "lucide-react";

const plans = [
  { id: 1, name: "Basic", price: 25, currency: "USD", description: "Up to 10 pieces of mail per month" },
  { id: 2, name: "Business", price: 49, currency: "USD", description: "Up to 50 pieces of mail per month" },
  { id: 3, name: "Premium", price: 99, currency: "USD", description: "Unlimited mail, priority support" },
];

export default function OfferingsSettingsPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Offering Plans</h2>
          <p className="text-sm text-gray-600 mt-1">Define mailbox plans and pricing</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={16} />
          Add Plan
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {plans.map((plan) => (
          <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-900">{plan.name}</p>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${plan.price}/{plan.currency}</p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
