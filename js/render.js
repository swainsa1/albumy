import { buildDateGroups } from './state.js';

export function setLiveMessage(message) {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

export function renderStatus(element, type, message) {
  if (!element) return;
  element.className = `status ${type}`.trim();
  element.textContent = message;
}

function createAlbumActions(album) {
  return `
    <div class="album-actions">
      <button type="button" class="secondary" data-action="open" data-id="${album.id}">Open</button>
      <button type="button" data-action="move-up" data-id="${album.id}">Move up</button>
      <button type="button" data-action="move-down" data-id="${album.id}">Move down</button>
      <button type="button" data-action="rename" data-id="${album.id}">Rename</button>
      <button type="button" class="danger" data-action="delete" data-id="${album.id}">Delete</button>
    </div>
  `;
}

export function renderAlbumGroups(container, albums) {
  if (!container) return;

  const groups = buildDateGroups(albums);
  if (groups.length === 0) {
    container.innerHTML = '<p class="muted">No albums yet. Create one to get started.</p>';
    return;
  }

  const html = groups.map((group) => {
    const cards = group.albums.map((album) => `
      <article
        class="album-card"
        draggable="true"
        data-album-id="${album.id}"
        data-date="${album.date}"
        aria-label="Album ${album.title} in group ${group.label}"
      >
        <div>
          <strong>${album.title}</strong>
          <p class="muted">Date: ${album.date}</p>
        </div>
        ${createAlbumActions(album)}
      </article>
    `).join('');

    return `
      <section class="group" data-group-date="${group.groupKey}">
        <div class="group-header">
          <h3>${group.label}</h3>
          <span class="muted">${group.albums.length} album(s)</span>
        </div>
        <div class="album-list">${cards}</div>
      </section>
    `;
  }).join('');

  container.innerHTML = html;
}

export function renderAlbumDetail(container, album, photos) {
  if (!container) return;

  if (!album) {
    container.innerHTML = '<p class="muted">Select an album to preview photos.</p>';
    return;
  }

  const albumPhotos = photos
    .filter((photo) => photo.albumId === album.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (albumPhotos.length === 0) {
    container.innerHTML = `
      <h3>${album.title}</h3>
      <p class="muted">This album has no photos yet.</p>
    `;
    return;
  }

  const warnings = albumPhotos.filter((photo) => photo.status !== 'ready');

  const tiles = albumPhotos.map((photo) => {
    if (photo.status !== 'ready') {
      return `
        <figure class="tile tile-unavailable" data-photo-id="${photo.id}">
          <div class="tile-placeholder" role="img" aria-label="Preview unavailable">
            Preview unavailable
          </div>
          <figcaption>${photo.caption || photo.id}</figcaption>
        </figure>
      `;
    }

    return `
      <figure class="tile" data-photo-id="${photo.id}">
        <img
          src="${photo.thumbnailSrc ?? photo.src}"
          alt="${photo.caption || photo.id}"
          loading="lazy"
          decoding="async"
        />
        <figcaption>${photo.caption || photo.id}</figcaption>
      </figure>
    `;
  }).join('');

  container.innerHTML = `
    <h3>${album.title}</h3>
    <p class="warning" data-preview-warning ${warnings.length === 0 ? 'hidden' : ''}>
      ${warnings.length} photo(s) may be unsupported or unavailable.
    </p>
    <div class="tile-grid" aria-label="Photo tile preview grid">${tiles}</div>
  `;

  const warningElement = container.querySelector('[data-preview-warning]');
  let unreadableCount = 0;
  const baseWarningCount = warnings.length;

  const syncWarning = () => {
    if (!warningElement) return;
    const totalWarnings = baseWarningCount + unreadableCount;
    if (totalWarnings <= 0) {
      warningElement.hidden = true;
      warningElement.textContent = '';
      return;
    }
    warningElement.hidden = false;
    warningElement.textContent = `${totalWarnings} photo(s) may be unsupported or unavailable.`;
  };

  container.querySelectorAll('.tile img').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.unreadable === 'true') {
        return;
      }

      img.dataset.unreadable = 'true';
      unreadableCount += 1;
      const tile = img.closest('.tile');

      if (tile) {
        tile.classList.add('tile-unavailable');
        const placeholder = document.createElement('div');
        placeholder.className = 'tile-placeholder';
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', 'Preview unavailable');
        placeholder.textContent = 'Preview unavailable';
        img.replaceWith(placeholder);
      }

      syncWarning();
    });
  });

  syncWarning();
}
