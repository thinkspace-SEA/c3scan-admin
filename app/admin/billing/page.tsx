"use client";

import { useState } from "react";
import { CreditCard, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: "paid" | "open" | "overdue";
  dueDate: string;
  mailboxCount: number;
}

const mockInvoices: Invoice[] = [
  { id: "INV-2026-001", period: "January 2026", amount: 2450.00, status: "paid", dueDate: "2026-02-01", mailboxCount: 45 },
  { id: "INV-2026-002", period: "February 2026", amount: 2675.00, status: "open", dueDate: "2026-03-01", mailboxCount: 48 },
  { id: "INV-2025-012", period: "December 2025", amount: 2400.00, status: "paid", dueDate: "2026-01-01", mailboxCount: 44 },
  { id: "INV-2025-011", period: "November 2025", amount: 2350.00, status: "paid", dueDate: "2025-12-01", mailboxCount: 43 },
];

const paymentMethods = [
  { id: "pm1", brand: "Visa", last4: "4242", expMonth: 12, expYear: 2027, isDefault: true },
  { id: "pm2", brand: "Mastercard", last4: "8888", expMonth: 8, expYear: 2026, isDefault: false },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "invoices">("overview");

  const totalDue = mockInvoices
    .filter(i => i.status === "open" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    open: "bg-blue-100 text-blue-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">Manage payment methods and view invoices</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "invoices", label: "Invoices" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#FFCC00] text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Amount Due</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">${totalDue.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">Next invoice due March 1, 2026</p>
              </div>
              {totalDue > 0 && (
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Payment Methods</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {pm.brand} •••• {pm.last4}
                        {pm.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Default</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Expires {pm.expMonth}/{pm.expYear}</p>
                    </div>
                  </div>
                  <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
              <button 
                onClick={() => setActiveTab("invoices")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {mockInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{invoice.period}</p>
                      <p className="text-sm text-gray-500">{invoice.mailboxCount} mailboxes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Download size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mailboxes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.mailboxCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${invoice.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{mockInvoices.length}</span> of <span className="font-medium">{mockInvoices.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="px-3 py-1 bg-[#FFCC00] text-gray-900 rounded-lg font-medium">1</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50" disabled>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
