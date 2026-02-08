'use client'

import { useEffect, useState } from 'react'
import { supabase, type AliasSubmission, type ScannedMail } from '@/lib/supabase'
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
  const [recentActivity, setRecentActivity] = useState<ScannedMail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch pending alias submissions count
      const { count: pendingAliases } = await supabase
        .from('alias_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('review_status', 'pending')

      // Fetch recent pending submissions
      const { data: submissions } = await supabase
        .from('alias_submissions')
        .select('*')
        .eq('review_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent scanned mail
      const { data: scans } = await supabase
        .from('scanned_mail')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        pendingAliases: pendingAliases || 0,
        unprocessedMail: 0,
        totalCustomers: 0,
        todayScans: scans?.length || 0
      })

      setRecentSubmissions(submissions || [])
      setRecentActivity(scans || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  return (
    <>
      <CommandPalette />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Metrics Cards - The Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Pending Alias Reviews"
          value={stats.pendingAliases}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          bgColor="bg-yellow-50"
          href="/admin/alias-submissions"
        />
        <MetricCard
          title="Unprocessed Mail"
          value={stats.unprocessedMail}
          icon={<Inbox className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
          href="/admin/mail"
        />
        <MetricCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-5 h-5 text-purple-600" />}
          bgColor="bg-purple-50"
          href="/admin/customers"
        />
        <MetricCard
          title="Today's Scans"
          value={stats.todayScans}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
          href="/admin/mail"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Queue - Main Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Alias Submissions</h2>
              <p className="text-sm text-gray-500 mt-1">Review and approve new alias requests from field staff</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => (
                  <a
                    key={submission.submission_id}
                    href={`/admin/alias-submissions/${submission.submission_id}`}
                    className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">
                          {submission.proposed_alias_name}
                        </h3>
                        <StatusPill status={submission.review_status} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        For company ID: {submission.company_id.substring(0, 8)}... • Submitted by {submission.submitter_email}
                      </p>
                      {submission.source_ocr_text && (
                        <p className="text-sm text-gray-400 mt-1 italic">
                          &ldquo;{submission.source_ocr_text.substring(0, 60)}...&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </a>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <ClipboardListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending alias submissions</p>
                  <p className="text-sm mt-1">New submissions will appear here</p>
                </div>
              )}
            </div>

            {recentSubmissions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <a
                  href="/admin/alias-submissions"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all submissions →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - Right Column */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Search className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Mail scanned
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                        {item.raw_ocr_text && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {item.raw_ocr_text.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  bgColor: string
  href: string
}

function MetricCard({ title, value, icon, bgColor, href }: MetricCardProps) {
  return (
    <a href={href} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
    </a>
  )
}

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
