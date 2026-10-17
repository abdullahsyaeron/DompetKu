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

export interface BillingCycleRange {
  startDate: Date;
  endDate: Date;
  label: string;
  shortLabel: string;
  cycleKey: string;
}

export interface CycleFinancialSummary {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  status: 'surplus' | 'warning' | 'deficit';
  statusLabel: string;
  statusColor: string;
}

export interface HistoricalCycleData {
  range: BillingCycleRange;
  summary: CycleFinancialSummary;
  isCurrent: boolean;
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function getBillingCycleRange(
  referenceDate: Date = new Date(),
  cycleStartDay: number = 1,
  cycleOffset: number = 0
): BillingCycleRange {
  const safeStartDay = Math.max(1, Math.min(31, Math.floor(cycleStartDay || 1)));
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDate = referenceDate.getDate();

  const startYear = refYear;
  let startMonth: number;

  if (safeStartDay === 1) {
    startMonth = refMonth + cycleOffset;
  } else {
    const baseMonth = refDate >= safeStartDay ? refMonth : refMonth - 1;
    startMonth = baseMonth + cycleOffset;
  }

  const tempStartDate = new Date(startYear, startMonth, 1);
  const resolvedStartYear = tempStartDate.getFullYear();
  const resolvedStartMonth = tempStartDate.getMonth();
  const daysInStartMonth = new Date(resolvedStartYear, resolvedStartMonth + 1, 0).getDate();
  const effectiveStartDay = Math.min(safeStartDay, daysInStartMonth);
  const startDate = new Date(resolvedStartYear, resolvedStartMonth, effectiveStartDay, 0, 0, 0, 0);

  let endDate: Date;
  if (safeStartDay === 1) {
    endDate = new Date(resolvedStartYear, resolvedStartMonth + 1, 0, 23, 59, 59, 999);
  } else {
    const tempEndDate = new Date(resolvedStartYear, resolvedStartMonth + 1, 1);
    const resolvedEndYear = tempEndDate.getFullYear();
    const resolvedEndMonth = tempEndDate.getMonth();
    const daysInEndMonth = new Date(resolvedEndYear, resolvedEndMonth + 1, 0).getDate();
    const targetEndDay = safeStartDay - 1;
    const effectiveEndDay = Math.min(targetEndDay, daysInEndMonth);
    endDate = new Date(resolvedEndYear, resolvedEndMonth, effectiveEndDay, 23, 59, 59, 999);
  }

  const sDay = startDate.getDate();
  const sMonth = MONTH_NAMES_SHORT[startDate.getMonth()];
  const sYear = startDate.getFullYear();

  const eDay = endDate.getDate();
  const eMonth = MONTH_NAMES_SHORT[endDate.getMonth()];
  const eYear = endDate.getFullYear();

  const label = sYear === eYear
    ? `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`
    : `${sDay} ${sMonth} ${sYear} – ${eDay} ${eMonth} ${eYear}`;

  const shortLabel = MONTH_NAMES_SHORT[endDate.getMonth()];
  const cycleKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

  return {
    startDate,
    endDate,
    label,
    shortLabel,
    cycleKey,
  };
}

export function calculateCycleCashflow<T extends { type: string; amount: number; date: string }>(
  transactions: T[],
  cycleRange: BillingCycleRange
): CycleFinancialSummary {
  const startTime = cycleRange.startDate.getTime();
  const endTime = cycleRange.endDate.getTime();

  const cycleTx = transactions.filter((tx) => {
    const t = new Date(tx.date).getTime();
    return t >= startTime && t <= endTime;
  });

  const income = cycleTx
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = cycleTx
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

  let status: 'surplus' | 'warning' | 'deficit';
  let statusLabel: string;
  let statusColor: string;

  if (net < 0) {
    status = 'deficit';
    statusLabel = 'Defisit';
    statusColor = 'var(--color-danger-text)';
  } else if (savingsRate < 20) {
    status = 'warning';
    statusLabel = 'Waspada';
    statusColor = 'var(--color-warning-text, #f59e0b)';
  } else {
    status = 'surplus';
    statusLabel = 'Surplus Sehat';
    statusColor = 'var(--color-success-text)';
  }

  return {
    income,
    expense,
    net,
    savingsRate,
    status,
    statusLabel,
    statusColor,
  };
}

export function getHistoricalCyclesCashflow<T extends { type: string; amount: number; date: string }>(
  transactions: T[],
  cycleStartDay: number = 1,
  count: number = 6,
  selectedOffset: number = 0,
  referenceDate: Date = new Date()
): HistoricalCycleData[] {
  const result: HistoricalCycleData[] = [];

  for (let i = 0; i < count; i++) {
    const offset = i - (count - 1);
    const range = getBillingCycleRange(referenceDate, cycleStartDay, offset);
    const summary = calculateCycleCashflow(transactions, range);
    result.push({
      range,
      summary,
      isCurrent: offset === selectedOffset,
    });
  }

  return result;
}

