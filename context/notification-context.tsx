'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'sync' | 'export' | 'alert' | 'general' | 'warning';
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (title: string, type: NotificationItem['type'], description: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'init_1',
      title: 'Workspace Initialized',
      description: 'Real-time telemetry feeds connected.',
      type: 'general',
      timestamp: 'Just now',
      isRead: false,
    },
  ]);

  const addNotification = (title: string, type: NotificationItem['type'], description: string) => {
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}