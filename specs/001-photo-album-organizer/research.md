# Phase 0 Research — Photo Album Organizer

## Decision 1: Use vanilla JavaScript modules for UI, state, and rendering

**Decision**: Implement with browser-native ES modules and no runtime framework.

**Rationale**: The feature explicitly requests vanilla HTML/CSS/JS and a minimal sample for GitHub deployment. Native modules keep the project lightweight and transparent.

**Alternatives considered**:
- React/Vue/Svelte: rejected due to unnecessary build/runtime complexity for sample scope.
- Single monolithic script file: rejected for maintainability and testability concerns.

## Decision 2: Persist user reorder/config state in localStorage

**Decision**: Store runtime album order and selected `photos` base path in `localStorage`.

**Rationale**: GitHub Pages/static hosting cannot write server-side data. localStorage enables persistence across reloads per user without backend infrastructure.

**Alternatives considered**:
- Backend API + database: rejected as non-minimal and outside static-hosting scope.
- URL-based state persistence: rejected as fragile and unsuitable for larger metadata.

## Decision 3: Discover images through `/photos/manifest.json`

**Decision**: Use a static manifest file under `/photos` as the source of album/photo metadata.

**Rationale**: Browsers cannot reliably list arbitrary directory contents on static hosts. A manifest is deterministic, cacheable, and deployment-friendly.

**Alternatives considered**:
- Runtime filesystem scanning: rejected due to browser sandbox limits.
- GitHub API directory listing: rejected due to added dependency/rate-limit complexity.

## Decision 4: Drag-and-drop with accessibility fallback

**Decision**: Implement pointer/drag interactions for reorder plus keyboard controls (`Move up`/`Move down`) and ARIA live announcements.

**Rationale**: Native DnD supports fast interaction for pointer users; keyboard fallback preserves usability and accessibility requirements.

**Alternatives considered**:
- Native drag-and-drop only: rejected due to weak touch/keyboard accessibility.
- Full custom sortable engine: rejected for complexity relative to sample scope.

## Decision 5: Sleek-retro design token set with accessible contrast

**Decision**: Define a compact design token palette (dark surfaces + amber/cyan accents) and consistent typography.

**Rationale**: Achieves requested style while preserving readability and consistent UX across main page, album view, and About page.

**Alternatives considered**:
- High-neon retro palette: rejected due to contrast and readability risks.
- Utility-first styling library: rejected to keep dependencies minimal.

## Decision 6: Minimal test strategy with high-value coverage

**Decision**: Use unit tests for pure logic (grouping, sorting, validation), plus smoke integration tests for key user flows.

**Rationale**: Satisfies constitution test discipline while keeping setup minimal and maintenance low.

**Alternatives considered**:
- Manual testing only: rejected due to regression risk.
- Full E2E suite for all paths: rejected as disproportionate for sample project.

## Decision 7: Configurable path constrained to same-origin static paths

**Decision**: Treat folder path configuration as a configurable relative/same-origin path, defaulting to `/photos`.

**Rationale**: Static browser apps cannot access arbitrary local filesystem paths without special permissions; this preserves requested configurability within deployable constraints.

**Alternatives considered**:
- Arbitrary absolute filesystem path picker: rejected as incompatible with normal browser security model.
- Hard-coded `/photos` only: rejected because user requested configurable path behavior.
