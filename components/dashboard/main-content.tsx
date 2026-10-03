'use client';

import type { ReactNode } from 'react';
import { useSidebar } from './sidebar-context';

/**
 * The sidebar is `fixed`, so it's taken out of normal document flow.
 * This wrapper reads the same collapsed state and applies the matching
 * left margin, so the two never fall out of sync.
 */
export function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {children}
    </div>
  );
}