export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ObjectPassport {
  name: string;
  region: string;
  resource_type: string;
  water_type: string;
  fauna: boolean;
  passport_date: string;
  condition: number;
  coordinates: Coordinates;
  risk_score: number;
  priority_score: number;
}

export interface SummaryMetrics {
  total_objects: number;
  avg_risk: number;
  critical_objects: number;
  avg_condition: number;
  avg_passport_age: number;
  fauna_count: number;
}

export interface ClusterInfo {
  cluster_id: number;
  cluster_risk_mean: number;
  count: number;
  condition_avg: number;
  critical_present: boolean;
}

export type PredictionMap = Record<string, number>;

