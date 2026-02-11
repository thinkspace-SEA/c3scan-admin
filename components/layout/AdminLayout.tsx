"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  Inbox, 
  Mail, 
  Users, 
  FileCheck, 
  CreditCard, 
  Settings, 
  LogOut,
  Building2,
  ChevronDown,
  Command,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin/mail", label: "Mail", icon: Inbox },
  { href: "/admin/mailboxes", label: "Mailboxes", icon: Mail },
  { href: "/admin/requests", label: "Requests", icon: FileCheck },
  { href: "/admin/renters", label: "Renters", icon: Users },
  { href: "/admin/compliance", label: "Compliance", icon: FileCheck },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/settings/general", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const currentLocation = "Thinkspace Seattle";

  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--border-subtle)] h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-0)] transition-colors"
            >
              <Menu className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
            <Link href="/admin/mail" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="C3scan"
                width={32}
                height={32}
                className="rounded"
                priority
              />
              <span className="hidden sm:block font-semibold text-[var(--text-primary)] text-lg">
                C3scan
              </span>
            </Link>
          </div>

          {/* Center: Location Selector */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[var(--surface-0)] transition-colors"
            >
              <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {currentLocation}
              </span>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            
            {locationDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[var(--border-subtle)] py-2 z-50">
                <div className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Select Location
                </div>
                <Link
                  href="/admin/select-location"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-0)] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--semantic-green)]" />
                  <span className="text-sm text-[var(--text-primary)]">Thinkspace Seattle</span>
                </Link>
                <Link
                  href="/admin/select-location"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-0)] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)]">Thinkspace Redmond</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Command Palette & User */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)] text-sm text-[var(--text-muted)] hover:border-[var(--text-muted)] transition-colors">
              <Command className="w-3.5 h-3.5" />
              <span>Command Palette</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white rounded border border-[var(--border-subtle)]">⌘K</kbd>
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-sm font-semibold text-[var(--action-black)]">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:sticky lg:top-16 left-0 z-30 w-64 h-[calc(100vh-64px)] bg-white border-r border-[var(--border-subtle)]
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? "bg-[var(--brand-primary-soft)] text-[var(--text-primary)]" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-0)] hover:text-[var(--text-primary)]"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[var(--action-black)]" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-subtle)]">
            <Link
              href="/admin/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-0)] hover:text-[var(--text-primary)] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Link>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
