"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Renter {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  mailboxPmb: string;
  mailboxName: string;
}

const mockRenters: Renter[] = [
  { id: "R001", fullName: "John Doe", email: "john@techstartup.com", phone: "(206) 555-0101", registrationDate: "2024-01-15", mailboxPmb: "205", mailboxName: "Tech Startup Inc" },
  { id: "R002", fullName: "Jane Smith", email: "jane@acme.com", phone: "(206) 555-0102", registrationDate: "2024-02-20", mailboxPmb: "342", mailboxName: "Acme Corp" },
  { id: "R003", fullName: "Michael Brown", email: "mike@designstudio.com", phone: "(206) 555-0103", registrationDate: "2024-03-10", mailboxPmb: "101", mailboxName: "Design Studio LLC" },
  { id: "R004", fullName: "Sarah Johnson", email: "sarah.j@email.com", phone: "(206) 555-0104", registrationDate: "2024-04-05", mailboxPmb: "089", mailboxName: "Sarah Johnson" },
  { id: "R005", fullName: "David Wilson", email: "dave@legalservices.com", phone: "(206) 555-0105", registrationDate: "2023-08-01", mailboxPmb: "234", mailboxName: "Legal Services Co" },
  { id: "R006", fullName: "Emily Chen", email: "emily@consulting.com", phone: "(206) 555-0106", registrationDate: "2024-05-12", mailboxPmb: "167", mailboxName: "Consulting Group" },
  { id: "R007", fullName: "Robert Taylor", email: "robert@freelancer.com", phone: "(206) 555-0107", registrationDate: "2024-06-18", mailboxPmb: "298", mailboxName: "Freelancer Pro" },
  { id: "R008", fullName: "Lisa Anderson", email: "lisa@acme.com", phone: "(206) 555-0108", registrationDate: "2024-07-22", mailboxPmb: "342", mailboxName: "Acme Corp" },
];

export default function RentersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRenters = mockRenters.filter((renter) =>
    renter.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    renter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    renter.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Renters</h1>
        <p className="text-gray-600 mt-1">Manage renters and compliance contacts</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Renters Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mailbox</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRenters.map((renter) => (
              <tr key={renter.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{renter.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{renter.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{renter.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  PMB {renter.mailboxPmb} - {renter.mailboxName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{renter.registrationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredRenters.length}</span> of <span className="font-medium">{filteredRenters.length}</span> results
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
