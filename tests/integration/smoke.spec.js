import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requiredFiles = [
  'index.html',
  'about.html',
  'css/styles.css',
  'js/app.js',
  'photos/manifest.json'
];

test('required app files exist', () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(file), true, `${file} is missing`);
  }
});
