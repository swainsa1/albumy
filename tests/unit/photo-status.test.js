import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeManifest } from '../../js/storage.js';

test('normalizeManifest marks unsupported extension', () => {
  const normalized = normalizeManifest({
    albums: [{ id: 'a', title: 'A', date: '2026-03-20', sortOrder: 0 }],
    photos: [
      { id: 'p1', albumId: 'a', src: 'x.jpg', sortOrder: 0 },
      { id: 'p2', albumId: 'a', src: 'note.txt', sortOrder: 1 }
    ]
  }, '/photos');

  const statuses = normalized.photos.map((p) => p.status);
  assert.deepEqual(statuses, ['ready', 'unsupported']);
});
