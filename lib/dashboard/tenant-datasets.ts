import type { WorkspaceId } from '@/context/workspace-context';

export type TimeRange = '24h' | '7d' | '30d' | 'all';

export const TIME_RANGES: TimeRange[] = ['24h', '7d', '30d', 'all'];

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  all: 'All Time',
};

// How many days each range represents — the unit the recalculation math
// below compounds over. "All Time" is pinned to ~6 months of platform
// history rather than being literally unbounded.
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  all: 180,
};

export type GoodDirection = 'up' | 'down';

export interface ScopeMetricConfig {
  label: string;
  subtitle: string;
  unit: string;
  // Average daily figure at the most recent day.
  baseDailyValue: number;
  // Fractional daily compounding rate — negative means the daily figure
  // has been shrinking day over day (good for an emissions metric),
  // positive means it's been growing.
  dailyTrendRate: number;
  goodDirection: GoodDirection;
}

export interface DomainHighlight {
  id: string;
  label: string;
  value: string;
  trendPercent: number;
  goodDirection: GoodDirection;
}

export type EventSeverity = 'info' | 'warning' | 'critical';
export type EventStatus = 'pending_review' | 'validated' | 'flagged' | 'isolated';

export interface OperationalEvent {
  id: string;
  title: string;
  metricLabel: string;
  severity: EventSeverity;
  status: EventStatus;
  loggedAt: string;
}

export interface TenantDataset {
  workspaceId: WorkspaceId;
  scope1: ScopeMetricConfig;
  scope2: ScopeMetricConfig;
  scope3: ScopeMetricConfig;
  domainHighlights: DomainHighlight[];
  operationalEvents: OperationalEvent[];
}

