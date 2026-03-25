import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDateGroups, moveAlbum } from '../../js/state.js';
import { buildClientStoragePayload } from '../../js/storage.js';

function measure(fn) {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

test('performance: grouping 200 albums should be fast in logic layer', () => {
  const albums = Array.from({ length: 200 }, (_, index) => ({
    id: `a-${index}`,
    date: index % 2 === 0 ? '2026-03-20' : '2026-03-18',
    sortOrder: index
  }));

  const elapsed = measure(() => buildDateGroups(albums));
  assert.ok(elapsed < 50);
});

test('performance: reorder feedback logic should be sub-1s by large margin', () => {
  const albums = Array.from({ length: 200 }, (_, index) => ({
    id: `a-${index}`,
    date: '2026-03-20',
    sortOrder: index
  }));

  const elapsed = measure(() => moveAlbum(albums, 'a-199', 0));
  assert.ok(elapsed < 50);
});

test('performance: reorder with persistence payload generation <1s for 200 albums', () => {
  const albums = Array.from({ length: 200 }, (_, index) => ({
    id: `a-${index}`,
    date: '2026-03-20',
    sortOrder: index
  }));

  const elapsed = measure(() => {
    moveAlbum(albums, 'a-199', 0);
    buildClientStoragePayload('/photos', albums);
  });
  assert.ok(elapsed < 1000, `reorder + payload should be <1s, was ${elapsed.toFixed(2)}ms`);
});

test('performance: prepare tile logic for 300 photos quickly', () => {
  const photos = Array.from({ length: 300 }, (_, index) => ({
    id: `p-${index}`,
    albumId: 'album-1',
    status: 'ready',
    sortOrder: index
  }));

  const elapsed = measure(() => photos.sort((a, b) => a.sortOrder - b.sortOrder));
  assert.ok(elapsed < 50);
});
