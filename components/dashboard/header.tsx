'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  ChevronDown,
  Search,
  Bell,
  Building2,
  Check,
  X,
  Command,
  LayoutDashboard,
  Ship,
  Factory,
  ScrollText,
  Plane,
  ShieldAlert,
  Trash2,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react';
import { useWorkspace } from '@/context/workspace-context';
import { ThemeToggle } from './theme-toggle';

// --- Global Dynamic Notification State Engine ---
export interface NotificationAlert {
  id: string;
  title: string;
  detail: string;
  time: string;
  isRead?: boolean;
}

type NotificationListener = (notification: NotificationAlert) => void;
const listeners: Set<NotificationListener> = new Set();

/**
 * Global helper you can import anywhere (e.g. main content page on button clicks)
 * Example usage: pushHeaderNotification({ title: 'Sync Completed', detail: 'Latest telemetry pulled' });
 */
export function pushHeaderNotification(payload: Omit<NotificationAlert, 'id' | 'time'>) {
  const newItem: NotificationAlert = {
    ...payload,
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    time: 'Just now',
    isRead: false,
  };
  listeners.forEach((listener) => listener(newItem));
}

// --- Search Constants ---
type SearchCategory = 'Navigation' | 'Shipments' | 'Suppliers' | 'Audit Logs';

interface SearchIndexItem {
  id: string;
  label: string;
  description: string;
  category: SearchCategory;
  href: string;
  icon: LucideIcon;
}

const SEARCH_INDEX: SearchIndexItem[] = [
  { id: 'nav-overview', label: 'Overview', description: 'Dashboard home', category: 'Navigation', href: '/dashboard', icon: LayoutDashboard },
  { id: 'nav-shipments', label: 'Shipments', description: 'Active shipment telemetry', category: 'Navigation', href: '/dashboard/shipments', icon: Ship },
  { id: 'nav-suppliers', label: 'Suppliers', description: 'Supplier risk & compliance', category: 'Navigation', href: '/dashboard/suppliers', icon: Factory },
  { id: 'nav-audit-logs', label: 'Audit Logs', description: 'Compliance & validation history', category: 'Navigation', href: '/dashboard/audit-logs', icon: ScrollText },
  { id: 'shipment-shanghai-la', label: 'Shanghai (PVG) → Los Angeles (LAX)', description: 'Air freight shipment', category: 'Shipments', href: '/dashboard/shipments', icon: Plane },
  { id: 'shipment-rotterdam-ny', label: 'Rotterdam Port → New York (JFK)', description: 'Sea freight shipment', category: 'Shipments', href: '/dashboard/shipments', icon: Ship },
  { id: 'shipment-frankfurt-singapore', label: 'Frankfurt (FRA) → Singapore (SIN)', description: 'Rail freight shipment', category: 'Shipments', href: '/dashboard/shipments', icon: Ship },
  { id: 'supplier-meridian', label: 'Meridian Fabrics Co-op', description: 'Flagged — Scope 3 emission factor review', category: 'Suppliers', href: '/dashboard/suppliers', icon: Building2 },
  { id: 'supplier-frostline', label: 'Frostline Carriers', description: 'Flagged — cold-chain compliance audit', category: 'Suppliers', href: '/dashboard/suppliers', icon: Building2 },
  { id: 'audit-compliance-variance', label: 'Compliance Variance Flags', description: 'Manually escalated records', category: 'Audit Logs', href: '/dashboard/audit-logs', icon: ShieldAlert },
  { id: 'audit-validation-history', label: 'Validation History', description: 'Approved & isolated events', category: 'Audit Logs', href: '/dashboard/audit-logs', icon: ScrollText },
];

const SEARCH_CATEGORY_ORDER: SearchCategory[] = ['Navigation', 'Shipments', 'Suppliers', 'Audit Logs'];

const INITIAL_ALERTS: NotificationAlert[] = [
  { id: 'alert-1', title: 'Compliance variance flagged', detail: 'Nord Textiles Group — Scope 3 telemetry', time: '12m ago', isRead: false },
  { id: 'alert-2', title: 'Cold-chain sensor dropout', detail: 'Aether Logistics Corp — Reefer Unit R-114', time: '38m ago', isRead: false },
  { id: 'alert-3', title: 'Blast furnace grid draw spike', detail: 'Vanguard Industrial — Furnace #2', time: '1h ago', isRead: true },
];

