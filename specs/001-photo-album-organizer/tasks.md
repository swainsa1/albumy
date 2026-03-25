# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-photo-album-organizer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are required for behavior changes in this feature.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize minimal static-web project structure and quality tooling.

- [x] T001 Create static app scaffold files in index.html, about.html, css/styles.css, js/app.js, js/state.js, js/render.js, js/storage.js, js/dnd.js, photos/manifest.json
- [x] T002 Initialize project scripts for local static serving and tests in package.json
- [x] T003 [P] Configure code style and linting rules in .eslintrc.json and .editorconfig
- [x] T004 [P] Configure smoke test runner scaffolding in playwright.config.js
- [x] T005 [P] Add baseline Node test entrypoint and utilities in tests/unit/setup.test.js and tests/integration/smoke.spec.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared data/contracts/state infrastructure required by all user stories.

**⚠️ CRITICAL**: No user story implementation begins until this phase is complete.

- [x] T006 Implement manifest loading and schema-aware validation utilities in js/storage.js
- [x] T007 [P] Implement storage configuration model and path validation (`/` or `./`, no `..`) in js/state.js
- [x] T008 [P] Implement global theme tokens (sleek-retro palette + typography + focus styles) in css/styles.css
- [x] T009 [P] Implement common app shell, navigation, and ARIA live region container in index.html and about.html
- [x] T010 Implement shared UI state rendering helpers for loading/empty/error/success states in js/render.js
- [x] T011 [P] Create contract fixtures for valid/invalid manifests and client storage payloads in tests/contract/fixtures/manifest.valid.json, tests/contract/fixtures/manifest.invalid.json, tests/contract/fixtures/client-storage.valid.json, tests/contract/fixtures/client-storage.invalid.json
- [x] T012 Implement contract tests for photos manifest and client storage payloads in tests/contract/manifest.contract.test.js and tests/contract/client-storage.contract.test.js
- [x] T013 Implement performance measurement helpers for first render and reorder latency in tests/integration/performance.spec.js

**Checkpoint**: Foundation complete; user story phases can begin.

---

## Phase 3: User Story 1 - Create and browse dated albums (Priority: P1) 🎯 MVP

**Goal**: Users can configure a photos path, load albums, and browse top-level albums grouped by date.

**Independent Test**: Configure `/photos`, load manifest, and verify albums are displayed in date groups with no nesting and clear empty/error states.

### Tests for User Story 1 (REQUIRED)

- [x] T014 [P] [US1] Add unit tests for path validation, date grouping, and deterministic sort order in tests/unit/state.grouping.test.js
- [x] T015 [P] [US1] Add integration tests for initial load, invalid path error, and empty date group state in tests/integration/us1-album-load.spec.js

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement `StorageConfiguration` read/write and default `/photos` behavior in js/state.js
- [x] T017 [P] [US1] Implement `Album` and `DateGroup` normalization from manifest in js/storage.js
- [x] T018 [US1] Implement main-page grouped album rendering with section headers by date in js/render.js
- [x] T019 [US1] Implement album create/rename/delete controls with top-level-only guardrails in js/app.js
- [x] T020 [US1] Implement no-nested-album validation and user feedback messages in js/app.js
- [x] T021 [US1] Implement photos path settings UI with validation feedback in index.html and js/app.js
- [x] T022 [US1] Implement empty/loading/error/success visual states for album groups in js/render.js and css/styles.css
- [x] T023 [US1] Add keyboard focus order and semantic labels for album management actions in index.html and js/render.js
- [x] T024 [US1] Validate P1 performance budget (<2s initial render for 200 albums) in tests/integration/performance.spec.js

**Checkpoint**: User Story 1 is independently functional and deployable as MVP.

---

## Phase 4: User Story 2 - Reorganize albums with drag-and-drop (Priority: P2)

**Goal**: Users can reorder albums within and across date groups with persistent results.

**Independent Test**: Drag/drop albums to new positions and date groups, refresh page, and verify persisted order and feedback behavior.

### Tests for User Story 2 (REQUIRED)

- [x] T025 [P] [US2] Add unit tests for reorder algorithms and cross-group move rules in tests/unit/reorder.logic.test.js
- [x] T026 [P] [US2] Add integration tests for drag/drop success, cancellation, and invalid target restore behavior in tests/integration/us2-reorder.spec.js

### Implementation for User Story 2

- [x] T027 [P] [US2] Implement drag lifecycle handlers (`dragstart`, `dragover`, `drop`, `dragend`) in js/dnd.js
- [x] T028 [P] [US2] Implement keyboard reorder fallback actions (`Move up`, `Move down`, `Move to date group`) in js/dnd.js and js/render.js
- [x] T029 [US2] Implement reorder persistence using localStorage `albumOrder` payload in js/storage.js
- [x] T030 [US2] Implement cross-date-group reassignment with no nesting enforcement in js/state.js and js/app.js
- [x] T031 [US2] Implement drag visual affordances and drop-state feedback styles in css/styles.css
- [x] T032 [US2] Implement failure recovery path to restore previous order on persistence errors in js/app.js and js/state.js
- [x] T033 [US2] Add ARIA live announcements for reorder start/success/failure in js/render.js
- [x] T034 [US2] Validate P2 performance budget (<1s reorder feedback) in tests/integration/performance.spec.js

