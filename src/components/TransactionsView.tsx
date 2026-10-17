'use client';

import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';
import { AppData, QuickTemplate, Transaction, TransactionType } from '@/types/finance';
import { formatRupiah, formatTimeID } from '@/lib/storage';

interface TransactionsViewProps {
  appData: AppData;
  hideBalance?: boolean;
  onOpenAddModal: (type?: TransactionType) => void;
  onExecuteTemplate: (tmpl: QuickTemplate) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
}

interface DateGroup {
  key: string;
  label: string;
  transactions: Transaction[];
}

function groupTransactionsByDate(transactions: Transaction[]): DateGroup[] {
  const sorted = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: DateGroup[] = [];
  const groupMap = new Map<string, DateGroup>();

  for (const tx of sorted) {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) {
      let unkGroup = groupMap.get('unknown');
      if (!unkGroup) {
        unkGroup = { key: 'unknown', label: 'Lainnya', transactions: [] };
        groupMap.set('unknown', unkGroup);
        groups.push(unkGroup);
      }
      unkGroup.transactions.push(tx);
      continue;
    }

    const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

    let key: string;
    let label: string;

    if (txDay.getTime() === today.getTime()) {
      key = 'today';
      label = 'Hari Ini';
    } else if (txDay.getTime() === yesterday.getTime()) {
      key = 'yesterday';
      label = 'Kemarin';
    } else {
      key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      const rawMonthYear = txDate.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
      label = rawMonthYear.charAt(0).toUpperCase() + rawMonthYear.slice(1);
    }

    let group = groupMap.get(key);
    if (!group) {
      group = { key, label, transactions: [] };
      groupMap.set(key, group);
      groups.push(group);
    }
    group.transactions.push(tx);
  }

  return groups;
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

  const filteredTransactions = useMemo(() => {
    return appData.transactions.filter((tx) => {
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
  }, [appData.transactions, appData.categories, appData.wallets, selectedType, selectedWallet, searchQuery]);

  const dateGroups = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

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
          className="apple-btn apple-btn-primary h-10 text-xs px-4 gap-1.5 apple-press self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Catat Transaksi
        </button>
      </div>

      {/* Quick Template Toggle Bar */}
      <div className="apple-card p-3.5 flex items-center justify-between shadow-sm">
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
          className="apple-btn apple-btn-secondary h-8 px-3 text-xs apple-press"
        >
          {showTemplates ? 'Tutup' : 'Buka'}
        </button>
      </div>

      {/* Expandable Templates Section */}
      {showTemplates && (
        <div className="apple-card p-4 space-y-2 shadow-sm">
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
                    className="flex-1 flex items-center gap-2.5 text-left apple-press"
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
                    className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] transition-colors rounded-lg hover:bg-[var(--color-surface)] apple-press"
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
              className="w-full h-11 pl-10 pr-4 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-soft)] rounded-full outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 shadow-sm transition-all placeholder:text-[var(--color-text-tertiary)]"
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
                className={`px-3.5 py-1.5 text-xs transition-all apple-press ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm font-semibold rounded-lg'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium rounded-lg'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction Groups List */}
      {filteredTransactions.length === 0 ? (
        <div className="apple-card rounded-[20px] p-10 text-center shadow-sm">
          <p className="text-xs text-[var(--color-text-secondary)]">Tidak ada transaksi yang cocok.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {dateGroups.map((group) => (
            <div key={group.key} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] px-1">
                {group.label}
              </h3>
              <div className="apple-card rounded-[20px] divide-y divide-[var(--color-border-soft)] overflow-hidden shadow-sm">
                {group.transactions.map((tx) => {
                  const wallet = appData.wallets.find((w) => w.id === tx.walletId);
                  const toWallet = tx.toWalletId
                    ? appData.wallets.find((w) => w.id === tx.toWalletId)
                    : null;
                  const category = appData.categories.find((c) => c.id === tx.categoryId);

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 hover:bg-[var(--color-surface-2)] transition-colors group gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
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
                          <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                            {tx.type === 'transfer'
                              ? `Transfer ${wallet?.name || ''} ke ${toWallet?.name || ''}`
                              : category?.name || 'Transaksi'}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                            <span>{wallet?.name || 'Dompet'}</span>
                            {' • '}
                            <span className="font-tabular">{formatTimeID(tx.date)}</span>
                            {tx.notes ? ` • ${tx.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <p
                          className={`text-sm font-semibold font-tabular shrink-0 text-right ${
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
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Hapus transaksi ini? Saldo dompet akan disesuaikan.')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] apple-press transition-colors rounded-lg hover:bg-[var(--color-surface-2)]"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
