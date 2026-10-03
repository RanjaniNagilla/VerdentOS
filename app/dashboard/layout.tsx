'use client';

import type { ReactNode } from 'react';
import { WorkspaceProvider } from '@/context/workspace-context';
import { NotificationProvider } from '@/context/notification-context';
import { SidebarProvider } from '@/components/dashboard/sidebar-context';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainContent } from '@/components/dashboard/main-content';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <NotificationProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 selection:bg-emerald-500/30 dark:bg-slate-950 dark:text-slate-100">
            <Sidebar />
            <MainContent>
              <Header />
              <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
            </MainContent>
          </div>
        </SidebarProvider>
      </NotificationProvider>
    </WorkspaceProvider>
  );
}