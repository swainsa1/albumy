import {
  addAlbum,
  applyAlbumOrder,
  createInitialState,
  deleteAlbum,
  moveAlbum,
  renameAlbum,
  selectAlbum,
  setPhotosBasePath,
  validatePhotosBasePath
} from './state.js';
import {
  applyStoredOrderToManifest,
  buildClientStoragePayload,
  loadManifest,
  normalizeManifest,
  readClientStorage,
  writeClientStorage
} from './storage.js';
import { renderAlbumDetail, renderAlbumGroups, renderStatus, setLiveMessage } from './render.js';
import { wireDragAndDrop } from './dnd.js';

const state = createInitialState();
let previousAlbumState = null;
let currentElements = null;

function getElements() {
  if (!currentElements) {
    currentElements = {
      settingsForm: document.getElementById('settings-form'),
      settingsStatus: document.getElementById('settings-status'),
      photosPathInput: document.getElementById('photos-path'),
      createForm: document.getElementById('album-create-form'),
      albumTitleInput: document.getElementById('album-title'),
      albumDateInput: document.getElementById('album-date'),
      groupsStatus: document.getElementById('groups-status'),
      groupsContainer: document.getElementById('album-groups'),
      detailContainer: document.getElementById('album-detail')
    };
  }
  return currentElements;
}

function render(elements) {
  renderAlbumGroups(elements.groupsContainer, state.albums);

  const selectedAlbum = state.albums.find((album) => album.id === state.selectedAlbumId);
  renderAlbumDetail(elements.detailContainer, selectedAlbum, state.photos);
}

function persistOrder() {
  try {
    const payload = buildClientStoragePayload(state.config.photosBasePath, state.albums);
    writeClientStorage(payload);
  } catch (err) {
    console.error('Failed to persist album order:', err);
    setLiveMessage('Error saving album order. Your changes may not be saved.');
    
    // Restore previous state if persistence fails
    if (previousAlbumState) {
      state.albums = JSON.parse(JSON.stringify(previousAlbumState));
      render(getElements());
    }
  }
}

function handleActionClick(event, elements) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const albumId = button.dataset.id;
  const albumIndex = state.albums.findIndex((album) => album.id === albumId);

  if (action === 'open') {
    selectAlbum(state, albumId);
    setLiveMessage('Album opened.');
    render(elements);
    return;
  }

  if (action === 'rename') {
    const current = state.albums.find((album) => album.id === albumId);
    const nextTitle = window.prompt('Rename album', current?.title ?? '');
    if (!nextTitle) return;
    renameAlbum(state, albumId, nextTitle);
    persistOrder();
    render(elements);
    return;
  }

  if (action === 'delete') {
    const confirmed = window.confirm('Delete album and its photo references?');
    if (!confirmed) return;
    deleteAlbum(state, albumId);
    persistOrder();
    render(elements);
    return;
  }

  if (action === 'move-up' && albumIndex > 0) {
    previousAlbumState = JSON.parse(JSON.stringify(state.albums));
    state.albums = moveAlbum(state.albums, albumId, albumIndex - 1);
    persistOrder();
    setLiveMessage('Album moved up.');
    render(elements);
    return;
  }

  if (action === 'move-down' && albumIndex >= 0 && albumIndex < state.albums.length - 1) {
    previousAlbumState = JSON.parse(JSON.stringify(state.albums));
    state.albums = moveAlbum(state.albums, albumId, albumIndex + 1);
    persistOrder();
    setLiveMessage('Album moved down.');
    render(elements);
  }
}

async function reloadFromSource(elements) {
  renderStatus(elements.groupsStatus, 'loading', 'Loading albums...');

  try {
    const manifest = await loadManifest(state.config.photosBasePath);
    const normalized = normalizeManifest(manifest, state.config.photosBasePath);
    const stored = readClientStorage();

    state.albums = applyStoredOrderToManifest(normalized.albums, stored)
      .map((album, index) => ({ ...album, sortOrder: index }));
    state.photos = normalized.photos;

    renderStatus(elements.groupsStatus, 'success', `Loaded ${state.albums.length} album(s).`);
    render(elements);
  } catch (error) {
    renderStatus(elements.groupsStatus, 'error', error.message);
    state.albums = [];
    state.photos = [];
    render(elements);
  }
}

function wireSettings(elements) {
  if (!elements.settingsForm) return;

  elements.settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextPath = elements.photosPathInput.value;

    const validation = validatePhotosBasePath(nextPath);
    if (!validation.valid) {
      renderStatus(elements.settingsStatus, 'error', validation.reason);
      return;
    }

    try {
      setPhotosBasePath(state, nextPath);
      renderStatus(elements.settingsStatus, 'success', 'Path saved. Reloading...');
      await reloadFromSource(elements);
      persistOrder();
    } catch (error) {
      renderStatus(elements.settingsStatus, 'error', error.message);
    }
  });
}

function wireCreateAlbum(elements) {
  if (!elements.createForm) return;

  elements.createForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = elements.albumTitleInput.value;
    const date = elements.albumDateInput.value;

    try {
      const album = addAlbum(state, title, date);
      state.albums = applyAlbumOrder(state.albums);
      persistOrder();
      selectAlbum(state, album.id);
      render(elements);
      elements.createForm.reset();
      setLiveMessage(`Created album ${album.title}.`);
    } catch (error) {
      renderStatus(elements.groupsStatus, 'error', error.message);
    }
  });
}

function wireActionDelegation(elements) {
  if (!elements.groupsContainer) return;

  elements.groupsContainer.addEventListener('click', (event) => {
    handleActionClick(event, elements);
  });

  wireDragAndDrop(elements.groupsContainer, ({ sourceId, targetId, targetDate }) => {
    const targetIndex = state.albums.findIndex((album) => album.id === targetId);
    if (targetIndex < 0 || sourceId === targetId) {
      setLiveMessage('Reorder cancelled.');
      return;
    }

    const previous = [...state.albums];

    try {
      state.albums = moveAlbum(state.albums, sourceId, targetIndex, targetDate);
      persistOrder();
      render(elements);
      setLiveMessage('Reorder saved.');
    } catch (error) {
      state.albums = previous;
      render(elements);
      renderStatus(elements.groupsStatus, 'error', `Unable to save order: ${error.message}`);
      setLiveMessage('Reorder failed and was restored.');
    }
  });
}

async function boot() {
  const elements = getElements();

  if (!elements.groupsContainer && !elements.settingsForm) {
    return;
  }

  const stored = readClientStorage();
  if (stored?.photosBasePath) {
    state.config.photosBasePath = stored.photosBasePath;
  }

  if (elements.photosPathInput) {
    elements.photosPathInput.value = state.config.photosBasePath;
  }

  wireSettings(elements);
  wireCreateAlbum(elements);
  wireActionDelegation(elements);

  await reloadFromSource(elements);
}

boot();
