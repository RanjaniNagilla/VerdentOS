'use client';

import { CheckCircle2, ShieldAlert, Info, X } from 'lucide-react';
import type { SystemNotification } from '@/hooks/use-system-notifications';

const TONE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/30',
    barClass: 'bg-emerald-500',
  },
  warning: {
    icon: ShieldAlert,
    iconClass: 'text-amber-600 dark:text-amber-400',
    ringClass: 'ring-amber-500/30',
    barClass: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-slate-600 dark:text-slate-300',
    ringClass: 'ring-slate-400/30 dark:ring-slate-600/30',
    barClass: 'bg-slate-400 dark:bg-slate-600',
  },
} as const;

interface SystemNotificationStackProps {
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
}

export function SystemNotificationStack({ notifications, onDismiss }: SystemNotificationStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {notifications.map((notification) => {
        const config = TONE_CONFIG[notification.tone];
        const ToneIcon = config.icon;

        return (
          <div
            key={notification.id}
            className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 pl-5 shadow-lg shadow-slate-900/10 ring-1 ${config.ringClass} transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/40 dark:backdrop-blur-xl`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${config.barClass}`} />
            <ToneIcon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
              {notification.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {notification.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-1 text-slate-400 transition-all duration-200 ease-in-out hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}