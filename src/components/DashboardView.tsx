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
import { calculateMonthlyCashflow, calculateBudgetUsage, maskBalance } from '@/lib/financeCalculations';
import { TabKey } from './BottomNav';

interface DashboardViewProps {
  appData: AppData;
  hideBalance: boolean;
  onNavigateTab: (tab: TabKey) => void;
  onOpenAddModal: (type?: 'expense' | 'income' | 'transfer') => void;
  onExecuteTemplate: (template: QuickTemplate) => void;
  onDeleteTransaction?: (id: string) => void;
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

  const activeGoal = appData.goals[0];
  const goalProgress = activeGoal
    ? Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Apple Titanium Hero Card */}
      <div className="apple-titanium-card rounded-[22px] p-6 relative overflow-hidden">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded-[5px] border border-amber-600/30 dark:border-amber-400/20 bg-gradient-to-br from-amber-200/40 via-amber-100/20 to-transparent flex items-center justify-center">
              <div className="w-4 h-3 border border-amber-600/30 dark:border-amber-400/20 rounded-[2px]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              DK Titanium
            </span>
          </div>
          <span className="apple-badge text-[10px] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)]">
            Personal
          </span>
        </div>

        {/* Center: Total Saldo Likuid */}
        <div className="mt-5 sm:mt-6">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total Saldo Likuid
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-text)] font-tabular mt-1">
            {maskBalance(formatRupiah(totalLiquidAssets), hideBalance)}
          </h2>
        </div>

        {/* Bottom Cashflow Strip (Unmasked per Privacy Rule) */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-soft)]">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <TrendingUp className="h-3.5 w-3.5 text-[#34C759]" />
              <span>Pemasukan Bulan Ini</span>
            </div>
            <p className="mt-1 text-base font-semibold text-[var(--color-success-text)] font-tabular">
              {formatRupiah(totalIncome)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <TrendingDown className="h-3.5 w-3.5 text-[#FF3B30]" />
              <span>Pengeluaran Bulan Ini</span>
            </div>
            <p className="mt-1 text-base font-semibold text-[var(--color-danger-text)] font-tabular">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tactile Action Pills Bar */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => onOpenAddModal('expense')}
          className="apple-press flex items-center justify-center gap-1.5 sm:gap-2 h-11 px-3 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-border-soft)] text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="truncate">Pengeluaran</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAddModal('income')}
          className="apple-press flex items-center justify-center gap-1.5 sm:gap-2 h-11 px-3 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-border-soft)] text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span className="truncate">Pemasukan</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenAddModal('transfer')}
          className="apple-press flex items-center justify-center gap-1.5 sm:gap-2 h-11 px-3 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-border-soft)] text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0" />
          <span className="truncate">Transfer</span>
        </button>
      </div>

      {/* 3. Quick Templates Carousel (1-Tap Fast Logging) */}
      {appData.templates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
              Input Cepat
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-medium text-[var(--color-primary)] hover:underline transition-colors"
            >
              Kelola
            </button>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {appData.templates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onExecuteTemplate(tmpl)}
                className="apple-card apple-press p-3 rounded-[16px] bg-[var(--color-surface)] border border-[var(--color-border-soft)] shrink-0 flex items-center gap-2.5 text-left transition-all"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    tmpl.type === 'expense'
                      ? 'bg-[#FF3B30]'
                      : tmpl.type === 'income'
                      ? 'bg-[#34C759]'
                      : 'bg-[#0071E3]'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text)] truncate max-w-[130px]">
                    {tmpl.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] font-tabular mt-0.5">
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
        <div className="apple-card rounded-[18px] p-5 space-y-3">
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
            <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetUsagePercent > 100
                    ? 'bg-[var(--color-danger-text)]'
                    : budgetUsagePercent >= 80
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
        <div className="apple-card rounded-[18px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <h4 className="text-xs font-semibold text-[var(--color-text)] truncate">
                {activeGoal?.title || 'Target Finansial'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('goals')}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors shrink-0"
            >
              Semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {activeGoal ? (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${Math.min(100, goalProgress)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)] font-tabular">
                <span>{hideBalance ? 'Rp ••••••••' : formatRupiah(activeGoal.currentAmount)}</span>
                <span>Target: {formatRupiah(activeGoal.targetAmount)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">Belum ada target keuangan aktif.</p>
          )}
        </div>
      </div>

      {/* 5. Recent Transactions List (Inset-Grouped) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            Transaksi Terkini
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline transition-colors"
          >
            Lihat Semua ({appData.transactions.length})
          </button>
        </div>

        {appData.transactions.length === 0 ? (
          <div className="p-8 text-center apple-card rounded-[18px]">
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
          <div className="apple-card rounded-[18px] divide-y divide-[var(--color-border-soft)] overflow-hidden">
            {appData.transactions.slice(0, 5).map((tx) => {
              const wallet = appData.wallets.find((w) => w.id === tx.walletId);
              const toWallet = tx.toWalletId
                ? appData.wallets.find((w) => w.id === tx.toWalletId)
                : null;
              const category = appData.categories.find((c) => c.id === tx.categoryId);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[var(--color-surface-2)] transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-tabular text-xs shrink-0 ${
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
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">
                        {tx.type === 'transfer'
                          ? `Transfer ke ${toWallet?.name || 'Dompet'}`
                          : category?.name || 'Transaksi'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                        <span className="shrink-0">{wallet?.name || 'Dompet'}</span>
                        <span className="shrink-0">/</span>
                        <span className="shrink-0">{formatDateID(tx.date)}</span>
                        {tx.notes && (
                          <>
                            <span className="shrink-0">/</span>
                            <span className="text-[var(--color-text-secondary)] truncate">
                              {tx.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold font-tabular ${
                        tx.type === 'expense'
                          ? 'text-[var(--color-danger-text)]'
                          : tx.type === 'income'
                          ? 'text-[var(--color-success-text)]'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {formatRupiah(tx.amount)}
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
