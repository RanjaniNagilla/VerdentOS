'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { useNotifications } from '@/context/notification-context';
import { useOnClickOutside } from '@/hooks/use-click-outside';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Factory, 
  ShieldAlert, 
  TrendingUp, 
  Search, 
  X, 
  Globe, 
  Sparkles, 
  RefreshCw,
  Building2,
  ArrowDownToLine
} from 'lucide-react';

interface SupplierMetrics {
  id: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  carbonIntensity: number;
  riskScore: number;
  status: 'Compliant' | 'Warning' | 'Critical';
  location: string;
}

// Pre-defined seed mock records for known demo tenants
const INITIAL_TENANT_SUPPLIERS: Record<string, SupplierMetrics[]> = {
  'nord-textiles-group': [
    { id: 'SUP-001', name: 'Apex Heavy Manufacturing', tier: 'Tier 1', carbonIntensity: 1.42, riskScore: 32, status: 'Compliant', location: 'Shanghai, CN' },
    { id: 'SUP-002', name: 'Nexus Logistics Hub', tier: 'Tier 1', carbonIntensity: 2.85, riskScore: 78, status: 'Warning', location: 'Rotterdam, NL' },
    { id: 'SUP-003', name: 'Vanguard Chemical Refining', tier: 'Tier 2', carbonIntensity: 4.12, riskScore: 92, status: 'Critical', location: 'Texas, USA' },
    { id: 'SUP-004', name: 'EcoPack Industrial Packagers', tier: 'Tier 3', carbonIntensity: 0.35, riskScore: 18, status: 'Compliant', location: 'Frankfurt, DE' },
    { id: 'SUP-005', name: 'Horizon Semiconductor Foundry', tier: 'Tier 2', carbonIntensity: 3.10, riskScore: 64, status: 'Warning', location: 'Hsinchu, TW' },
  ],
  'aether-logistics-corp': [
    { id: 'SUP-101', name: 'Global Aero-Freight Spares', tier: 'Tier 1', carbonIntensity: 5.82, riskScore: 88, status: 'Critical', location: 'Atlanta, USA' },
    { id: 'SUP-102', name: 'PacRim Maritime Drydock', tier: 'Tier 2', carbonIntensity: 2.10, riskScore: 45, status: 'Compliant', location: 'Busan, KR' },
    { id: 'SUP-103', name: 'BioFuel Synthetics Depot', tier: 'Tier 3', carbonIntensity: 0.82, riskScore: 21, status: 'Compliant', location: 'Lyon, FR' },
  ],
  'vanguard-industrial': [
    { id: 'SUP-201', name: 'Titanium Smelting Corp', tier: 'Tier 1', carbonIntensity: 7.45, riskScore: 96, status: 'Critical', location: 'Perth, AU' },
    { id: 'SUP-202', name: 'EuroGrid Smarter Alloys', tier: 'Tier 2', carbonIntensity: 3.90, riskScore: 71, status: 'Warning', location: 'Katowice, PL' },
    { id: 'SUP-203', name: 'Rhine-Westphalia Logistics', tier: 'Tier 1', carbonIntensity: 2.40, riskScore: 52, status: 'Warning', location: 'Duisburg, DE' },
    { id: 'SUP-204', name: 'Nordic Castings & Forges', tier: 'Tier 3', carbonIntensity: 1.15, riskScore: 14, status: 'Compliant', location: 'Oslo, NO' },
  ]
};

// Helper: Convert display names into clean lookup keys
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Dynamic fallback supplier generator for newly created or unknown enterprise companies
function generateFallbackSuppliers(companyName: string): SupplierMetrics[] {
  const prefix = companyName.split(' ')[0].toUpperCase().slice(0, 3) || 'SUP';
  return [
    { id: `${prefix}-01`, name: `${companyName} Primary Logistics`, tier: 'Tier 1', carbonIntensity: 1.85, riskScore: 28, status: 'Compliant', location: 'Hamburg, DE' },
    { id: `${prefix}-02`, name: `Global ${companyName} Component Subcontractors`, tier: 'Tier 2', carbonIntensity: 3.42, riskScore: 68, status: 'Warning', location: 'Guangzhou, CN' },
    { id: `${prefix}-03`, name: `Apex Materials & Extraction`, tier: 'Tier 2', carbonIntensity: 5.12, riskScore: 89, status: 'Critical', location: 'Santiago, CL' },
    { id: `${prefix}-04`, name: `Eco-Standard Sustainable Packaging`, tier: 'Tier 3', carbonIntensity: 0.45, riskScore: 12, status: 'Compliant', location: 'Seattle, USA' },
  ];
}

