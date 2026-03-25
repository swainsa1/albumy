import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateManifest } from '../../js/storage.js';

const fixtures = path.resolve('tests/contract/fixtures');

test('manifest fixture valid passes validation', () => {
  const json = JSON.parse(fs.readFileSync(path.join(fixtures, 'manifest.valid.json'), 'utf8'));
  const result = validateManifest(json);
  assert.equal(result.valid, true, result.errors.join(' | '));
});

test('manifest fixture invalid fails validation', () => {
  const json = JSON.parse(fs.readFileSync(path.join(fixtures, 'manifest.invalid.json'), 'utf8'));
  const result = validateManifest(json);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
