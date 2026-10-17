# Apple Comprehensive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire personal finance web application to meet Apple Human Interface Guidelines (HIG) with Helvetica typography, solid opaque surfaces, Apple Titanium Card, Date-Grouped Inset Lists, Apple Bottom Sheet modals, and refined privacy toggle masking.

**Architecture:** A comprehensive overhaul across 7 coordinated tasks. Design tokens and spring micro-interactions are established in global CSS, followed by navigation, dashboard with titanium card, transactions with date grouping, wallets and budgets in Apple Wallet style, goals and settings in Apple Inset-Grouped layout, and bottom sheet modal dialogs.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide React, Node.js Test Runner.

## Global Constraints

- Design Spec: `docs/superpowers/specs/2026-10-17-apple-comprehensive-redesign-design.md`
- Typography: `"Helvetica", "Helvetica Neue", Arial, sans-serif` strictly across all views and inputs.
- Color Tokens: Action Blue `#0071E3` (Light) / `#2997FF` (Dark), Canvas `#F5F5F7` / `#000000`, Surface `#FFFFFF` / `#1C1C1E`.
- No Frosted Glass / Murky Blur: Solid opaque surfaces and solid dimming modal scrim (`bg-black/50`).
- Privacy Toggle: Eye icon masks ONLY true account balances & total net worth (`Rp ••••••••`), leaving operational cashflows and budget figures legible.
- Non-functional regressions: 10/10 unit tests in `test/finance.test.mjs` and `test/theme.test.mjs` must continue passing. Zero ESLint errors.

---

### Task 1: Privacy Toggle Refinement & Global CSS Apple Utilities

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx:40-60`
- Test: `test/privacy.test.mjs`

**Interfaces:**
- Produces: CSS utility `.apple-titanium-card`, `.apple-sheet-mobile`, tactile active spring classes, and refined `hideBalance` logic.

- [ ] **Step 1: Write test for privacy masking behavior**

Create `test/privacy.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