export const TENANT_DATASETS: Record<WorkspaceId, TenantDataset> = {
  'nord-textiles': {
    workspaceId: 'nord-textiles',
    scope1: {
      label: 'Scope 1',
      subtitle: 'Direct Emissions',
      unit: 't CO2e',
      baseDailyValue: 42.8,
      dailyTrendRate: -0.004,
      goodDirection: 'down',
    },
    scope2: {
      label: 'Scope 2',
      subtitle: 'Purchased Grid Power',
      unit: 't CO2e',
      baseDailyValue: 118.5,
      dailyTrendRate: 0.002,
      goodDirection: 'down',
    },
    scope3: {
      label: 'Scope 3',
      subtitle: 'Value Chain Telemetry',
      unit: 't CO2e',
      baseDailyValue: 612.4,
      dailyTrendRate: -0.006,
      goodDirection: 'down',
    },
    domainHighlights: [
      { id: 'organic-cotton-ratio', label: 'Organic Cotton Ratio', value: '62.4%', trendPercent: 3.1, goodDirection: 'up' },
      { id: 'water-degradation', label: 'Water Degradation Index', value: '38.2 NTU', trendPercent: -4.6, goodDirection: 'down' },
      { id: 'dye-filtration', label: 'Indigo Dye Filtration Efficacy', value: '94.1%', trendPercent: 1.8, goodDirection: 'up' },
      { id: 'supplier-emission-factor', label: 'Avg. Supplier Emission Factor', value: '1.84 kg/kg', trendPercent: -2.4, goodDirection: 'down' },
    ],
    operationalEvents: [
      { id: 'evt_nt_1', title: 'Indigo Dye Filtration — Facility 3', metricLabel: '91.2% efficacy (threshold 93%)', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-20T05:12:00.000Z' },
      { id: 'evt_nt_2', title: 'Water Degradation Spike — Effluent Line 2', metricLabel: '51.6 NTU (baseline 38.2 NTU)', severity: 'critical', status: 'pending_review', loggedAt: '2026-07-20T03:47:00.000Z' },
      { id: 'evt_nt_3', title: 'Organic Cotton Batch Verification — Lot #4471', metricLabel: '62.8% organic content confirmed', severity: 'info', status: 'validated', loggedAt: '2026-07-19T22:03:00.000Z' },
      { id: 'evt_nt_4', title: 'Synthetic Polyester Overrun — Line 5', metricLabel: '+12.4% vs. planned blend ratio', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-19T18:26:00.000Z' },
      { id: 'evt_nt_5', title: 'Scope 3 Supplier Audit — Meridian Fabrics Co-op', metricLabel: 'Emission factor 2.31 kg/kg (flagged)', severity: 'critical', status: 'flagged', loggedAt: '2026-07-19T09:14:00.000Z' },
    ],
  },
  'aether-logistics': {
    workspaceId: 'aether-logistics',
    scope1: {
      label: 'Scope 1',
      subtitle: 'Direct Emissions',
      unit: 't CO2e',
      baseDailyValue: 284.6,
      dailyTrendRate: -0.003,
      goodDirection: 'down',
    },
    scope2: {
      label: 'Scope 2',
      subtitle: 'Purchased Grid Power',
      unit: 't CO2e',
      baseDailyValue: 34.2,
      dailyTrendRate: 0.001,
      goodDirection: 'down',
    },
    scope3: {
      label: 'Scope 3',
      subtitle: 'Value Chain Telemetry',
      unit: 't CO2e',
      baseDailyValue: 891.3,
      dailyTrendRate: 0.0015,
      goodDirection: 'down',
    },
    domainHighlights: [
      { id: 'routing-efficiency', label: 'Routing Efficiency Index', value: '87.3%', trendPercent: 2.2, goodDirection: 'up' },
      { id: 'jet-fuel-burn', label: 'Jet Fuel Burn Volume', value: '428.6k L/wk', trendPercent: -1.4, goodDirection: 'down' },
      { id: 'cold-chain-dropoff', label: 'Cold-Chain Sensor Drop-off Rate', value: '2.1%', trendPercent: -0.9, goodDirection: 'down' },
      { id: 'final-mile-score', label: 'Final-Mile Optimization Score', value: '79.6', trendPercent: 1.1, goodDirection: 'up' },
    ],
    operationalEvents: [
      { id: 'evt_al_1', title: 'Cold-Chain Sensor Dropout — Reefer Unit R-114', metricLabel: 'Signal lost 42 min (route SEA→DEN)', severity: 'critical', status: 'pending_review', loggedAt: '2026-07-20T06:02:00.000Z' },
      { id: 'evt_al_2', title: 'Final-Mile Route Deviation — Hub 7', metricLabel: 'Optimization score dipped to 71.2', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-20T01:19:00.000Z' },
      { id: 'evt_al_3', title: 'Jet Fuel Burn Anomaly — Flight AL-2291', metricLabel: '+8.6% burn vs. flight plan', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-19T20:41:00.000Z' },
      { id: 'evt_al_4', title: 'Routing Efficiency Recovery — Corridor 12', metricLabel: 'Efficiency index back to 89.1%', severity: 'info', status: 'validated', loggedAt: '2026-07-19T14:57:00.000Z' },
      { id: 'evt_al_5', title: 'Cold-Chain Compliance Audit — Partner Carrier Frostline', metricLabel: 'Drop-off rate 4.8% (flagged)', severity: 'critical', status: 'flagged', loggedAt: '2026-07-19T08:33:00.000Z' },
    ],
  },
  'vanguard-industrial': {
    workspaceId: 'vanguard-industrial',
    scope1: {
      label: 'Scope 1',
      subtitle: 'Direct Emissions',
      unit: 't CO2e',
      baseDailyValue: 1240.8,
      dailyTrendRate: -0.0025,
      goodDirection: 'down',
    },
    scope2: {
      label: 'Scope 2',
      subtitle: 'Purchased Grid Power',
      unit: 't CO2e',
      baseDailyValue: 968.4,
      dailyTrendRate: -0.001,
      goodDirection: 'down',
    },
    scope3: {
      label: 'Scope 3',
      subtitle: 'Value Chain Telemetry',
      unit: 't CO2e',
      baseDailyValue: 402.7,
      dailyTrendRate: 0.002,
      goodDirection: 'down',
    },
    domainHighlights: [
      { id: 'blast-furnace-draw', label: 'Blast Furnace Grid Draw', value: '18.4 MWh/day', trendPercent: -1.6, goodDirection: 'down' },
      { id: 'scrap-yield', label: 'Alloy Scrap Processing Yield', value: '91.6%', trendPercent: 1.3, goodDirection: 'up' },
      { id: 'carbon-capture', label: 'Carbon Capture Scrub Efficacy', value: '78.3%', trendPercent: 2.7, goodDirection: 'up' },
      { id: 'coke-intensity', label: 'Metallurgical Coke Intensity', value: '612 kg/t steel', trendPercent: -0.8, goodDirection: 'down' },
    ],
    operationalEvents: [
      { id: 'evt_vi_1', title: 'Blast Furnace #2 Grid Draw Spike', metricLabel: '22.1 MWh/day (baseline 18.4)', severity: 'critical', status: 'pending_review', loggedAt: '2026-07-20T04:28:00.000Z' },
      { id: 'evt_vi_2', title: 'Carbon Capture Scrub Efficacy Dip — Unit C', metricLabel: '71.4% (threshold 75%)', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-20T00:52:00.000Z' },
      { id: 'evt_vi_3', title: 'Alloy Scrap Processing Yield Improvement — Line 2', metricLabel: '93.8% yield achieved', severity: 'info', status: 'validated', loggedAt: '2026-07-19T19:36:00.000Z' },
      { id: 'evt_vi_4', title: 'Metallurgical Coke Intensity Review — Furnace #1', metricLabel: '634 kg/t (target 600 kg/t)', severity: 'warning', status: 'pending_review', loggedAt: '2026-07-19T15:04:00.000Z' },
      { id: 'evt_vi_5', title: 'Structural Alloy Batch Isolation — Lot #7782', metricLabel: 'Contaminant trace detected', severity: 'critical', status: 'isolated', loggedAt: '2026-07-19T07:22:00.000Z' },
    ],
  },
};

/**
 * Sums a metric's daily figure across `days`, compounding `dailyTrendRate`
 * forward from `baseDailyValue`. Stands in for a real time-bucketed SQL
 * aggregation (e.g. `sum(co2_tonnes) where logged_at > now() - interval`)
 * — deterministic, not random, so switching ranges always recalculates
 * consistently rather than reshuffling numbers.
 */
export function computeScopeTotal(config: ScopeMetricConfig, days: number): number {
  let total = 0;
  let dayValue = config.baseDailyValue;
  for (let day = 0; day < days; day += 1) {
    total += dayValue;
    dayValue *= 1 + config.dailyTrendRate;
  }
  return total;
}

/**
 * Percent change between the selected period's total and the immediately
 * preceding period of equal length, both derived from the same compounding
 * rate — so a metric with a negative dailyTrendRate always reports a
 * negative (improving) trend, regardless of which range is selected.
 */
export function computeScopeTrendPercent(config: ScopeMetricConfig, days: number): number {
  const currentTotal = computeScopeTotal(config, days);
  const priorPeriodStartValue = config.baseDailyValue / Math.pow(1 + config.dailyTrendRate, days);
  let priorTotal = 0;
  let dayValue = priorPeriodStartValue;
  for (let day = 0; day < days; day += 1) {
    priorTotal += dayValue;
    dayValue *= 1 + config.dailyTrendRate;
  }
  if (priorTotal === 0) return 0;
  return ((currentTotal - priorTotal) / priorTotal) * 100;
}

/**
 * Samples the metric's per-day (not cumulative) value across the selected
 * range into a fixed number of points, for the KPI card's sparkline. Using
 * the per-day figure rather than a running total means the line actually
 * slopes in the direction the metric is trending, instead of always
 * climbing (a cumulative sum only ever goes up).
 */
export function computeScopeSparkline(config: ScopeMetricConfig, days: number, points = 8): number[] {
  const bucketCount = Math.max(2, Math.min(points, days));
  const daysPerBucket = days / bucketCount;
  const sparkline: number[] = [];

  let dayValue = config.baseDailyValue / Math.pow(1 + config.dailyTrendRate, days);
  let currentDay = 0;

  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const targetDay = Math.floor((bucket + 0.5) * daysPerBucket);
    while (currentDay < targetDay) {
      dayValue *= 1 + config.dailyTrendRate;
      currentDay += 1;
    }
    sparkline.push(Number(dayValue.toFixed(2)));
  }

  return sparkline;
}

export function formatMetricValue(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}