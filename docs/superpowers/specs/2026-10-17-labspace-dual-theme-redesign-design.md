# Design Specification: LabSpace Dual-Theme Redesign

**Project**: Finance Planning & Tracking PWA  
**Date**: 2026-10-17  
**Design Reference**: LabSpace Design System (`DESIGN.md`)  
**Status**: Ready for Implementation Planning  

---

## 1. Objective
Redesign UI for financial planning application to achieve visual consistency with LabSpace project (`DESIGN.md`). Provide seamless Dual-Theme support:
1. **Light Mode**: Strict LabSpace Apple-inspired clean aesthetic (`#F5F5F7` canvas, `#FFFFFF` cards, `#007AFF` accent, frosted glass).
2. **Dark Mode**: Apple macOS/iOS Dark Mode counterpart (`#000000` canvas, `#1C1C1E` cards, `#0A84FF` accent, dark frosted glass).

---

## 2. Architecture & Design Tokens

### 2.1 CSS Variables Architecture (`src/app/globals.css`)
Theme switching uses CSS custom properties defined on `:root` (Light mode) and overridden under `[data-theme="dark"]` (Dark mode).

```css
:root {
  /* Font */
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif;

  /* Colors (Light - LabSpace Standard) */
  --color-primary: #007AFF;
  --color-primary-hover: #006EE6;
  --color-primary-soft: #EAF3FF;
  --color-primary-muted: #D6E9FF;

  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-surface-2: #FBFBFD;

  --color-text: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-text-tertiary: #8E8E93;
  --color-border: #D2D2D7;
  --color-border-soft: #E5E5EA;

  /* Status Colors */
  --color-success-bg: #E8F8EF;
  --color-success-text: #137A3A;
  --color-warning-bg: #FFF4D6;
  --color-warning-text: #8A5A00;
  --color-danger-bg: #FFE8E6;
  --color-danger-text: #B42318;
  --color-info-bg: #EAF3FF;
  --color-info-text: #005BB5;

  /* Spacing & Radii */
  --radius-sm: 8px;     /* Inputs, small badges */
  --radius-md: 14px;    /* Buttons */
  --radius-lg: 20px;    /* Cards, Modals */
  --radius-pill: 999px; /* Status badges, tabs */

  /* Shadows */
  --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.045);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.06);

  /* Glassmorphism */
  --glass-surface: rgba(255, 255, 255, 0.78);
  --glass-border: rgba(229, 229, 234, 0.7);
  --glass-blur: blur(20px) saturate(180%);

  /* Animation */
  --ease-apple: cubic-bezier(0.2, 0.8, 0.2, 1);
  --transition-fast: 160ms var(--ease-apple);
  --transition-normal: 240ms var(--ease-apple);
}

[data-theme="dark"] {
  /* Colors (Dark - Apple macOS/iOS) */
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

  /* Status Colors */
  --color-success-bg: rgba(48, 209, 88, 0.15);
  --color-success-text: #30D158;
  --color-warning-bg: rgba(255, 214, 10, 0.15);
  --color-warning-text: #FFD60A;
  --color-danger-bg: rgba(255, 69, 58, 0.15);
  --color-danger-text: #FF453A;
  --color-info-bg: rgba(10, 132, 255, 0.15);
  --color-info-text: #64D2FF;

  /* Shadows */
  --shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.55);

  /* Glassmorphism */
  --glass-surface: rgba(28, 28, 30, 0.78);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### 2.2 Theme Persistence & Synchronous Hydration
- Key in `localStorage`: `finance_theme_mode` (`"light" | "dark" | "system"`).
- Root inline script or layout hydration sets `document.documentElement.setAttribute('data-theme', theme)` before render to eliminate flash of unstyled content (FOUC).
- Theme toggle exposed in `SettingsView.tsx` and quick toggle button in `Header.tsx`.

---

## 3. UI Component Mapping & Guidelines

### 3.1 Card Container (`.apple-card`)
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border-soft)`
- Border Radius: `var(--radius-lg)` (`20px`)
- Padding: `var(--space-6)` (`24px`, responsive `16px` on mobile)
- Shadow: `var(--shadow-sm)`
- Hover interaction: `transform: translateY(-2px)`, shadow `var(--shadow-md)` with `transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 160ms cubic-bezier(0.2, 0.8, 0.2, 1)`