test('maskBalance only masks account balances and total wealth', () => {
  const mask = (val, hide) => (hide ? 'Rp ••••••••' : val);
  
  assert.equal(mask('Rp 15.000.000', true), 'Rp ••••••••');
  assert.equal(mask('Rp 15.000.000', false), 'Rp 15.000.000');
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test test/privacy.test.mjs`
Expected: PASS 1/1

- [ ] **Step 3: Update `src/app/globals.css` with Apple utilities**

Add titanium card gradients and bottom-sheet animation helpers:
```css
.apple-titanium-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F7 50%, #EBEBED 100%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .apple-titanium-card {
  background: linear-gradient(135deg, #242426 0%, #1C1C1E 50%, #161618 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.apple-press {
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.apple-press:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

- [ ] **Step 4: Run tests and verify build**

Run: `npm test && npm run build`
Expected: 10/10 PASS, build exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css test/privacy.test.mjs
git commit -m "feat(tokens): add apple titanium card gradients and spring utilities"
```

---

### Task 2: Redesign Header & BottomNav to Apple iOS Standards

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/BottomNav.tsx`

**Interfaces:**
- Consumes: HeaderProps, BottomNavProps, TabKey.
- Produces: Polished Apple App Bar and iOS Tab Bar.

- [ ] **Step 1: Refactor `src/components/Header.tsx`**

Implement Apple squircle brand icon, refined privacy eye tooltip, theme switch, and cloud pill:
- Height 56px, clean solid `.apple-navbar`.
- `DK` brand monogram in Apple iOS icon shape (`rounded-[10px]`).
- Clean hairline action buttons with `apple-press`.

- [ ] **Step 2: Refactor `src/components/BottomNav.tsx`**

Implement iOS tab bar:
- Height 64px with `pb-safe`.
- Tabs with soft rounded container for active state (`bg-[var(--color-primary-soft)] text-[var(--color-primary)]`).
- Label font size 10px in Helvetica.

- [ ] **Step 3: Run tests and lint**

Run: `npm test && npm run lint`
Expected: 10/10 PASS, 0 lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/BottomNav.tsx
git commit -m "feat(nav): redesign header and bottom tab bar to apple ios standards"
```

---

### Task 3: Redesign DashboardView with Apple Titanium Card & Action Pills

**Files:**
- Modify: `src/components/DashboardView.tsx`

**Interfaces:**
- Consumes: AppData, hideBalance, onNavigateTab, onOpenAddModal, onExecuteTemplate, onDeleteTransaction.
- Produces: Titanium physical card hero, tactile action pills, quick template carousel, and Inset-Grouped summaries.

- [ ] **Step 1: Implement Apple Titanium Card in `DashboardView.tsx`**

- Ratio card fisik (~1.8 : 1) dengan `.apple-titanium-card`.
- Chip glyph & "DK TITANIUM" branding.
- Angka Saldo Likuiditas utama besar (32px-36px) Helvetica bold masked with `hideBalance`.
- Cashflow strip (Pemasukan & Pengeluaran) **tetap ditampilkan** tanpa masker saldo agar operasional kas terlihat jelas.

- [ ] **Step 2: Implement Tactile Action Pills**

- 3 kapsul sentuh horizontal: `+ Pengeluaran` (merah pastel), `+ Pemasukan` (hijau pastel), `Transfer` (biru pastel).
- `apple-press` dengan `active:scale-[0.97]`.

- [ ] **Step 3: Implement Inset-Grouped Recent Activity & Widgets**

- Widget Anggaran & Target dengan linear progress rounded 6px.
- 5 transaksi terkini dalam format Inset-Grouped card.

- [ ] **Step 4: Run tests and lint**

Run: `npm test && npm run lint && npm run build`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardView.tsx
git commit -m "feat(dashboard): implement apple titanium card, action pills, and inset summaries"
```

---

### Task 4: Redesign TransactionsView with Date-Grouped Inset Lists & Apple Segmented Control

**Files:**
- Modify: `src/components/TransactionsView.tsx`

**Interfaces:**
- Consumes: AppData, hideBalance, onOpenAddModal, onExecuteTemplate, onDeleteTransaction, onDeleteTemplate.
- Produces: Date grouping logic ("Hari Ini", "Kemarin", "Bulan YYYY"), Inset-Grouped transaction cards, pill search bar.

- [ ] **Step 1: Add date grouping logic in `TransactionsView.tsx`**

Group filtered transactions into sections:
```typescript
function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: { label: string; items: Transaction[] }[] = [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Group by date
  ...
}
```

- [ ] **Step 2: Implement Apple Pill Search & Segmented Control**

- Pill search input (`rounded-full`, `pl-10 pr-4 h-11`).
- Segmented Control (`Semua`, `Pengeluaran`, `Pemasukan`, `Transfer`).

- [ ] **Step 3: Render Inset-Grouped Transaction Cards**

- Section title in Apple caption style (`text-xs font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase`).
- Each section inside an `apple-card` container with hairline dividers between items.
- Line items with circular icon badges and bold tabular figures.

- [ ] **Step 4: Run tests and verify build**

Run: `npm test && npm run build`
Expected: 10/10 PASS, build exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/TransactionsView.tsx
git commit -m "feat(transactions): add date-grouped inset lists and apple segmented control"
```

---

### Task 5: Redesign WalletsView & BudgetsView to Apple Wallet Standards

**Files:**
- Modify: `src/components/WalletsView.tsx`
- Modify: `src/components/BudgetsView.tsx`

**Interfaces:**
- Consumes: AppData, CRUD callbacks for wallets and budgets.
- Produces: Apple Wallet card grid, account number masking (`•••• 1234`), and linear progress indicators.

- [ ] **Step 1: Refactor `WalletsView.tsx`**

- Hero total saldo (masked when `hideBalance` is true).
- Wallet cards styled with physical card accents, account masking, and tactile edit/delete icons.
- Add/Edit wallet modal in Apple card layout.

- [ ] **Step 2: Refactor `BudgetsView.tsx`**

- Monthly overall budget summary with Apple linear progress bar.
- Category budget cards in Inset-Grouped grid with Apple capsule status badges (`Aman`, `Waspada`, `Melebihi Batas`).

- [ ] **Step 3: Run tests and verify lint**

Run: `npm test && npm run lint`
Expected: 10/10 PASS, 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/WalletsView.tsx src/components/BudgetsView.tsx
git commit -m "feat(views): redesign wallets to apple card style and budgets to inset-grouped"
```

---

### Task 6: Redesign GoalsView & SettingsView to Apple Inset-Grouped Standards

**Files:**
- Modify: `src/components/GoalsView.tsx`
- Modify: `src/components/SettingsView.tsx`

**Interfaces:**
- Consumes: AppData, goal callbacks, themeMode, onSetTheme, onUpdatePin.
- Produces: Apple Goals tracker and Apple Settings grouped layout.

- [ ] **Step 1: Refactor `GoalsView.tsx`**

- Savings goal hero card (masked when `hideBalance` is true).
- Goal item cards with progress ring/bar and quick "+ Tabung" trigger.

- [ ] **Step 2: Refactor `SettingsView.tsx`**

- Apple Settings Inset-Grouped layout:
  - Theme Switcher segmented card (Otomatis Sistem, Terang, Gelap).
  - Master PIN management card.
  - Supabase Cloud sync card.
  - Data backup (JSON export/import) and demo reset card.
  - PWA install guide.

- [ ] **Step 3: Run tests and verify build**

Run: `npm test && npm run build`
Expected: 10/10 PASS, build exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/GoalsView.tsx src/components/SettingsView.tsx
git commit -m "feat(views): redesign goals and settings to apple grouped standards"
```

---

### Task 7: Redesign Modals & PinLockModal to Apple Bottom Sheet & Passcode

**Files:**
- Modify: `src/components/TransactionModal.tsx`
- Modify: `src/components/PinLockModal.tsx`

**Interfaces:**
- Consumes: TransactionModalProps, PinLockModalProps.
- Produces: Apple Bottom Sheet modal (mobile) / Centered Sheet (desktop) with iOS navigation header, and tactile passcode screen.

- [ ] **Step 1: Refactor `TransactionModal.tsx` to Apple Bottom Sheet**

- Header bar: *Batal* text button on left, modal title in center, *Simpan* action button on right.
- Mobile: slides from bottom with drag grabber bar (`w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mx-auto mb-3`).
- Large display amount input with `Rp` prefix in Helvetica font-bold.
- Quick amount chips (+10rb, +50rb, +100rb, +500rb) with `apple-press`.
- Clean segmented tabs for transaction type.

- [ ] **Step 2: Refactor `PinLockModal.tsx` to Apple Passcode Screen**

- Smooth animated circle dot indicators.
- Circular number keypad buttons (`h-16 w-16 rounded-full font-semibold text-xl active:scale-95`).
- Clean error shake animation on invalid PIN.

- [ ] **Step 3: Run tests, lint, and build**

Run: `npm test && npm run lint && npm run build`
Expected: All pass with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/TransactionModal.tsx src/components/PinLockModal.tsx
git commit -m "feat(modals): implement apple bottom sheet and passcode screen"
```

---

### Task 8: End-to-End Verification & Polish

**Files:**
- Modify: `src/app/page.tsx` (if any final wiring needed)

- [ ] **Step 1: Run comprehensive automated test suite**

Run: `npm test`
Expected: 10/10 PASS.

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: 0 errors.

- [ ] **Step 3: Run Next.js Turbopack build**

Run: `npm run build`
Expected: Compiled successfully with zero hydration errors.

- [ ] **Step 4: Commit final verification**

```bash
git commit -am "chore: complete apple comprehensive redesign verification"
```
