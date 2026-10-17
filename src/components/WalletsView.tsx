'use client';

import React, { useState } from 'react';
import {
  Plus,
  ArrowLeftRight,
  Building2,
  Smartphone,
  Wallet as WalletIcon,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { AppData, Wallet, WalletType } from '@/types/finance';
import { formatRupiah } from '@/lib/storage';
import { maskBalance } from '@/lib/financeCalculations';

interface WalletsViewProps {
  appData: AppData;
  hideBalance: boolean;
  onSaveWallet: (wallet: Wallet) => void;
  onDeleteWallet: (walletId: string) => void;
  onOpenTransferModal: () => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  appData,
  hideBalance,
  onSaveWallet,
  onDeleteWallet,
  onOpenTransferModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balanceStr, setBalanceStr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#27272a');

  const mask = (val: string) => maskBalance(val, hideBalance);
  const totalBalance = appData.wallets.reduce((acc, w) => acc + w.balance, 0);

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setName('');
    setType('bank');
    setBalanceStr('0');
    setAccountNumber('');
    setColor('#27272a');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setBalanceStr(String(w.balance));
    setAccountNumber(w.accountNumber || '');
    setColor(w.color || '#27272a');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWallet: Wallet = {
      id: editingWallet ? editingWallet.id : `w-${Date.now()}`,
      name: name.trim(),
      type,
      balance: parseFloat(balanceStr) || 0,
      accountNumber: accountNumber.trim() || undefined,
      color,
      icon:
        type === 'bank'
          ? 'Building2'
          : type === 'ewallet'
          ? 'Smartphone'
          : 'Wallet',
    };

    onSaveWallet(newWallet);
    setIsModalOpen(false);
  };

  const getWalletIcon = (wType: WalletType) => {
    switch (wType) {
      case 'bank':
        return Building2;
      case 'ewallet':
        return Smartphone;
      default:
        return WalletIcon;
    }
  };

  return (
    <div className="space-y-6 pb-36">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text)]">
            Dompet & Rekening
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {appData.wallets.length} pos penyimpanan uang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTransferModal}
            className="apple-btn apple-btn-secondary apple-press h-9 px-3.5 text-xs gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            Transfer
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="apple-btn apple-btn-primary apple-press h-9 px-3.5 text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="apple-card p-6 rounded-[20px]">
        <div className="flex items-center justify-between">
          <div>
            <span className="apple-badge text-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              Total Akumulasi Saldo
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text)] font-tabular mt-2">
              {mask(formatRupiah(totalBalance))}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-text-secondary)]">
            <WalletIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {appData.wallets.map((w) => {
          const IconComp = getWalletIcon(w.type);
          const typeLabel =
            w.type === 'bank'
              ? 'Bank Account'
              : w.type === 'ewallet'
              ? 'Digital Wallet'
              : 'Cash Vault';

          return (
            <div
              key={w.id}
              className="apple-card apple-card-hover p-5 rounded-[20px] flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-text)] shrink-0">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--color-text)] leading-tight truncate">
                      {w.name}
                    </h4>
                    <span className="apple-badge text-[10px] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] mt-1">
                      {typeLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(w)}
                    className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                    title="Ubah data dompet"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {appData.wallets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Hapus dompet "${w.name}"? Transaksi terkait dompet ini akan ikut terhapus.`
                          )
                        ) {
                          onDeleteWallet(w.id);
                        }
                      }}
                      className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors"
                      title="Hapus dompet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[var(--color-border-soft)]">
                <p className="text-[11px] text-[var(--color-text-secondary)]">Saldo Tersedia</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="font-tabular font-semibold text-lg text-[var(--color-text)]">
                    {mask(formatRupiah(w.balance))}
                  </p>
                  {w.accountNumber && (
                    <span className="font-tabular text-xs text-[var(--color-text-secondary)]">
                      •••• {w.accountNumber.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Wallet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="apple-card max-w-md w-full p-6 space-y-4 rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-soft)]">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                {editingWallet ? 'Ubah Dompet' : 'Tambah Dompet'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="apple-press p-1.5 rounded-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Utama, GoPay, Tunai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="apple-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Tipe
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WalletType)}
                    className="apple-input cursor-pointer"
                  >
                    <option value="bank">Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Tunai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Nomor Rekening / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Opsional"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="apple-input font-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Saldo Saat Ini (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--color-text-secondary)] pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    value={balanceStr}
                    onChange={(e) => setBalanceStr(e.target.value)}
                    className="apple-input !pl-10 font-tabular"
                  />
                </div>
              </div>

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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
