import test from 'node:test';
import assert from 'node:assert/strict';
import { moveAlbum } from '../../js/state.js';

test('moveAlbum reorders within same date group', () => {
  const albums = [
    { id: 'a', date: '2026-03-20', sortOrder: 0 },
    { id: 'b', date: '2026-03-20', sortOrder: 1 },
    { id: 'c', date: '2026-03-20', sortOrder: 2 }
  ];
  const moved = moveAlbum(albums, 'c', 0);
  assert.deepEqual(moved.map((a) => a.id), ['c', 'a', 'b']);
  assert.deepEqual(moved.map((a) => a.sortOrder), [0, 1, 2]);
  assert.equal(moved[0].date, '2026-03-20', 'date unchanged');
});

test('moveAlbum reassigns album to different date group', () => {
  const albums = [
    { id: 'a', date: '2026-03-20', sortOrder: 0 },
    { id: 'b', date: '2026-03-18', sortOrder: 1 }
  ];
  const moved = moveAlbum(albums, 'b', 0, '2026-03-20');
  assert.equal(moved[0].id, 'b');
  assert.equal(moved[0].date, '2026-03-20', 'album moved to new date');
  assert.equal(moved[0].sortOrder, 0, 'album placed at target index');
});

test('moveAlbum preserves other albums and recalculates sortOrder', () => {
  const albums = [
    { id: 'a', date: '2026-03-20', sortOrder: 0 },
    { id: 'b', date: '2026-03-20', sortOrder: 1 },
    { id: 'c', date: '2026-03-20', sortOrder: 2 },
    { id: 'd', date: '2026-03-18', sortOrder: 3 }
  ];
  const moved = moveAlbum(albums, 'b', 2);
  assert.equal(moved.length, 4, 'all albums preserved');
  assert.deepEqual(moved.map((a) => a.sortOrder), [0, 1, 2, 3], 'sortOrder recalculated 0-n');
  const b = moved.find((a) => a.id === 'b');
  assert.equal(b.sortOrder, 2, 'moved album gets target sortOrder');
});

test('moveAlbum handles cross-group move with correct indices', () => {
  const albums = [
    { id: 'a1', date: '2026-03-20', sortOrder: 0 },
    { id: 'a2', date: '2026-03-20', sortOrder: 1 },
    { id: 'b1', date: '2026-03-18', sortOrder: 2 },
    { id: 'b2', date: '2026-03-18', sortOrder: 3 }
  ];
  // Move a2 from position 1 to position 0 and change date to 2026-03-18
  const moved = moveAlbum(albums, 'a2', 0, '2026-03-18');
  assert.equal(moved[0].id, 'a2', 'a2 at position 0');
  assert.equal(moved[0].date, '2026-03-18', 'a2 has new date');
  assert.deepEqual(moved.map((a) => a.id), ['a2', 'a1', 'b1', 'b2'], 'order correct after move');
});
