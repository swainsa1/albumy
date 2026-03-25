export const DEFAULT_CONFIG = {
  photosBasePath: '/photos'
};

export function validatePhotosBasePath(pathValue) {
  if (typeof pathValue !== 'string' || pathValue.trim() === '') {
    return { valid: false, reason: 'Path is required.' };
  }

  const trimmed = pathValue.trim();
  const startsCorrectly = trimmed.startsWith('/') || trimmed.startsWith('./');
  if (!startsCorrectly) {
    return { valid: false, reason: 'Path must start with / or ./' };
  }

  if (trimmed.includes('..')) {
    return { valid: false, reason: 'Path cannot contain .. segments.' };
  }

  return { valid: true, reason: '' };
}

export function normalizeDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) {
    throw new Error('Invalid album date.');
  }
  return date.toISOString().slice(0, 10);
}

export function sortAlbums(albums) {
  return [...albums].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export function buildDateGroups(albums) {
  const groups = new Map();

  for (const album of sortAlbums(albums)) {
    if (!groups.has(album.date)) {
      groups.set(album.date, []);
    }
    groups.get(album.date).push(album);
  }

  return [...groups.entries()].map(([groupKey, groupedAlbums]) => ({
    groupKey,
    label: groupKey,
    albums: groupedAlbums
  }));
}

export function applyAlbumOrder(albums, albumOrder = []) {
  if (!Array.isArray(albumOrder) || albumOrder.length === 0) {
    return sortAlbums(albums);
  }

  const orderMap = new Map(albumOrder.map((id, index) => [id, index]));
  return [...albums].sort((a, b) => {
    const ai = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bi = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) {
      return ai - bi;
    }
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export function moveAlbum(albums, albumId, toIndex, toDate = null) {
  const list = [...albums];
  const fromIndex = list.findIndex((album) => album.id === albumId);
  if (fromIndex < 0) {
    return list;
  }

  const [moved] = list.splice(fromIndex, 1);
  if (toDate) {
    moved.date = normalizeDate(toDate);
  }

  const clampedIndex = Math.max(0, Math.min(toIndex, list.length));
  list.splice(clampedIndex, 0, moved);

  return list.map((album, index) => ({
    ...album,
    sortOrder: index
  }));
}

export function createInitialState() {
  return {
    config: { ...DEFAULT_CONFIG },
    albums: [],
    photos: [],
    selectedAlbumId: null,
    status: { type: 'idle', message: '' }
  };
}

export function addAlbum(state, title, date) {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle) {
    throw new Error('Album title is required.');
  }

  const normalizedDate = normalizeDate(date);
  const id = `album-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const album = {
    id,
    title: trimmedTitle,
    date: normalizedDate,
    sortOrder: state.albums.length
  };

  state.albums = [...state.albums, album];
  return album;
}

export function renameAlbum(state, albumId, nextTitle) {
  const title = nextTitle?.trim();
  if (!title) {
    throw new Error('Album title is required.');
  }

  state.albums = state.albums.map((album) => (
    album.id === albumId ? { ...album, title } : album
  ));
}

export function deleteAlbum(state, albumId) {
  state.albums = state.albums.filter((album) => album.id !== albumId)
    .map((album, index) => ({ ...album, sortOrder: index }));

  state.photos = state.photos.filter((photo) => photo.albumId !== albumId);
  if (state.selectedAlbumId === albumId) {
    state.selectedAlbumId = null;
  }
}

export function selectAlbum(state, albumId) {
  state.selectedAlbumId = albumId;
}

export function setPhotosBasePath(state, nextPath) {
  const validation = validatePhotosBasePath(nextPath);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }
  state.config.photosBasePath = nextPath.trim();
}
