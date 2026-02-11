"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle, AlertCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface ComplianceCase {
  id: string;
  pmb: string;
  mailboxName: string;
  status: "compliant" | "pending" | "non_compliant" | "under_review";
  graceDeadline: string;
  rentersCount: number;
  documentsUploaded: number;
  documentsRequired: number;
}

const mockCompliance: ComplianceCase[] = [
  { id: "C001", pmb: "101", mailboxName: "Design Studio LLC", status: "compliant", graceDeadline: "N/A", rentersCount: 2, documentsUploaded: 4, documentsRequired: 4 },
  { id: "C002", pmb: "205", mailboxName: "Tech Startup Inc", status: "compliant", graceDeadline: "N/A", rentersCount: 3, documentsUploaded: 6, documentsRequired: 6 },
  { id: "C003", pmb: "342", mailboxName: "Acme Corp", status: "pending", graceDeadline: "2026-03-15", rentersCount: 1, documentsUploaded: 2, documentsRequired: 4 },
  { id: "C004", pmb: "156", mailboxName: "John Smith", status: "compliant", graceDeadline: "N/A", rentersCount: 1, documentsUploaded: 2, documentsRequired: 2 },
  { id: "C005", pmb: "089", mailboxName: "Sarah Johnson", status: "non_compliant", graceDeadline: "2026-02-01", rentersCount: 1, documentsUploaded: 0, documentsRequired: 2 },
  { id: "C006", pmb: "298", mailboxName: "Freelancer Pro", status: "under_review", graceDeadline: "2026-02-28", rentersCount: 1, documentsUploaded: 2, documentsRequired: 2 },
  { id: "C007", pmb: "167", mailboxName: "Consulting Group", status: "compliant", graceDeadline: "N/A", rentersCount: 2, documentsUploaded: 4, documentsRequired: 4 },
];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<"all" | "compliant" | "non_compliant">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = mockCompliance.filter((c) => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const matchesSearch = 
      c.pmb.includes(searchQuery) ||
      c.mailboxName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusConfig = {
    compliant: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Compliant" },
    pending: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pending" },
    non_compliant: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Non-compliant" },
    under_review: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-100", label: "Under Review" },
  };

  const stats = {
    compliant: mockCompliance.filter(c => c.status === "compliant").length,
    nonCompliant: mockCompliance.filter(c => c.status === "non_compliant" || c.status === "pending").length,
    underReview: mockCompliance.filter(c => c.status === "under_review").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Compliance</h1>
        <p className="text-gray-600 mt-1">USPS Form 1583 compliance management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Compliant</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{stats.compliant}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Non-compliant</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{stats.nonCompliant}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">Under Review</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.underReview}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "all", label: "All", count: mockCompliance.length },
          { id: "compliant", label: "Compliant", count: stats.compliant },
          { id: "non_compliant", label: "Non-compliant", count: stats.nonCompliant },
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

      {/* Search */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by PMB or mailbox name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PMB</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mailbox</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grace Deadline</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Renters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCases.map((c) => {
              const config = statusConfig[c.status];
              const Icon = config.icon;
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.pmb}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.mailboxName}</td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                      <Icon size={14} />
                      {config.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.graceDeadline}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.documentsUploaded}/{c.documentsRequired}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.rentersCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCases.length}</span> of <span className="font-medium">{filteredCases.length}</span> results
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
