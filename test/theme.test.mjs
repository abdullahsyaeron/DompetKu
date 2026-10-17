import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveIsDark, getStoredTheme, applyTheme } from '../src/lib/theme.ts';

test('resolveIsDark handles light, dark, and system modes correctly', () => {
  assert.equal(resolveIsDark('light', true), false);
  assert.equal(resolveIsDark('light', false), false);
  assert.equal(resolveIsDark('dark', false), true);
  assert.equal(resolveIsDark('dark', true), true);
  assert.equal(resolveIsDark('system', true), true);
  assert.equal(resolveIsDark('system', false), false);
});

test('getStoredTheme returns system in non-browser environment', () => {
  assert.equal(getStoredTheme(), 'system');
});

test('applyTheme returns false in non-browser environment', () => {
  assert.equal(applyTheme('dark'), false);
});
