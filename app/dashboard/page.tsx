'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Factory,
  Zap,
  Globe2,
  Building2,
  Flag,
  RefreshCw,
  Loader2,
  Shirt,
  Droplet,
  Filter,
  Route,
  Plane,
  Snowflake,
  Gauge,
  Flame,
  Recycle,
  ShieldCheck,
  Thermometer,
  Info,
  ShieldAlert,
  Siren,
  CheckCircle2,
  PauseCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from 'lucide-react';
import { useWorkspace } from '@/context/workspace-context';
import { useSystemNotifications } from '@/hooks/use-system-notifications';
import { pushHeaderNotification } from '@/components/dashboard/header';
import { ScopeKpiCard } from '@/components/dashboard/scope-kpi-card';
import { SystemNotificationStack } from '@/components/dashboard/system-notification-stack';
import {
  TENANT_DATASETS,
  TIME_RANGES,
  TIME_RANGE_LABELS,
  TIME_RANGE_DAYS,
  computeScopeTotal,
  computeScopeTrendPercent,
  computeScopeSparkline,
  formatMetricValue,
  type TimeRange,
  type OperationalEvent,
  type EventSeverity,
  type EventStatus,
} from '@/lib/dashboard/tenant-datasets';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const DOMAIN_HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  'organic-cotton-ratio': Shirt,
  'water-degradation': Droplet,
  'dye-filtration': Filter,
  'supplier-emission-factor': Globe2,
  'routing-efficiency': Route,
  'jet-fuel-burn': Plane,
  'cold-chain-dropoff': Snowflake,
  'final-mile-score': Gauge,
  'blast-furnace-draw': Flame,
  'scrap-yield': Recycle,
  'carbon-capture': ShieldCheck,
  'coke-intensity': Thermometer,
};

