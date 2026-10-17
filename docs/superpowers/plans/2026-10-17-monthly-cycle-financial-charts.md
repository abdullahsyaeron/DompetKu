# Monthly Billing Cycle & Financial Health Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan pengaturan tanggal siklus bulanan (cut-off gajian), indikator kesehatan keuangan (Surplus/Defisit & Rasio Tabungan), serta visualisasi grafik komparasi arus kas 6 siklus terakhir berbasis Pure SVG/CSS di aplikasi DompetKu.

**Architecture:** Memperluas data model `AppData` dengan `billingCycleStartDay`, menambahkan modul kalkulasi rentang tanggal siklus dan riwayat cashflow di `src/lib/financeCalculations.ts`, membangun kartu `FinancialHealthCard` mandiri di `DashboardView.tsx` dengan Apple HIG dual-bar SVG chart, dan kontrol pengaturan siklus di `SettingsView.tsx`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Lucide React, Pure SVG/CSS, Node.js Test Runner.

## Global Constraints
- Target Design Spec: `docs/superpowers/specs/2026-10-17-monthly-cycle-financial-charts-design.md`
- Typography: Helvetica (`"Helvetica", "Helvetica Neue", Arial, sans-serif`) strictly.
- Dual-Theme Tokens: Light (`#F5F5F7`, surface `#FFFFFF`), Dark (`#000000`, surface `#1C1C1E`).
- Zero Heavy Dependencies: Pure SVG/CSS chart, dilarang menambahkan library chart pihak ketiga (recharts, chart.js, d3).
- Offline & Cloud Sync: Tersimpan otomatis di `localStorage` dan tersinkron ke Supabase Cloud via `app_data`.
- 100% Passing Tests: Semua unit test yang ada (`finance.test.mjs`, `privacy.test.mjs`, `theme.test.mjs`) ditambah `cycle.test.mjs` harus lolos.

---

### Task 1: Core Type & Cycle Calculations with TDD

**Files:**
- Modify: `src/types/finance.ts`
- Modify: `src/lib/financeCalculations.ts`
- Create: `test/cycle.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Transaction` from `src/types/finance.ts`
- Produces:
  ```ts
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

  export function getBillingCycleRange(
    referenceDate?: Date,
    cycleStartDay?: number,
    cycleOffset?: number
  ): BillingCycleRange;

  export function calculateCycleCashflow<T extends { type: string; amount: number; date: string }>(
    transactions: T[],
    cycleRange: BillingCycleRange
  ): CycleFinancialSummary;

  export function getHistoricalCyclesCashflow<T extends { type: string; amount: number; date: string }>(
    transactions: T[],
    cycleStartDay?: number,
    count?: number,
    selectedOffset?: number
  ): HistoricalCycleData[];
  ```

- [ ] **Step 1: Update AppData type**
In `src/types/finance.ts`:
Add `billingCycleStartDay?: number;` to `AppData`.

- [ ] **Step 2: Write the failing tests in `test/cycle.test.mjs`**
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBillingCycleRange,
  calculateCycleCashflow,
  getHistoricalCyclesCashflow,
} from '../src/lib/financeCalculations.ts';

test('getBillingCycleRange handles default day 1 (calendar month)', () => {
  const ref = new Date('2026-10-15T10:00:00Z');
  const cycle = getBillingCycleRange(ref, 1, 0);

  assert.strictEqual(cycle.startDate.getDate(), 1);
  assert.strictEqual(cycle.startDate.getMonth(), 9); // October
  assert.strictEqual(cycle.endDate.getDate(), 31);
  assert.strictEqual(cycle.endDate.getMonth(), 9);
  assert.strictEqual(cycle.cycleKey, '2026-10');
});

