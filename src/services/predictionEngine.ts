import { Sale, MonthlyConsumption, DemandPredictionResult } from '../types';

export function aggregateSalesByMonth(sales: Sale[]): MonthlyConsumption[] {
  const map: Record<string, number> = {};

  sales.forEach(sale => {
    // Expected sale_date format: YYYY-MM-DD
    const monthKey = sale.sale_date.substring(0, 7); // e.g. "2026-06"
    map[monthKey] = (map[monthKey] || 0) + sale.quantity_sold;
  });

  const sortedMonths = Object.keys(map).sort();
  return sortedMonths.map(m => {
    const d = new Date(m + '-01');
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return {
      month: monthLabel,
      units: map[m]
    };
  });
}

export function computeDemandPrediction(
  sales: Sale[],
  currentStock: number,
  minimumStock: number,
  method: 'linear_regression' | 'moving_average' = 'linear_regression'
): DemandPredictionResult {
  const historical = aggregateSalesByMonth(sales);
  const n = historical.length;

  if (n < 2) {
    return {
      sufficient_data: false,
      message: `Insufficient historical consumption data. Found only ${n} period(s); at least 2 consecutive monthly periods are required to calculate regression slopes or moving averages.`,
      historical_data: historical,
      total_periods: n,
      average_monthly_consumption: n === 1 ? historical[0].units : 0,
      predicted_units: 0,
      current_stock: currentStock,
      minimum_stock: minimumStock,
      safety_stock_buffer: 0,
      stock_status: 'Deficit',
      recommended_reorder: Math.max(0, minimumStock - currentStock),
      urgency_level: currentStock <= minimumStock ? 'High (Low Stock)' : 'Normal',
      formula_used: 'N/A',
      formula_details: 'Not enough data to fit model.',
      slope_trend: 'Stable'
    };
  }

  const yValues = historical.map(h => h.units);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const avgY = sumY / n;

  // Simple Moving Average (SMA of last 3 periods or all periods)
  const smaWindow = Math.min(3, n);
  const lastK = yValues.slice(-smaWindow);
  const smaPrediction = lastK.reduce((a, b) => a + b, 0) / smaWindow;

  // Linear Regression: y = mx + c
  // x = 1, 2, ..., n
  const xValues = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
  const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  let slopeM = 0;
  let interceptC = avgY;

  if (denominator !== 0) {
    slopeM = (n * sumXY - sumX * sumY) / denominator;
    interceptC = (sumY - slopeM * sumX) / n;
  }

  const nextX = n + 1;
  const linearPrediction = Math.max(0, slopeM * nextX + interceptC);

  let finalPredictedUnits = 0;
  let formulaName = '';
  let formulaBreakdown = '';

  if (method === 'moving_average') {
    finalPredictedUnits = Math.round(smaPrediction);
    formulaName = `Simple Moving Average (SMA, window = ${smaWindow} months)`;
    formulaBreakdown = 
      `Equation: SMA = (Sum of last ${smaWindow} periods) / ${smaWindow}\n` +
      `Data points considered: [${lastK.join(', ')}]\n` +
      `Calculated Mean = ${smaPrediction.toFixed(2)} ≈ ${finalPredictedUnits} units`;
  } else {
    finalPredictedUnits = Math.round(linearPrediction);
    formulaName = 'Linear Regression (Ordinary Least Squares: y = mx + c)';
    formulaBreakdown = 
      `Equation: y = mx + c\n` +
      `Chronological Period (x_next) = ${nextX}\n` +
      `Slope (m) = ${slopeM >= 0 ? '+' : ''}${slopeM.toFixed(3)} units/period (Trend Direction)\n` +
      `Y-Intercept (c) = ${interceptC.toFixed(2)}\n` +
      `Estimated Demand = (${slopeM.toFixed(3)} × ${nextX}) + ${interceptC.toFixed(2)} = ${linearPrediction.toFixed(2)} ≈ ${finalPredictedUnits} units`;
  }

  // Safety buffer & procurement reorder
  const safetyStockBuffer = Math.round(0.20 * finalPredictedUnits);
  const totalRequired = finalPredictedUnits + minimumStock;
  const deficit = Math.max(0, totalRequired - currentStock);

  let urgency = 'Normal (Stock Adequate)';
  let recommendedOrder = 0;

  if (currentStock === 0) {
    urgency = 'Critical Out of Stock';
    recommendedOrder = totalRequired;
  } else if (currentStock <= minimumStock) {
    urgency = 'High (Low Stock Warning)';
    recommendedOrder = deficit;
  } else if (deficit > 0) {
    urgency = 'Medium (Replenish for Next Cycle)';
    recommendedOrder = deficit;
  } else {
    urgency = 'Normal (Stock Sufficient)';
    recommendedOrder = 0;
  }

  const slopeTrend: 'Increasing' | 'Decreasing' | 'Stable' =
    slopeM > 0.5 ? 'Increasing' : slopeM < -0.5 ? 'Decreasing' : 'Stable';

  return {
    sufficient_data: true,
    historical_data: historical,
    total_periods: n,
    average_monthly_consumption: Math.round(avgY * 10) / 10,
    predicted_units: finalPredictedUnits,
    current_stock: currentStock,
    minimum_stock: minimumStock,
    safety_stock_buffer: safetyStockBuffer,
    stock_status: deficit > 0 ? 'Deficit' : 'Sufficient',
    recommended_reorder: recommendedOrder,
    urgency_level: urgency,
    formula_used: formulaName,
    formula_details: formulaBreakdown,
    slope_trend: slopeTrend,
    slope_m: Math.round(slopeM * 1000) / 1000,
    intercept_c: Math.round(interceptC * 100) / 100
  };
}