export function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, workspaces } = useWorkspace();

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Dynamic alerts state
  const [alerts, setAlerts] = useState<NotificationAlert[]>(INITIAL_ALERTS);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to live pushes from anywhere in the application
  useEffect(() => {
    const handlePush = (newAlert: NotificationAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };
    listeners.add(handlePush);
    return () => {
      listeners.delete(handlePush);
    };
  }, []);

  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  // Global ⌘K / Ctrl+K keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsWorkspaceOpen(false);
        setIsNotificationsOpen(false);
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groupedResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matches = normalizedQuery
      ? SEARCH_INDEX.filter(
          (item) =>
            item.label.toLowerCase().includes(normalizedQuery) ||
            item.description.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery)
        )
      : SEARCH_INDEX.filter((item) => item.category === 'Navigation');

    return SEARCH_CATEGORY_ORDER.map((category) => ({
      category,
      items: matches.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const hasResults = groupedResults.length > 0;

  function openWorkspaceMenu() {
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
    setIsWorkspaceOpen((prev) => !prev);
  }

  function openNotifications() {
    setIsWorkspaceOpen(false);
    setIsSearchOpen(false);
    setIsNotificationsOpen((prev) => !prev);
  }

  function handleMarkAllAsRead() {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
  }

  function handleDismissAlert(id: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  function handleClearAllAlerts() {
    setAlerts([]);
  }

  function handleSelectSearchResult(item: SearchIndexItem) {
    router.push(item.href);
    setIsSearchOpen(false);
    setSearchQuery('');
    searchInputRef.current?.blur();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950/90 lg:px-8">
      {/* Workspace switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={openWorkspaceMenu}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700">
            <Building2 className="h-4 w-4 text-slate-700 dark:text-slate-300" strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Enterprise Workspace
            </p>
            <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {activeWorkspace?.name || 'Workspace'}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform dark:text-slate-400 ${
              isWorkspaceOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isWorkspaceOpen && (
          <>
            <button
              type="button"
              aria-label="Close workspace menu"
              className="fixed inset-0 z-40 cursor-default bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
              onClick={() => setIsWorkspaceOpen(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl transition-all duration-150 dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Select Enterprise Tenant
                </p>
              </div>
              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const isSelected = workspace.id === activeWorkspaceId;
                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceId(workspace.id);
                        setIsWorkspaceOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-emerald-50/80 text-emerald-950 font-semibold dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white'
                      }`}
                    >
                      <span className="min-w-0 flex-1 pr-2">
                        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {workspace.name}
                        </span>
                        <span className="block truncate text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                          {workspace.industryLabel}
                        </span>
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              setIsWorkspaceOpen(false);
              setIsNotificationsOpen(false);
              setIsSearchOpen(true);
            }}
            placeholder="Search shipments, suppliers…"
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-emerald-500/50"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-transparent dark:text-slate-500">
              <Command className="h-2.5 w-2.5" strokeWidth={2} />K
            </span>
          )}

          {isSearchOpen && (
            <>
              <button
                type="button"
                aria-label="Close search"
                className="fixed inset-0 z-40 cursor-default bg-black/10 dark:bg-black/30"
                onClick={() => setIsSearchOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {!hasResults && (
                  <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}

                {hasResults && (
                  <div className="max-h-80 overflow-y-auto">
                    {groupedResults.map((group) => (
                      <div key={group.category} className="mb-1 last:mb-0">
                        <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {group.category}
                        </p>
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectSearchResult(item)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ItemIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={2} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {item.label}
                                </span>
                                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        {/* Interactive Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={openNotifications}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:bg-emerald-400 dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default bg-black/10 dark:bg-black/30"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Recent Alerts {unreadCount > 0 && `(${unreadCount} unread)`}
                  </p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`group relative px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          alert.isRead ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="pr-6">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{alert.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{alert.detail}</p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-600">{alert.time}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDismissAlert(alert.id)}
                          title="Dismiss"
                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-8 text-center text-xs text-slate-400">No recent alerts</p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
                  {alerts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllAlerts}
                      className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/dashboard/audit-logs');
                      setIsNotificationsOpen(false);
                    }}
                    className="ml-auto flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors hover:underline dark:text-emerald-400"
                  >
                    View all in Audit Logs
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="ml-1 h-8 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Live Clerk User Profile & Sign Out Button */}
        <div className="flex items-center gap-2.5 pl-1">
          <UserButton />
          <div className="hidden text-left lg:block">
            <p className="text-sm font-medium leading-tight text-slate-900 dark:text-slate-100">
              {user?.fullName || user?.firstName || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.primaryEmailAddress?.emailAddress || 'Enterprise Account'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;