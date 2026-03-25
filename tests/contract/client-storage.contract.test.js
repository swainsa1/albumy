import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateClientStorage } from '../../js/storage.js';

const fixtures = path.resolve('tests/contract/fixtures');

test('client storage fixture valid passes validation', () => {
  const json = JSON.parse(fs.readFileSync(path.join(fixtures, 'client-storage.valid.json'), 'utf8'));
  const result = validateClientStorage(json);
  assert.equal(result.valid, true, result.errors.join(' | '));
});

test('client storage fixture invalid fails validation', () => {
  const json = JSON.parse(fs.readFileSync(path.join(fixtures, 'client-storage.invalid.json'), 'utf8'));
  const result = validateClientStorage(json);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
