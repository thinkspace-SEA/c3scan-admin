'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { AliasSubmission } from '@/lib/api'
import { StatusPill } from '@/components/ui/StatusPill'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Inbox, Clock, Users, TrendingUp, Search } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingAliases: 0,
    unprocessedMail: 0,
    totalCustomers: 0,
    todayScans: 0
  })
  const [recentSubmissions, setRecentSubmissions] = useState<AliasSubmission[]>([])
  const [recentActivity, setRecentActivity] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      setError(null)
      
      // Use the new API client layer
      const [statsData, submissions, activity] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentSubmissions(5),
        api.getRecentActivity(10),
      ])

      setStats({
        pendingAliases: statsData.pendingAliases,
        unprocessedMail: 0, // TODO: Add mail_items count
        totalCustomers: 0, // TODO: Add customers count
        todayScans: statsData.todayScans,
      })

      setRecentSubmissions(submissions)
      setRecentActivity(activity)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCC00]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">Error loading dashboard</p>
        <p className="text-gray-500 text-sm">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-[#FFCC00] text-black rounded-lg hover:bg-[#E6B800] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <CommandPalette />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Inbox className="w-5 h-5 text-[#FFCC00]" />
            </div>
            <span className="text-sm text-gray-500">Pending Aliases</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingAliases}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Unprocessed Mail</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.unprocessedMail}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Customers</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Today&apos;s Scans</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.todayScans}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Alias Submissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pending Alias Submissions</h2>
            <span className="text-sm text-gray-500">{recentSubmissions.length} pending</span>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission.submission_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{submission.proposed_alias_name}</p>
                      <p className="text-sm text-gray-500">{submission.submitter_email}</p>
                      <p className="text-xs text-gray-400 mt-1">{submission.alias_type}</p>
                    </div>
                    <StatusPill status={submission.review_status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No pending submissions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((item: unknown, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Mail scanned
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date((item as { created_at: string }).created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
