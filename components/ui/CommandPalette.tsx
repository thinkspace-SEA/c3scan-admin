'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Home, Mail, ClipboardList, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  name: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const commands: Command[] = [
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      shortcut: 'D',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/admin')
    },
    {
      id: 'mail',
      name: 'Go to Mail Items',
      shortcut: 'M',
      icon: <Mail className="w-4 h-4" />,
      action: () => router.push('/admin/mail')
    },
    {
      id: 'aliases',
      name: 'Review Alias Submissions',
      shortcut: 'A',
      icon: <ClipboardList className="w-4 h-4" />,
      action: () => router.push('/admin/alias-submissions')
    },
    {
      id: 'customers',
      name: 'View Customers',
      shortcut: 'C',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/admin/customers')
    },
    {
      id: 'settings',
      name: 'Settings',
      shortcut: 'S',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/admin/settings')
    }
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // CMD+K or CTRL+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(true)
    }
    // ESC to close
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 text-lg outline-none placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => {
                command.action()
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors",
                index === 0 && "bg-gray-50"
              )}
            >
              <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                {command.icon}
              </span>
              <span className="flex-1 text-left text-gray-700">{command.name}</span>
              {command.shortcut && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {command.shortcut}
                </span>
              )}
            </button>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
