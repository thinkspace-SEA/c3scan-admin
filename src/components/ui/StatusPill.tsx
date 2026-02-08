'use client'

import { cn } from "@/lib/utils"

interface StatusPillProps {
  status: string
  className?: string
}

const statusColors: Record<string, string> = {
  uploaded: "bg-blue-100 text-blue-700",
  received: "bg-blue-100 text-blue-700",
  open_scan_requested: "bg-yellow-100 text-yellow-700",
  forward_requested: "bg-yellow-100 text-yellow-700",
  pickup_requested: "bg-yellow-100 text-yellow-700",
  action_required: "bg-red-100 text-red-700",
  non_compliant: "bg-red-100 text-red-700",
  open_scan_completed: "bg-green-100 text-green-700",
  forward_shipped: "bg-green-100 text-green-700",
  picked_up: "bg-green-100 text-green-700",
  shred_requested: "bg-gray-100 text-gray-700",
  disposed: "bg-gray-100 text-gray-700",
  compliance_pending: "bg-purple-100 text-purple-700",
  compliance_submitted: "bg-purple-100 text-purple-700",
  missing_documents: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  inactive: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  under_review: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700"
}

export function StatusPill({ status, className }: StatusPillProps) {
  const colorClass = statusColors[status] || statusColors.default
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      colorClass,
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
