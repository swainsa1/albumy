import { applyAlbumOrder } from './state.js';

export const CLIENT_STORAGE_KEY = 'albumy.clientStorage.v1';
export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateManifest(manifest) {
  const errors = [];

  if (!isObject(manifest)) {
    return { valid: false, errors: ['Manifest must be an object.'] };
  }

  if (!Array.isArray(manifest.albums)) {
    errors.push('albums must be an array.');
  }

  if (!Array.isArray(manifest.photos)) {
    errors.push('photos must be an array.');
  }

  if (Array.isArray(manifest.albums)) {
    const ids = new Set();
    for (const album of manifest.albums) {
      if (!isObject(album)) {
        errors.push('album item must be an object.');
        continue;
      }
      if (!album.id || typeof album.id !== 'string') errors.push('album.id is required.');
      if (!album.title || typeof album.title !== 'string') errors.push(`album ${album.id ?? '?'} title is required.`);
      if (!album.date || Number.isNaN(new Date(album.date).valueOf())) errors.push(`album ${album.id ?? '?'} date is invalid.`);
      if (!Number.isInteger(album.sortOrder) || album.sortOrder < 0) errors.push(`album ${album.id ?? '?'} sortOrder invalid.`);
      if (ids.has(album.id)) errors.push(`album id ${album.id} duplicated.`);
      ids.add(album.id);
    }
  }

  if (Array.isArray(manifest.photos)) {
    for (const photo of manifest.photos) {
      if (!isObject(photo)) {
        errors.push('photo item must be an object.');
        continue;
      }
      if (!photo.id || typeof photo.id !== 'string') errors.push('photo.id is required.');
      if (!photo.albumId || typeof photo.albumId !== 'string') errors.push(`photo ${photo.id ?? '?'} albumId is required.`);
      if (!photo.src || typeof photo.src !== 'string') errors.push(`photo ${photo.id ?? '?'} src is required.`);
      if (!Number.isInteger(photo.sortOrder) || photo.sortOrder < 0) errors.push(`photo ${photo.id ?? '?'} sortOrder invalid.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateClientStorage(payload) {
  if (!isObject(payload)) {
    return { valid: false, errors: ['Payload must be an object.'] };
  }

  const errors = [];

  if (!Number.isInteger(payload.version) || payload.version < 1) {
    errors.push('version must be integer >= 1.');
  }

  if (typeof payload.photosBasePath !== 'string' || !/^(\/|\.\/)(?!.*\.\.).+/.test(payload.photosBasePath)) {
    errors.push('photosBasePath is invalid.');
  }

  if (!Array.isArray(payload.albumOrder)) {
    errors.push('albumOrder must be an array.');
  }

  if (Array.isArray(payload.albumOrder)) {
    const unique = new Set(payload.albumOrder);
    if (unique.size !== payload.albumOrder.length) {
      errors.push('albumOrder must have unique values.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function loadManifest(basePath) {
  const manifestPath = `${basePath.replace(/\/$/, '')}/manifest.json`;
  const response = await fetch(manifestPath, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Unable to load manifest from ${manifestPath}.`);
  }

  const data = await response.json();
  const validation = validateManifest(data);
  if (!validation.valid) {
    throw new Error(`Invalid manifest: ${validation.errors.join(' ')}`);
  }

  return data;
}

function makePhotoStatus(src) {
  const lower = src.toLowerCase();
  const supported = SUPPORTED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
  return supported ? 'ready' : 'unsupported';
}

export function normalizeManifest(manifest, basePath = '/photos') {
  const normalizedBasePath = basePath.replace(/\/$/, '');

  const albums = manifest.albums.map((album) => ({
    id: album.id,
    title: album.title.trim(),
    date: album.date,
    sortOrder: album.sortOrder
  }));

  const photos = manifest.photos.map((photo) => ({
    id: photo.id,
    albumId: photo.albumId,
    src: photo.src.startsWith('/') ? photo.src : `${normalizedBasePath}/${photo.src}`,
    thumbnailSrc: photo.thumbnailSrc ? (photo.thumbnailSrc.startsWith('/') ? photo.thumbnailSrc : `${normalizedBasePath}/${photo.thumbnailSrc}`) : null,
    caption: photo.caption ?? '',
    sortOrder: photo.sortOrder,
    status: makePhotoStatus(photo.src)
  }));

  return {
    albums,
    photos
  };
}

export function readClientStorage() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validation = validateClientStorage(parsed);
    return validation.valid ? parsed : null;
  } catch {
    return null;
  }
}

export function writeClientStorage(payload) {
  const validation = validateClientStorage(payload);
  if (!validation.valid) {
    throw new Error(`Invalid client payload: ${validation.errors.join(' ')}`);
  }

  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(payload));
}

export function buildClientStoragePayload(photosBasePath, albums) {
  return {
    version: 1,
    photosBasePath,
    albumOrder: albums.map((album) => album.id),
    updatedAt: new Date().toISOString()
  };
}

export function applyStoredOrderToManifest(manifestAlbums, storagePayload) {
  if (!storagePayload?.albumOrder) {
    return manifestAlbums;
  }
  return applyAlbumOrder(manifestAlbums, storagePayload.albumOrder)
    .map((album, index) => ({ ...album, sortOrder: index }));
}
