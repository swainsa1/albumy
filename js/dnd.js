import { setLiveMessage } from './render.js';

export function wireDragAndDrop(container, onMove) {
  if (!container) return;

  let dragSourceId = null;
  let dragSourceCard = null;
  let lastDropTarget = null;

  container.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.album-card');
    if (!card) return;

    dragSourceId = card.dataset.albumId;
    dragSourceCard = card;
    
    // Visual feedback for drag start
    card.classList.add('dragging');
    card.setAttribute('aria-grabbed', 'true');
    
    // Set drag image and data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', card.innerHTML);
    
    // Announce to screen readers
    const albumTitle = card.querySelector('strong')?.textContent ?? 'album';
    setLiveMessage(`Started reordering ${albumTitle}. Drag to new position.`);
  });

  container.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const card = event.target.closest('.album-card');
    if (!card || card === dragSourceCard) return;

    // Visual feedback for valid drop target
    if (lastDropTarget && lastDropTarget !== card) {
      lastDropTarget.classList.remove('drop-target');
    }
    card.classList.add('drop-target');
    lastDropTarget = card;
  });

  container.addEventListener('dragleave', (event) => {
    const card = event.target.closest('.album-card');
    if (!card) return;
    
    // Only remove if we're truly leaving this element
    if (event.relatedTarget === null || !card.contains(event.relatedTarget)) {
      card.classList.remove('drop-target');
      if (lastDropTarget === card) {
        lastDropTarget = null;
      }
    }
  });

  container.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const card = event.target.closest('.album-card');
    if (!card || !dragSourceId) return;

    const targetId = card.dataset.albumId;
    const targetDate = card.dataset.date;

    // Clean up visual state
    card.classList.remove('drop-target');
    if (lastDropTarget === card) {
      lastDropTarget = null;
    }

    // Prevent drop on self
    if (targetId === dragSourceId) {
      setLiveMessage('Drop cancelled: target is same as source.');
      return;
    }

    // Notify callback with move details
    const albumTitle = card.querySelector('strong')?.textContent ?? 'album';
    setLiveMessage(`Dropped. Moving to ${albumTitle} position...`);
    onMove({ sourceId: dragSourceId, targetId, targetDate });
  });

  container.addEventListener('dragend', () => {
    const card = dragSourceCard;
    if (card) {
      card.classList.remove('dragging');
      card.setAttribute('aria-grabbed', 'false');
    }
    
    // Clean up all drop targets
    container.querySelectorAll('.album-card').forEach((c) => {
      c.classList.remove('dragging', 'drop-target');
      c.setAttribute('aria-grabbed', 'false');
    });
    
    dragSourceId = null;
    dragSourceCard = null;
    lastDropTarget = null;
    setLiveMessage('Reordering complete.');
  });
}
