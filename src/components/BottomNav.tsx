'use client';

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Target,
  Settings,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'wallets'
  | 'goals'
  | 'settings';

export interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems = [
    { key: 'dashboard' as TabKey, label: 'Beranda', icon: LayoutDashboard },
    { key: 'transactions' as TabKey, label: 'Transaksi', icon: ArrowLeftRight },
    { key: 'budgets' as TabKey, label: 'Anggaran', icon: PieChart },
    { key: 'wallets' as TabKey, label: 'Dompet', icon: Wallet },
    { key: 'goals' as TabKey, label: 'Target', icon: Target },
    { key: 'settings' as TabKey, label: 'Setelan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 apple-navbar border-t border-[var(--color-border-soft)] pb-safe">
      <div className="max-w-xl mx-auto px-3 flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              className="apple-press flex flex-col items-center justify-center flex-1 py-1"
            >
              <div
                className={`p-1.5 rounded-[10px] transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'bg-transparent text-[var(--color-text-secondary)]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.2]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive
                    ? 'text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-secondary)] font-normal'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
