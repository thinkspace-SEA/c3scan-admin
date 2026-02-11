"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Scan,
  Trash2,
  Recycle,
  Truck,
  Package,
  Banknote,
  Home,
  Calendar,
  ChevronRight,
} from "lucide-react";

const requestTypes = [
  { type: "open_scan", label: "Open & Scan", icon: Scan, count: 5, color: "bg-blue-100 text-blue-700" },
  { type: "shred", label: "Shred", icon: Trash2, count: 2, color: "bg-red-100 text-red-700" },
  { type: "recycle", label: "Recycle", icon: Recycle, count: 1, color: "bg-green-100 text-green-700" },
  { type: "forward", label: "Forward", icon: Truck, count: 3, color: "bg-yellow-100 text-yellow-700" },
  { type: "pickup", label: "Pickup", icon: Package, count: 4, color: "bg-purple-100 text-purple-700" },
  { type: "deposit", label: "Deposit", icon: Banknote, count: 0, color: "bg-gray-100 text-gray-700" },
  { type: "leave", label: "Leave at Office", icon: Home, count: 1, color: "bg-gray-100 text-gray-700" },
  { type: "weekly", label: "Weekly Forward", icon: Calendar, count: 2, color: "bg-indigo-100 text-indigo-700" },
];

const pendingRequests = [
  { id: "REQ001", type: "Open & Scan", pmb: "205", mailbox: "Tech Startup Inc", requestedBy: "John Doe", date: "2026-02-08 09:15" },
  { id: "REQ002", type: "Forward", pmb: "342", mailbox: "Acme Corp", requestedBy: "Jane Smith", date: "2026-02-08 08:30" },
  { id: "REQ003", type: "Pickup", pmb: "089", mailbox: "Sarah Johnson", requestedBy: "Sarah Johnson", date: "2026-02-07 16:45" },
  { id: "REQ004", type: "Open & Scan", pmb: "156", mailbox: "Acme Corp", requestedBy: "Mike Brown", date: "2026-02-07 14:20" },
  { id: "REQ005", type: "Shred", pmb: "234", mailbox: "Legal Services Co", requestedBy: "Admin", date: "2026-02-07 11:00" },
];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Requests</h1>
          <p className="text-gray-600 mt-1">Manage customer requests and fulfillment</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "pending", label: "Pending" },
          { id: "completed", label: "Completed" },
          { id: "all", label: "All" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {activeTab === "dashboard" && (
        <>
          {/* Request Type Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {requestTypes.map((req) => {
              const Icon = req.icon;
              return (
                <Link
                  key={req.type}
                  href={`/admin/requests?type=${req.type}`}
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#FFCC00] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${req.color}`}>
                      <Icon size={20} />
                    </div>
                    {req.count > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-900 text-white text-xs font-semibold rounded-full">
                        {req.count}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-medium text-gray-900">{req.label}</p>
                  <p className="text-sm text-gray-500">{req.count} pending</p>
                </Link>
              );
            })}
          </div>

          {/* Recent Pending Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Pending Requests</h2>
              <Link href="/admin/requests/pending" className="text-sm text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{req.type}</span>
                      <span className="text-sm text-gray-500">• {req.id}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      PMB {req.pmb} - {req.mailbox}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{req.requestedBy}</p>
                    <p className="text-xs text-gray-500">{req.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "pending" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mailbox</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{req.type}</p>
                      <p className="text-xs text-gray-500">{req.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    PMB {req.pmb} - {req.mailbox}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.requestedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{req.date}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Process <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === "completed" || activeTab === "all") && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Inbox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {activeTab === "completed" ? "No completed requests" : "Select a filter"}
          </h3>
          <p className="mt-2 text-gray-600">
            {activeTab === "completed" 
              ? "Completed requests will appear here" 
              : "Use the dashboard to view requests by type"}
          </p>
        </div>
      )}
    </div>
  );
}
