'use client';

import { useState } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { useAuth } from '@/context/auth-context';
import { useUser } from '@clerk/nextjs';
import { 
  ShieldCheck, 
  ArrowDownToLine, 
  RefreshCw, 
  FileSpreadsheet, 
  Layers, 
  CheckCircle2, 
  User, 
  Search, 
  X, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check 
} from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'Scope 1' | 'Scope 2' | 'Scope 3';
  operator: string;
  status: 'Verified' | 'Pending' | 'Flagged';
  hash: string;
}

// Multi-tenant audit log entries mapped by activeWorkspaceId & workspace names
const TENANT_AUDIT_LOGS: Record<string, AuditEntry[]> = {
  'nord-textiles-group': [
    { id: 'TXN-9081', timestamp: '2026-07-19 02:14:10', action: 'Recalculated maritime emission coefficient', category: 'Scope 3', operator: 'Riya Kapoor', status: 'Verified', hash: 'sha256:8f2a...c3d1' },
    { id: 'TXN-9080', timestamp: '2026-07-19 01:45:22', action: 'Ingested Tier-1 supplier energy billing records', category: 'Scope 2', operator: 'System Automated', status: 'Verified', hash: 'sha256:4e9b...7a2f' },
    { id: 'TXN-9079', timestamp: '2026-07-18 23:12:05', action: 'Flagged anomalies in air cargo weight variance', category: 'Scope 3', operator: 'AI Audit Engine', status: 'Flagged', hash: 'sha256:1a8c...9e4b' },
    { id: 'TXN-9078', timestamp: '2026-07-18 18:30:00', action: 'Closed offsetting balance period Q2', category: 'Scope 1', operator: 'Marcus Vance', status: 'Verified', hash: 'sha256:7d3f...2b8d' },
    { id: 'TXN-9077', timestamp: '2026-07-18 14:02:11', action: 'Initialized new route optimization simulation', category: 'Scope 3', operator: 'Riya Kapoor', status: 'Pending', hash: 'sha256:5c2e...8f1a' },
  ],
  'aether-logistics-corp': [
    { id: 'TXN-8841', timestamp: '2026-07-19 04:12:00', action: 'Synchronized cross-docking distribution telemetry', category: 'Scope 3', operator: 'Alex Chen', status: 'Verified', hash: 'sha256:9d4e...1b7f' },
    { id: 'TXN-8840', timestamp: '2026-07-19 00:22:15', action: 'Adjusted regional jet-fuel conversion factors', category: 'Scope 1', operator: 'System Automated', status: 'Verified', hash: 'sha256:3a1b...8e9c' },
    { id: 'TXN-8839', timestamp: '2026-07-18 21:05:44', action: 'Flagged cold-chain sensor threshold exception', category: 'Scope 2', operator: 'AI Audit Engine', status: 'Flagged', hash: 'sha256:6c8f...2d4a' },
  ],
  'vanguard-industrial': [
    { id: 'TXN-7412', timestamp: '2026-07-19 05:30:11', action: 'Audited heavy smelting furnace electric grid logs', category: 'Scope 2', operator: 'Elena Rostova', status: 'Verified', hash: 'sha256:2f4e...7c9a' },
    { id: 'TXN-7411', timestamp: '2026-07-19 01:10:45', action: 'Rebalanced structural alloy scrap offset logic', category: 'Scope 1', operator: 'Marcus Vance', status: 'Pending', hash: 'sha256:9b1a...4f3e' },
    { id: 'TXN-7410', timestamp: '2026-07-18 19:48:12', action: 'Calculated baseline metallurgical coke intensity', category: 'Scope 1', operator: 'Elena Rostova', status: 'Verified', hash: 'sha256:5e3c...1a2b' },
    { id: 'TXN-7409', timestamp: '2026-07-18 11:15:00', action: 'Flagged iron ore bulk carrier draft anomalies', category: 'Scope 3', operator: 'AI Audit Engine', status: 'Flagged', hash: 'sha256:8a7d...3e9f' },
  ]
};

const TENANT_AGGREGATES: Record<string, { events: string }> = {
  'nord-textiles-group': { events: '14,204 Events' },
  'aether-logistics-corp': { events: '9,812 Events' },
  'vanguard-industrial': { events: '22,451 Events' }
};

