'use client';

import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, BookmarkPlus } from 'lucide-react';
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
    appData.categories.find((c) => c.type === (initialType === 'income' ? 'income' : 'expense'))?.id || ''
  );
  const [notes, setNotes] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(false);
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [prevProps, setPrevProps] = useState({ isOpen, initialType });

  if (isOpen !== prevProps.isOpen || initialType !== prevProps.initialType) {
    setPrevProps({ isOpen, initialType });
    if (isOpen) {
      setType(initialType);
      const defaultCat = appData.categories.find(
        (c) => c.type === (initialType === 'income' ? 'income' : 'expense')
      );
      if (defaultCat) setCategoryId(defaultCat.id);
      setErrorMsg(null);
    }
  }

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

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const firstCat = appData.categories.find((c) => c.type === newType);
      if (firstCat) setCategoryId(firstCat.id);
    }
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (parsedAmount <= 0) {
      setErrorMsg('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (type === 'transfer' && (!toWalletId || walletId === toWalletId)) {
      setErrorMsg('Pilih dompet tujuan transfer yang berbeda dan valid.');
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

    setAmountStr('');
    setNotes('');
    setSaveAsTemplate(false);
    setTemplateTitle('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="apple-card w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[22px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag grabber handle on mobile */}
        <div className="sm:hidden w-10 h-1.5 rounded-full bg-[var(--color-border)] mx-auto my-2.5 shrink-0" />

        {/* iOS Navigation Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-[var(--color-border-soft)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-normal text-[var(--color-primary)] hover:opacity-80 apple-press py-1 px-2 cursor-pointer"
          >
            Batal
          </button>
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Catat Transaksi
          </h2>
          <button
            type="submit"
            form="transaction-form"
            className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 apple-press py-1 px-2 cursor-pointer"
          >
            Simpan
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto space-y-4 pb-safe sm:pb-6 flex-1"
        >
          {/* Transaction Type Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border-soft)]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all apple-press ${
                type === 'expense'
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-semibold rounded-lg'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium rounded-lg'
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5 text-[var(--color-danger-text)]" />
              Pengeluaran
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all apple-press ${
                type === 'income'
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-semibold rounded-lg'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium rounded-lg'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
              Pemasukan
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs transition-all apple-press ${
                type === 'transfer'
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-semibold rounded-lg'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium rounded-lg'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Transfer
            </button>
          </div>

          {/* Large Display Amount Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              Nominal Transaksi
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xl sm:text-2xl font-semibold font-tabular text-[var(--color-text-secondary)] select-none">
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
                className="apple-input !h-14 sm:!h-16 !pl-12 sm:!pl-14 pr-4 text-2xl sm:text-3xl font-semibold font-tabular text-[var(--color-text)] rounded-xl"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] font-tabular font-medium">
                {formatRupiah(parsedAmount)}
              </p>
            )}

            {/* Quick amount pills */}
            <div className="flex flex-wrap gap-2 mt-2.5">
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
                  className="apple-card apple-press text-xs font-semibold py-1.5 px-3 rounded-lg border border-[var(--color-border-soft)] text-[var(--color-text)] cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
              {parsedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] transition-colors cursor-pointer apple-press"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Wallets */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Dari Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="apple-input rounded-xl text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
                  className="apple-input rounded-xl text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
                  className="apple-input rounded-xl text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
                  className="apple-input rounded-xl text-xs bg-[var(--color-surface)] text-[var(--color-text)]"
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
              className="apple-input rounded-xl text-xs"
            />
          </div>

          {/* Save as Quick Template Checkbox */}
          <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-0 h-4 w-4 bg-[var(--color-surface)] cursor-pointer"
              />
              <span className="text-xs text-[var(--color-text)] flex items-center gap-1.5 font-medium">
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
                  className="apple-input rounded-xl text-xs"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-[var(--color-danger-text)] bg-[var(--color-danger-bg)] p-3 rounded-xl border border-[var(--color-danger-text)]/20 font-medium">
              {errorMsg}
            </p>
          )}

          {/* Primary Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="apple-btn apple-btn-primary w-full gap-2 rounded-xl apple-press"
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
