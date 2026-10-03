'use client';

import { useCallback, useRef, useState } from 'react';

export type NotificationTone = 'success' | 'warning' | 'info';

export interface SystemNotification {
  id: string;
  title: string;
  description?: string;
  tone: NotificationTone;
}

const AUTO_DISMISS_MS = 4500;

export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const idCounterRef = useRef(0);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const triggerSystemNotification = useCallback(
    (title: string, tone: NotificationTone = 'info', description?: string) => {
      idCounterRef.current += 1;
      const id = `notif_${Date.now()}_${idCounterRef.current}`;

      setNotifications((prev) => [...prev, { id, title, description, tone }]);

      setTimeout(() => {
        dismissNotification(id);
      }, AUTO_DISMISS_MS);
    },
    [dismissNotification]
  );

  return { notifications, triggerSystemNotification, dismissNotification };
}