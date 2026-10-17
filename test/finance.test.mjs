import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  applyTransactionToWallets,
  calculateMonthlyCashflow,
  calculateBudgetUsage,
  contributeToGoal,
} from '../src/lib/financeCalculations.ts';

test('formatRupiah formats number to IDR string correctly', () => {
  const formatted = formatRupiah(15000000);
  assert.ok(formatted.includes('15.000.000') || formatted.includes('15,000,000'));
});

test('applyTransactionToWallets handles expense correctly', () => {
  const wallets = [
    { id: 'w1', name: 'BCA', balance: 1000000 },
    { id: 'w2', name: 'Cash', balance: 50000 },
  ];
  const tx = {
    type: 'expense',
    amount: 250000,
    walletId: 'w1',
    date: '2026-10-17T10:00:00Z',
  };

  const updated = applyTransactionToWallets(wallets, tx);
  assert.strictEqual(updated.find((w) => w.id === 'w1').balance, 750000);
  assert.strictEqual(updated.find((w) => w.id === 'w2').balance, 50000);
});

test('applyTransactionToWallets handles income correctly', () => {
  const wallets = [{ id: 'w1', name: 'BCA', balance: 1000000 }];
  const tx = {
    type: 'income',
    amount: 5000000,
    walletId: 'w1',
    date: '2026-10-17T10:00:00Z',
  };

  const updated = applyTransactionToWallets(wallets, tx);
  assert.strictEqual(updated[0].balance, 6000000);
});

test('applyTransactionToWallets handles transfer between two wallets', () => {
  const wallets = [
    { id: 'w1', name: 'BCA', balance: 1000000 },
    { id: 'w2', name: 'GoPay', balance: 50000 },
  ];
  const tx = {
    type: 'transfer',
    amount: 200000,
    walletId: 'w1',
    toWalletId: 'w2',
    date: '2026-10-17T10:00:00Z',
  };

  const updated = applyTransactionToWallets(wallets, tx);
  assert.strictEqual(updated.find((w) => w.id === 'w1').balance, 800000);
  assert.strictEqual(updated.find((w) => w.id === 'w2').balance, 250000);
});

test('calculateMonthlyCashflow computes income, expense, and net correctly for specific month', () => {
  const transactions = [
    { id: 't1', type: 'income', amount: 10000000, date: '2026-10-01T09:00:00Z' },
    { id: 't2', type: 'expense', amount: 3000000, date: '2026-10-05T12:00:00Z' },
    { id: 't3', type: 'expense', amount: 1500000, date: '2026-10-10T14:00:00Z' },
    { id: 't4', type: 'expense', amount: 500000, date: '2026-09-28T10:00:00Z' }, // Bulan lalu
  ];

  const cashflow = calculateMonthlyCashflow(transactions, '2026-10');
  assert.strictEqual(cashflow.income, 10000000);
  assert.strictEqual(cashflow.expense, 4500000);
  assert.strictEqual(cashflow.net, 5500000);
});

test('calculateBudgetUsage computes percentage and remaining quota', () => {
  const budgets = [
    { id: 'b1', categoryId: 'cat-food', limitAmount: 2000000, month: '2026-10' },
    { id: 'b2', categoryId: 'cat-transport', limitAmount: 1000000, month: '2026-10' },
  ];
  const transactions = [
    { id: 't1', type: 'expense', amount: 1200000, categoryId: 'cat-food', date: '2026-10-02T10:00:00Z' },
    { id: 't2', type: 'expense', amount: 300000, categoryId: 'cat-transport', date: '2026-10-03T10:00:00Z' },
  ];

  const usage = calculateBudgetUsage(budgets, transactions, '2026-10');
  assert.strictEqual(usage.totalLimit, 3000000);
  assert.strictEqual(usage.totalSpent, 1500000);
  assert.strictEqual(usage.usagePercent, 50);
});

test('contributeToGoal deducts wallet and increments goal currentAmount', () => {
  const wallets = [{ id: 'w1', name: 'BCA', balance: 5000000 }];
  const goal = {
    id: 'g1',
    title: 'Dana Darurat',
    targetAmount: 30000000,
    currentAmount: 10000000,
  };

  const result = contributeToGoal(wallets, goal, 2000000, 'w1');
  assert.strictEqual(result.updatedWallets.find((w) => w.id === 'w1').balance, 3000000);
  assert.strictEqual(result.updatedGoal.currentAmount, 12000000);
  assert.strictEqual(result.transaction.amount, 2000000);
  assert.strictEqual(result.transaction.walletId, 'w1');
});
