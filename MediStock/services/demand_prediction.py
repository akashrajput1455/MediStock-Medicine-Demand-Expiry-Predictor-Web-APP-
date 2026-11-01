"""
MediStock - Medicine Demand Prediction Service
MCA Python Mini Project
Demonstrates:
- Pandas DataFrame operations (grouping, aggregation, indexing)
- NumPy arrays and mathematical formulas (mean, sum, least-squares regression)
- Transparent, explainable statistical prediction (Simple Moving Average & Linear Regression)
- Inventory reorder recommendation logic
"""

import numpy as np
import pandas as pd
from datetime import datetime

class DemandPredictor:
    """
    Predicts next-month medicine demand based on historical sales/consumption records.
    Does not use black-box models; provides full mathematical transparency for MCA evaluation.
    """

    MINIMUM_DATA_POINTS_REQUIRED = 2

    @staticmethod
    def prepare_sales_dataframe(sales_records):
        """
        Converts raw SQL sales records into a clean Pandas DataFrame grouped by month.
        Demonstrates: Pandas DataFrame creation, datetime conversion, groupby, and sum.
        """
        if not sales_records or len(sales_records) == 0:
            return pd.DataFrame()

        df = pd.DataFrame(sales_records)
        df['sale_date'] = pd.to_datetime(df['sale_date'])
        df['year_month'] = df['sale_date'].dt.to_period('M')
        
        # Aggregate monthly consumption
        monthly_df = df.groupby('year_month')['quantity_sold'].sum().reset_index()
        monthly_df['year_month_str'] = monthly_df['year_month'].astype(str)
        monthly_df = monthly_df.sort_values('year_month').reset_index(drop=True)
        return monthly_df

    @classmethod
    def predict_demand(cls, sales_records, current_stock, minimum_stock, method='linear_regression'):
        """
        Calculates predicted demand using either:
        1. Simple Moving Average (SMA)
        2. Linear Regression (Ordinary Least Squares: y = mx + c)
        
        Returns:
            dict containing:
            - historical_data: list of monthly consumption {month, units}
            - predicted_units: estimated units required next month
            - current_stock: available inventory
            - stock_status: 'Sufficient' or 'Deficit'
            - recommended_reorder: units to order
            - algorithm_explanation: step-by-step mathematical breakdown
            - sufficient_data: bool
        """
        monthly_df = cls.prepare_sales_dataframe(sales_records)
        n = len(monthly_df)

        if n < cls.MINIMUM_DATA_POINTS_REQUIRED:
            return {
                'sufficient_data': False,
                'message': f"Insufficient historical data. Found only {n} monthly records (minimum {cls.MINIMUM_DATA_POINTS_REQUIRED} required).",
                'historical_data': monthly_df.to_dict('records') if n > 0 else [],
                'predicted_units': 0,
                'recommended_reorder': max(0, minimum_stock - current_stock),
                'current_stock': current_stock
            }

        historical_records = []
        for _, row in monthly_df.iterrows():
            historical_records.append({
                'month': row['year_month_str'],
                'units': int(row['quantity_sold'])
            })

        # NumPy Array Operations
        y_values = monthly_df['quantity_sold'].to_numpy(dtype=float)
        x_values = np.arange(1, n + 1, dtype=float)  # Time indices 1, 2, ..., n
        next_x = n + 1

        # Calculate Simple Moving Average (SMA)
        sma_prediction = float(np.mean(y_values[-3:])) if n >= 3 else float(np.mean(y_values))

        # Linear Regression using Least Squares: y = mx + c
        # Slope m = [n*sum(xy) - sum(x)*sum(y)] / [n*sum(x^2) - (sum(x))^2]
        sum_x = np.sum(x_values)
        sum_y = np.sum(y_values)
        sum_xy = np.sum(x_values * y_values)
        sum_x_squared = np.sum(x_values ** 2)

        denominator = (n * sum_x_squared) - (sum_x ** 2)
        if denominator != 0:
            slope_m = ((n * sum_xy) - (sum_x * sum_y)) / denominator
            intercept_c = (sum_y - (slope_m * sum_x)) / n
            linear_prediction = (slope_m * next_x) + intercept_c
        else:
            slope_m = 0.0
            intercept_c = float(np.mean(y_values))
            linear_prediction = intercept_c

        # Prevent negative predictions
        linear_prediction = max(0.0, linear_prediction)

        # Select prediction based on requested method
        if method == 'moving_average':
            final_prediction = int(round(sma_prediction))
            formula_used = "Simple Moving Average (SMA)"
            formula_details = (
                f"Formula: SMA = (Sum of last {min(3, n)} months) / {min(3, n)}\n"
                f"Values considered: {y_values[-min(3, n):].tolist()}\n"
                f"Mean = {sma_prediction:.2f} ≈ {final_prediction} units"
            )
        else:
            final_prediction = int(round(linear_prediction))
            formula_used = "Linear Regression (Ordinary Least Squares: y = mx + c)"
            formula_details = (
                f"Equation: y = mx + c\n"
                f"Time index (x) for next period = {int(next_x)}\n"
                f"Calculated Slope (m) = {slope_m:+.3f} units/month (Trend)\n"
                f"Y-Intercept (c) = {intercept_c:.2f}\n"
                f"Predicted Demand = ({slope_m:.3f} * {int(next_x)}) + {intercept_c:.2f} = {linear_prediction:.2f} ≈ {final_prediction} units"
            )

        # Reorder Recommendation Logic
        # Safety Stock Buffer: 20% of predicted demand + minimum_stock threshold
        safety_stock = int(round(0.20 * final_prediction))
        total_required = final_prediction + minimum_stock
        deficit = max(0, total_required - current_stock)

        # Determine urgency status
        if current_stock == 0:
            urgency = 'Critical Out of Stock'
            recommended_reorder = total_required
        elif current_stock < minimum_stock:
            urgency = 'High (Low Stock Warning)'
            recommended_reorder = deficit
        elif deficit > 0:
            urgency = 'Medium (Replenish for Next Period)'
            recommended_reorder = deficit
        else:
            urgency = 'Normal (Current Stock Sufficient)'
            recommended_reorder = 0

        return {
            'sufficient_data': True,
            'historical_data': historical_records,
            'total_periods': n,
            'average_monthly_consumption': round(float(np.mean(y_values)), 1),
            'predicted_units': final_prediction,
            'current_stock': current_stock,
            'minimum_stock': minimum_stock,
            'safety_stock_buffer': safety_stock,
            'stock_status': 'Sufficient' if deficit == 0 else 'Deficit',
            'recommended_reorder': recommended_reorder,
            'urgency_level': urgency,
            'formula_used': formula_used,
            'formula_details': formula_details,
            'slope_trend': 'Increasing' if slope_m > 0.5 else ('Decreasing' if slope_m < -0.5 else 'Stable')
        }
