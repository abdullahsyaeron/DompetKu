'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  Zap,
  Target,
  PieChart,
  Calendar,
} from 'lucide-react';
import { AppData, QuickTemplate } from '@/types/finance';
import { formatRupiah, formatDateID } from '@/lib/storage';
import { calculateMonthlyCashflow, calculateBudgetUsage } from '@/lib/financeCalculations';
import { TabKey } from './BottomNav';

interface DashboardViewProps {
  appData: AppData;
  hideBalance: boolean;
  onNavigateTab: (tab: TabKey) => void;
  onOpenAddModal: (type?: 'expense' | 'income' | 'transfer') => void;
  onExecuteTemplate: (template: QuickTemplate) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appData,
  hideBalance,
  onNavigateTab,
  onOpenAddModal,
  onExecuteTemplate,
}) => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { income: totalIncome, expense: totalExpense } = calculateMonthlyCashflow(
    appData.transactions,
    currentMonthYear
  );

  const totalLiquidAssets = appData.wallets.reduce(
    (acc, curr) => acc + curr.balance,
    0
  );

  const { totalLimit: totalBudgetLimit, usagePercent: budgetUsagePercent } = calculateBudgetUsage(
    appData.budgets,
    appData.transactions,
    currentMonthYear
  );

  const mask = (val: string) => (hideBalance ? 'Rp ••••••••' : val);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Main Net Asset Hero Card */}
      <div className="apple-card p-6">
        <div className="flex items-center justify-between">
          <span className="apple-badge text-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            Total Saldo Likuid
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            {appData.wallets.length} Akun
          </span>
        </div>

        <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text)] font-tabular">
          {mask(formatRupiah(totalLiquidAssets))}
        </h2>

        {/* Cashflow In/Out Strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-soft)]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
              <span>Pemasukan Bulan Ini</span>
            </div>
            <p className="mt-1 text-base font-semibold text-[var(--color-success-text)] font-tabular">
              {mask(formatRupiah(totalIncome))}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <TrendingDown className="h-3.5 w-3.5 text-[var(--color-danger-text)]" />
              <span>Pengeluaran Bulan Ini</span>
            </div>
            <p className="mt-1 text-base font-semibold text-[var(--color-danger-text)] font-tabular">
              {mask(formatRupiah(totalExpense))}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tactile Quick Actions */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onOpenAddModal('expense')}
          className="apple-btn apple-btn-secondary w-full gap-2 text-xs font-semibold hover:border-[var(--color-border)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-[var(--color-danger-text)]" />
          <span>Pengeluaran</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAddModal('income')}
          className="apple-btn apple-btn-secondary w-full gap-2 text-xs font-semibold hover:border-[var(--color-border)] active:scale-[0.98]"
        >
          <TrendingUp className="h-4 w-4 text-[var(--color-success-text)]" />
          <span>Pemasukan</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAddModal('transfer')}
          className="apple-btn apple-btn-secondary w-full gap-2 text-xs font-semibold hover:border-[var(--color-border)] active:scale-[0.98]"
        >
          <ArrowLeftRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <span>Transfer</span>
        </button>
      </div>

      {/* 3. Quick Templates (1-Tap Fast Logging) */}
      {appData.templates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              Input Cepat
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Kelola
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {appData.templates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onExecuteTemplate(tmpl)}
                className="apple-card apple-card-hover p-2.5 rounded-[14px] bg-[var(--color-surface)] border border-[var(--color-border-soft)] flex-shrink-0 flex items-center gap-2.5 active:scale-[0.98] transition-all text-left"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    tmpl.type === 'expense'
                      ? 'bg-[var(--color-danger-text)]'
                      : tmpl.type === 'income'
                      ? 'bg-[var(--color-success-text)]'
                      : 'bg-[var(--color-text-tertiary)]'
                  }`}
                />
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)] truncate max-w-[130px]">
                    {tmpl.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-tabular">
                    {formatRupiah(tmpl.amount)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Budget & Financial Goals Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Budget Status Widget */}
        <div className="apple-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <h4 className="text-xs font-semibold text-[var(--color-text)]">Batas Anggaran</h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('budgets')}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
            >
              Rincian <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetUsagePercent > 90
                    ? 'bg-[var(--color-danger-text)]'
                    : budgetUsagePercent > 70
                    ? 'bg-[var(--color-warning-text)]'
                    : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] font-tabular">
              <span>{formatRupiah(totalExpense)} ({budgetUsagePercent}%)</span>
              <span>Batas: {formatRupiah(totalBudgetLimit)}</span>
            </div>
          </div>
        </div>

        {/* Goals / Dana Darurat Widget */}
        <div className="apple-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <h4 className="text-xs font-semibold text-[var(--color-text)]">
                {appData.goals[0]?.title || 'Target Finansial'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('goals')}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors"
            >
              Semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {appData.goals[0] ? (
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (appData.goals[0].currentAmount / appData.goals[0].targetAmount) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] font-tabular">
                <span>{mask(formatRupiah(appData.goals[0].currentAmount))}</span>
                <span>Target: {formatRupiah(appData.goals[0].targetAmount)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Belum ada target keuangan aktif.</p>
          )}
        </div>
      </div>

      {/* 5. Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            Transaksi Terkini
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            Lihat Semua ({appData.transactions.length})
          </button>
        </div>

        {appData.transactions.length === 0 ? (
          <div className="p-8 text-center apple-card">
            <p className="text-xs text-[var(--color-text-secondary)]">Belum ada transaksi tercatat.</p>
            <button
              type="button"
              onClick={() => onOpenAddModal('expense')}
              className="mt-3 apple-btn apple-btn-secondary text-xs h-9 px-3"
            >
              Catat Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="apple-card divide-y divide-[var(--color-border-soft)] overflow-hidden">
            {appData.transactions.slice(0, 5).map((tx) => {
              const wallet = appData.wallets.find((w) => w.id === tx.walletId);
              const toWallet = tx.toWalletId
                ? appData.wallets.find((w) => w.id === tx.toWalletId)
                : null;
              const category = appData.categories.find((c) => c.id === tx.categoryId);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-[10px] flex items-center justify-center font-tabular text-xs ${
                        tx.type === 'expense'
                          ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                          : tx.type === 'income'
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'
                          : 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      }`}
                    >
                      {tx.type === 'expense' ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : tx.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <ArrowLeftRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text)]">
                        {tx.type === 'transfer'
                          ? `Transfer ke ${toWallet?.name || 'Dompet'}`
                          : category?.name || 'Transaksi'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        <span>{wallet?.name || 'Dompet'}</span>
                        <span>/</span>
                        <span>{formatDateID(tx.date)}</span>
                        {tx.notes && (
                          <>
                            <span>/</span>
                            <span className="text-[var(--color-text-secondary)] truncate max-w-[120px]">
                              {tx.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-semibold font-tabular ${
                        tx.type === 'expense'
                          ? 'text-[var(--color-danger-text)]'
                          : tx.type === 'income'
                          ? 'text-[var(--color-success-text)]'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {mask(formatRupiah(tx.amount))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