### 3.2 Action Buttons (`.apple-btn`, `.apple-btn-primary`, `.apple-btn-secondary`)
- Base: Height 44px min, border-radius `var(--radius-md)` (`14px`), font-weight 600, font-size 15px.
- Active feedback: `transform: scale(0.98)` on click.
- Primary: Background `var(--color-primary)`, text white, hover `var(--color-primary-hover)`.
- Secondary: Background `var(--color-surface-2)`, text `var(--color-text)`, border `1px solid var(--color-border-soft)`.

### 3.3 Form Fields & Inputs (`.apple-input`)
- Height: 44px min.
- Border radius: `var(--radius-sm)` (`8px`).
- Border: `1px solid var(--color-border)`.
- Background: `var(--color-surface)`.
- Focus state: `border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2); outline: none;`.

### 3.4 Status & Metric Badges (`.apple-badge`)
- Pill shape: `border-radius: var(--radius-pill)` (`999px`).
- Typography: 12px, font-weight 600, uppercase letter-spacing 0.3px.
- Semantic variants:
  - `.apple-badge-success`: `var(--color-success-bg)` / `var(--color-success-text)`
  - `.apple-badge-danger`: `var(--color-danger-bg)` / `var(--color-danger-text)`
  - `.apple-badge-warning`: `var(--color-warning-bg)` / `var(--color-warning-text)`

### 3.5 Frosted Glass Navbars
- `Header.tsx`: Fixed top, `background: var(--glass-surface)`, `backdrop-filter: var(--glass-blur)`, `border-bottom: 1px solid var(--glass-border)`.
- `BottomNav.tsx`: Fixed bottom, same glass styling, safe padding for mobile swipe bar, active tab pill indicator with blue accent.

---

## 4. Detailed Component Updates

1. **`globals.css`**: Replace dark-only palette with dual-mode LabSpace token system. Add shared utility classes (`apple-card`, `apple-btn`, `apple-input`, `apple-badge`, `topbar-glass`).
2. **`Header.tsx`**: Update layout to topbar-glass, add theme switcher toggle icon (sun/moon), show total net balance with clean SF typography.
3. **`BottomNav.tsx`**: Update to topbar-glass, Apple HIG icon styling, active tab badge styling.
4. **`DashboardView.tsx`**: Net worth hero card, monthly cashflow summary cards with LabSpace green/red badges, quick actions button group, recent activity card.
5. **`WalletsView.tsx`**: Multi-wallet cards with rounded-20px styling, balance indicators, wallet management modal.
6. **`BudgetsView.tsx`**: Budget progress bars with clean Apple-style track and fill, warning states over 80% and danger over 100%.
7. **`GoalsView.tsx`**: Savings goals circular or bar progress with estimated completion timeline badges.
8. **`TransactionsView.tsx`**: Filter chips (Semua, Pengeluaran, Pemasukan), transaction rows with clean border-b and semantic colored amounts.
9. **`TransactionModal.tsx` & `PinLockModal.tsx`**: Centered frosted glass backdrop, `apple-card` modal container with `rounded-[20px]`, clean inputs and keypad.
10. **`SettingsView.tsx`**: Theme preference selection (Otomatis Sistem, Terang, Gelap), export/import data cards, PIN lock configuration card.

---

## 5. Verification & Validation Strategy
- **Calculation Integrity**: Run `npm test` (`node --experimental-strip-types --test test/finance.test.mjs`) to verify all 7 unit tests pass without regression.
- **Build Integrity**: Run `npm run build` to confirm Next.js compiler produces clean zero-error production bundle.
- **Theme Switching**: Verify switching between Light, Dark, and System modes instantaneously swaps variables without layout shifts.
