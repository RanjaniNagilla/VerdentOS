'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useWorkspace } from '@/context/workspace-context';
import { 
  Truck, 
  Plane, 
  Ship, 
  Train, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  Search,
  Zap,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export interface ShipmentRecord {
  id: string;
  origin: string;
  destination: string;
  mode: 'Air' | 'Ocean' | 'Road' | 'Rail';
  status: 'Critical Risk' | 'Moderate Risk' | 'Optimal';
  carbonTons: number;
  co2Variance: string;
  carrier: string;
  eta: string;
}

// Multi-tenant shipment datasets mapped by activeWorkspaceId
const TENANT_SHIPMENTS: Record<string, ShipmentRecord[]> = {
  'nord-textiles-group': [
    { id: 'NTG-801', origin: 'Shanghai (PVG), CN', destination: 'Los Angeles (LAX), USA', mode: 'Air', status: 'Critical Risk', carbonTons: 42.5, co2Variance: '+24%', carrier: 'Pacific Air Freight', eta: '12h 40m' },
    { id: 'NTG-802', origin: 'Rotterdam Port, NL', destination: 'Hamburg Hub, DE', mode: 'Road', status: 'Moderate Risk', carbonTons: 12.8, co2Variance: '+8%', carrier: 'TransEurop Express', eta: '4h 15m' },
    { id: 'NTG-803', origin: 'Shenzhen, CN', destination: 'Singapore (SIN), SG', mode: 'Ocean', status: 'Optimal', carbonTons: 8.2, co2Variance: '-12%', carrier: 'Oceanic Global', eta: '2d 08h' },
    { id: 'NTG-804', origin: 'Yokohama, JP', destination: 'Seattle Port, USA', mode: 'Ocean', status: 'Critical Risk', carbonTons: 38.1, co2Variance: '+19%', carrier: 'Nippon Shipping', eta: '4d 18h' },
    { id: 'NTG-805', origin: 'Chicago Terminal, USA', destination: 'Toronto, CA', mode: 'Rail', status: 'Optimal', carbonTons: 4.5, co2Variance: '-5%', carrier: 'NorthRail Intermodal', eta: '1d 02h' },
  ],
  'aether-logistics-corp': [
    { id: 'ALC-301', origin: 'Frankfurt (FRA), DE', destination: 'Singapore (SIN), SG', mode: 'Air', status: 'Critical Risk', carbonTons: 68.4, co2Variance: '+31%', carrier: 'Aether ColdJet Express', eta: '8h 20m' },
    { id: 'ALC-302', origin: 'Busan Port, KR', destination: 'Long Beach, USA', mode: 'Ocean', status: 'Optimal', carbonTons: 19.3, co2Variance: '-14%', carrier: 'Pacific Reefer Line', eta: '6d 12h' },
    { id: 'ALC-303', origin: 'Milan, IT', destination: 'Paris, FR', mode: 'Road', status: 'Moderate Risk', carbonTons: 9.7, co2Variance: '+11%', carrier: 'EuroCold Haulage', eta: '9h 45m' },
    { id: 'ALC-304', origin: 'Dallas, USA', destination: 'Mexico City, MX', mode: 'Rail', status: 'Optimal', carbonTons: 6.1, co2Variance: '-8%', carrier: 'CrossBorder Rail', eta: '2d 04h' },
    { id: 'ALC-305', origin: 'Antwerp Port, BE', destination: 'Felixstowe, UK', mode: 'Ocean', status: 'Moderate Risk', carbonTons: 14.2, co2Variance: '+6%', carrier: 'North Sea Logistics', eta: '18h 30m' },
  ],
  'vanguard-industrial': [
    { id: 'VGI-501', origin: 'Duisburg Steel Yard, DE', destination: 'Katowice Plant, PL', mode: 'Rail', status: 'Critical Risk', carbonTons: 112.4, co2Variance: '+42%', carrier: 'HeavyIron Rail', eta: '1d 14h' },
    { id: 'VGI-502', origin: 'Houston Port, USA', destination: 'Santos Port, BR', mode: 'Ocean', status: 'Moderate Risk', carbonTons: 84.6, co2Variance: '+15%', carrier: 'Vanguard DeepSea', eta: '9d 06h' },
    { id: 'VGI-503', origin: 'Nagoya, JP', destination: 'Brisbane, AU', mode: 'Ocean', status: 'Optimal', carbonTons: 45.2, co2Variance: '-9%', carrier: 'Pacific Ore Carriers', eta: '7d 22h' },
    { id: 'VGI-504', origin: 'Ostrava, CZ', destination: 'Stuttgart, DE', mode: 'Road', status: 'Critical Risk', carbonTons: 28.9, co2Variance: '+22%', carrier: 'Atlas Heavy Freight', eta: '11h 10m' },
    { id: 'VGI-505', origin: 'Pittsburgh, USA', destination: 'Cleveland, USA', mode: 'Rail', status: 'Optimal', carbonTons: 11.0, co2Variance: '-4%', carrier: 'Midwest Freight Rail', eta: '14h 00m' },
  ]
};

export default function ShipmentsPage() {
  const { user } = useUser();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();

  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Critical Risk' | 'Moderate Risk' | 'Optimal'>('ALL');

  // Load tenant-specific dataset dynamically based on active workspace
  const shipments = TENANT_SHIPMENTS[activeWorkspaceId] || TENANT_SHIPMENTS['nord-textiles-group'];

  const handleOpenAdvice = async (shipment: ShipmentRecord) => {
    setSelectedShipment(shipment);
    setIsDrawerOpen(true);
    setIsLoading(true);
    setAdvice(null);

    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipment,
          workspaceId: activeWorkspaceId,
          workspaceName: activeWorkspace.name,
        }),
      });

      const data = await response.json();
      setAdvice(data);
    } catch (error) {
      console.error('Error fetching advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'ALL' || s.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const criticalCount = shipments.filter(s => s.status === 'Critical Risk').length;
  const avgCarbon = shipments.length > 0
    ? (shipments.reduce((acc, s) => acc + s.carbonTons, 0) / shipments.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 p-6 md:p-8 space-y-6 font-sans">
      
      {/* Top Banner Header */}
      <div className="relative rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900/10 via-slate-900/5 to-transparent dark:from-[#0D131F] dark:via-[#0A0E17] dark:to-[#070A0F] overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00E599] text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              Real-Time Carbon Telemetry Engine • {activeWorkspace.name}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Shipment <span className="text-emerald-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#00E599] dark:to-cyan-400">Emissions Matrix</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Active Monitoring for <span className="text-slate-800 dark:text-slate-200 font-semibold">{user?.fullName || user?.firstName || 'Abhijeet Raj Rana'}</span> • Select high-risk routes to trigger instant Gemini carbon mitigation strategies.
            </p>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-rose-500 text-xs font-medium">
                <ShieldAlert className="h-3.5 w-3.5" />
                Critical Routes
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{criticalCount} <span className="text-xs text-slate-400">Active</span></div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00E599] text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                Avg Route CO2
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{avgCarbon} <span className="text-xs text-slate-400">MT</span></div>
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
              type="text"
              placeholder="Search shipment, carrier, or route..."
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
          {(['ALL', 'Critical Risk', 'Moderate Risk', 'Optimal'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-emerald-500 dark:bg-[#00E599] text-white dark:text-slate-950 font-bold shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {filter === 'ALL' ? 'All Routes' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0D131F]/80 shadow-sm dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A0E17] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 uppercase font-mono text-[11px] tracking-wider">
              <tr>
                <th className="p-5 pl-7">Shipment</th>
                <th className="p-5">Route & Carrier</th>
                <th className="p-5">Transport Mode</th>
                <th className="p-5">Risk Status</th>
                <th className="p-5">Carbon Footprint</th>
                <th className="p-5">CO2 Variance</th>
                <th className="p-5 text-right pr-7">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50 font-medium text-slate-700 dark:text-slate-300">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 pl-7 font-mono font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-[#00E599] animate-pulse" />
                      {s.id}
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="text-slate-900 dark:text-slate-100 font-bold text-sm">{s.origin} → {s.destination}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{s.carrier} • ETA {s.eta}</div>
                  </td>

                  <td className="p-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {s.mode === 'Air' && <Plane className="h-3.5 w-3.5 text-sky-500" />}
                      {s.mode === 'Ocean' && <Ship className="h-3.5 w-3.5 text-blue-500" />}
                      {s.mode === 'Road' && <Truck className="h-3.5 w-3.5 text-amber-500" />}
                      {s.mode === 'Rail' && <Train className="h-3.5 w-3.5 text-purple-500" />}
                      {s.mode}
                    </span>
                  </td>

                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      s.status === 'Critical Risk' 
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                        : s.status === 'Moderate Risk'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-[#00E599] border border-emerald-500/20'
                    }`}>
                      {s.status === 'Critical Risk' && <AlertTriangle className="h-3.5 w-3.5" />}
                      {s.status === 'Optimal' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {s.status}
                    </span>
                  </td>

                  <td className="p-5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {s.carbonTons} <span className="text-slate-400 text-xs font-normal">Tons CO2</span>
                  </td>

                  <td className="p-5 font-mono font-bold">
                    <span className={s.co2Variance.startsWith('+') ? 'text-rose-500' : 'text-emerald-600 dark:text-[#00E599]'}>
                      {s.co2Variance}
                    </span>
                  </td>

                  <td className="p-5 text-right pr-7">
                    <button
                      onClick={() => handleOpenAdvice(s)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00E599] dark:hover:bg-[#00C885] text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Get AI Advice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Advice Slide-Over Drawer */}
      {isDrawerOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-all animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D131F] border-l border-slate-200 dark:border-slate-800 h-full p-8 overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#00E599]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Gemini AI Route Strategy</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedShipment.id} • {selectedShipment.carrier}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">Generating live carbon reduction plan...</p>
                </div>
              ) : advice ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-[#00E599]">
                      Tailored Route Strategy
                    </span>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {advice.recommendation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Carbon Reduction</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-[#00E599] mt-1 block font-mono">
                        {advice.carbonSavings}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400 block">Financial Savings</span>
                      <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1 block font-mono">
                        {advice.financialImpact}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Action Protocol
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {advice.actionSteps?.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-5 mt-6">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 text-xs font-bold rounded-2xl bg-emerald-500 hover:bg-emerald-600 dark:bg-[#00E599] dark:hover:bg-[#00C885] text-white dark:text-slate-950 transition-all shadow-md active:scale-95"
              >
                Apply Strategy To Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}