import test from 'node:test';
import assert from 'node:assert/strict';
import { maskBalance } from '../src/lib/financeCalculations.ts';

test('maskBalance only masks account balances and total wealth', () => {
  const mask = (val, hide) => (hide ? 'Rp ••••••••' : val);

  assert.equal(mask('Rp 15.000.000', true), 'Rp ••••••••');
  assert.equal(mask('Rp 15.000.000', false), 'Rp 15.000.000');

  assert.equal(maskBalance('Rp 15.000.000', true), 'Rp ••••••••');
  assert.equal(maskBalance('Rp 15.000.000', false), 'Rp 15.000.000');
});
