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
