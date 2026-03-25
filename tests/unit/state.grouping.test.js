import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDateGroups, sortAlbums, validatePhotosBasePath } from '../../js/state.js';

test('validatePhotosBasePath accepts same-origin style paths', () => {
  assert.equal(validatePhotosBasePath('/photos').valid, true);
  assert.equal(validatePhotosBasePath('./photos').valid, true);
});

test('validatePhotosBasePath rejects traversal', () => {
  const result = validatePhotosBasePath('../photos');
  assert.equal(result.valid, false);
});

test('sortAlbums orders by date desc then sortOrder asc', () => {
  const albums = [
    { id: 'a', date: '2026-03-18', sortOrder: 2 },
    { id: 'b', date: '2026-03-20', sortOrder: 1 },
    { id: 'c', date: '2026-03-20', sortOrder: 0 }
  ];
  const sorted = sortAlbums(albums);
  assert.deepEqual(sorted.map((a) => a.id), ['c', 'b', 'a']);
});

test('buildDateGroups produces grouped arrays', () => {
  const groups = buildDateGroups([
    { id: 'a', date: '2026-03-18', sortOrder: 0 },
    { id: 'b', date: '2026-03-18', sortOrder: 1 },
    { id: 'c', date: '2026-03-20', sortOrder: 0 }
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupKey, '2026-03-20');
  assert.equal(groups[1].albums.length, 2);
});
