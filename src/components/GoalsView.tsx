'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  PiggyBank,
  X,
  Check,
} from 'lucide-react';
import { AppData, Goal } from '@/types/finance';
import { formatRupiah, formatDateID } from '@/lib/storage';
import { maskBalance } from '@/lib/financeCalculations';

interface GoalsViewProps {
  appData: AppData;
  hideBalance: boolean;
  onSaveGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onContributeToGoal: (goalId: string, amount: number, fromWalletId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  appData,
  hideBalance,
  onSaveGoal,
  onDeleteGoal,
  onContributeToGoal,
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositWalletId, setDepositWalletId] = useState(appData.wallets[0]?.id || '');

  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Keamanan Finansial');
  const [color, setColor] = useState('#27272a');
  const [goalErrorMsg, setGoalErrorMsg] = useState<string | null>(null);
  const [depositErrorMsg, setDepositErrorMsg] = useState<string | null>(null);

  const mask = (val: string) => maskBalance(val, hideBalance);

  const totalTarget = appData.goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = appData.goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAddGoal = () => {
    setGoalErrorMsg(null);
    setEditingGoal(null);
    setTitle('');
    setTargetAmountStr('');
    setCurrentAmountStr('0');
    setTargetDate('2026-12-31');
    setCategory('Keamanan Finansial');
    setColor('#27272a');
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (g: Goal) => {
    setGoalErrorMsg(null);
    setEditingGoal(g);
    setTitle(g.title);
    setTargetAmountStr(String(g.targetAmount));
    setCurrentAmountStr(String(g.currentAmount));
    setTargetDate(g.targetDate);
    setCategory(g.category);
    setColor(g.color || '#27272a');
    setIsGoalModalOpen(true);
  };

  const handleOpenDeposit = (g: Goal) => {
    setDepositErrorMsg(null);
    setSelectedGoalForDeposit(g);
    setDepositAmountStr('');
    setDepositWalletId(appData.wallets[0]?.id || '');
    setIsDepositModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalErrorMsg(null);
    if (!title.trim()) return;
    const targetAmt = parseFloat(targetAmountStr) || 0;
    const currentAmt = parseFloat(currentAmountStr) || 0;
    if (targetAmt <= 0) {
      setGoalErrorMsg('Masukkan target nominal yang valid.');
      return;
    }

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : `g-${Date.now()}`,
      title: title.trim(),
      targetAmount: targetAmt,
      currentAmount: currentAmt,
      targetDate,
      category,
      color,
    };

    onSaveGoal(newGoal);
    setIsGoalModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositErrorMsg(null);
    if (!selectedGoalForDeposit) return;
    const amount = parseFloat(depositAmountStr) || 0;
    if (amount <= 0) {
      setDepositErrorMsg('Masukkan nominal setoran tabungan yang valid.');
      return;
    }

    const sourceWallet = appData.wallets.find((w) => w.id === depositWalletId);
    if (!sourceWallet) return;
    if (sourceWallet.balance < amount) {
      setDepositErrorMsg(`Saldo ${sourceWallet.name} tidak mencukupi (${formatRupiah(sourceWallet.balance)}).`);
      return;
    }

    onContributeToGoal(selectedGoalForDeposit.id, amount, depositWalletId);
    setIsDepositModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-36">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Target Finansial
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Perencanaan dana darurat dan akumulasi tabungan
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddGoal}
          className="apple-btn apple-btn-primary h-9 px-3.5 text-xs gap-1.5 apple-press self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Target Baru
        </button>
      </div>

