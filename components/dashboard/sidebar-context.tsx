'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  isCollapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

/**
 * Wraps the dashboard route group. Holds the single source of truth for
 * whether the rail is collapsed, so <Sidebar> and <MainContent> — two
 * separate components — can both react to it without prop drilling.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be called within a <SidebarProvider>');
  }
  return ctx;
}