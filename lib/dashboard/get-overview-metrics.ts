export interface OverviewMetric {
  id: 'total_co2' | 'active_shipments' | 'high_risk_suppliers' | 'carbon_offsets';
  label: string;
  value: string;
  unit: string;
  deltaPercent: number;
  goodDirection: 'up' | 'down';
  trend: number[];
}

export interface OverviewMetrics {
  metrics: OverviewMetric[];
  lastSyncedAt: string;
}

/**
 * Returns the four headline KPIs for the dashboard overview.
 *
 * This is mock data shaped exactly like what you'd hand back from Supabase,
 * so swapping it out later is a drop-in replacement. A real implementation
 * would look roughly like:
 *
 *   const supabase = createServerComponentClient();
 *
 *   const { data: co2 } = await supabase
 *     .from('emissions_log')
 *     .select('co2_tonnes, logged_at')
 *     .gte('logged_at', startOfPeriod);
 *
 *   const { data: shipments } = await supabase
 *     .from('shipments')
 *     .select('id, status')
 *     .eq('status', 'in_transit');
 *
 *   const { data: suppliers } = await supabase
 *     .from('suppliers')
 *     .select('id, risk_score')
 *     .gte('risk_score', 70);
 *
 * ...then reduce those rows into the same `OverviewMetric[]` shape below,
 * ideally inside a Postgres view or RPC so the aggregation happens in the
 * database rather than in JS.
 */
export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  return {
    lastSyncedAt: new Date().toISOString(),
    metrics: [
      {
        id: 'total_co2',
        label: 'Total CO2 Tonnes',
        value: '18,240.6',
        unit: 't CO2e',
        deltaPercent: -6.4,
        goodDirection: 'down',
        trend: [640, 615, 632, 598, 570, 560, 542, 528],
      },
      {
        id: 'active_shipments',
        label: 'Active Shipments',
        value: '312',
        unit: 'in transit',
        deltaPercent: 8.1,
        goodDirection: 'up',
        trend: [210, 224, 231, 240, 265, 278, 296, 312],
      },
      {
        id: 'high_risk_suppliers',
        label: 'High-Risk Suppliers',
        value: '14',
        unit: 'of 186 audited',
        deltaPercent: -12.5,
        goodDirection: 'down',
        trend: [22, 21, 19, 18, 17, 16, 15, 14],
      },
      {
        id: 'carbon_offsets',
        label: 'Carbon Offsets',
        value: '4,802',
        unit: 't CO2e retired',
        deltaPercent: 15.3,
        goodDirection: 'up',
        trend: [2800, 3100, 3400, 3650, 3900, 4200, 4500, 4802],
      },
    ],
  };
}