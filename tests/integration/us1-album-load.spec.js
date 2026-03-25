import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeManifest } from '../../js/storage.js';
import { buildDateGroups, validatePhotosBasePath } from '../../js/state.js';

test('US1: manifest loads and groups by date', () => {
  const manifest = JSON.parse(fs.readFileSync('photos/manifest.json', 'utf8'));
  const normalized = normalizeManifest(manifest, '/photos');
  const groups = buildDateGroups(normalized.albums);
  assert.ok(groups.length >= 1);
  assert.equal(groups[0].groupKey >= groups[groups.length - 1].groupKey, true);
});

test('US1: invalid path is rejected', () => {
  const validation = validatePhotosBasePath('../photos');
  assert.equal(validation.valid, false);
});
