import { AppData } from '@/types/finance';

const getRecentDate = (daysAgo: number, timeStr = '12:00:00'): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${timeStr}`;
};

const getCurrentMonthStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

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

export const initialDummyData: AppData = {
  isPinEnabled: true,
  pinHash: '1234', // Default PIN demo
  wallets: [
    {
      id: 'w-bca',
      name: 'BCA Utama',
      type: 'bank',
      balance: 14500000,
      accountNumber: '8271xxxx12',
      color: '#00529C',
      icon: 'Building2',
    },
    {
      id: 'w-mandiri',
      name: 'Mandiri Payroll',
      type: 'bank',
      balance: 5200000,
      accountNumber: '1370xxxx89',
      color: '#0B3F7E',
      icon: 'CreditCard',
    },
    {
      id: 'w-gopay',
      name: 'GoPay / GoPay Tabungan',
      type: 'ewallet',
      balance: 385000,
      accountNumber: '0812xxxx9921',
      color: '#00AA13',
      icon: 'Smartphone',
    },
    {
      id: 'w-cash',
      name: 'Kas Tunai Dompet',
      type: 'cash',
      balance: 450000,
      color: '#15803d',
      icon: 'Wallet',
    },
  ],
  categories: defaultCategories,
  transactions: [
    {
      id: 'tx-1',
      type: 'income',
      amount: 15000000,
      walletId: 'w-mandiri',
      categoryId: 'cat-salary',
      date: getRecentDate(12, '09:00:00'),
      notes: 'Gaji Pokok Perusahaan',
    },
    {
      id: 'tx-2',
      type: 'transfer',
      amount: 8000000,
      walletId: 'w-mandiri',
      toWalletId: 'w-bca',
      date: getRecentDate(12, '10:00:00'),
      notes: 'Pindah alokasi tabungan BCA',
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 1250000,
      walletId: 'w-bca',
      categoryId: 'cat-bills',
      date: getRecentDate(10, '14:20:00'),
      notes: 'Listrik PLN & WiFi Indihome',
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 850000,
      walletId: 'w-bca',
      categoryId: 'cat-groceries',
      date: getRecentDate(8, '18:45:00'),
      notes: 'Superindo mingguan',
    },
    {
      id: 'tx-5',
      type: 'income',
      amount: 2500000,
      walletId: 'w-bca',
      categoryId: 'cat-freelance',
      date: getRecentDate(5, '11:15:00'),
      notes: 'Project Web Dashboard UI',
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 150000,
      walletId: 'w-gopay',
      categoryId: 'cat-transport',
      date: getRecentDate(3, '08:30:00'),
      notes: 'Bensin & Tol',
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 45000,
      walletId: 'w-cash',
      categoryId: 'cat-food',
      date: getRecentDate(1, '12:30:00'),
      notes: 'Makan siang Nasi Padang',
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 28000,
      walletId: 'w-gopay',
      categoryId: 'cat-food',
      date: getRecentDate(0, '15:10:00'),
      notes: 'Es Kopi Susu Aren',
    },
  ],
  budgets: [
    {
      id: 'b-food',
      categoryId: 'cat-food',
      limitAmount: 2500000,
      month: getCurrentMonthStr(),
    },
    {
      id: 'b-transport',
      categoryId: 'cat-transport',
      limitAmount: 1000000,
      month: getCurrentMonthStr(),
    },
    {
      id: 'b-groceries',
      categoryId: 'cat-groceries',
      limitAmount: 2000000,
      month: getCurrentMonthStr(),
    },
    {
      id: 'b-bills',
      categoryId: 'cat-bills',
      limitAmount: 1500000,
      month: getCurrentMonthStr(),
    },
    {
      id: 'b-entertainment',
      categoryId: 'cat-entertainment',
      limitAmount: 800000,
      month: getCurrentMonthStr(),
    },
  ],
  goals: [
    {
      id: 'g-emergency',
      title: 'Dana Darurat 6 Bulan',
      targetAmount: 30000000,
      currentAmount: 18500000,
      targetDate: '2026-12-31',
      category: 'Keamanan Finansial',
      color: '#0284c7',
    },
    {
      id: 'g-vacation',
      title: 'Liburan Akhir Tahun Jepang',
      targetAmount: 15000000,
      currentAmount: 6200000,
      targetDate: '2026-11-20',
      category: 'Impian & Rekreasi',
      color: '#ec4899',
    },
    {
      id: 'g-gadget',
      title: 'Laptop Upgrade M-Series',
      targetAmount: 20000000,
      currentAmount: 8000000,
      targetDate: '2027-02-15',
      category: 'Peralatan Kerja',
      color: '#8b5cf6',
    },
  ],
  templates: [
    {
      id: 'tmpl-kopi',
      title: 'Kopi Harian (Rp 25.000)',
      type: 'expense',
      amount: 25000,
      walletId: 'w-gopay',
      categoryId: 'cat-food',
      notes: 'Kopi Susu Harian',
    },
    {
      id: 'tmpl-bensin',
      title: 'Isi Bensin Motor (Rp 35.000)',
      type: 'expense',
      amount: 35000,
      walletId: 'w-cash',
      categoryId: 'cat-transport',
      notes: 'Bensin Pertalite / Pertamax',
    },
    {
      id: 'tmpl-makan',
      title: 'Makan Siang (Rp 30.000)',
      type: 'expense',
      amount: 30000,
      walletId: 'w-cash',
      categoryId: 'cat-food',
      notes: 'Makan siang',
    },
    {
      id: 'tmpl-topup',
      title: 'Top Up GoPay (Rp 200.000)',
      type: 'transfer',
      amount: 200000,
      walletId: 'w-bca',
      toWalletId: 'w-gopay',
      notes: 'Top Up saldo GoPay dari BCA',
    },
  ],
};

export const emptyData: AppData = {
  isPinEnabled: true,
  pinHash: '1234',
  wallets: [
    {
      id: 'w-default',
      name: 'Dompet Utama',
      type: 'bank',
      balance: 0,
      color: '#0284c7',
      icon: 'Wallet',
    },
  ],
  categories: defaultCategories,
  transactions: [],
  budgets: [],
  goals: [],
  templates: [],
};
