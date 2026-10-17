'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { AppData, Budget } from '@/types/finance';
import { formatRupiah } from '@/lib/storage';

interface BudgetsViewProps {
  appData: AppData;
  hideBalance: boolean;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  appData,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const expenseCategories = appData.categories.filter((c) => c.type === 'expense');

  const categorySpendingMap: Record<string, number> = {};
  appData.transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonth))
    .forEach((tx) => {
      if (tx.categoryId) {
        categorySpendingMap[tx.categoryId] =
          (categorySpendingMap[tx.categoryId] || 0) + tx.amount;
      }
    });

  const currentMonthBudgets = appData.budgets.filter((b) => b.month === currentMonth);
  const totalBudgetLimit = currentMonthBudgets.reduce((acc, b) => acc + b.limitAmount, 0);

  const totalExpenseInBudgetedCategories = currentMonthBudgets.reduce((acc, b) => {
    return acc + (categorySpendingMap[b.categoryId] || 0);
  }, 0);

  const overallPercent =
    totalBudgetLimit > 0
      ? Math.round((totalExpenseInBudgetedCategories / totalBudgetLimit) * 100)
      : 0;

  const handleOpenSetBudget = (categoryId?: string, existingLimit?: number) => {
    setErrorMsg(null);
    setSelectedCategoryId(categoryId || expenseCategories[0]?.id || '');
    setLimitStr(existingLimit ? String(existingLimit) : '');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedCategoryId) return;
    const limit = parseFloat(limitStr) || 0;
    if (limit <= 0) {
      setErrorMsg('Masukkan batas anggaran yang valid.');
      return;
    }

    const existing = appData.budgets.find(
      (b) => b.categoryId === selectedCategoryId && b.month === currentMonth
    );

    const budget: Budget = {
      id: existing ? existing.id : `b-${Date.now()}`,
      categoryId: selectedCategoryId,
      limitAmount: limit,
      month: currentMonth,
    };

    onSaveBudget(budget);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-36">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Batas Anggaran
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Alokasi pos belanja bulan {currentMonthName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenSetBudget()}
          className="apple-btn apple-btn-primary apple-press h-9 px-3.5 text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Atur Kuota
        </button>
      </div>

      {/* Overall Budget Summary */}
      <div className="apple-card p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)]">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                Total Plafon Anggaran
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] font-tabular mt-0.5">
                {formatRupiah(totalBudgetLimit)}
              </h3>
            </div>
          </div>

          <div
            className={`apple-badge text-xs font-semibold gap-1.5 ${
              overallPercent > 100
                ? 'apple-badge-danger'
                : overallPercent >= 80
                ? 'apple-badge-warning'
                : 'apple-badge-success'
            }`}
          >
            {overallPercent > 100 ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>{overallPercent}% Terpakai</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallPercent > 100
                  ? 'bg-[var(--color-danger-text)]'
                  : overallPercent >= 80
                  ? 'bg-[var(--color-warning-text)]'
                  : 'bg-[var(--color-primary)]'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
          <div className="flex justify-between font-tabular text-xs text-[var(--color-text-secondary)]">
            <span>Terpakai: {formatRupiah(totalExpenseInBudgetedCategories)}</span>
            <span>
              Sisa: {formatRupiah(Math.max(0, totalBudgetLimit - totalExpenseInBudgetedCategories))}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          POS PENGELUARAN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {expenseCategories.map((cat) => {
            const budget = currentMonthBudgets.find((b) => b.categoryId === cat.id);
            const spent = categorySpendingMap[cat.id] || 0;
            const limit = budget ? budget.limitAmount : 0;
            const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const remaining = limit - spent;

            const badgeClass =
              percent > 100
                ? 'apple-badge apple-badge-danger'
                : percent >= 80
                ? 'apple-badge apple-badge-warning'
                : 'apple-badge apple-badge-success';

            const badgeText =
              percent > 100
                ? 'Melebihi Batas'
                : percent >= 80
                ? 'Waspada'
                : 'Aman';

            const barFillClass =
              percent > 100
                ? 'bg-[var(--color-danger-text)]'
                : percent >= 80
                ? 'bg-[var(--color-warning-text)]'
                : 'bg-[var(--color-primary)]';

            return (
              <div
                key={cat.id}
                className="apple-card apple-card-hover p-5 rounded-[20px] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-xs font-semibold text-[var(--color-text)] shrink-0">
                        {cat.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {cat.name}
                        </h4>
                        <p className="font-tabular text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                          {limit > 0 ? (
                            <>
                              Terpakai {formatRupiah(spent)} / {formatRupiah(limit)}
                            </>
                          ) : (
                            <>Terpakai {formatRupiah(spent)} (Tanpa Batas)</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {limit > 0 ? (
                        <>
                          <span className={badgeClass}>
                            {badgeText}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenSetBudget(cat.id, limit)}
                            className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                            title="Ubah Kuota"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {budget && onDeleteBudget && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus kuota anggaran untuk kategori "${cat.name}"?`)) {
                                  onDeleteBudget(budget.id);
                                }
                              }}
                              className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors"
                              title="Hapus Kuota"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSetBudget(cat.id)}
                          className="apple-btn apple-btn-secondary apple-press h-8 px-3 text-xs"
                        >
                          + Atur
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {limit > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[var(--color-border-soft)]">
                    <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barFillClass}`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="font-tabular text-xs text-[var(--color-text-secondary)] flex justify-between items-center">
                      <span>{percent}% terpakai</span>
                      <span
                        className={
                          remaining < 0
                            ? 'text-[var(--color-danger-text)] font-semibold'
                            : 'text-[var(--color-text-secondary)]'
                        }
                      >
                        {remaining < 0
                          ? `Kelebihan: ${formatRupiah(Math.abs(remaining))}`
                          : `Sisa: ${formatRupiah(remaining)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Set Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="apple-card max-w-md w-full p-6 space-y-4 rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-soft)]">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Atur Kuota Anggaran
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Kategori
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="apple-input cursor-pointer"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Batas Bulanan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-secondary)] pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    placeholder="1500000"
                    value={limitStr}
                    onChange={(e) => setLimitStr(e.target.value)}
                    className="apple-input !pl-10 font-tabular"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] p-3 rounded-lg border border-[var(--color-danger-text)]/20">
                  {errorMsg}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="apple-btn apple-btn-secondary apple-press flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="apple-btn apple-btn-primary apple-press flex-1 gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Simpan Kuota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
