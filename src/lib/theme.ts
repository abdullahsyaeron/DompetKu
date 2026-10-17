export type ThemeMode = 'light' | 'dark' | 'system';

export function resolveIsDark(mode: ThemeMode, systemPrefersDark: boolean): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return Boolean(systemPrefersDark);
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    return (localStorage.getItem('finance_theme_mode') as ThemeMode) || 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(mode: ThemeMode): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem('finance_theme_mode', mode);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = resolveIsDark(mode, systemPrefersDark);
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    return isDark;
  } catch {
    return false;
  }
}
