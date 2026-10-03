'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  LayoutDashboard,
  Ship,
  Factory,
  ScrollText,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { useSidebar } from './sidebar-context';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Shipments', href: '/dashboard/shipments', icon: Ship },
  { label: 'Suppliers', href: '/dashboard/suppliers', icon: Factory },
  { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: ScrollText },
];

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800/80 dark:bg-slate-950/95 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand with Rotating Globe Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800/80">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-sm shadow-emerald-500/10">
          <Globe className="h-5 w-5 animate-[spin_7s_linear_infinite]" strokeWidth={2.5} />
        </div>
        <span
          className={`whitespace-nowrap text-[15px] font-semibold tracking-tight text-slate-900 transition-opacity duration-200 dark:text-slate-100 ${
            isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          Verdant<span className="text-emerald-600 dark:text-emerald-400">OS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-600 dark:bg-emerald-400" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span
                className={`whitespace-nowrap transition-opacity duration-200 ${
                  isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800/80">
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          )}
          <span
            className={`whitespace-nowrap transition-opacity duration-200 ${
              isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}