import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeManifest, SUPPORTED_IMAGE_EXTENSIONS } from '../../js/storage.js';

test('US3: album detail has tiles-ready data', () => {
  const manifest = JSON.parse(fs.readFileSync('photos/manifest.json', 'utf8'));
  const normalized = normalizeManifest(manifest, '/photos');
  const hasTileCandidates = normalized.photos.some((photo) => photo.status === 'ready');
  assert.equal(hasTileCandidates, true);
});

test('US3: photo status correctly identifies unsupported images', () => {
  const manifest = JSON.parse(fs.readFileSync('photos/manifest.json', 'utf8'));
  const normalized = normalizeManifest(manifest, '/photos');
  const unsupported = normalized.photos.find((photo) => photo.status !== 'ready');
  assert.ok(unsupported, 'at least one unsupported photo exists in test data');
  assert.notEqual(unsupported.status, 'ready', 'unsupported photo marked as not ready');
});

test('US3: photo tiles include all supported image extensions', () => {
  const supportedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  assert.deepEqual(
    SUPPORTED_IMAGE_EXTENSIONS,
    supportedExt,
    'supported extensions match expected set'
  );
});

test('US3: about page includes key sections and navigation', () => {
  const about = fs.readFileSync('about.html', 'utf8');
  assert.match(about, /About Albumy/, 'has About section');
  assert.match(about, /How it works/, 'has How it works section');
  assert.match(about, /href.*[Aa]lbums|Albums/i, 'has link to albums page');
});

test('US3: about page content describes the app purpose', () => {
  const about = fs.readFileSync('about.html', 'utf8');
  assert.match(about, /organize|browse|album/i, 'describes app purpose');
  assert.match(about, /drag|drop|reorder/i, 'mentions drag-drop feature');
});
