'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type WorkspaceId = 'nord-textiles' | 'aether-logistics' | 'vanguard-industrial';

export interface Workspace {
  id: WorkspaceId;
  name: string;
  industryLabel: string;
}

export const WORKSPACES: Workspace[] = [
  {
    id: 'nord-textiles',
    name: 'Nord Textiles Group',
    industryLabel: 'Textile Manufacturing & Dye Processing',
  },
  {
    id: 'aether-logistics',
    name: 'Aether Logistics Corp',
    industryLabel: 'Freight, Cold-Chain & Distribution',
  },
  {
    id: 'vanguard-industrial',
    name: 'Vanguard Industrial',
    industryLabel: 'Heavy Metallurgical Manufacturing',
  },
];

interface WorkspaceContextValue {
  activeWorkspace: Workspace;
  activeWorkspaceId: WorkspaceId;
  setActiveWorkspaceId: (id: WorkspaceId) => void;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

/**
 * Wraps the dashboard route group. Anything that needs to know "which
 * tenant is currently selected" — the workspace switcher in the header,
 * the tenant-specific analytics on the overview page, future pages that
 * scope queries by workspace — reads from this one place.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<WorkspaceId>(WORKSPACES[0].id);
  const activeWorkspace = WORKSPACES.find((w) => w.id === activeWorkspaceId) ?? WORKSPACES[0];

  return (
    <WorkspaceContext.Provider
      value={{ activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, workspaces: WORKSPACES }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be called within a <WorkspaceProvider>');
  }
  return ctx;
}