test('getBillingCycleRange handles salary cut-off day 25', () => {
  // If current date is Oct 15 and startDay is 25: active cycle is Sep 25 - Oct 24
  const ref = new Date('2026-10-15T10:00:00Z');
  const cycle = getBillingCycleRange(ref, 25, 0);

  assert.strictEqual(cycle.startDate.getDate(), 25);
  assert.strictEqual(cycle.startDate.getMonth(), 8); // September
  assert.strictEqual(cycle.endDate.getDate(), 24);
  assert.strictEqual(cycle.endDate.getMonth(), 9); // October
});

test('getBillingCycleRange handles offset -1 (previous cycle)', () => {
  const ref = new Date('2026-10-15T10:00:00Z');
  const prevCycle = getBillingCycleRange(ref, 25, -1);

  assert.strictEqual(prevCycle.startDate.getDate(), 25);
  assert.strictEqual(prevCycle.startDate.getMonth(), 7); // August
  assert.strictEqual(prevCycle.endDate.getDate(), 24);
  assert.strictEqual(prevCycle.endDate.getMonth(), 8); // September
});

test('calculateCycleCashflow categorizes surplus, warning, and deficit correctly', () => {
  const cycle = {
    startDate: new Date('2026-10-01T00:00:00Z'),
    endDate: new Date('2026-10-31T23:59:59Z'),
    label: '1 Okt – 31 Okt 2026',
    shortLabel: 'Okt',
    cycleKey: '2026-10',
  };

  // Surplus test (savings rate >= 20%)
  const txSurplus = [
    { type: 'income', amount: 10000000, date: '2026-10-05T10:00:00Z' },
    { type: 'expense', amount: 6000000, date: '2026-10-10T10:00:00Z' },
  ];
  const summarySurplus = calculateCycleCashflow(txSurplus, cycle);
  assert.strictEqual(summarySurplus.status, 'surplus');
  assert.strictEqual(summarySurplus.savingsRate, 40);

  // Deficit test (net < 0)
  const txDeficit = [
    { type: 'income', amount: 5000000, date: '2026-10-05T10:00:00Z' },
    { type: 'expense', amount: 7000000, date: '2026-10-10T10:00:00Z' },
  ];
  const summaryDeficit = calculateCycleCashflow(txDeficit, cycle);
  assert.strictEqual(summaryDeficit.status, 'deficit');
  assert.strictEqual(summaryDeficit.net, -2000000);
});

test('getHistoricalCyclesCashflow returns exactly requested count of cycles', () => {
  const tx = [
    { type: 'income', amount: 10000000, date: '2026-10-05T10:00:00Z' },
  ];
  const history = getHistoricalCyclesCashflow(tx, 25, 6, 0);
  assert.strictEqual(history.length, 6);
  assert.strictEqual(history[5].isCurrent, true);
});
```

- [ ] **Step 3: Update `package.json` test script**
Add `test/cycle.test.mjs` to `test` script:
`"test": "node --experimental-strip-types --test test/finance.test.mjs test/theme.test.mjs test/privacy.test.mjs test/cycle.test.mjs"`

- [ ] **Step 4: Run test to verify it fails**
Command: `npm.cmd test`
Expected: FAIL (`getBillingCycleRange is not a function`).

- [ ] **Step 5: Implement cycle calculation functions in `src/lib/financeCalculations.ts`**
Implement `getBillingCycleRange`, `calculateCycleCashflow`, and `getHistoricalCyclesCashflow`.

- [ ] **Step 6: Run test to verify it passes**
Command: `npm.cmd test`
Expected: PASS (16 tests total).

- [ ] **Step 7: Commit Task 1**
```bash
git add src/types/finance.ts src/lib/financeCalculations.ts test/cycle.test.mjs package.json
git commit -m "feat(cycle): implement monthly billing cycle calculations and unit tests"
```

---

### Task 2: Cycle Settings in SettingsView

**Files:**
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `appData.billingCycleStartDay` from `AppData`, `getBillingCycleRange` from `src/lib/financeCalculations.ts`
- Produces: `onUpdateBillingCycleStartDay: (day: number) => void`

- [ ] **Step 1: Add cycle setting card to `src/components/SettingsView.tsx`**
Add a dedicated card "Siklus Keuangan Bulanan" under PIN settings:
- Select dropdown or number picker (1 - 31), default 1.
- Dynamic preview label showing current cycle date range:
  `"Diatur setiap tanggal {day}. Siklus berjalan: {range.label}"`
- Button "Simpan Tanggal Siklus".

- [ ] **Step 2: Wire handler in `src/app/page.tsx`**
In `src/app/page.tsx`:
Implement `handleUpdateBillingCycleStartDay(day: number)`:
```ts
const handleUpdateBillingCycleStartDay = (day: number) => {
  updateAndSave({ ...appData, billingCycleStartDay: day });
  showToast(`Siklus bulanan diatur ke tanggal ${day}.`);
};
```
Pass to `<SettingsView />`.

- [ ] **Step 3: Verify and Commit Task 2**
Run: `npm.cmd test && npm.cmd run lint && npm.cmd run build`
Commit:
```bash
git add src/components/SettingsView.tsx src/app/page.tsx
git commit -m "feat(settings): add monthly billing cycle configuration card"
```

---

### Task 3: Financial Health & Cycle Comparison Card Component

**Files:**
- Create: `src/components/FinancialHealthCard.tsx`
- Modify: `src/components/DashboardView.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  - `transactions: Transaction[]`
  - `billingCycleStartDay?: number`
  - `hideBalance: boolean`
