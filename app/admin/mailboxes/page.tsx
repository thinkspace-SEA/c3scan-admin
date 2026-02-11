"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Download,
  Upload,
  FileCheck,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Mailbox {
  id: string;
  pmb: string;
  name: string;
  status: "active" | "cancelled";
  compliance: "compliant" | "pending" | "non_compliant";
  createdOn: string;
  plan: string;
}

const mockMailboxes: Mailbox[] = [
  { id: "MB001", pmb: "101", name: "Design Studio LLC", status: "active", compliance: "compliant", createdOn: "2024-01-15", plan: "Business" },
  { id: "MB002", pmb: "205", name: "Tech Startup Inc", status: "active", compliance: "compliant", createdOn: "2024-02-20", plan: "Premium" },
  { id: "MB003", pmb: "342", name: "Acme Corp", status: "active", compliance: "pending", createdOn: "2024-03-10", plan: "Business" },
  { id: "MB004", pmb: "156", name: "John Smith", status: "active", compliance: "compliant", createdOn: "2024-04-05", plan: "Basic" },
  { id: "MB005", pmb: "089", name: "Sarah Johnson", status: "active", compliance: "non_compliant", createdOn: "2024-05-12", plan: "Basic" },
  { id: "MB006", pmb: "234", name: "Legal Services Co", status: "cancelled", compliance: "compliant", createdOn: "2023-08-01", plan: "Premium" },
  { id: "MB007", pmb: "167", name: "Consulting Group", status: "active", compliance: "compliant", createdOn: "2024-06-18", plan: "Business" },
  { id: "MB008", pmb: "298", name: "Freelancer Pro", status: "active", compliance: "pending", createdOn: "2024-07-22", plan: "Basic" },
];

export default function MailboxesPage() {
  const [activeTab, setActiveTab] = useState<"active" | "cancelled" | "all">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMailboxes = mockMailboxes.filter((mb) => {
    const matchesTab = activeTab === "all" || mb.status === activeTab;
    const matchesSearch = 
      mb.pmb.includes(searchQuery) ||
      mb.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const complianceIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle size={16} className="text-green-600" />;
      case "pending":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "non_compliant":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const complianceLabel = (status: string) => {
    switch (status) {
      case "compliant":
        return "Compliant";
      case "pending":
        return "Pending";
      case "non_compliant":
        return "Non-compliant";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mailboxes</h1>
          <p className="text-gray-600 mt-1">Manage customer mailboxes and PMBs</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={18} />
            New Mailbox
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "active", label: "Active", count: mockMailboxes.filter(m => m.status === "active").length },
          { id: "cancelled", label: "Cancelled", count: mockMailboxes.filter(m => m.status === "cancelled").length },
          { id: "all", label: "All", count: mockMailboxes.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-[#FFCC00] text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by PMB or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
            />
          </div>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Upload size={18} />
          Import
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FileCheck size={18} />
          Export CMRAs
        </button>
      </div>

      {/* Mailboxes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PMB</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMailboxes.map((mb) => (
              <tr key={mb.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{mb.pmb}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{mb.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{mb.plan}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {complianceIcon(mb.compliance)}
                    <span className="text-sm text-gray-600">{complianceLabel(mb.compliance)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{mb.createdOn}</td>
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
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredMailboxes.length}</span> of <span className="font-medium">{filteredMailboxes.length}</span> results
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
