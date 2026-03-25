# Quickstart — Photo Album Organizer

## 1) Prepare files

1. Ensure project root contains:
   - `index.html`
   - `about.html`
   - `css/styles.css`
   - `js/*.js`
   - `photos/manifest.json`
2. Add image files under `photos/` (or a configured same-origin subpath).

## 2) Create `photos/manifest.json`

Use a minimal manifest structure matching the contract in `contracts/photos-manifest.schema.json`.

Required sections:
- `albums`: top-level albums with `id`, `title`, `date`, and `sortOrder`
- `photos`: photo entries with `id`, `albumId`, and `src`

## 3) Run locally (static)

Serve the repository root with any static file server and open `index.html`.

Expected behavior:
- Albums load grouped by date.
- Drag-and-drop reorders albums.
- Reorder persists after refresh (localStorage).
- Album view shows tiled photo previews.
- About page is reachable from main navigation.

## 4) Configure photos path

In app settings, set a same-origin path (default: `/photos`).

Validation expectations:
- Invalid path shows actionable error state.
- Valid path reloads manifest and updates albums/photos.

## 5) Verify constitution quality gates

### Code Quality
- Run lint/format checks configured for the project.
- Confirm no dead code and clear module boundaries.

### Testing
- Run unit tests for:
  - date grouping
  - reorder calculations
  - manifest/path validation
- Run smoke integration checks for:
  - initial album load
  - drag-and-drop reorder + persistence
  - About page route/load

### UX Consistency
- Confirm loading, empty, success, and error states on main and album pages.
- Confirm keyboard reorder fallback and visible focus states.
- Confirm color contrast for core text and controls.

### Performance
- Validate main page render under 2s for ~200 albums.
- Validate album tile render under 2s for ~300 photos.
- Validate reorder feedback appears within 1s.

## 6) Deploy to GitHub Pages

1. Push branch to GitHub.
2. Enable GitHub Pages from repository settings.
3. Use repository root (or selected Pages directory) as publish source.
4. Confirm deployed app loads `photos/manifest.json` correctly from the configured path.
