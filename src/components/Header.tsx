'use client';

import React from 'react';
import { Eye, EyeOff, Lock, Cloud, HardDrive, Sun, Moon } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { resolveIsDark } from '@/lib/theme';

export interface HeaderProps {
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  onLockApp: () => void;
  onOpenSettings: () => void;
  themeMode?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hideBalance,
  onToggleHideBalance,
  onLockApp,
  onOpenSettings,
  themeMode,
  onToggleTheme,
}) => {
  const isDark = resolveIsDark(
    themeMode || 'system',
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--color-border-soft)] apple-navbar">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-border-soft)] font-bold text-sm tracking-tighter flex items-center justify-center">
            <span>DK</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[var(--color-text)] tracking-tight leading-none">
                DompetKu
              </h1>
              <span className="text-[10px] font-medium py-0.5 px-2 bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] rounded-full">
                Personal
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-tight mt-0.5">
              Rencana & Pantau Keuangan
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Storage Mode indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="apple-press hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            title="Pengaturan penyimpanan data"
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <span className="text-[11px] font-medium">Supabase Cloud</span>
              </>
            ) : (
              <>
                <HardDrive className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Offline Lokal</span>
              </>
            )}
          </button>

          {/* Privacy Toggle (Hide/Show Balances) */}
          <button
            type="button"
            onClick={onToggleHideBalance}
            className="apple-press h-8 w-8 rounded-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center border border-[var(--color-border-soft)]"
            title={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            aria-label={hideBalance ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
          >
            {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="apple-press h-8 w-8 rounded-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center border border-[var(--color-border-soft)]"
              title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* Quick Lock App */}
          <button
            type="button"
            onClick={onLockApp}
            className="apple-press h-8 w-8 rounded-[10px] bg-[var(--color-surface-2)] hover:bg-[var(--color-border-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center border border-[var(--color-border-soft)]"
            title="Kunci Aplikasi"
            aria-label="Kunci Aplikasi"
          >
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