export default function SuppliersPage() {
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const { addNotification } = useNotifications();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const activeCompanyName = activeWorkspace?.name || 'Enterprise Workspace';

  // Dynamic Workspace Matching Logic
  const suppliers = useMemo(() => {
    const idKey = activeWorkspaceId ? slugify(activeWorkspaceId) : '';
    const nameKey = slugify(activeCompanyName);

    if (INITIAL_TENANT_SUPPLIERS[idKey]) {
      return INITIAL_TENANT_SUPPLIERS[idKey];
    }
    if (INITIAL_TENANT_SUPPLIERS[nameKey]) {
      return INITIAL_TENANT_SUPPLIERS[nameKey];
    }

    return generateFallbackSuppliers(activeCompanyName);
  }, [activeWorkspaceId, activeCompanyName]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Compliant' | 'Warning' | 'Critical'>('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Close drawer when clicking outside or pressing Escape
  useOnClickOutside(drawerRef, () => setSelectedSupplier(null), Boolean(selectedSupplier));

  // Global ⌘K / Ctrl+K keyboard shortcut handling
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        supplier.name.toLowerCase().includes(term) ||
        supplier.id.toLowerCase().includes(term) ||
        supplier.location.toLowerCase().includes(term) ||
        supplier.tier.toLowerCase().includes(term);
      
      const matchesStatus = statusFilter === 'ALL' || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const criticalCount = useMemo(() => suppliers.filter(s => s.status === 'Critical').length, [suppliers]);
  const warningCount = useMemo(() => suppliers.filter(s => s.status === 'Warning').length, [suppliers]);
  const compliancePercentage = useMemo(() => {
    if (!suppliers.length) return '100.0';
    return ((suppliers.filter(s => s.status === 'Compliant').length / suppliers.length) * 100).toFixed(1);
  }, [suppliers]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    addNotification(
      'Vendor Intelligence Synced',
      'sync',
      `Updated Scope 3 telemetry for ${activeCompanyName}.`
    );

    setTimeout(() => {
      setIsRefreshing(false);
      setNotification(`Vendor intelligence re-synced for ${activeCompanyName}.`);
      setTimeout(() => setNotification(null), 3000);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Vendor ID', 'Vendor Name', 'Tier Level', 'Location', 'Carbon Intensity (kg/USD)', 'Risk Score (/100)', 'Status'];
    const csvRows = filteredSuppliers.map(s => [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.tier}"`,
      `"${s.location}"`,
      `"${s.carbonIntensity}"`,
      `"${s.riskScore}"`,
      `"${s.status}"`
    ]);

    const metadataHeader = [
      `"VERDANTOS VENDOR COMPLIANCE EXPORT"`,
      `"ACTIVE_TENANT: ${activeCompanyName.toUpperCase()}"`,
      `"EXPORT_TIMESTAMP: ${new Date().toISOString()}"`,
      `""` 
    ].join('\n');

    const csvContent = metadataHeader + [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', `verdantos_${slugify(activeCompanyName)}_vendors_${new Date().toISOString().split('T')[0]}.csv`);
    downloadLink.style.visibility = 'hidden';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    addNotification(
      'Vendor Dataset Exported',
      'export',
      `CSV report generated for ${activeCompanyName}.`
    );

    setNotification(`Vendor dataset exported for ${activeCompanyName}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectSupplier = (supplier: SupplierMetrics) => {
    setSelectedSupplier(supplier);
    addNotification(
      'Audit Plan Opened',
      'general',
      `Inspecting ${supplier.name} (${supplier.id}).`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-950 text-xs font-mono font-medium text-emerald-300 shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900/10 via-slate-900/5 to-transparent dark:from-[#0D131F] dark:via-[#0A0E17] dark:to-[#070A0F] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00E599] text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5" />
              Vendor Intelligence Matrix
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Supplier Risk & <span className="text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#00E599] dark:to-cyan-400">Sustainability Hub</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Auditing Tier 1–3 vendors for <span className="text-slate-800 dark:text-slate-200 font-semibold">{activeCompanyName}</span> context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} /> 
              {isRefreshing ? 'Syncing...' : 'Refresh'}
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00E599] dark:hover:bg-[#00C885] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Export Vendors
            </button>
          </div>
        </div>
      </div>

      {/* Analytical Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Critical Risk Vendors</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {criticalCount} {criticalCount === 1 ? 'Vendor' : 'Vendors'} Flagged
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Warning Compliance Alerts</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {warningCount} Action Required
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Roster Integrity</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {compliancePercentage}% Compliant
            </div>
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
              ref={searchInputRef}
              type="text"
              placeholder="Search vendor name, ID, or location..."
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
          {(['ALL', 'Compliant', 'Warning', 'Critical'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-emerald-500 dark:bg-[#00E599] text-white dark:text-slate-950 font-bold shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {status === 'ALL' ? 'All Vendors' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Matrix Table Structure */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A0E17] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-mono text-[11px] tracking-wider">
              <tr>
                <th className="p-5 pl-7">Vendor Structure</th>
                <th className="p-5">Operations Group</th>
                <th className="p-5">Origin Node</th>
                <th className="p-5">Carbon Intensity Index</th>
                <th className="p-5">Environmental Risk Vector</th>
                <th className="p-5 pr-7 text-right">Compliance Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 font-medium text-slate-700 dark:text-slate-300">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                          <Factory className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{supplier.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{supplier.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${
                        supplier.tier === 'Tier 1' 
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' 
                          : supplier.tier === 'Tier 2' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}>
                        {supplier.tier}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        {supplier.location}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supplier.carbonIntensity} <span className="text-[11px] text-slate-400 font-normal">kg/USD</span></span>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="w-full max-w-[140px]">
                        <div className="flex justify-between text-[11px] font-mono font-medium mb-1.5">
                          <span className="text-slate-400">Score</span>
                          <span className={supplier.riskScore > 75 ? 'text-rose-500 font-bold' : supplier.riskScore > 50 ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-[#00E599] font-bold'}>
                            {supplier.riskScore}/100
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              supplier.riskScore > 75 ? 'bg-rose-500' : 
                              supplier.riskScore > 50 ? 'bg-amber-500' : 
                              'bg-emerald-500 dark:bg-[#00E599]'
                            }`}
                            style={{ width: `${supplier.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-5 pr-7 text-right">
                      <button
                        onClick={() => handleSelectSupplier(supplier)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          supplier.status === 'Compliant' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] border-emerald-500/20 hover:bg-emerald-500/20' 
                            : supplier.status === 'Warning' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {supplier.status === 'Compliant' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {supplier.status === 'Warning' && <AlertTriangle className="h-3.5 w-3.5" />}
                        {supplier.status === 'Critical' && <ShieldAlert className="h-3.5 w-3.5" />}
                        {supplier.status}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    No matching supplier records found for &ldquo;{searchTerm}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Mitigation Slide-Over Drawer with Click-Outside Listener */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-all animate-fade-in">
          <div 
            ref={drawerRef}
            className="w-full max-w-lg bg-white dark:bg-[#0D131F] border-l border-slate-200 dark:border-slate-800 h-full p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#00E599]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">AI Vendor Decarbonization Plan</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedSupplier.id} • {selectedSupplier.tier}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSupplier(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-[#00E599]">
                    Vendor Analysis: {selectedSupplier.name}
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    Location: <span className="font-bold">{selectedSupplier.location}</span>. High emissions detected relative to sector benchmarks with a risk score of <span className="font-bold text-rose-500">{selectedSupplier.riskScore}/100</span>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block">Carbon Intensity</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block font-mono">
                      {selectedSupplier.carbonIntensity} kg/USD
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 block">Recommended Audit</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-[#00E599] mt-1 block font-mono">
                      Scope 3 Verification
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-6">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="w-full py-3.5 text-xs font-bold rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00E599] dark:hover:bg-[#00C885] text-white dark:text-slate-950 transition-all shadow-md active:scale-95"
              >
                Close Audit Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}