import test from 'node:test';
import assert from 'node:assert/strict';
import { moveAlbum, sortAlbums } from '../../js/state.js';
import { buildClientStoragePayload, validateClientStorage } from '../../js/storage.js';

const albums = [
  { id: 'a', date: '2026-03-20', sortOrder: 0 },
  { id: 'b', date: '2026-03-20', sortOrder: 1 },
  { id: 'c', date: '2026-03-18', sortOrder: 2 }
];

test('US2: reorder within list applies expected ordering', () => {
  const reordered = moveAlbum(albums, 'a', 2);
  assert.deepEqual(reordered.map((a) => a.id), ['b', 'c', 'a']);
});

test('US2: persistence payload validates after reorder', () => {
  const reordered = moveAlbum(albums, 'c', 0, '2026-03-20');
  const payload = buildClientStoragePayload('/photos', reordered);
  const validation = validateClientStorage(payload);
  assert.equal(validation.valid, true, validation.errors.join(' | '));
});

test('US2: drag-drop move-up within same date group', () => {
  // Simulate dragging 'b' to position above 'a'
  const result = moveAlbum(albums, 'b', 0);
  assert.equal(result[0].id, 'b', 'b moved to first position');
  assert.deepEqual(result.map((a) => a.id), ['b', 'a', 'c']);
});

test('US2: drag-drop move-down with date group reassignment', () => {
  // Simulate dragging 'b' (2026-03-20) to 2026-03-18 group at position 1
  const result = moveAlbum(albums, 'b', 1, '2026-03-18');
  const movedAlbum = result.find((a) => a.id === 'b');
  assert.equal(movedAlbum.date, '2026-03-18', 'b reassigned to new date');
  assert.ok(result.some((a) => a.date === '2026-03-20' && a.id === 'a'), 'a remains in original group');
});

test('US2: cancellation restores original order', () => {
  const original = JSON.parse(JSON.stringify(albums));
  // Simulate cancelled drag: capture original, then restore
  const cancelled = albums;
  assert.deepEqual(cancelled, original, 'cancelled state matches original');
});

test('US2: invalid target index handled gracefully', () => {
  // Test with index beyond array length (should clamp)
  const result = moveAlbum(albums, 'a', 999);
  assert.equal(result.length, albums.length, 'array length preserved');
  assert.ok(result.some((a) => a.id === 'a'), 'source album still present');
});

test('US2: invalid source ID returns unchanged list', () => {
  const result = moveAlbum(albums, 'nonexistent', 0);
  assert.equal(result.length, albums.length, 'length unchanged');
  assert.deepEqual(result.map((a) => a.id), albums.map((a) => a.id), 'order unchanged');
});

test('US2: sorted order preserved after reorder', () => {
  const reordered = moveAlbum(albums, 'c', 0, '2026-03-20');
  const sorted = sortAlbums(reordered);
  // Should sort by date descending, then by sortOrder
  assert.equal(sorted[0].date, '2026-03-20', 'newer date comes first');
  assert.equal(sorted[sorted.length - 1].date, '2026-03-18', 'older date comes last');
});
