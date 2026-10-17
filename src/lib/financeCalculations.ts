export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const maskBalance = (val: string, hide: boolean): string => {
  return hide ? 'Rp ••••••••' : val;
};

export interface WalletItem {
  id: string;
  name?: string;
  balance: number;
}

export interface TransactionItem {
  id?: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  walletId: string;
  toWalletId?: string;
  categoryId?: string;
  date: string;
  notes?: string;
}

export interface BudgetItem {
  id?: string;
  categoryId: string;
  limitAmount: number;
  month: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetAmount?: number;
  currentAmount: number;
}

/**
 * Update balances across wallets based on a transaction
 */
export function applyTransactionToWallets<T extends WalletItem>(
  wallets: T[],
  tx: { type: 'expense' | 'income' | 'transfer'; amount: number; walletId: string; toWalletId?: string }
): T[] {
  return wallets.map((w) => {
    if (tx.type === 'expense' && w.id === tx.walletId) {
      return { ...w, balance: w.balance - tx.amount };
    }
    if (tx.type === 'income' && w.id === tx.walletId) {
      return { ...w, balance: w.balance + tx.amount };
    }
    if (tx.type === 'transfer') {
      if (w.id === tx.walletId) {
        return { ...w, balance: w.balance - tx.amount };
      }
      if (w.id === tx.toWalletId) {
        return { ...w, balance: w.balance + tx.amount };
      }
    }
    return w;
  });
}

/**
 * Calculate total monthly income, expense, and net cashflow
 */
export function calculateMonthlyCashflow<T extends { type: string; amount: number; date: string }>(
  transactions: T[],
  monthYear: string
): { income: number; expense: number; net: number } {
  const currentMonthTx = transactions.filter((tx) => tx.date.startsWith(monthYear));

  const income = currentMonthTx
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = currentMonthTx
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return {
    income,
    expense,
    net: income - expense,
  };
}

/**
 * Calculate overall budget allocation and spending percentage
 */
export function calculateBudgetUsage<
  B extends { categoryId: string; limitAmount: number; month: string },
  T extends { type: string; amount: number; categoryId?: string; date: string }
>(
  budgets: B[],
  transactions: T[],
  monthYear: string
): { totalLimit: number; totalSpent: number; usagePercent: number } {
  const currentBudgets = budgets.filter((b) => b.month === monthYear);
  const totalLimit = currentBudgets.reduce((acc, b) => acc + b.limitAmount, 0);

  const spendingMap: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(monthYear))
    .forEach((tx) => {
      if (tx.categoryId) {
        spendingMap[tx.categoryId] = (spendingMap[tx.categoryId] || 0) + tx.amount;
      }
    });

  const totalSpent = currentBudgets.reduce((acc, b) => {
    return acc + (spendingMap[b.categoryId] || 0);
  }, 0);

  const usagePercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return {
    totalLimit,
    totalSpent,
    usagePercent,
  };
}

/**
 * Contribute funds from a wallet into a savings goal
 */
export function contributeToGoal<
  W extends WalletItem,
  G extends GoalItem
>(
  wallets: W[],
  goal: G,
  amount: number,
  fromWalletId: string
): {
  updatedWallets: W[];
  updatedGoal: G;
  transaction: {
    type: 'expense';
    amount: number;
    walletId: string;
    categoryId: string;
    date: string;
    notes: string;
  };
} {
  const updatedWallets = wallets.map((w) =>
    w.id === fromWalletId ? { ...w, balance: w.balance - amount } : w
  );
  const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };

  const transaction = {
    type: 'expense' as const,
    amount,
    walletId: fromWalletId,
    categoryId: 'cat-investment',
    date: new Date().toISOString(),
    notes: `Setoran Tabungan: ${goal.title}`,
  };

  return {
    updatedWallets,
    updatedGoal,
    transaction,
  };
}