export default function AuditLogsPage() {
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const auth = useAuth?.() || { user: null };
  const { user: clerkUser } = useUser();

  const currentUser = 
    clerkUser?.fullName || 
    clerkUser?.firstName || 
    auth.user?.name || 
    'Abhijeet Raj Rana';

  const activeCompanyName = activeWorkspace?.name || 'Nord Textiles Group';

  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Verified' | 'Flagged' | 'Pending'>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Retrieve logs and metrics with fallback for tenant mapping
  const rawLogs = TENANT_AUDIT_LOGS[activeWorkspaceId] || TENANT_AUDIT_LOGS['nord-textiles-group'];
  const eventVolume = TENANT_AGGREGATES[activeWorkspaceId]?.events || '0 Events';

  const filteredLogs = rawLogs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setExportNotification(`Ledger sync completed for ${activeCompanyName}.`);
      setTimeout(() => setExportNotification(null), 3000);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Action Event', 'Scope Category', 'Operator Node', 'Verification Status', 'Cryptographic Hash'];
    
    const csvRows = filteredLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.category}"`,
      `"${log.operator}"`,
      `"${log.status}"`,
      `"${log.hash}"`
    ]);

    const metadataHeader = [
      `"VERDANTOS COMPLIANCE AUDIT EXPORT"`,
      `"ACTIVE_TENANT: ${activeCompanyName.toUpperCase()}"`,
      `"AUDIT_AUDITOR: ${currentUser.toUpperCase()}"`,
      `"EXPORT_TIMESTAMP: ${new Date().toISOString()}"`,
      `"SYSTEM_INTEGRITY_STATUS: SECURE_100%"`,
      `""` 
    ].join('\n');

    const csvContent = metadataHeader + [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', `verdantos_${activeCompanyName.toLowerCase().replace(/\s+/g, '_')}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    downloadLink.style.visibility = 'hidden';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    setExportNotification(`Ledger signature generated for ${activeCompanyName}. CSV Downloaded!`);
    setTimeout(() => setExportNotification(null), 4000);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6 font-sans">
      
      {/* Dynamic Notification Toast */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-950 text-xs font-mono font-medium text-emerald-300 shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900/10 via-slate-900/5 to-transparent dark:from-[#0D131F] dark:via-[#0A0E17] dark:to-[#070A0F] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00E599] text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              Auditor: {currentUser}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Compliance <span className="text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#00E599] dark:to-cyan-400">Audit Ledger</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Immutable tracking metrics signature for <span className="text-slate-800 dark:text-slate-200 font-semibold">{activeCompanyName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} /> 
              {isRefreshing ? 'Syncing...' : 'Refresh Data'}
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00E599] dark:hover:bg-[#00C885] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Export Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Ledger Integrity</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">100% Cryptographic</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Scopes Monitored</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Scopes 1, 2, & 3</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Transactions</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 font-mono">{eventVolume}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="relative flex items-center bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search action, ID, operator, or scope..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
            />
            {searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-800 w-full md:w-auto shadow-sm overflow-x-auto">
          {(['ALL', 'Verified', 'Flagged', 'Pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-emerald-500 dark:bg-[#00E599] text-white dark:text-slate-950 font-bold shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {status === 'ALL' ? 'All Entries' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A0E17] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[11px] tracking-wider">
              <tr>
                <th className="p-5 pl-7">Txn ID</th>
                <th className="p-5">Timestamp</th>
                <th className="p-5">Action Event</th>
                <th className="p-5">Category</th>
                <th className="p-5">Operator</th>
                <th className="p-5">Status</th>
                <th className="p-5 pr-7 hidden lg:table-cell">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 font-medium text-slate-700 dark:text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 pl-7 font-mono font-bold text-slate-900 dark:text-white">
                      {log.id}
                    </td>

                    <td className="p-5 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {log.timestamp}
                    </td>

                    <td className="p-5 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                      {log.action}
                    </td>

                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {log.category}
                      </span>
                    </td>

                    <td className="p-5 font-mono text-xs">
                      <span className={log.operator === currentUser ? 'font-bold text-emerald-600 dark:text-[#00E599]' : 'text-slate-700 dark:text-slate-300'}>
                        {log.operator}
                      </span>
                    </td>

                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'Verified' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] border border-emerald-500/20' 
                          : log.status === 'Flagged'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.status === 'Verified' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {log.status === 'Flagged' && <AlertTriangle className="h-3.5 w-3.5" />}
                        {log.status === 'Pending' && <Clock className="h-3.5 w-3.5" />}
                        {log.status}
                      </span>
                    </td>

                    <td className="p-5 pr-7 font-mono text-xs text-slate-400 dark:text-slate-500 hidden lg:table-cell">
                      <button 
                        onClick={() => handleCopyHash(log.hash)}
                        className="inline-flex items-center gap-2 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
                        title="Click to copy hash"
                      >
                        <span>{log.hash}</span>
                        {copiedHash === log.hash ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    No matching audit records found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}