      {/* Hero Summary Card */}
      <div className="apple-card p-6 space-y-4 rounded-[20px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                Total Akumulasi Tabungan
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] font-tabular mt-0.5">
                {mask(formatRupiah(totalSaved))}
              </h3>
            </div>
          </div>
          <div className="apple-badge bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border-soft)] font-tabular">
            {overallPercent}% Tercapai
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
          <div className="flex justify-between font-tabular text-xs text-[var(--color-text-secondary)]">
            <span>Terkumpul: {mask(formatRupiah(totalSaved))}</span>
            <span>Target Total: {formatRupiah(totalTarget)}</span>
          </div>
        </div>
      </div>

      {/* Goals Cards List */}
      {appData.goals.length === 0 ? (
        <div className="apple-card p-10 text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Belum ada target finansial. Klik &quot;Target Baru&quot; untuk membuat rencana tabungan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appData.goals.map((g) => {
            const percent = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className="apple-card apple-card-hover rounded-[20px] p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[var(--color-text)] truncate">{g.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="apple-badge bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] text-[10px]">
                            {g.category}
                          </span>
                          <span className="apple-badge bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] text-[10px] gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateID(g.targetDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors apple-press"
                        title="Ubah target"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus target "${g.title}"?`)) {
                            onDeleteGoal(g.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-surface-2)] transition-colors apple-press"
                        title="Hapus target"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Amounts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-tabular">
                      <span className="text-[var(--color-text)] font-semibold">
                        {mask(formatRupiah(g.currentAmount))}
                      </span>
                      <span className="text-[var(--color-text-secondary)]">
                        Target: {formatRupiah(g.targetAmount)}
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border-soft)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-tabular">
                      <span>{percent}% tercapai</span>
                      <span>{percent >= 100 ? 'Target tercapai!' : `${mask(formatRupiah(remaining))} lagi`}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[var(--color-border-soft)] flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {percent >= 100 ? 'Target selesai tercapai' : 'Alokasi tabungan'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenDeposit(g)}
                    className="apple-btn apple-btn-primary h-9 text-xs px-3.5 gap-1 apple-press"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Tabung
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Goal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="apple-card max-w-md w-full p-6 space-y-4 rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-soft)]">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                {editingGoal ? 'Ubah Target' : 'Tambah Target Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors apple-press"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat 6 Bulan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Target Nominal (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-secondary)] pointer-events-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      value={targetAmountStr}
                      onChange={(e) => setTargetAmountStr(e.target.value)}
                      className="apple-input !pl-10 font-tabular"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Saldo Awal (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-secondary)] pointer-events-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={currentAmountStr}
                      onChange={(e) => setCurrentAmountStr(e.target.value)}
                      className="apple-input !pl-10 font-tabular"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="apple-input cursor-pointer"
                  >
                    <option value="Keamanan Finansial">Keamanan Finansial</option>
                    <option value="Impian & Rekreasi">Impian & Rekreasi</option>
                    <option value="Peralatan Kerja">Peralatan Kerja</option>
                    <option value="Investasi Jangka Panjang">Investasi Jangka Panjang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Tenggat Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="apple-input"
                  />
                </div>
              </div>

              {goalErrorMsg && (
                <p className="text-xs text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] p-3 rounded-lg border border-[var(--color-danger-text)]/20">
                  {goalErrorMsg}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="apple-btn apple-btn-secondary flex-1 apple-press"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="apple-btn apple-btn-primary flex-1 apple-press gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Setor Tabungan */}
      {isDepositModalOpen && selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="apple-card max-w-md w-full p-6 space-y-4 rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-soft)]">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Setor ke: {selectedGoalForDeposit.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors apple-press"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Pilih Dompet Sumber
                </label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="apple-input cursor-pointer"
                >
                  {appData.wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Nominal Setoran (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-secondary)] pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    placeholder="Contoh: 500000"
                    value={depositAmountStr}
                    onChange={(e) => setDepositAmountStr(e.target.value)}
                    className="apple-input !pl-10 font-tabular"
                  />
                </div>
              </div>

              {depositErrorMsg && (
                <p className="text-xs text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] p-3 rounded-lg border border-[var(--color-danger-text)]/20">
                  {depositErrorMsg}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="apple-btn apple-btn-secondary flex-1 apple-press"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="apple-btn apple-btn-primary flex-1 apple-press gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Alokasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
