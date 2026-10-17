'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, BookmarkPlus } from 'lucide-react';
import { AppData, Transaction, TransactionType } from '@/types/finance';
import { formatRupiah } from '@/lib/storage';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>, saveAsTemplate?: boolean, templateTitle?: string) => void;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  appData,
  onSaveTransaction,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [walletId, setWalletId] = useState<string>(appData.wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState<string>(
    appData.wallets.length > 1 ? appData.wallets[1].id : ''
  );
  const [categoryId, setCategoryId] = useState<string>(
    appData.categories.find(c => c.type === (initialType === 'income' ? 'income' : 'expense'))?.id || ''
  );
  const [notes, setNotes] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(false);
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCategories = appData.categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const parsedAmount = parseFloat(amountStr) || 0;

  const handleQuickAddAmount = (add: number) => {
    setErrorMsg(null);
    setAmountStr((prev) => {
      const current = parseFloat(prev) || 0;
      return String(current + add);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (parsedAmount <= 0) {
      setErrorMsg('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (type === 'transfer' && walletId === toWalletId) {
      setErrorMsg('Dompet asal dan tujuan transfer tidak boleh sama.');
      return;
    }

    const now = new Date();
    onSaveTransaction(
      {
        type,
        amount: parsedAmount,
        walletId,
        toWalletId: type === 'transfer' ? toWalletId : undefined,
        categoryId: type === 'transfer' ? undefined : categoryId,
        date: now.toISOString(),
        notes: notes.trim() || undefined,
      },
      saveAsTemplate,
      templateTitle.trim() || undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="apple-card max-w-lg w-full p-6 space-y-4 rounded-[20px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-soft)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Catat Transaksi</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] border border-[var(--color-border-soft)]">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const firstExp = appData.categories.find((c) => c.type === 'expense');
              if (firstExp) setCategoryId(firstExp.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all ${
              type === 'expense'
                ? 'bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] shadow-sm'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-[var(--radius-md)] hover:text-[var(--color-text)]'
            }`}
          >
            <ArrowDownRight className={`h-3.5 w-3.5 ${type === 'expense' ? 'text-white' : 'text-rose-500'}`} />
            Pengeluaran
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              const firstInc = appData.categories.find((c) => c.type === 'income');
              if (firstInc) setCategoryId(firstInc.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all ${
              type === 'income'
                ? 'bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] shadow-sm'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-[var(--radius-md)] hover:text-[var(--color-text)]'
            }`}
          >
            <ArrowUpRight className={`h-3.5 w-3.5 ${type === 'income' ? 'text-white' : 'text-emerald-500'}`} />
            Pemasukan
          </button>

          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all ${
              type === 'transfer'
                ? 'bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius-md)] shadow-sm'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-[var(--radius-md)] hover:text-[var(--color-text)]'
            }`}
          >
            <ArrowLeftRight className={`h-3.5 w-3.5 ${type === 'transfer' ? 'text-white' : 'text-[var(--color-text-secondary)]'}`} />
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-mono font-medium text-[var(--color-text-secondary)]">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                required
                min="1"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="apple-input pl-11 pr-3 text-xl font-mono font-semibold"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1 text-xs text-[var(--color-text-secondary)] font-mono">
                {formatRupiah(parsedAmount)}
              </p>
            )}

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { label: '+10rb', val: 10000 },
                { label: '+50rb', val: 50000 },
                { label: '+100rb', val: 100000 },
                { label: '+500rb', val: 500000 },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickAddAmount(chip.val)}
                  className="apple-card apple-card-hover text-xs font-mono font-medium py-1.5 px-3 rounded-[8px] border border-[var(--color-border-soft)] text-[var(--color-text)] cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
              {parsedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2.5 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Wallets */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Dari Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="apple-input text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
                  Ke Dompet
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="apple-input text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
                >
                  {appData.wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Akun / Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="apple-input text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="apple-input text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Kopi, Makan Siang..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="apple-input text-xs"
            />
          </div>

          {/* Save as Quick Template Checkbox */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-0 h-4 w-4 bg-[var(--color-surface)]"
              />
              <span className="text-xs text-[var(--color-text)] flex items-center gap-1.5">
                <BookmarkPlus className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                Simpan sebagai template input kilat
              </span>
            </label>

            {saveAsTemplate && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Nama template (cth: Kopi Pagi Rp 25.000)"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="apple-input text-xs"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] p-3 rounded-[var(--radius-md)] border border-[var(--color-danger-text)]/20">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="apple-btn apple-btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              className="apple-btn apple-btn-primary flex-1 gap-1.5"
            >
              <Check className="h-4 w-4" />
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
