import { AppData } from '@/types/finance';

export const defaultCategories = [
  // Pengeluaran
  { id: 'cat-food', name: 'Makanan & Minuman', type: 'expense' as const, icon: 'Utensils', color: '#f97316' },
  { id: 'cat-transport', name: 'Transportasi & Bensin', type: 'expense' as const, icon: 'Car', color: '#3b82f6' },
  { id: 'cat-bills', name: 'Tagihan & Utilitas', type: 'expense' as const, icon: 'Receipt', color: '#ef4444' },
  { id: 'cat-groceries', name: 'Belanja Bulanan', type: 'expense' as const, icon: 'ShoppingCart', color: '#10b981' },
  { id: 'cat-entertainment', name: 'Hiburan & Hobi', type: 'expense' as const, icon: 'Gamepad2', color: '#8b5cf6' },
  { id: 'cat-health', name: 'Kesehatan & Medis', type: 'expense' as const, icon: 'HeartPulse', color: '#ec4899' },
  { id: 'cat-education', name: 'Edukasi & Buku', type: 'expense' as const, icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat-other-exp', name: 'Pengeluaran Lain', type: 'expense' as const, icon: 'MoreHorizontal', color: '#64748b' },

  // Pemasukan
  { id: 'cat-salary', name: 'Gaji Bulanan', type: 'income' as const, icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Freelance & Side Job', type: 'income' as const, icon: 'Laptop', color: '#3b82f6' },
  { id: 'cat-investment', name: 'Hasil Investasi', type: 'income' as const, icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-bonus', name: 'Bonus & Hadiah', type: 'income' as const, icon: 'Gift', color: '#f59e0b' },
  { id: 'cat-other-inc', name: 'Pemasukan Lain', type: 'income' as const, icon: 'Coins', color: '#64748b' },
];

export const emptyData: AppData = {
  isPinEnabled: false,
  pinHash: '',
  wallets: [
    {
      id: 'w-default',
      name: 'Dompet Utama',
      type: 'cash',
      balance: 0,
      color: '#0071E3',
      icon: 'Wallet',
    },
  ],
  categories: defaultCategories,
  transactions: [],
  budgets: [],
  goals: [],
  templates: [],
};
