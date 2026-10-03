import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Sparkline } from './sparkline';
import type { OverviewMetric } from '@/lib/dashboard/get-overview-metrics';

type Accent = 'emerald' | 'amber' | 'slate';

// Static, fully-spelled-out class strings — again, so Tailwind's compiler
// can actually see and generate them. Never build these with template
// literals like `bg-${accent}-500/10`.
const ACCENT_CHIP: Record<Accent, string> = {
  emerald: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 ring-1 ring-inset ring-emerald-500/30',
  amber: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 ring-1 ring-inset ring-amber-500/30',
  slate: 'bg-gradient-to-br from-slate-500/20 to-slate-500/5 text-slate-300 ring-1 ring-inset ring-slate-500/30',
};

interface KpiCardProps {
  metric: OverviewMetric;
  icon: LucideIcon;
  accent: Accent;
}

export function KpiCard({ metric, icon: Icon, accent }: KpiCardProps) {
  const { label, value, unit, deltaPercent, goodDirection, trend, id } = metric;

  const isGood =
    (deltaPercent >= 0 && goodDirection === 'up') || (deltaPercent < 0 && goodDirection === 'down');
  const DeltaIcon = deltaPercent === 0 ? Minus : deltaPercent > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-[0_16px_40px_rgb(0,0,0,0.5)]">
      {/* Glassy sheen — the "3D" cue, kept subtle and consistent everywhere */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />

      <div className="relative flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_CHIP[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-slate-50">
          {value}
        </span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>

      <div className="relative mt-3 flex items-center gap-1.5">
        <span
          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
            isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}
        >
          <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />
          {Math.abs(deltaPercent).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-500">vs. last period</span>
      </div>

      <div className="relative mt-4">
        <Sparkline id={id} data={trend} accent={accent} />
      </div>
    </div>
  );
}