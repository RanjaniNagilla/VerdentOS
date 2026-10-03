import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from './sparkline';
import type { GoodDirection } from '@/lib/dashboard/tenant-datasets';

type Accent = 'emerald' | 'amber' | 'slate';

// Static, fully-spelled-out class strings so Tailwind's compiler can see
// and generate them — never build these with `bg-${accent}-500/10`.
const ACCENT_CHIP: Record<Accent, string> = {
  emerald:
    'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600 ring-1 ring-inset ring-emerald-500/30 dark:from-emerald-500/20 dark:text-emerald-400',
  amber:
    'bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 ring-1 ring-inset ring-amber-500/30 dark:from-amber-500/20 dark:text-amber-400',
  slate:
    'bg-gradient-to-br from-slate-500/15 to-slate-500/5 text-slate-600 ring-1 ring-inset ring-slate-500/30 dark:from-slate-500/20 dark:text-slate-300',
};

interface ScopeKpiCardProps {
  id: string;
  label: string;
  subtitle: string;
  value: string;
  unit: string;
  deltaPercent: number;
  goodDirection: GoodDirection;
  trend: number[];
  accent: Accent;
  icon: LucideIcon;
}

export function ScopeKpiCard({
  id,
  label,
  subtitle,
  value,
  unit,
  deltaPercent,
  goodDirection,
  trend,
  accent,
  icon: Icon,
}: ScopeKpiCardProps) {
  const isGood =
    (deltaPercent >= 0 && goodDirection === 'up') || (deltaPercent < 0 && goodDirection === 'down');
  const DeltaIcon = deltaPercent === 0 ? Minus : deltaPercent > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:backdrop-blur-xl dark:hover:border-slate-700 dark:hover:shadow-[0_16px_40px_rgb(0,0,0,0.5)]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-black/[0.015] via-transparent to-transparent dark:from-white/[0.04]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600">{subtitle}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_CHIP[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-500">{unit}</span>
      </div>

      <div className="relative mt-3 flex items-center gap-1.5">
        <span
          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out ${
            isGood
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />
          {Math.abs(deltaPercent).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500">vs. prior period</span>
      </div>

      <div className="relative mt-4">
        <Sparkline id={id} data={trend} accent={accent} />
      </div>
    </div>
  );
}