'use client'

import { useState } from 'react'
import { Users, Plus, MoreVertical, Mail } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'Admin Owner' | 'Location Staff' | 'Compliance Reviewer' | 'Billing Admin'
  status: 'active' | 'pending'
}

export default function AccessSettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'Peter Chee', email: 'peter@thinkspace.com', role: 'Admin Owner', status: 'active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@thinkspace.com', role: 'Location Staff', status: 'active' },
    { id: '3', name: 'Mike Chen', email: 'mike@thinkspace.com', role: 'Compliance Reviewer', status: 'pending' },
  ])
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Send invitation
    setInviteEmail('')
    setShowInviteForm(false)
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Access</h1>
          <p className="text-gray-500 mt-1">Manage staff users and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2 bg-[#FFCC00] text-black font-medium rounded-lg hover:bg-[#E6B800] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite Staff
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F172A] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Send Invite
            </button>
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status === 'active' ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
