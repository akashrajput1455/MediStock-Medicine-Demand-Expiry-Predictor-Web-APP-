export interface Medicine {
  medicine_id: number;
  medicine_name: string;
  category: string;
  manufacturer: string;
  batch_number: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  minimum_stock: number;
  manufacturing_date: string;
  expiry_date: string;
  supplier_name: string;
  created_at?: string;
  // Computed fields
  expiry_status?: 'EXPIRED' | 'EXPIRING_30_DAYS' | 'EXPIRING_60_DAYS' | 'EXPIRING_90_DAYS' | 'SAFE';
  expiry_label?: string;
  days_remaining?: number;
  is_dispensable?: boolean;
  action_required?: string;
  stock_value?: number;
}

export interface Sale {
  sale_id: number;
  medicine_id: number;
  quantity_sold: number;
  sale_date: string;
  total_amount: number;
  patient_reference: string;
  medicine_name?: string;
  batch_number?: string;
}

export interface InventoryTransaction {
  transaction_id: number;
  medicine_id: number;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'EXPIRED_DISCARD';
  quantity: number;
  transaction_date: string;
  description: string;
  performed_by: string;
  medicine_name?: string;
  batch_number?: string;
}

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  role: string;
}

export interface MonthlyConsumption {
  month: string;
  units: number;
}

export interface DemandPredictionResult {
  sufficient_data: boolean;
  message?: string;
  historical_data: MonthlyConsumption[];
  total_periods: number;
  average_monthly_consumption: number;
  predicted_units: number;
  current_stock: number;
  minimum_stock: number;
  safety_stock_buffer: number;
  stock_status: 'Sufficient' | 'Deficit';
  recommended_reorder: number;
  urgency_level: string;
  formula_used: string;
  formula_details: string;
  slope_trend: 'Increasing' | 'Decreasing' | 'Stable';
  slope_m?: number;
  intercept_c?: number;
}

export interface ExpirySummary {
  total_medicines: number;
  expired_count: number;
  expiring_30_count: number;
  expiring_60_count: number;
  expiring_90_count: number;
  safe_count: number;
  total_expiring_soon: number;
  expired_inventory_value: number;
  at_risk_value_30_days: number;
}

export interface DashboardMetrics {
  total_medicines: number;
  total_stock_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
  expired_count: number;
  expiring_soon_count: number;
  expiring_30_count: number;
  total_inventory_value: number;
  total_selling_value: number;
  potential_profit_margin: number;
  expired_inventory_value: number;
  category_counts: Record<string, number>;
  category_stock: Record<string, number>;
  stock_status_breakdown: Record<string, number>;
}
