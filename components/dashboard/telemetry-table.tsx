'use client';

import { useState, useEffect } from 'react';
import {
  Plane,
  Ship,
  TrainFront,
  Truck,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type {
  ShipmentTelemetryExtended,
  ShipmentStatus,
  TransitMethod,
} from '@/types/database';

const HIGH_RISK_THRESHOLD = 75;

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; dotClass: string; textClass: string; ping: boolean }
> = {
  in_transit: { label: 'In Transit', dotClass: 'bg-emerald-400', textClass: 'text-emerald-400', ping: true },
  delayed: { label: 'Delayed', dotClass: 'bg-amber-400', textClass: 'text-amber-400', ping: true },
  pending: { label: 'Pending', dotClass: 'bg-amber-300/70', textClass: 'text-amber-300/80', ping: false },
  delivered: { label: 'Delivered', dotClass: 'bg-slate-400', textClass: 'text-slate-400', ping: false },
};

const TRANSIT_CONFIG: Record<TransitMethod, { icon: LucideIcon; label: string }> = {
  air: { icon: Plane, label: 'Air' },
  sea: { icon: Ship, label: 'Sea' },
  rail: { icon: TrainFront, label: 'Rail' },
  road: { icon: Truck, label: 'Road' },
};

function StatusIndicator({ status }: { status: ShipmentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dotClass}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotClass}`} />
      </span>
      <span className={`text-xs font-medium ${config.textClass}`}>{config.label}</span>
    </span>
  );
}

interface TelemetryRowProps {
  shipment: ShipmentTelemetryExtended;
  isSelected: boolean;
  onRowClick: (shipment: ShipmentTelemetryExtended) => void;
}

function TelemetryRow({ shipment, isSelected, onRowClick }: TelemetryRowProps) {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const transit = TRANSIT_CONFIG[shipment.transit_type];
  const TransitIcon = transit.icon;
  const isHighRisk = shipment.supplier.risk_score > HIGH_RISK_THRESHOLD;

  const bgClass = isSelected
    ? 'bg-emerald-500/[0.08] border-l-2 border-emerald-500'
    : hasEntered
      ? 'bg-transparent hover:bg-slate-800/40'
      : 'bg-emerald-500/10';

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onRowClick(shipment)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRowClick(shipment);
        }
      }}
      className={`group cursor-pointer outline-none transition-all duration-700 ease-out focus-visible:bg-slate-800/50 ${bgClass} ${
        hasEntered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-slate-100">
          {shipment.origin} <span className="text-slate-600">→</span> {shipment.destination}
        </p>
        <p className="mt-0.5 font-mono text-xs text-slate-500">{shipment.id}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-300">{shipment.supplier.name}</p>
        <p className={`mt-0.5 text-xs ${isHighRisk ? 'text-amber-400' : 'text-slate-500'}`}>
          Risk {shipment.supplier.risk_score.toFixed(1)}
        </p>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
          <TransitIcon className="h-4 w-4 text-slate-500" strokeWidth={2} />
          {transit.label}
        </span>
      </td>
      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-slate-300">
        {shipment.cargo_weight_kg.toLocaleString('en-US')} kg
      </td>
      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-slate-100">
        {shipment.emissions_log?.co2_tonnes ? shipment.emissions_log.co2_tonnes.toFixed(2) : '—'}
      </td>
      <td className="px-4 py-4">
        <StatusIndicator status={shipment.status} />
      </td>
      <td className="px-4 py-4">
        <ChevronRight
          className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400"
          strokeWidth={2}
        />
      </td>
    </tr>
  );
}

interface TelemetryTableProps {
  shipments: ShipmentTelemetryExtended[];
  onRowClick: (shipment: ShipmentTelemetryExtended) => void;
  selectedShipment?: ShipmentTelemetryExtended | null;
}

export function TelemetryTable({ shipments, onRowClick, selectedShipment }: TelemetryTableProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.35)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />

      <div className="relative flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Active Shipments Feed</h2>
          <p className="mt-0.5 text-xs text-slate-500">Click a row terminal entry for mitigation metrics</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800/80">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Route</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Supplier</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Transit</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Cargo</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">CO2 (t)</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {shipments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                  Connecting to live telemetry feed…
                </td>
              </tr>
            )}

            {shipments.map((shipment) => (
              <TelemetryRow
                key={shipment.id}
                shipment={shipment}
                isSelected={selectedShipment ? shipment.id === selectedShipment.id : false}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}