**Checkpoint**: User Story 2 works independently on top of US1.

---

## Phase 5: User Story 3 - Tile photo previews and About page (Priority: P3)

**Goal**: Users can open albums to browse tiled photo previews and read About page content.

**Independent Test**: Open album with photos and empty album; verify tile previews, warnings for unsupported images, and About page navigation/content.

### Tests for User Story 3 (REQUIRED)

- [x] T035 [P] [US3] Add unit tests for photo filtering/status mapping (`ready`, `unsupported`, `unreadable`) in tests/unit/photo-status.test.js
- [x] T036 [P] [US3] Add integration tests for tile rendering, empty album state, and About page route/content in tests/integration/us3-photo-about.spec.js

### Implementation for User Story 3

- [x] T037 [P] [US3] Implement album detail route/state selection for active album view in js/app.js and js/state.js
- [x] T038 [P] [US3] Implement `Photo` model normalization and per-album photo sorting in js/storage.js
- [x] T039 [US3] Implement tile-grid photo preview UI with lazy image loading and async decoding in js/render.js and css/styles.css
- [x] T040 [US3] Implement non-blocking warning UI for unsupported/unreadable photos in js/render.js
- [x] T041 [US3] Implement About page content and shared sleek-retro styling consistency in about.html and css/styles.css
- [x] T042 [US3] Implement navigation links between main page, album view, and About page in index.html, about.html, and js/app.js
- [x] T043 [US3] Add accessibility labels and keyboard support for tile navigation and About page links in index.html, about.html, and js/render.js
- [x] T044 [US3] Validate P3 performance budget (<2s tile render for 300 photos) in tests/integration/performance.spec.js

**Checkpoint**: All three user stories are independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality hardening, documentation, and deployment readiness.

- [x] T045 [P] Add sample manifest and demo albums/photos documentation in photos/manifest.json and README.md
- [x] T046 Run full lint and test gates, then fix residual issues in package.json and tests/
- [x] T047 [P] Tune CSS/component consistency for shared states across all pages in css/styles.css
- [x] T048 [P] Add GitHub Pages deployment notes and troubleshooting in README.md
- [x] T049 Validate quickstart end-to-end checklist against implementation in specs/001-photo-album-organizer/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies
- **Phase 2 (Foundational)**: depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: depends on Phase 2
- **Phase 4 (US2)**: depends on Phase 2 and leverages US1 rendering/state foundations
- **Phase 5 (US3)**: depends on Phase 2 and leverages US1 manifest/state foundations
- **Phase 6 (Polish)**: depends on completion of targeted user stories

### User Story Dependencies

- **US1 (P1)**: independent after foundational phase; MVP scope
- **US2 (P2)**: independent validation possible once foundational + album list baseline exists
- **US3 (P3)**: independent validation possible once foundational + album selection baseline exists

### Within Each User Story

- Write tests first and confirm they fail before implementation
- Implement data/state logic before UI wiring
- Add accessibility and UX states before story completion
- Validate performance budgets before marking story done

---

## Parallel Execution Examples

### User Story 1

- [ ] T014 [P] [US1] Add unit tests for path validation, date grouping, and deterministic sort order in tests/unit/state.grouping.test.js
- [ ] T015 [P] [US1] Add integration tests for initial load, invalid path error, and empty date group state in tests/integration/us1-album-load.spec.js
- [ ] T016 [P] [US1] Implement `StorageConfiguration` read/write and default `/photos` behavior in js/state.js
- [ ] T017 [P] [US1] Implement `Album` and `DateGroup` normalization from manifest in js/storage.js

### User Story 2

- [ ] T025 [P] [US2] Add unit tests for reorder algorithms and cross-group move rules in tests/unit/reorder.logic.test.js
- [ ] T026 [P] [US2] Add integration tests for drag/drop success, cancellation, and invalid target restore behavior in tests/integration/us2-reorder.spec.js
- [ ] T027 [P] [US2] Implement drag lifecycle handlers (`dragstart`, `dragover`, `drop`, `dragend`) in js/dnd.js
- [ ] T028 [P] [US2] Implement keyboard reorder fallback actions (`Move up`, `Move down`, `Move to date group`) in js/dnd.js and js/render.js

### User Story 3

- [ ] T035 [P] [US3] Add unit tests for photo filtering/status mapping (`ready`, `unsupported`, `unreadable`) in tests/unit/photo-status.test.js
- [ ] T036 [P] [US3] Add integration tests for tile rendering, empty album state, and About page route/content in tests/integration/us3-photo-about.spec.js
- [ ] T037 [P] [US3] Implement album detail route/state selection for active album view in js/app.js and js/state.js
- [ ] T038 [P] [US3] Implement `Photo` model normalization and per-album photo sorting in js/storage.js

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) fully, including tests and performance checks.
3. Validate MVP on static local server and GitHub Pages.

### Incremental Delivery

1. Ship MVP (US1).
2. Add reorder workflow (US2) with persistence and accessibility announcements.
3. Add album tile previews + About page (US3).
4. Finish with polish and deployment documentation.

### Parallel Team Strategy

1. One contributor finalizes setup/foundation.
2. Then split by stories:
   - Contributor A: US1 completion and refinements
   - Contributor B: US2 reorder and persistence
   - Contributor C: US3 photo tiles and About page
3. Rejoin in Phase 6 for shared quality/performance pass.
