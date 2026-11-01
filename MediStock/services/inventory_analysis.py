"""
MediStock - Inventory Analysis Service
Aggregates inventory metrics, category distributions, and financial valuation.
Demonstrates: Python dictionaries, list comprehensions, sorting, and aggregation.
"""

from services.expiry_checker import ExpiryChecker

class InventoryAnalysisService:
    """Provides statistical aggregations for dashboard and reports."""

    @staticmethod
    def calculate_dashboard_metrics(medicines, sales_records=None, reference_date=None):
        """
        Computes all core dashboard KPIs from live database records.
        """
        enriched_meds, expiry_summary = ExpiryChecker.process_medicine_records(medicines, reference_date)

        total_medicines = len(enriched_meds)
        total_stock_units = sum(m['quantity'] for m in enriched_meds)
        
        # Low stock: quantity <= minimum_stock AND quantity > 0
        low_stock_medicines = [m for m in enriched_meds if 0 < m['quantity'] <= m['minimum_stock']]
        out_of_stock_medicines = [m for m in enriched_meds if m['quantity'] == 0]
        
        # Financial valuation
        total_inventory_purchase_value = sum(float(m['quantity']) * float(m['purchase_price']) for m in enriched_meds)
        total_inventory_selling_value = sum(float(m['quantity']) * float(m['selling_price']) for m in enriched_meds)
        potential_profit_margin = total_inventory_selling_value - total_inventory_purchase_value

        # Category distribution
        category_counts = {}
        category_stock = {}
        for m in enriched_meds:
            cat = m['category']
            category_counts[cat] = category_counts.get(cat, 0) + 1
            category_stock[cat] = category_stock.get(cat, 0) + m['quantity']

        # Stock status breakdown
        stock_status_breakdown = {
            'Safe Stock': len([m for m in enriched_meds if m['quantity'] > m['minimum_stock'] and m['expiry_status'] != 'EXPIRED']),
            'Low Stock': len(low_stock_medicines),
            'Out of Stock': len(out_of_stock_medicines),
            'Expired': expiry_summary['expired_count'],
            'Expiring Soon': expiry_summary['total_expiring_soon']
        }

        return {
            'total_medicines': total_medicines,
            'total_stock_units': total_stock_units,
            'low_stock_count': len(low_stock_medicines),
            'out_of_stock_count': len(out_of_stock_medicines),
            'expired_count': expiry_summary['expired_count'],
            'expiring_soon_count': expiry_summary['total_expiring_soon'],
            'expiring_30_count': expiry_summary['expiring_30_count'],
            'total_inventory_value': round(total_inventory_purchase_value, 2),
            'total_selling_value': round(total_inventory_selling_value, 2),
            'potential_profit_margin': round(potential_profit_margin, 2),
            'expired_inventory_value': expiry_summary['expired_inventory_value'],
            'category_counts': category_counts,
            'category_stock': category_stock,
            'stock_status_breakdown': stock_status_breakdown,
            'enriched_medicines': enriched_meds
        }