const SEVERITY_CONFIG: Record<EventSeverity, { label: string; icon: LucideIcon; badgeClass: string }> = {
  info: {
    label: 'Info',
    icon: Info,
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  warning: {
    label: 'Warning',
    icon: ShieldAlert,
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  },
  critical: {
    label: 'Critical',
    icon: Siren,
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  },
};

const STATUS_CONFIG: Record<EventStatus, { label: string; dotClass: string; textClass: string }> = {
  pending_review: {
    label: 'Pending Review',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  validated: {
    label: 'Validated',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  flagged: {
    label: 'Flagged',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
  isolated: {
    label: 'Isolated',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-600 dark:text-slate-400',
  },
};

export default function DashboardOverviewPage() {
  const workspaceCtx = useWorkspace() as any;
  const { user: clerkUser } = useUser();
  const { notifications, triggerSystemNotification, dismissNotification } = useSystemNotifications();

  const activeWorkspace = workspaceCtx?.activeWorkspace;
  const activeWorkspaceId = workspaceCtx?.activeWorkspaceId;
  const workspaceUser = workspaceCtx?.user;

  const workspaceKey = (activeWorkspaceId || 'nord-textiles') as keyof typeof TENANT_DATASETS;

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [events, setEvents] = useState<OperationalEvent[]>(
    () => TENANT_DATASETS[workspaceKey]?.operationalEvents || []
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(() => new Date());

  // Extract raw user name, prioritizing Clerk auth context, then workspace context, falling back to 'Abhijeet'
  const rawFullName: string =
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    workspaceUser?.name ||
    workspaceUser?.displayName ||
    workspaceUser?.fullName ||
    workspaceCtx?.userName ||
    activeWorkspace?.userName ||
    activeWorkspace?.user?.name ||
    (workspaceUser?.email ? workspaceUser.email.split('@')[0] : '') ||
    'Abhijeet';

  const firstName = rawFullName.trim().split(/\s+/)[0] || 'Abhijeet';

  const dataset = TENANT_DATASETS[workspaceKey] || TENANT_DATASETS['nord-textiles'];

  useEffect(() => {
    if (TENANT_DATASETS[workspaceKey]) {
      setEvents(TENANT_DATASETS[workspaceKey].operationalEvents);
    }
    setTimeRange('24h');
  }, [activeWorkspaceId, workspaceKey]);

  const days = TIME_RANGE_DAYS[timeRange];

  const scopeCards = useMemo(() => {
    const configs: Array<{
      key: 'scope1' | 'scope2' | 'scope3';
      accent: 'slate' | 'amber' | 'emerald';
      icon: LucideIcon;
    }> = [
      { key: 'scope1', accent: 'slate', icon: Factory },
      { key: 'scope2', accent: 'amber', icon: Zap },
      { key: 'scope3', accent: 'emerald', icon: Globe2 },
    ];

    return configs.map(({ key, accent, icon }) => {
      const config = dataset[key];
      const total = computeScopeTotal(config, days);
      const trendPercent = computeScopeTrendPercent(config, days);
      const sparkline = computeScopeSparkline(config, days);

      return {
        id: `${activeWorkspaceId}-${key}`,
        label: config.label,
        subtitle: config.subtitle,
        value: formatMetricValue(total),
        unit: config.unit,
        deltaPercent: Number(trendPercent.toFixed(1)),
        goodDirection: config.goodDirection,
        trend: sparkline,
        accent,
        icon,
      };
    });
  }, [dataset, days, activeWorkspaceId]);

  const handleTriggerSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      setLastSyncedAt(new Date());
      setIsSyncing(false);

      const title = 'Real-time sync complete';
      const detail = `Datasets refreshed for ${activeWorkspace?.name || 'Workspace'} by ${firstName}.`;

      // Trigger standard system toast
      triggerSystemNotification(title, 'success', detail);

      // Push to Header Bell dropdown
      pushHeaderNotification({
        title,
        detail,
      });
    }, 1400);
  };

  const handleFlagComplianceVariance = () => {
    const flaggedEvent: OperationalEvent = {
      id: `evt_flag_${Date.now()}`,
      title: `Manual Compliance Variance Flag — ${activeWorkspace?.name || 'Workspace'}`,
      metricLabel: `Escalated for review by ${firstName}`,
      severity: 'critical',
      status: 'flagged',
      loggedAt: new Date().toISOString(),
    };
    setEvents((prev) => [flaggedEvent, ...prev]);

    const title = 'Compliance variance flagged';
    const detail = `${activeWorkspace?.name || 'Workspace'} Scope 3 telemetry escalated for manual review by ${firstName}.`;

    // Trigger toast notification
    triggerSystemNotification(title, 'warning', detail);

    // Push to Header Bell dropdown
    pushHeaderNotification({
      title,
      detail,
    });
  };

  const handleApprove = (eventId: string) => {
    const target = events.find((event) => event.id === eventId);
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, status: 'validated' } : event))
    );

    const title = 'Validation approved';
    const detail = target ? `"${target.title}" marked as validated by ${firstName}.` : `Approved by ${firstName}`;

    // Trigger toast notification
    triggerSystemNotification(title, 'success', detail);

    // Push to Header Bell dropdown
    pushHeaderNotification({
      title,
      detail,
    });
  };

  const handleIsolate = (eventId: string) => {
    const target = events.find((event) => event.id === eventId);
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, status: 'isolated' } : event))
    );

    const title = 'Record isolated';
    const detail = target ? `"${target.title}" isolated from active reporting by ${firstName}.` : `Isolated by ${firstName}`;

    // Trigger toast notification
    triggerSystemNotification(title, 'warning', detail);

    // Push to Header Bell dropdown
    pushHeaderNotification({
      title,
      detail,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top header panel */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 ease-in-out dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-500/[0.02] via-transparent to-emerald-500/[0.02] dark:from-white/[0.03]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {getGreeting()}, {firstName}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              {activeWorkspace?.name}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
              {activeWorkspace?.industryLabel}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
              Last synced{' '}
              {lastSyncedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFlagComplianceVariance}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
            >
              <Flag className="h-4 w-4" strokeWidth={2} />
              Flag Compliance Variance
            </button>
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <RefreshCw className="h-4 w-4" strokeWidth={2} />
              )}
              {isSyncing ? 'Syncing…' : 'Trigger Real-time Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* Time-range filter */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white p-1 shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/60">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setTimeRange(range)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              timeRange === range
                ? 'bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
          >
            {TIME_RANGE_LABELS[range]}
          </button>
        ))}
      </div>

      {/* Primary analytics KPI grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {scopeCards.map((card) => (
          <ScopeKpiCard key={card.id} {...card} />
        ))}
      </div>

      {/* Domain signal metrics */}
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Domain Signal Metrics
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
          Point-in-time indicators specific to {activeWorkspace?.industryLabel?.toLowerCase() || 'industry'}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dataset.domainHighlights.map((highlight: any) => {
            const HighlightIcon = DOMAIN_HIGHLIGHT_ICONS[highlight.id] ?? Gauge;
            const isGood =
              (highlight.trendPercent >= 0 && highlight.goodDirection === 'up') ||
              (highlight.trendPercent < 0 && highlight.goodDirection === 'down');
            const DeltaIcon =
              highlight.trendPercent === 0 ? Minus : highlight.trendPercent > 0 ? TrendingUp : TrendingDown;

            return (
              <div
                key={highlight.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-all duration-200 dark:bg-slate-800 dark:text-slate-300">
                    <HighlightIcon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      isGood ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    <DeltaIcon className="h-3 w-3" strokeWidth={2.5} />
                    {Math.abs(highlight.trendPercent).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-3 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                  {highlight.value}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{highlight.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active operational queue */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Operational Queue
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
              {events.length} events tracked for {activeWorkspace?.name}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-950/30">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Event
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Metric
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Severity
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {events.map((event) => {
                const severity = SEVERITY_CONFIG[event.severity];
                const SeverityIcon = severity.icon;
                const status = STATUS_CONFIG[event.status];
                const canAct = event.status === 'pending_review';

                return (
                  <tr
                    key={event.id}
                    className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
                        {new Date(event.loggedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {event.metricLabel}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                          severity.badgeClass
                        } ${event.severity === 'critical' ? 'animate-pulse' : ''}`}
                      >
                        <SeverityIcon className="h-3 w-3" strokeWidth={2.5} />
                        {severity.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.textClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(event.id)}
                          disabled={!canAct}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Approve Validation
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIsolate(event.id)}
                          disabled={!canAct}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                        >
                          <PauseCircle className="h-3.5 w-3.5" strokeWidth={2} />
                          Isolate Record
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SystemNotificationStack notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
}