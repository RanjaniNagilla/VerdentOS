'use client';

import { useState, useRef } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  X, 
  Check, 
  Trash2, 
  CheckCheck 
} from 'lucide-react';
import { useNotifications } from '@/context/notification-context';
import { useOnClickOutside } from '@/hooks/use-click-outside';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Automatically close menu when user clicks outside or presses ESC
  useOnClickOutside(popoverRef, () => setIsOpen(false), isOpen);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div ref={popoverRef} className="relative inline-block">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D131F] p-4 shadow-2xl z-50 space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Activity Logs
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-[#00E599] hover:underline px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity Item List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 font-sans">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`group relative p-3 rounded-2xl border transition-all flex gap-3 items-start ${
                    item.isRead
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/40 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    item.isRead 
                      ? 'bg-slate-200/50 dark:bg-slate-800 text-slate-400' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-[#00E599]'
                  }`}>
                    {item.type === 'sync' && <RefreshCw className="w-3.5 h-3.5" />}
                    {item.type === 'export' && <Download className="w-3.5 h-3.5" />}
                    {(item.type === 'alert' || item.type === 'warning') && <AlertTriangle className="w-3.5 h-3.5" />}
                    {item.type === 'general' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-10">
                    <p className={`text-xs font-bold truncate ${item.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {item.timestamp}
                    </span>
                  </div>

                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(item.id)}
                      title="Remove"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No activity records logged.
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
              <button
                onClick={clearAll}
                className="text-[11px] text-slate-400 hover:text-rose-500 font-medium transition"
              >
                Clear all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}