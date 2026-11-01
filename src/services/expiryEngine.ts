import { Medicine, ExpirySummary } from '../types';

// System reference date for 2026 mini-project execution
export const REFERENCE_DATE = new Date('2026-11-01');

export function calculateShelfLife(expiryDateStr: string, referenceDate: Date = REFERENCE_DATE): { daysRemaining: number; expiryDate: Date } {
  const expiryDate = new Date(expiryDateStr);
  const diffTime = expiryDate.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { daysRemaining, expiryDate };
}

export function classifyMedicineExpiry(expiryDateStr: string, referenceDate: Date = REFERENCE_DATE) {
  const { daysRemaining } = calculateShelfLife(expiryDateStr, referenceDate);

  if (daysRemaining < 0) {
    return {
      status: 'EXPIRED' as const,
      label: 'Expired',
      daysRemaining,
      isDispensable: false,
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      actionRequired: 'Quarantine immediately. Strictly blocked from dispensing.'
    };
  } else if (daysRemaining <= 30) {
    return {
      status: 'EXPIRING_30_DAYS' as const,
      label: 'Expiring ≤ 30 Days',
      daysRemaining,
      isDispensable: true,
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      actionRequired: 'High Alert: Dispense on urgent FEFO priority or return to vendor.'
    };
  } else if (daysRemaining <= 60) {
    return {
      status: 'EXPIRING_60_DAYS' as const,
      label: 'Expiring ≤ 60 Days',
      daysRemaining,
      isDispensable: true,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      actionRequired: 'Medium Alert: Prioritize in daily outpatient dispensary.'
    };
  } else if (daysRemaining <= 90) {
    return {
      status: 'EXPIRING_90_DAYS' as const,
      label: 'Expiring ≤ 90 Days',
      daysRemaining,
      isDispensable: true,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      actionRequired: 'Notice: Track monthly consumption vs remaining shelf life.'
    };
  } else {
    return {
      status: 'SAFE' as const,
      label: 'Safe Stock (>90 Days)',
      daysRemaining,
      isDispensable: true,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actionRequired: 'Adequate shelf life. Standard storage conditions.'
    };
  }
}

export function processMedicinesWithExpiry(medicines: Medicine[], referenceDate: Date = REFERENCE_DATE): { enriched: Medicine[]; summary: ExpirySummary } {
  let expiredCount = 0;
  let expiring30Count = 0;
  let expiring60Count = 0;
  let expiring90Count = 0;
  let safeCount = 0;
  let expiredValuation = 0;
  let atRiskValuation30 = 0;

  const enriched = medicines.map(med => {
    const classification = classifyMedicineExpiry(med.expiry_date, referenceDate);
    const stockVal = med.quantity * med.purchase_price;

    if (classification.status === 'EXPIRED') {
      expiredCount++;
      expiredValuation += stockVal;
    } else if (classification.status === 'EXPIRING_30_DAYS') {
      expiring30Count++;
      atRiskValuation30 += stockVal;
    } else if (classification.status === 'EXPIRING_60_DAYS') {
      expiring60Count++;
    } else if (classification.status === 'EXPIRING_90_DAYS') {
      expiring90Count++;
    } else {
      safeCount++;
    }

    return {
      ...med,
      expiry_status: classification.status,
      expiry_label: classification.label,
      days_remaining: classification.daysRemaining,
      is_dispensable: classification.isDispensable,
      action_required: classification.actionRequired,
      stock_value: stockVal
    };
  });

  const summary: ExpirySummary = {
    total_medicines: medicines.length,
    expired_count: expiredCount,
    expiring_30_count: expiring30Count,
    expiring_60_count: expiring60Count,
    expiring_90_count: expiring90Count,
    safe_count: safeCount,
    total_expiring_soon: expiring30Count + expiring60Count + expiring90Count,
    expired_inventory_value: Math.round(expiredValuation * 100) / 100,
    at_risk_value_30_days: Math.round(atRiskValuation30 * 100) / 100
  };

  return { enriched, summary };
}
