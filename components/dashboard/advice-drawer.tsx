'use client';

import { useEffect } from 'react';
import {
  X,
  Sparkles,
  Route,
  Gauge,
  Wallet,
  ShieldAlert,
  CheckCircle2,
  Package,
  Cloud,
} from 'lucide-react';
import type { ShipmentTelemetryExtended } from '@/types/database';

interface Advice {
  recommendation: string;
  action: string;
  impact: string;
  financials: string;
}

interface AdviceDrawerProps {
  isOpen: boolean;
  shipment: ShipmentTelemetryExtended | null;
  advice: Advice | null;
  onClose: () => void;
}

type Tone = 'opportunity' | 'alert' | 'nominal';

// Mirrors the same branch order as useTelemetry's generateAIOptimizationAdvice,
// purely to pick a badge/icon — the advice copy itself still comes from the hook.
function getTone(shipment: ShipmentTelemetryExtended): Tone {
  if (shipment.transit_type === 'air') return 'opportunity';
  if (shipment.supplier.risk_score > 75) return 'alert';
  return 'nominal';
}

const TONE_CONFIG: Record<
  Tone,
  { badge: string; badgeClass: string; icon: typeof Sparkles; iconClass: string }
> = {
  opportunity: {
    badge: 'Efficiency Opportunity',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30',
    icon: Route,
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  alert: {
    badge: 'Compliance Alert',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-amber-400 ring-1 ring-inset ring-red-500/30 dark:ring-amber-500/30',
    icon: ShieldAlert,
    iconClass: 'text-red-600 dark:text-amber-400',
  },
  nominal: {
    badge: 'Nominal',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/30',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function AdviceDrawer({ isOpen, shipment, advice, onClose }: AdviceDrawerProps) {
  // Escape-to-close, and lock background scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const tone = shipment ? getTone(shipment) : 'nominal';
  const toneConfig = TONE_CONFIG[tone];
  const ToneIcon = toneConfig.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI carbon mitigation advice"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {shipment && advice && (
          <>
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 dark:border-slate-800/80 px-6 py-5">
              <div>
                <p className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {shipment.id}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {shipment.origin} <span className="text-slate-400 dark:text-slate-600">→</span> {shipment.destination}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close advice panel"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* AI agent eyebrow + tone badge */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-emerald-500/5 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-500/30">
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  AI Agent · Carbon Mitigation
                </span>
              </div>

              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${toneConfig.badgeClass}`}>
                <ToneIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {toneConfig.badge}
              </div>

              <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-slate-50">
                {advice.recommendation}
              </h3>

              {/* Advice detail cards */}
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Route className="h-3.5 w-3.5" strokeWidth={2} />
                    Action
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{advice.action}</p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
                    Impact
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{advice.impact}</p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
                    Financials
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{advice.financials}</p>
                </div>
              </div>

              {/* Live shipment stats recap */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Package className="h-3.5 w-3.5" strokeWidth={2} />
                    Cargo Weight
                  </div>
                  <p className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {shipment.cargo_weight_kg.toLocaleString('en-US')}
                    <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">kg</span>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Cloud className="h-3.5 w-3.5" strokeWidth={2} />
                    Emissions
                  </div>
                  <p className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {shipment.emissions_log?.co2_tonnes.toFixed(2) ?? '—'}
                    <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">t CO2e</span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}