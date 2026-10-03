'use client';

import { useState } from 'react';
import { Cloud, Package, AlertTriangle, Leaf, type LucideIcon } from 'lucide-react';
import { useTelemetry } from '@/hooks/use-telemetry';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TelemetryTable } from '@/components/dashboard/telemetry-table';
import { AdviceDrawer } from '@/components/dashboard/advice-drawer';
import { type OverviewMetric } from '@/lib/dashboard/get-overview-metrics';

type ShipmentTelemetryExtended = NonNullable<ReturnType<typeof useTelemetry>['shipments']>[number];

interface TelemetrySectionProps {
  initialMetrics: OverviewMetric[];
}

const METRIC_PRESENTATION: Record<
  OverviewMetric['id'],
  { icon: LucideIcon; accent: 'emerald' | 'amber' | 'slate' }
> = {
  total_co2: { icon: Cloud, accent: 'slate' },
  active_shipments: { icon: Package, accent: 'slate' },
  high_risk_suppliers: { icon: AlertTriangle, accent: 'amber' },
  carbon_offsets: { icon: Leaf, accent: 'emerald' },
};

export function TelemetrySection({ initialMetrics }: TelemetrySectionProps) {
  // Use our optimized telemetry hook stream
  const { shipments, generateAIOptimizationAdvice, containerRef } = useTelemetry();

  // Active UI state to track the user's selected shipment for the slide-out panel
  const [selectedShipment, setSelectedShipment] = useState<ShipmentTelemetryExtended | null>(null);

  // Dynamically compute KPIs from the active live data pool
  const liveTotalCo2 = shipments.reduce((acc, curr) => acc + (curr.emissions_log?.co2_tonnes || 0), 0);
  const liveActiveCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'pending').length;
  const liveHighRiskCount = shipments.filter(s => s.supplier.risk_score > 70).length;

  // Map dynamic computations straight back into the presentational metric matrix layout shape
  const liveMetrics = initialMetrics.map((metric) => {
    switch (metric.id) {
      case 'total_co2':
        return { 
          ...metric, 
          value: liveTotalCo2 > 0 ? liveTotalCo2.toLocaleString('en-US', { maximumFractionDigits: 1 }) : metric.value 
        };
      case 'active_shipments':
        return { ...metric, value: liveTotalCo2 > 0 ? liveActiveCount.toString() : metric.value };
      case 'high_risk_suppliers':
        return { ...metric, value: liveTotalCo2 > 0 ? liveHighRiskCount.toString() : metric.value };
      default:
        return metric;
    }
  });

  return (
    <div className="space-y-8" ref={containerRef}>
      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((metric) => {
          const { icon, accent } = METRIC_PRESENTATION[metric.id];
          return <KpiCard key={metric.id} metric={metric} icon={icon} accent={accent} />;
        })}
      </div>

      {/* Main Stream Monitoring Table View Component */}
      <div className="mt-8">
        <TelemetryTable 
  shipments={shipments} 
  onRowClick={(shipment) => setSelectedShipment(shipment)}
  selectedShipment={selectedShipment} // Add this line here to close the loop!
  />
      </div>

      {/* Dynamic Slide-out AI Optimization Advice Drawer Panel */}
      <AdviceDrawer 
        shipment={selectedShipment} 
        isOpen={selectedShipment !== null}
        advice={selectedShipment ? generateAIOptimizationAdvice(selectedShipment) : null}
        onClose={() => setSelectedShipment(null)} 
      />
    </div>
  );
}