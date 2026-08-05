export type ForecastFrequency = "D" | "M";
export type ForecastModel = "ARIMA" | "Prophet" | "XGBoost" | "CatBoost" | "Ensemble";

export interface ForecastRun {
  id: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  trigger_source: "manual" | "webhook" | "scheduled";
  data_through: string | null;
  products: string[];
  frequencies: ForecastFrequency[];
  horizons: number[];
  models: ForecastModel[];
  products_count: number | null;
  started_at: string | null;
  completed_at: string | null;
  duration_sec: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface EDASeriesPoint {
  product: string;
  frequency: ForecastFrequency;
  date: string;
  cif_price: number | null;
  transactions: number | null;
  fx_usdvnd: number | null;
  corn_fut: number | null;
  soymeal_fut: number | null;
  rolling_mean_s: number | null;
  rolling_mean_m: number | null;
  rolling_mean_l: number | null;
  rolling_std_s: number | null;
  rolling_std_m: number | null;
  rolling_std_l: number | null;
  refreshed_at: string;
}

export interface EDAMetric {
  product: string;
  frequency: ForecastFrequency;
  current_price: number | null;
  mean_price: number | null;
  min_price: number | null;
  max_price: number | null;
  volatility: number | null;
  last_date: string | null;
  data_points: number | null;
  fx_usdvnd: number | null;
  corn_fut: number | null;
  soymeal_fut: number | null;
  correlation_cif_fx: number | null;
  correlation_cif_corn: number | null;
  correlation_cif_soy: number | null;
  refreshed_at: string;
}

export interface ForecastPoint {
  id: number;
  run_id: string;
  product: string;
  frequency: ForecastFrequency;
  horizon: number;
  model: ForecastModel;
  forecast_date: string;
  point_forecast: number;
  lower_bound: number | null;
  upper_bound: number | null;
  is_historical: boolean;
  actual_value: number | null;
}

export interface ForecastMetric {
  id: number;
  run_id: string;
  product: string;
  frequency: ForecastFrequency;
  horizon: number;
  model: ForecastModel;
  rmse: number | null;
  mae: number | null;
  mape: number | null;
  weight: number | null;
}

export interface ExternalFeature {
  id: number;
  date: string;
  fx_usdvnd: number | null;
  corn_fut: number | null;
  soymeal_fut: number | null;
}

export interface EDAFilters {
  product?: string;
  frequency: ForecastFrequency;
}

export interface ProjectionFilters {
  product: string;
  frequency: ForecastFrequency;
  horizon: number;
  model?: ForecastModel;
}

export const FORECAST_FREQUENCIES: { value: ForecastFrequency; label: string }[] = [
  { value: "D", label: "Daily" },
  { value: "M", label: "Monthly" },
];

export const FORECAST_MODELS: ForecastModel[] = [
  "ARIMA",
  "Prophet",
  "XGBoost",
  "CatBoost",
  "Ensemble",
];

export const DAILY_HORIZONS = [30, 60, 90, 120] as const;
export const MONTHLY_HORIZONS = [3, 6, 9, 12] as const;
