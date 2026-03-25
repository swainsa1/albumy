# Albumy

Albumy is a minimal static photo album organizer built with vanilla HTML, CSS, and JavaScript.

## Features

- Albums grouped by date on the main page
- Drag-and-drop and keyboard-based album reordering
- No nested album structure
- Tile-style photo previews per album
- Configurable same-origin photos path (default: `/photos`)
- Sleek-retro visual theme
- About page

## Project structure

- `index.html` main album organizer UI
- `about.html` project/about details
- `css/styles.css` theme and UI styles
- `js/*.js` modular app logic
- `photos/manifest.json` sample album/photo metadata
- `tests/` unit, contract, and integration tests

## Run locally

1. Install dependencies:
   - `npm install`
2. Start a static server:
   - `npm run serve`
3. Open the local URL in your browser.

## Test and lint

- `npm test`
- `npm run lint`

## GitHub Pages deployment

1. Push this repository to GitHub.
2. In repository settings, open **Pages**.
3. Set the publish source to the repository root (or the selected pages directory).
4. Confirm `photos/manifest.json` is reachable from your deployed site.

## Troubleshooting

- If albums do not load, verify `photos/manifest.json` exists and is valid JSON.
- If path configuration fails, use only same-origin paths like `/photos` or `./photos`.
- If reorder changes are missing after refresh, clear browser storage and retry.
