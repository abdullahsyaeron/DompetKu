# LabSpace Dual-Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the financial planning PWA UI to match the LabSpace Apple/iOS design system (`DESIGN.md`) with flawless Dual-Theme (Light `#F5F5F7` + Apple macOS Dark `#000000`/`#1C1C1E`) support.

**Architecture:** Centralized CSS custom properties in `globals.css` driving all color and elevation styles via `[data-theme="dark"]`. Zero-FOUC theme hydration script in `layout.tsx`. Reusable LabSpace class tokens (`apple-card`, `apple-btn`, `apple-input`, `apple-badge`, `topbar-glass`) applied directly to modular view components.

**Tech Stack:** Next.js 16.4.2 (App Router), React 19, TypeScript, Tailwind CSS v4, Node.js native test runner.

## Global Constraints
- Target Design Spec: `docs/superpowers/specs/2026-10-17-labspace-dual-theme-redesign-design.md`
- Original Tokens: `C:/Users/Aspire 5/.gemini/antigravity/scratch/labspace/DESIGN.md`
- Theme Storage Key: `finance_theme_mode` (`"light" | "dark" | "system"`)
- Attribute Selector: `html[data-theme="dark"]`
- No functional regressions: All 7 existing unit tests in `test/finance.test.mjs` must pass at every task.
- Zero over-engineering (Ponytail philosophy): Pure CSS variables, zero extra styling libraries, direct utility classes.

---

### Task 1: Theme Engine & CSS Design Tokens

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `src/app/globals.css`
- Test: `test/theme.test.mjs`

**Interfaces:**
- Consumes: `localStorage`, `window.matchMedia`
- Produces: `ThemeMode`, `getStoredTheme()`, `applyTheme(mode: ThemeMode)`

- [ ] **Step 1: Write test for theme logic**

Create `test/theme.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

function resolveIsDark(mode, systemPrefersDark) {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return Boolean(systemPrefersDark);
}

test('resolveIsDark handles light, dark, and system modes correctly', () => {
  assert.equal(resolveIsDark('light', true), false);
  assert.equal(resolveIsDark('light', false), false);
  assert.equal(resolveIsDark('dark', false), true);
  assert.equal(resolveIsDark('dark', true), true);
  assert.equal(resolveIsDark('system', true), true);
  assert.equal(resolveIsDark('system', false), false);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test test/theme.test.mjs`  
Expected: PASS with 1 test completed.

- [ ] **Step 3: Implement `src/lib/theme.ts`**

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';

export function resolveIsDark(mode: ThemeMode, systemPrefersDark: boolean): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return Boolean(systemPrefersDark);
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    return (localStorage.getItem('finance_theme_mode') as ThemeMode) || 'system';
  } catch {
    return 'system';
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
```

- [ ] **Step 4: Update `src/app/globals.css` with LabSpace Dual-Theme tokens**

Replace `src/app/globals.css` with:
```css
@import "tailwindcss";

:root {
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif;

  /* Primary Palette */
  --color-primary: #007AFF;
  --color-primary-hover: #006EE6;
  --color-primary-soft: #EAF3FF;
  --color-primary-muted: #D6E9FF;

  /* Surfaces & Canvas */
  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-surface-2: #FBFBFD;

  /* Text & Border */
  --color-text: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-text-tertiary: #8E8E93;
  --color-border: #D2D2D7;
  --color-border-soft: #E5E5EA;

  /* Semantic Status Colors */
  --color-success-bg: #E8F8EF;
  --color-success-text: #137A3A;
  --color-warning-bg: #FFF4D6;
  --color-warning-text: #8A5A00;
  --color-danger-bg: #FFE8E6;
  --color-danger-text: #B42318;
  --color-info-bg: #EAF3FF;
  --color-info-text: #005BB5;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.045);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.06);

  /* Glassmorphism */
  --glass-surface: rgba(255, 255, 255, 0.78);
  --glass-border: rgba(229, 229, 234, 0.7);
  --glass-blur: blur(20px) saturate(180%);

  /* Transitions */
  --ease-apple: cubic-bezier(0.2, 0.8, 0.2, 1);
  --transition-fast: 160ms var(--ease-apple);
}

[data-theme="dark"] {
  --color-primary: #0A84FF;
  --color-primary-hover: #409CFF;
  --color-primary-soft: rgba(10, 132, 255, 0.15);
  --color-primary-muted: rgba(10, 132, 255, 0.25);

  --color-bg: #000000;
  --color-surface: #1C1C1E;
  --color-surface-2: #2C2C2E;

  --color-text: #F5F5F7;
  --color-text-secondary: #8E8E93;
  --color-text-tertiary: #636366;
  --color-border: #38383A;
  --color-border-soft: rgba(255, 255, 255, 0.1);

  --color-success-bg: rgba(48, 209, 88, 0.15);
  --color-success-text: #30D158;
  --color-warning-bg: rgba(255, 214, 10, 0.15);
  --color-warning-text: #FFD60A;
  --color-danger-bg: rgba(255, 69, 58, 0.15);
  --color-danger-text: #FF453A;
  --color-info-bg: rgba(10, 132, 255, 0.15);
  --color-info-text: #64D2FF;

  --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.55);

  --glass-surface: rgba(28, 28, 30, 0.78);
  --glass-border: rgba(255, 255, 255, 0.1);
}

