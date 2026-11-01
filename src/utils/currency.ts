/**
 * MediStock - Currency Formatting Helper
 * Formats monetary amounts in Indian Rupees (₹) using Indian numbering system (en-IN)
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatINRNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
