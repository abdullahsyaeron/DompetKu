export type WalletType = 'bank' | 'ewallet' | 'cash' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  walletId: string;
  toWalletId?: string; // Khusus transfer
  categoryId?: string; // Khusus income/expense
  date: string; // ISO format (YYYY-MM-DDTHH:mm:ss)
  notes?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  month: string; // Format: YYYY-MM
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string;
}

export interface QuickTemplate {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  walletId: string;
  toWalletId?: string;
  categoryId?: string;
  notes?: string;
}

export interface AppData {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  templates: QuickTemplate[];
  pinHash: string; // PIN 4-6 digit
  isPinEnabled: boolean;
}