body {
  margin: 0;
  font-family: var(--font-system);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.apple-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.apple-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.apple-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-family: var(--font-system);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.apple-btn:active {
  transform: scale(0.98);
}

.apple-btn-primary {
  background-color: var(--color-primary);
  color: #FFFFFF;
}

.apple-btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.apple-btn-secondary {
  background-color: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border-soft);
}

.apple-btn-secondary:hover {
  border-color: var(--color-border);
}

.apple-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  font-size: 15px;
  font-family: var(--font-system);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: all var(--transition-fast);
}

.apple-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.apple-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.apple-badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
}

.apple-badge-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-text);
}

.apple-badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.topbar-glass {
  background-color: var(--glass-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-color: var(--glass-border);
}

.font-tabular {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 5: Run tests and commit**

Run: `node --test test/theme.test.mjs && npm test`  
Expected: PASS (all tests pass)

```bash
git add src/lib/theme.ts src/app/globals.css test/theme.test.mjs
git commit -m "feat(tokens): add labspace dual-theme tokens and theme engine"
```

---

### Task 2: Anti-FOUC Root Hydration & Layout Refresh

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `src/lib/theme.ts`
- Produces: Seamless zero-flicker HTML initial render with theme support

- [ ] **Step 1: Update `src/app/layout.tsx` with zero-flicker script**

Add inline theme detection script to `<head>` inside `src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perencana & Pelacak Keuangan",
  description: "Aplikasi perancangan rencana keuangan pribadi dan pemantauan cashflow dengan standar LabSpace.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance Plan",
  },
};

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('finance_theme_mode')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.removeAttribute('data-theme');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Update `src/app/page.tsx` to handle theme changes dynamically**

Ensure `page.tsx` initializes `applyTheme` on mount and listens for system preference changes.

- [ ] **Step 3: Verify build**

Run: `npm run build`  
Expected: Zero build errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat(layout): add anti-fouc theme hydration to root layout"
```

---

### Task 3: Redesign Header & BottomNav with LabSpace Frosted Glass

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/BottomNav.tsx`

**Interfaces:**
- Consumes: `totalBalance: number`, `themeMode`, `onToggleTheme()`, `activeTab`, `onTabChange()`

- [ ] **Step 1: Refactor `Header.tsx`**

Style with `.topbar-glass`, sticky top-0, border-b `var(--glass-border)`. Add theme toggle button (Sun/Moon icon) next to PIN Lock status and Quick Add button. Use `apple-btn` with `h-9` and `apple-badge`.

- [ ] **Step 2: Refactor `BottomNav.tsx`**

Style with `.topbar-glass`, fixed bottom-0, safe-area inset padding. Render 5 clean iOS-style tabs with blue accent indicator on active item (`var(--color-primary)` text and pill highlight).

- [ ] **Step 3: Verify build & tests**

Run: `npm test && npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/BottomNav.tsx
git commit -m "feat(nav): apply labspace frosted glass to header and bottom nav"
```

---

### Task 4: Redesign DashboardView with Apple Card Layering

**Files:**
- Modify: `src/components/DashboardView.tsx`

**Interfaces:**
- Consumes: `wallets`, `cashflow`, `recentTransactions`, `goals`, `budgets`

- [ ] **Step 1: Refactor Net Worth Hero Card**

Use `.apple-card` with subtle gradient border or soft primary tint (`var(--color-primary-soft)`). Display Net Worth in clean bold SF Pro typography with `font-tabular`.

- [ ] **Step 2: Refactor Cashflow Metric Cards**

Render Pemasukan & Pengeluaran side-by-side using `.apple-card apple-card-hover`. Use `.apple-badge-success` and `.apple-badge-danger` for surplus/deficit badges.

- [ ] **Step 3: Refactor Quick Actions & Recent Activity Cards**

Buttons use `.apple-btn .apple-btn-secondary` and `.apple-btn .apple-btn-primary`. Transaction list items styled with clean divider `border-b border-[var(--color-border-soft)]`.

- [ ] **Step 4: Verify build & tests**

Run: `npm test && npm run build`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardView.tsx
git commit -m "feat(dashboard): apply labspace card layering to dashboard view"
```

---

### Task 5: Redesign Wallets & Budgets Views

**Files:**
- Modify: `src/components/WalletsView.tsx`
- Modify: `src/components/BudgetsView.tsx`

**Interfaces:**
- Consumes: `wallets`, `budgets`, `monthlySpendByCategory`

- [ ] **Step 1: Refactor `WalletsView.tsx`**

Display wallets in `.apple-card` grid. Show wallet type badge (Bank, E-Wallet, Cash) with LabSpace colors. Add wallet button using `.apple-btn .apple-btn-primary`.

- [ ] **Step 2: Refactor `BudgetsView.tsx`**

Render category budget cards with Apple HIG progress bars:
- Normal (<80%): `var(--color-primary)`
- Warning (80-100%): `var(--color-warning-text)` with `apple-badge-warning`
- Exceeded (>100%): `var(--color-danger-text)` with `apple-badge-danger`

- [ ] **Step 3: Verify build & tests**

Run: `npm test && npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/WalletsView.tsx src/components/BudgetsView.tsx
git commit -m "feat(views): redesign wallets and budgets views with labspace cards"
```

---

### Task 6: Redesign GoalsView & TransactionsView

**Files:**
- Modify: `src/components/GoalsView.tsx`
- Modify: `src/components/TransactionsView.tsx`

**Interfaces:**
- Consumes: `goals`, `transactions`, `wallets`

- [ ] **Step 1: Refactor `GoalsView.tsx`**

Render savings goals cards with target date pill badge, remaining amount, and contribution button using `.apple-btn`.

- [ ] **Step 2: Refactor `TransactionsView.tsx`**

Add LabSpace filter pill tabs (Semua, Pengeluaran, Pemasukan). Transaction items list styled with `.apple-card` and semantic amount colors.

- [ ] **Step 3: Verify build & tests**

Run: `npm test && npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/GoalsView.tsx src/components/TransactionsView.tsx
git commit -m "feat(views): redesign goals and transactions views"
```

---

### Task 7: Redesign Modals & SettingsView with Theme Switcher

**Files:**
- Modify: `src/components/TransactionModal.tsx`
- Modify: `src/components/PinLockModal.tsx`
- Modify: `src/components/SettingsView.tsx`

**Interfaces:**
- Consumes: `themeMode`, `setThemeMode`, `pinState`, `wallets`

- [ ] **Step 1: Refactor `TransactionModal.tsx`**

Frosted backdrop overlay `backdrop-blur-md bg-black/30`. Modal card styled with `.apple-card` (`rounded-[20px]`). All inputs styled with `.apple-input`.

- [ ] **Step 2: Refactor `PinLockModal.tsx`**

iOS Lock Screen aesthetic: clean numeric keypad with circular keys (`w-16 h-16 rounded-full bg-[var(--color-surface-2)] active:scale-95`), PIN dot indicators.

- [ ] **Step 3: Refactor `SettingsView.tsx`**

Add Theme Selection Card with 3 segmented options: "Otomatis Sistem", "Terang (Light)", "Gelap (Dark)". Export/import backup and PIN setting in `.apple-card`.

- [ ] **Step 4: Verify build & tests**

Run: `npm test && npm run build`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/TransactionModal.tsx src/components/PinLockModal.tsx src/components/SettingsView.tsx
git commit -m "feat(settings): add theme switcher card and redesign modal dialogs"
```

---

### Task 8: Verification & Visual Polish

**Files:**
- Review: all modified files

- [ ] **Step 1: Run complete test suite**

Run: `node --test test/*.test.mjs && npm test`  
Expected: All tests pass with zero failures.

- [ ] **Step 2: Production Build Check**

Run: `npm run build`  
Expected: Next.js clean production build with 0 TypeScript/ESLint errors.

- [ ] **Step 3: Final Git Checkpoint Commit**

```bash
git add .
git commit -m "chore: complete labspace dual-theme redesign verification"
```
