'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type {
  ShipmentTelemetryExtended,
  Shipment,
  Supplier,
  EmissionsLog,
  TransitMethod,
} from '@/types/database';

// Precise carbon coefficients (kg CO2 per km per kg of cargo)
const EMISSION_FACTORS: Record<TransitMethod, number> = {
  air: 0.0005,  // 0.5kg per tonne-km translated down to kg level
  sea: 0.00001, // Highly efficient maritime transport
  rail: 0.00002,
  road: 0.00012,
};

// `shipments` doesn't carry a distance_km column, so there's nothing in
// the INSERT payload to calculate against for a brand-new route. This is
// a stand-in lookup — same routes the old mock used — until the schema
// has a real distance source (a `distance_km` column, or a Postgres
// function/trigger that computes it server-side when a shipment lands).
const ROUTE_DISTANCE_KM: Record<string, number> = {
  'Shanghai (PVG)->Los Angeles (LAX)': 10400,
  'Rotterdam Port->New York (JFK)': 6200,
  'Frankfurt (FRA)->Singapore (SIN)': 10200,
  'Tokyo Haneda->London Heathrow': 9600,
};
const FALLBACK_DISTANCE_KM = 5000;

function resolveDistanceKm(origin: string, destination: string): number {
  return ROUTE_DISTANCE_KM[`${origin}->${destination}`] ?? FALLBACK_DISTANCE_KM;
}

// Keeps the live table from growing unbounded over a long session.
const MAX_VISIBLE_SHIPMENTS = 25;

// Raw shape returned by the initial embedded-select query below. The
// browser client isn't wired to generated Database types yet, so this
// is asserted at the query site rather than inferred — see the note
// in loadInitialShipments().
interface ShipmentQueryRow extends Shipment {
  supplier: Pick<Supplier, 'name' | 'risk_score'> | null;
  emissions_log: (Pick<EmissionsLog, 'co2_tonnes' | 'calculations_metadata_json'> & {
    logged_at: string;
  })[] | null;
}

export function useTelemetry() {
  const [shipments, setShipments] = useState<ShipmentTelemetryExtended[]>([]);
  // Unused internally, same as before — kept only so the hook's returned
  // shape doesn't change for any other consumer that might reference it.
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Created once via lazy initializer — passing createClient() directly to
  // useState (or useRef) would call it on every render; the function form
  // only runs on the first render.
  const [supabase] = useState(() => createClient());

  const calculateEmissions = useCallback(
    (weightKg: number, type: TransitMethod, distanceKm: number): number => {
      const totalKg = weightKg * distanceKm * EMISSION_FACTORS[type];
      return Math.round((totalKg / 1000) * 100) / 100; // Metric tonnes, 2dp
    },
    []
  );

  // Generates real-time architectural insights contextually
  const generateAIOptimizationAdvice = useCallback((shipment: ShipmentTelemetryExtended) => {
    if (shipment.transit_type === 'air') {
      return {
        recommendation: 'Intermodal Shift Recommended',
        action: `Route variant from ${shipment.origin} can be shifted to Ocean-Rail travel.`,
        impact: `Reduces projected scope-3 footprint by ~94.2% instantly.`,
        financials: 'Increases delivery window by 8 days; lowers transit cost allocation by 40%.',
      };
    }
    if (shipment.supplier.risk_score > 75) {
      return {
        recommendation: 'High-Risk Vendor Compliance Alert',
        action: 'Supplier risk index exceeds enterprise variance thresholds.',
        impact: 'Carbon reporting auditing accuracy flagged due to tier-3 reporting inconsistencies.',
        financials: 'Initiate offboarding procedures or schedule secondary environmental assessment.',
      };
    }
    return {
      recommendation: 'Nominal Efficiency Maintained',
      action: 'Current routing parameters fall well within target sustainability thresholds.',
      impact: 'Carbon offsets matching targets effectively neutralizes remaining tracking load.',
      financials: 'No immediate remediation steps required.',
    };
  }, []);

  // A fresh INSERT payload only carries columns from `shipments` itself —
  // no joined supplier, no emissions_log row (nothing's computed it yet).
  // This fetches the supplier and runs the same client-side carbon math
  // the mock used to, so the row lands in state already fully shaped as
  // ShipmentTelemetryExtended.
  const enrichShipment = useCallback(
    async (row: Shipment): Promise<ShipmentTelemetryExtended> => {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('name, risk_score')
        .eq('id', row.supplier_id)
        .single();

      if (error) {
        console.error('[useTelemetry] failed to load supplier for new shipment', error);
      }

      const distanceKm = resolveDistanceKm(row.origin, row.destination);
      const co2Tonnes = calculateEmissions(row.cargo_weight_kg, row.transit_type, distanceKm);

      return {
        ...row,
        supplier: (supplier as Pick<Supplier, 'name' | 'risk_score'> | null) ?? {
          name: 'Unknown Supplier',
          risk_score: 0,
        },
        emissions_log: {
          co2_tonnes: co2Tonnes,
          calculations_metadata_json: {
            distance_km: distanceKm,
            emission_factor_used: EMISSION_FACTORS[row.transit_type],
          },
        },
      };
    },
    [supabase, calculateEmissions]
  );

  useEffect(() => {
    let isMounted = true;

    // Realtime only streams changes that happen *after* you subscribe —
    // it won't hand you the table's current contents. So the first thing
    // this does is fetch whatever's already active, the same way any
    // normal page load would.
    async function loadInitialShipments() {
      const { data, error } = await supabase
        .from('shipments')
        .select(
          `*, supplier:suppliers(name, risk_score), emissions_log(co2_tonnes, calculations_metadata_json, logged_at)`
        )
        .in('status', ['pending', 'in_transit', 'delayed'])
        .order('created_at', { ascending: false })
        .limit(MAX_VISIBLE_SHIPMENTS);

      if (error) {
        console.error('[useTelemetry] failed to load initial shipments', error);
        return;
      }
      if (!isMounted || !data) return;

      // Asserted rather than inferred: without generated Database types,
      // the client can't know the shape of an embedded select on its own.
      // Run `supabase gen types typescript` and swap in the generated
      // Database type on createBrowserClient<Database>() to remove this.
      const rows = data as unknown as ShipmentQueryRow[];

      const normalized: ShipmentTelemetryExtended[] = rows.map((row) => {
        const logs = row.emissions_log ?? [];
        const latestLog = [...logs].sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];

        return {
          ...row,
          supplier: row.supplier ?? { name: 'Unknown Supplier', risk_score: 0 },
          emissions_log: latestLog
            ? {
                co2_tonnes: latestLog.co2_tonnes,
                calculations_metadata_json: latestLog.calculations_metadata_json,
              }
            : null,
        };
      });

      setShipments(normalized);
    }

    loadInitialShipments();

    // New shipments landing after mount, streamed in live.
    const channel: RealtimeChannel = supabase
      .channel('shipments-inserts')
      .on<Shipment>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shipments' },
        async (payload) => {
          const enriched = await enrichShipment(payload.new);
          if (!isMounted) return;

          setShipments((prev) => {
            if (prev.some((s) => s.id === enriched.id)) return prev;
            return [enriched, ...prev].slice(0, MAX_VISIBLE_SHIPMENTS);
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, enrichShipment]);

  return { shipments, generateAIOptimizationAdvice, containerRef };
}