- Produces: `<FinancialHealthCard />` component with cycle navigation, financial condition badge, 3 metric strip, and interactive pure SVG/CSS 6-cycle dual-bar chart.

- [ ] **Step 1: Create `src/components/FinancialHealthCard.tsx`**
Features:
- State `selectedOffset` (number, default `0`).
- Cycle header with ChevronLeft `<` (decrements offset) and ChevronRight `>` (increments offset, disabled when `selectedOffset === 0`).
- Date range label (e.g. `25 Sep 2026 – 24 Okt 2026`).
- Status Badge:
  - `🟢 Surplus Sehat (+X% tersimpan)`
  - `🟡 Waspada (+X% tersimpan)`
  - `🔴 Defisit (-X% defisit)`
- 3 Metric strip:
  - Pemasukan Siklus (green)
  - Pengeluaran Siklus (red)
  - Sisa / Tabungan Bersih (blue, respects `hideBalance`)
- Pure SVG / CSS 6-cycle dual-bar chart:
  - 6 cycle columns horizontally.
  - Paired bars: Green (Income) & Red (Expense).
  - Selected cycle has highlight ring / active style.
  - Tap / hover tooltip showing formatted amounts.

- [ ] **Step 2: Render in `src/components/DashboardView.tsx`**
Place `<FinancialHealthCard />` immediately below the Titanium Card & Quick Action Pills.

- [ ] **Step 3: Pass props from `src/app/page.tsx`**
Pass `billingCycleStartDay={appData.billingCycleStartDay || 1}` and `hideBalance={hideBalance}` to `DashboardView`.

- [ ] **Step 4: Verify and Commit Task 3**
Run: `npm.cmd test && npm.cmd run lint && npm.cmd run build`
Commit:
```bash
git add src/components/FinancialHealthCard.tsx src/components/DashboardView.tsx src/app/page.tsx
git commit -m "feat(dashboard): add financial health card and 6-cycle interactive dual-bar chart"
```

---

### Task 4: Full System Verification & GitHub Push

**Files:**
- All touched files

- [ ] **Step 1: Execute full test suites**
Run: `npm.cmd test`
Verify: 16/16 tests pass.

- [ ] **Step 2: Run ESLint**
Run: `npm.cmd run lint`
Verify: 0 errors.

- [ ] **Step 3: Run production build**
Run: `npm.cmd run build`
Verify: Clean build.

- [ ] **Step 4: Push to GitHub**
Run: `git push origin main`
Verify: Vercel auto-deploys commit to production.
