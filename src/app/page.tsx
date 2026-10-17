'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { AppData, QuickTemplate, Transaction, TransactionType, Wallet, Goal, Budget } from '@/types/finance';
import {
  loadAppData,
  saveAppData,
  resetToDummyData,
  resetToEmptyData,
  formatRupiah,
} from '@/lib/storage';
import {
  applyTransactionToWallets,
  contributeToGoal as calcContributeToGoal,
} from '@/lib/financeCalculations';
import { ThemeMode, getStoredTheme, applyTheme } from '@/lib/theme';
import { PinLockModal } from '@/components/PinLockModal';
import { Header } from '@/components/Header';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { TransactionsView } from '@/components/TransactionsView';
import { WalletsView } from '@/components/WalletsView';
import { BudgetsView } from '@/components/BudgetsView';
import { GoalsView } from '@/components/GoalsView';
import { SettingsView } from '@/components/SettingsView';
import { TransactionModal } from '@/components/TransactionModal';
import { CheckCircle2 } from 'lucide-react';

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const mounted = useMounted();
  const [appData, setAppData] = useState<AppData | null>(() =>
    typeof window !== 'undefined' ? loadAppData() : null
  );
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const data = loadAppData();
      return Boolean(data.isPinEnabled);
    }
    return true;
  });
  const [hideBalance, setHideBalance] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    typeof window !== 'undefined' ? getStoredTheme() : 'light'
  );

  useEffect(() => {
    const stored = getStoredTheme();
    applyTheme(stored);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentStored = getStoredTheme();
      if (currentStored === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const handleToggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
    applyTheme(nextMode);
  };

  const handleSetTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const updateAndSave = (newData: AppData) => {
    setAppData(newData);
    saveAppData(newData);
  };

  if (!mounted || !appData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
        <p className="text-xs font-mono animate-pulse">Memuat data keuangan...</p>
      </div>
    );
  }

  // 1. Transaction Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'>,
    saveAsTemplate = false,
    templateTitle?: string
  ) => {
    const newTxId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: newTxId,
    };

    const updatedWallets = applyTransactionToWallets(appData.wallets, txData);

    const updatedTemplates = [...appData.templates];
    if (saveAsTemplate) {
      const newTemplate: QuickTemplate = {
        id: `tmpl-${Date.now()}`,
        title: templateTitle || `${txData.notes || 'Transaksi'} (${formatRupiah(txData.amount)})`,
        type: txData.type,
        amount: txData.amount,
        walletId: txData.walletId,
        toWalletId: txData.toWalletId,
        categoryId: txData.categoryId,
        notes: txData.notes,
      };
      updatedTemplates.push(newTemplate);
    }

    const updatedData: AppData = {
      ...appData,
      wallets: updatedWallets,
      transactions: [newTx, ...appData.transactions],
      templates: updatedTemplates,
    };

    updateAndSave(updatedData);
    showToast('Transaksi tercatat.');
  };

  const handleExecuteTemplate = (tmpl: QuickTemplate) => {
    const sourceWallet = appData.wallets.find((w) => w.id === tmpl.walletId);
    if (!sourceWallet) {
      showToast('Dompet terkait template tidak ditemukan.');
      return;
    }

    if (tmpl.type === 'expense' && sourceWallet.balance < tmpl.amount) {
      showToast(`Saldo ${sourceWallet.name} tidak cukup (${formatRupiah(sourceWallet.balance)}).`);
      return;
    }

    handleSaveTransaction({
      type: tmpl.type,
      amount: tmpl.amount,
      walletId: tmpl.walletId,
      toWalletId: tmpl.toWalletId,
      categoryId: tmpl.categoryId,
      date: new Date().toISOString(),
      notes: tmpl.notes || tmpl.title,
    });
    showToast(`Template "${tmpl.title}" langsung dicatat.`);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = appData.transactions.find((t) => t.id === id);
    if (!tx) return;

    // Inverse transaction to revert balance
    const updatedWallets = applyTransactionToWallets(appData.wallets, {
      type: tx.type === 'expense' ? 'income' : tx.type === 'income' ? 'expense' : 'transfer',
      amount: tx.amount,
      walletId: tx.type === 'transfer' ? (tx.toWalletId || '') : tx.walletId,
      toWalletId: tx.type === 'transfer' ? tx.walletId : undefined,
    });

    const updatedData: AppData = {
      ...appData,
      wallets: updatedWallets,
      transactions: appData.transactions.filter((t) => t.id !== id),
    };

    updateAndSave(updatedData);
    showToast('Transaksi dihapus.');
  };

  const handleDeleteTemplate = (id: string) => {
    const updatedData: AppData = {
      ...appData,
      templates: appData.templates.filter((t) => t.id !== id),
    };
    updateAndSave(updatedData);
    showToast('Template dihapus.');
  };

  // 2. Wallets Handlers
  const handleSaveWallet = (wallet: Wallet) => {
    const exists = appData.wallets.some((w) => w.id === wallet.id);
    const updatedWallets = exists
      ? appData.wallets.map((w) => (w.id === wallet.id ? wallet : w))
      : [...appData.wallets, wallet];

    updateAndSave({ ...appData, wallets: updatedWallets });
    showToast('Dompet tersimpan.');
  };

  const handleDeleteWallet = (walletId: string) => {
    const updatedWallets = appData.wallets.filter((w) => w.id !== walletId);
    const updatedTransactions = appData.transactions.filter(
      (tx) => tx.walletId !== walletId && tx.toWalletId !== walletId
    );
    updateAndSave({
      ...appData,
      wallets: updatedWallets,
      transactions: updatedTransactions,
    });
    showToast('Dompet dihapus.');
  };

  // 3. Budgets Handlers
  const handleSaveBudget = (budget: Budget) => {
    const exists = appData.budgets.some((b) => b.id === budget.id);
    const updatedBudgets = exists
      ? appData.budgets.map((b) => (b.id === budget.id ? budget : b))
      : [...appData.budgets, budget];

    updateAndSave({ ...appData, budgets: updatedBudgets });
    showToast('Anggaran tersimpan.');
  };

  const handleDeleteBudget = (budgetId: string) => {
    updateAndSave({
      ...appData,
      budgets: appData.budgets.filter((b) => b.id !== budgetId),
    });
    showToast('Anggaran dihapus.');
  };

  // 4. Goals Handlers
  const handleSaveGoal = (goal: Goal) => {
    const exists = appData.goals.some((g) => g.id === goal.id);
    const updatedGoals = exists
      ? appData.goals.map((g) => (g.id === goal.id ? goal : g))
      : [...appData.goals, goal];

    updateAndSave({ ...appData, goals: updatedGoals });
    showToast('Target tersimpan.');
  };

  const handleDeleteGoal = (goalId: string) => {
    updateAndSave({
      ...appData,
      goals: appData.goals.filter((g) => g.id !== goalId),
    });
    showToast('Target dihapus.');
  };

  const handleContributeToGoal = (goalId: string, amount: number, fromWalletId: string) => {
    const goal = appData.goals.find((g) => g.id === goalId);
    const wallet = appData.wallets.find((w) => w.id === fromWalletId);
    if (!goal || !wallet) return;

    const result = calcContributeToGoal(appData.wallets, goal, amount, fromWalletId);

    updateAndSave({
      ...appData,
      wallets: result.updatedWallets,
      goals: appData.goals.map((g) => (g.id === goalId ? result.updatedGoal : g)),
      transactions: [{ ...result.transaction, id: `tx-${Date.now()}` }, ...appData.transactions],
    });

    showToast(`Setor ${formatRupiah(amount)} berhasil.`);
  };


  // 5. Settings Handlers
  const handleUpdatePin = (newPin: string) => {
    updateAndSave({ ...appData, pinHash: newPin });
  };

  const handleResetDummyData = () => {
    const dummy = resetToDummyData();
    setAppData(dummy);
    showToast('Data demo dimuat.');
  };

  const handleResetEmptyData = () => {
    const empty = resetToEmptyData();
    setAppData(empty);
    showToast('Data dikosongkan.');
  };

  const handleImportData = (importedData: AppData) => {
    updateAndSave(importedData);
    showToast('Data dipulihkan.');
  };

  return (
    <div className="min-h-screen text-[var(--color-text)] selection:bg-[var(--color-primary)] selection:text-white">
      {/* PIN Lockscreen */}
      {isLocked && appData.isPinEnabled && (
        <PinLockModal
          correctPin={appData.pinHash}
          onUnlocked={() => setIsLocked(false)}
        />
      )}

      {/* Main Top Header */}
      <Header
        hideBalance={hideBalance}
        onToggleHideBalance={() => setHideBalance(!hideBalance)}
        onLockApp={() => setIsLocked(true)}
        onOpenSettings={() => setCurrentTab('settings')}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Sleek Minimal Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-36">
        {currentTab === 'dashboard' && (
          <DashboardView
            appData={appData}
            hideBalance={hideBalance}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenAddModal={(type = 'expense') => {
              setModalInitialType(type);
              setIsAddModalOpen(true);
            }}
            onExecuteTemplate={handleExecuteTemplate}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            appData={appData}
            hideBalance={hideBalance}
            onOpenAddModal={(type = 'expense') => {
              setModalInitialType(type);
              setIsAddModalOpen(true);
            }}
            onExecuteTemplate={handleExecuteTemplate}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {currentTab === 'wallets' && (
          <WalletsView
            appData={appData}
            hideBalance={hideBalance}
            onSaveWallet={handleSaveWallet}
            onDeleteWallet={handleDeleteWallet}
            onOpenTransferModal={() => {
              setModalInitialType('transfer');
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetsView
            appData={appData}
            hideBalance={hideBalance}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            appData={appData}
            hideBalance={hideBalance}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            onContributeToGoal={handleContributeToGoal}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            appData={appData}
            onUpdatePin={handleUpdatePin}
            onResetDummyData={handleResetDummyData}
            onResetEmptyData={handleResetEmptyData}
            onImportData={handleImportData}
            themeMode={themeMode}
            onSetTheme={handleSetTheme}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        appData={appData}
        onSaveTransaction={handleSaveTransaction}
        initialType={modalInitialType}
      />
    </div>
  );
}
