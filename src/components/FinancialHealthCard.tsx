'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/finance';
import {
  getBillingCycleRange,
  calculateCycleCashflow,
  getHistoricalCyclesCashflow,
  formatRupiah,
  maskBalance,
} from '@/lib/financeCalculations';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export interface FinancialHealthCardProps {
  transactions: Transaction[];
  billingCycleStartDay?: number;
  hideBalance: boolean;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  transactions,
  billingCycleStartDay = 1,
  hideBalance,
}) => {
  const [selectedOffset, setSelectedOffset] = useState<number>(0);

  const currentRange = getBillingCycleRange(
    new Date(),
    billingCycleStartDay || 1,
    selectedOffset
  );
  const summary = calculateCycleCashflow(transactions, currentRange);
  const history = getHistoricalCyclesCashflow(
    transactions,
    billingCycleStartDay || 1,
    6,
    selectedOffset
  );

  const maxVal = Math.max(
    1,
    ...history.map((h) => Math.max(h.summary.income, h.summary.expense))
  );

  return (
    <div className="apple-card p-5 sm:p-6 space-y-4 rounded-[20px]">
      {/* 1. Header with Cycle Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Kondisi Keuangan &amp; Siklus
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-tabular">
              {currentRange.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedOffset((prev) => prev - 1)}
            disabled={selectedOffset <= -5}
            className="apple-btn apple-btn-secondary h-8 w-8 p-0 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Siklus Sebelumnya"
            aria-label="Siklus Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedOffset((prev) => prev + 1)}
            disabled={selectedOffset === 0}
            className="apple-btn apple-btn-secondary h-8 w-8 p-0 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Siklus Berikutnya"
            aria-label="Siklus Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Status Badge & 3-Metric Strip */}
      <div className="space-y-2.5">
        <div>
          {summary.status === 'surplus' && (
            <span className="apple-badge apple-badge-success flex items-center gap-1 w-fit">
              <Sparkles className="h-3 w-3" />
              <span>Surplus Sehat (+{Math.round(summary.savingsRate)}% tersimpan)</span>
            </span>
          )}
          {summary.status === 'warning' && (
            <span className="apple-badge apple-badge-warning flex items-center gap-1 w-fit">
              <AlertTriangle className="h-3 w-3" />
              <span>Waspada (+{Math.round(summary.savingsRate)}% tersimpan)</span>
            </span>
          )}
          {summary.status === 'deficit' && (
            <span className="apple-badge apple-badge-danger flex items-center gap-1 w-fit">
              <AlertCircle className="h-3 w-3" />
              <span>Defisit ({Math.round(summary.savingsRate)}%)</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3 rounded-[16px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)]">
          <div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
              Pemasukan Siklus
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[var(--color-success-text)] font-tabular truncate">
              {formatRupiah(summary.income)}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
              Pengeluaran Siklus
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[var(--color-danger-text)] font-tabular truncate">
              {formatRupiah(summary.expense)}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
              Tabungan Bersih
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[var(--color-primary)] font-tabular truncate">
              {maskBalance(formatRupiah(summary.net), hideBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pure SVG/CSS 6-Cycle Dual-Bar Chart */}
      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 items-end h-[130px] pt-2">
          {history.map((h, index) => {
            const isSelected = h.isCurrent;
            const incomeHeight =
              h.summary.income > 0
                ? Math.max(4, Math.round((h.summary.income / maxVal) * 100))
                : 0;
            const expenseHeight =
              h.summary.expense > 0
                ? Math.max(4, Math.round((h.summary.expense / maxVal) * 100))
                : 0;

            return (
              <button
                key={h.range.cycleKey}
                type="button"
                onClick={() => setSelectedOffset(index - 5)}
                className={`flex flex-col items-center justify-end p-1 sm:p-1.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-surface-2)] ring-2 ring-[var(--color-primary)] shadow-sm'
                    : 'hover:bg-[var(--color-surface-2)]/60'
                }`}
                title={`${h.range.label}\nPemasukan: ${formatRupiah(h.summary.income)}\nPengeluaran: ${formatRupiah(h.summary.expense)}\nTabungan: ${formatRupiah(h.summary.net)}`}
              >
                <div className="w-full h-20 flex items-end justify-center gap-1 sm:gap-1.5">
                  {/* Income Bar */}
                  <div
                    className="w-2 sm:w-2.5 bg-[#34C759] rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${incomeHeight}%`,
                      minHeight: h.summary.income > 0 ? '4px' : '0px',
                    }}
                  />
                  {/* Expense Bar */}
                  <div
                    className="w-2 sm:w-2.5 bg-[#FF3B30] rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${expenseHeight}%`,
                      minHeight: h.summary.expense > 0 ? '4px' : '0px',
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] font-tabular mt-1.5 truncate max-w-full ${
                    isSelected
                      ? 'font-bold text-[var(--color-primary)]'
                      : 'font-medium text-[var(--color-text-secondary)]'
                  }`}
                >
                  {h.range.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border-soft)] text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34C759]" />
              <span className="text-[11px]">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF3B30]" />
              <span className="text-[11px]">Pengeluaran</span>
            </div>
          </div>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            Klik batang untuk melihat rincian siklus
          </span>
        </div>
      </div>
    </div>
  );
};
