export type TransitMethod = 'air' | 'sea' | 'rail' | 'road';
export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed';

export interface Supplier {
  id: string;
  name: string;
  region: string;
  risk_score: number; // 0.00 - 100.00
  joined_at: string;
}

export interface Shipment {
  id: string;
  supplier_id: string;
  origin: string;
  destination: string;
  cargo_weight_kg: number;
  transit_type: TransitMethod;
  status: ShipmentStatus;
  departure_date: string;
  created_at: string;
}

export interface CalculationsMetadata {
  distance_km?: number;
  emission_factor_used?: number;
  efficiency_multiplier?: number;
  [key: string]: unknown;
}

export interface EmissionsLog {
  id: string;
  shipment_id: string;
  co2_tonnes: number;
  calculations_metadata_json: CalculationsMetadata;
  logged_at: string;
}

export interface ShipmentTelemetryExtended extends Shipment {
  supplier: Pick<Supplier, 'name' | 'risk_score'>;
  emissions_log: Pick<EmissionsLog, 'co2_tonnes' | 'calculations_metadata_json'> | null;
}