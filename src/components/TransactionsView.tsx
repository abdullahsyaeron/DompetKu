'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';
import { AppData, QuickTemplate, TransactionType } from '@/types/finance';
import { formatRupiah, formatDateID, formatTimeID } from '@/lib/storage';

interface TransactionsViewProps {
  appData: AppData;
  hideBalance: boolean;
  onOpenAddModal: (type?: TransactionType) => void;
  onExecuteTemplate: (tmpl: QuickTemplate) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  appData,
  onOpenAddModal,
  onExecuteTemplate,
  onDeleteTransaction,
  onDeleteTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  const filteredTransactions = appData.transactions.filter((tx) => {
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (
      selectedWallet !== 'all' &&
      tx.walletId !== selectedWallet &&
      tx.toWalletId !== selectedWallet
    )
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cat = appData.categories.find((c) => c.id === tx.categoryId)?.name || '';
      const notes = tx.notes || '';
      const wallet = appData.wallets.find((w) => w.id === tx.walletId)?.name || '';
      return (
        cat.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q) ||
        wallet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-36">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {filteredTransactions.length} transaksi tercatat
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenAddModal('expense')}
          className="apple-btn apple-btn-primary h-10 text-xs px-4 gap-1.5 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Catat Transaksi
        </button>
      </div>

      {/* Quick Template Toggle Bar */}
      <div className="apple-card p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-primary)]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-text)]">Template Rutin</p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              {appData.templates.length} template untuk input 1-ketukan
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="apple-btn apple-btn-secondary h-8 px-3 text-xs"
        >
          {showTemplates ? 'Tutup' : 'Buka'}
        </button>
      </div>

      {/* Expandable Templates Section */}
      {showTemplates && (
        <div className="apple-card p-4 space-y-2">
          {appData.templates.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">
              Belum ada template rutin. Simpan template saat mencatat transaksi.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {appData.templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] hover:border-[var(--color-border)] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onExecuteTemplate(tmpl)}
                    className="flex-1 flex items-center gap-2.5 text-left"
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        tmpl.type === 'expense'
                          ? 'bg-[var(--color-danger-text)]'
                          : tmpl.type === 'income'
                          ? 'bg-[var(--color-success-text)]'
                          : 'bg-[var(--color-primary)]'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text)]">{tmpl.title}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] font-tabular">
                        {formatRupiah(tmpl.amount)}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(tmpl.id)}
                    className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] transition-colors rounded-lg hover:bg-[var(--color-surface)]"
                    title="Hapus template"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Cari transaksi, pos, atau keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-soft)] rounded-xl outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm transition-all placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>

          <div className="w-full sm:w-52 shrink-0">
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-soft)] rounded-xl outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm transition-all cursor-pointer font-medium"
            >
              <option value="all">Semua Dompet</option>
              {appData.wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Apple Segmented Control Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] w-fit max-w-full overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'expense', label: 'Pengeluaran' },
            { id: 'income', label: 'Pemasukan' },
            { id: 'transfer', label: 'Transfer' },
          ].map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="apple-card p-10 text-center">
          <p className="text-xs text-[var(--color-text-secondary)]">Tidak ada transaksi yang cocok.</p>
        </div>
      ) : (
        <div className="apple-card divide-y divide-[var(--color-border-soft)] overflow-hidden">
          {filteredTransactions.map((tx) => {
            const wallet = appData.wallets.find((w) => w.id === tx.walletId);
            const toWallet = tx.toWalletId
              ? appData.wallets.find((w) => w.id === tx.toWalletId)
              : null;
            const category = appData.categories.find((c) => c.id === tx.categoryId);

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 hover:bg-[var(--color-surface-2)] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0 ${
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
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                      {tx.type === 'transfer'
                        ? `Transfer ${wallet?.name || ''} ke ${toWallet?.name || ''}`
                        : category?.name || 'Transaksi'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] mt-0.5 flex-wrap">
                      <span>{wallet?.name || 'Dompet'}</span>
                      <span>•</span>
                      <span className="font-tabular">
                        {formatDateID(tx.date)} {formatTimeID(tx.date)}
                      </span>
                    </div>
                    {tx.notes && (
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                        {tx.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
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
                      {formatRupiah(tx.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus transaksi ini? Saldo dompet akan disesuaikan.')) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-40 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-surface)] transition-all"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
