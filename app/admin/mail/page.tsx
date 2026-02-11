"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Upload,
  MoreHorizontal,
  Package,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MailItem {
  id: string;
  pmb: string;
  mailboxName: string;
  packageType: "correspondence" | "package";
  status: string;
  uploadedDate: string;
  carrier?: string;
}

const mockMail: MailItem[] = [
  { id: "M001", pmb: "101", mailboxName: "Design Studio LLC", packageType: "package", status: "uploaded", uploadedDate: "2026-02-08", carrier: "UPS" },
  { id: "M002", pmb: "205", mailboxName: "Tech Startup Inc", packageType: "correspondence", status: "open_scan_requested", uploadedDate: "2026-02-08", carrier: "USPS" },
  { id: "M003", pmb: "342", mailboxName: "Acme Corp", packageType: "package", status: "forward_requested", uploadedDate: "2026-02-07", carrier: "FedEx" },
  { id: "M004", pmb: "156", mailboxName: "John Smith", packageType: "correspondence", status: "uploaded", uploadedDate: "2026-02-07", carrier: "USPS" },
  { id: "M005", pmb: "089", mailboxName: "Sarah Johnson", packageType: "package", status: "pickup_requested", uploadedDate: "2026-02-06", carrier: "UPS" },
  { id: "M006", pmb: "234", mailboxName: "Legal Services Co", packageType: "correspondence", status: "shred_requested", uploadedDate: "2026-02-06" },
  { id: "M007", pmb: "167", mailboxName: "Consulting Group", packageType: "package", status: "uploaded", uploadedDate: "2026-02-05", carrier: "Amazon" },
  { id: "M008", pmb: "298", mailboxName: "Freelancer Pro", packageType: "correspondence", status: "deposited", uploadedDate: "2026-02-05" },
];

const statusColors: Record<string, string> = {
  uploaded: "bg-blue-100 text-blue-700",
  open_scan_requested: "bg-yellow-100 text-yellow-700",
  open_scan_completed: "bg-green-100 text-green-700",
  forward_requested: "bg-yellow-100 text-yellow-700",
  forward_shipped: "bg-green-100 text-green-700",
  pickup_requested: "bg-yellow-100 text-yellow-700",
  picked_up: "bg-green-100 text-green-700",
  shred_requested: "bg-yellow-100 text-yellow-700",
  disposed: "bg-gray-100 text-gray-700",
  deposited: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  uploaded: "Uploaded",
  open_scan_requested: "Open & Scan Requested",
  open_scan_completed: "Open & Scan Completed",
  forward_requested: "Forward Requested",
  forward_shipped: "Forward Shipped",
  pickup_requested: "Pickup Requested",
  picked_up: "Picked Up",
  shred_requested: "Shred Requested",
  disposed: "Disposed",
  deposited: "Deposited",
};

export default function MailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMail = mockMail.filter((item) => {
    const matchesSearch = 
      item.pmb.includes(searchQuery) ||
      item.mailboxName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.packageType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mail</h1>
          <p className="text-gray-600 mt-1">Manage incoming mail and packages</p>
        </div>
        <Link
          href="/admin/mail/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Upload size={18} />
          Upload Mail
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by PMB, mailbox, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
        >
          <option value="all">All Statuses</option>
          <option value="uploaded">Uploaded</option>
          <option value="open_scan_requested">Open & Scan Requested</option>
          <option value="forward_requested">Forward Requested</option>
          <option value="pickup_requested">Pickup Requested</option>
          <option value="shred_requested">Shred Requested</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
        >
          <option value="all">All Types</option>
          <option value="correspondence">Correspondence</option>
          <option value="package">Package</option>
        </select>
      </div>

      {/* Mail Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PMB</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mailbox</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMail.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.pmb}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.mailboxName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    {item.packageType === "package" ? <Package size={14} /> : <Mail size={14} />}
                    {item.packageType === "package" ? "Package" : "Correspondence"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.carrier || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.uploadedDate}</td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <MoreHorizontal size={18} className="text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredMail.length}</span> of <span className="font-medium">{filteredMail.length}</span> results
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
    </div>
  );
}
