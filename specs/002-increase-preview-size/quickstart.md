# Quickstart — Increase Photo Preview Fit

**Version**: 1.0.0  
**Date**: 2026-03-25  
**Feature**: 002-increase-preview-size

## Overview

This quickstart guide provides immediate next steps for Phase 1 design completion and Phase 2 task planning. It includes acceptance tests, performance validation steps, and UX consistency checks that must pass before Phase 3 implementation begins.

---

## Phase 1 Design Completion Checklist

### ✅ Pre-Phase 2 Validation

- [x] Plan.md completed with Technical Context, Constitution Check, and Project Structure
- [x] Research.md completed with all design decisions documented
- [x] Data-model.md completed with PreviewTile and PreviewWarningState entities
- [x] Contracts created with preview-tile.md specification
- [ ] Agent context updated via update-agent-context.sh (NEXT STEP)
- [ ] All Constitution Check post-Phase-1 gates verified (PENDING)

### Post-Phase-1 Constitution Check (REQUIRED BEFORE PHASE 2)

- [ ] **Code Quality**: All CSS changes use consistent property ordering; no dead code in styles.css
- [ ] **Testing**: New test files created for fit behavior, responsive behavior, fallback UI; contract tests for preview-tile.md
- [ ] **UX Consistency**: Fallback tile styling matches sleek-retro theme tokens; ARIA labels align with Feature 001 patterns
- [ ] **Performance**: Image decode timing instrumented; render time assertions added to tests
- [ ] **Regression Prevention**: All Feature 001 tests still passing; no breaking changes to Album/Photo/DateGroup

---

## Phase 2 Preparation: Task Breakdown Structure

The following tasks will be organized in `/speckit.tasks` output:

### Phase 1: Setup & Infrastructure (5 tasks)
- T101: Create CSS custom properties for responsive tile dimensions
- T102: Add responsive tile sizing rules to styles.css
- T103: Add `.tile-unavailable` and `.tile-placeholder` CSS classes
- T104: Document performance measurement instrumentation
- T105: Update project configuration (gitignore, eslint rules)

### Phase 2: Foundational Code (6 tasks)
- T201: Add image aspect-ratio preservation CSS (object-fit, object-position)
- T202: Add CSS Grid responsive layout with repeat(auto-fit, minmax())
- T203: Enhance js/render.js image element rendering with aspect-ratio awareness
- T204: Create PreviewTile view model factory function
- T205: Create PreviewWarningState aggregate computation
- T206: Unit tests for PreviewTile and PreviewWarningState

### Phase 3: User Story 1 — Fit Photos Within Preview (7 tasks)
- T301: Implement CSS aspect-ratio rules for landscape, portrait, square photos
- T302: Test aspect-ratio preservation with multiple image dimensions
- T303: Add max-width/max-height constraints for extreme aspect ratios
- T304: Test extreme portrait (1:10) and panorama (10:1) handling
- T305: Implement image error listener with placeholder fallback
- T306: Integration tests for photo fit across viewports
- T307: Performance measurement for image decode time

### Phase 4: User Story 2 — Responsive Scaling (6 tasks)
- T401: Implement mobile breakpoint (160×160 tiles, 2 columns)
- T402: Implement tablet breakpoint (200×200 tiles, 3 columns)
- T403: Implement desktop breakpoint (240×240 tiles, 4 columns)
- T404: Integration tests for responsive reflow across breakpoints
- T405: Test viewport resize behavior
- T406: Performance validation for grid reflow timing

### Phase 5: User Story 3 — Fallback UI (5 tasks)
- T501: Implement `.tile-unavailable` class styling (dashed border, gradient)
- T502: Implement `.tile-placeholder` content (icon + text)
- T503: Enhance PreviewWarningState rendering in album header
- T504: Add dynamic warning counter update on image errors
- T505: Integration tests for fallback UI and warning state

### Phase 6: Polish & Deployment (4 tasks)
- T601: Lint checks and code review (ESLint 9.x, CSS consistency)
- T602: Final accessibility validation (keyboard nav, screen reader, ARIA)
- T603: Performance regression testing (image decode, render time budgets)
- T604: Update documentation and release notes

**Total Tasks**: 33 (Phase 2 breakdown includes 1-2 stretch goals)

---

## Acceptance Tests (Phase 1 → Phase 2 Gate)

These tests must pass before implementation begins. They define the minimum acceptance criteria for Feature 002.

### Test Suite 1: Photo Fit Behavior (Unit Tests)

**Test**: Landscape image fits in square tile without overflow
```javascript
// Given a 16:9 aspect-ratio image (1920×1080)
// And a square tile container (240×240)
// When the image is rendered with object-fit: contain
// Then the image fills the tile width and has margins on top/bottom
// And total rendered height ≤ 240px
```

**Test**: Portrait image fits in square tile without overflow
```javascript
// Given a 9:16 aspect-ratio image (1080×1920)
// And a square tile container (240×240)
// When the image is rendered with object-fit: contain
// Then the image fills the tile height and has margins on sides
// And total rendered width ≤ 240px
```

**Test**: Square image fills tile completely
```javascript
// Given a 1:1 aspect-ratio image (1000×1000)
// And a square tile container (240×240)
// When the image is rendered with object-fit: contain
// Then the image fills the entire tile with no margins
```

**Test**: Extreme portrait (1:10) scales without overflow
```javascript
// Given a 1:10 aspect-ratio image (100×1000)
// And a square tile container (240×240)
// When the image is rendered with object-fit: contain and max-height limit
// Then the image height ≤ 240px and width ≤ 240px
// And aspect ratio is preserved
```

### Test Suite 2: Responsive Behavior (Integration Tests)

**Test**: Mobile viewport renders 2-column grid
```javascript
// Given viewport width = 375px (mobile)
// When album detail view is rendered
// Then tiles are arranged in 2 columns
// And each tile is 160×160px
// And gap between tiles is 0.5rem
```

**Test**: Tablet viewport renders 3-column grid
```javascript
// Given viewport width = 768px (tablet)
// When album detail view is rendered
// Then tiles are arranged in 3 columns
// And each tile is 200×200px
// And gap between tiles is 0.75rem
```

**Test**: Desktop viewport renders 4-column grid
```javascript
// Given viewport width = 1440px (desktop)
// When album detail view is rendered
// Then tiles are arranged in 4 columns
// And each tile is 240×240px
// And gap between tiles is 1rem
```

**Test**: Viewport resize reflows without page reload
```javascript
// Given album detail view at 1440px (desktop, 4 columns)
// When viewport is resized to 375px (mobile, 2 columns)
// Then grid reflows to 2 columns automatically
// And tiles maintain aspect ratio and visibility
// And reflow completes within 50ms
// And page does not reload
```

### Test Suite 3: Fallback UI (Contract Tests)

**Test**: Unsupported file renders placeholder tile
```javascript
// Given a photo with status = 'unsupported'
// When album detail view is rendered
// Then tile has class 'tile-unavailable'
// And tile contains placeholder element (icon + text)
// And tile does NOT contain <img>
// And aria-label includes "preview unavailable"
```

**Test**: Image load failure renders placeholder tile
```javascript
// Given an image element that fires error event
// When error listener processes the event
// Then <img> is removed from DOM
// And placeholder is inserted in its place
// And tile has class 'tile-unavailable'
// And warning counter is incremented
```

**Test**: Warning message displays correct count
```javascript
// Given album with 3 unsupported and 2 failed-to-load photos (5 total unavailable)
// When album detail view is rendered
// Then warning element text is "5 preview(s) unavailable"
// And warning element has aria-live="polite"
// And warning counter is accessible to screen readers
```

**Test**: Empty album renders empty state
```javascript
// Given album with photoIds = []
// When album detail view is rendered
// Then empty-state message is displayed
// And message text is "No photos in this album"
// And no tile grid is rendered
```

### Test Suite 4: Accessibility (Integration Tests)

**Test**: Keyboard navigation through tiles
```javascript
// Given album detail view with 10 tiles
// When user presses Tab repeatedly
// Then focus traverses tiles in reading order (left-to-right, top-to-bottom)
// And no tiles are skipped
// And focus trap is not present
```

**Test**: Screen reader announces unavailable preview
```javascript
// Given album with 1 unavailable photo out of 12
// When screen reader focuses album header
// Then announcement is "1 preview unavailable"
// And aria-live="polite" does not interrupt current content
```

**Test**: ARIA labels on tiles are meaningful
```javascript
// Given a tile for "Roadtrip" album, 3rd photo of 12, with caption "Scenic overlook"
// When screen reader focuses the tile
// Then aria-label text is "Roadtrip, photo 3 of 12, Scenic overlook" OR similar
// And caption is either aria-label or alt attribute
// And photo index is conveyed clearly
```

---

## Performance Validation (Phase 1 → Phase 2 Gate)

All of these must be validated before Phase 3 implementation begins.

### Render Performance Baselines (from Feature 001)

| Metric | Budget | Status |
|--------|--------|--------|
| Album list render | <2s for 200 albums | ✅ From Feature 001 (NO REGRESSION ALLOWED) |
| Album detail render | <2s for 300 photos | ✅ From Feature 001 (NO REGRESSION ALLOWED) |
| Reorder feedback | <1s per drag-end | ✅ From Feature 001 (NO REGRESSION ALLOWED) |

### New Performance Metrics (Feature 002)

| Metric | Budget | Measurement Method | Status |
|--------|--------|-------------------|--------|
| Image decode time (p95) | <100ms per tile | `Image.onload` event timing | ⏳ TO IMPLEMENT |
| Grid reflow on resize | <50ms | Viewport resize → reflow complete | ⏳ TO IMPLEMENT |
| CSS aspect-ratio layout | 0ms (native CSS) | No JS overhead; browser handles | ✅ THEORETICAL |

### Performance Measurement Instructions

1. **Image Decode Timing**:
   ```javascript
   // Instrument image onload in js/render.js:
   const startTime = performance.now();
   img.onload = () => {
     const decodeTime = performance.now() - startTime;
     console.debug(`Image decode: ${decodeTime.toFixed(2)}ms`);
     // Assert decodeTime < 100ms in tests
   };
   ```

2. **Grid Reflow Timing**:
   ```javascript
   // Instrument viewport resize listener:
   window.addEventListener('resize', () => {
     const reflowStart = performance.now();
     // CSS Grid reflow happens automatically
     requestAnimationFrame(() => {
       const reflowTime = performance.now() - reflowStart;
       console.debug(`Reflow time: ${reflowTime.toFixed(2)}ms`);
       // Assert reflowTime < 50ms in tests
     });
   });
   ```

3. **Performance Assertion in Tests**:
   ```javascript
   // Add performance check in integration tests:
   test('renders 300 photos album within budget', async () => {
     const start = performance.now();
     await page.goto('/index.html?album=testalbum');
     const renderTime = performance.now() - start;
     assert(renderTime < 2000, `Render exceeded 2s budget: ${renderTime}ms`);
   });
   ```

---

## UX Consistency Validation

Feature 002 must align with Feature 001's sleek-retro design patterns.

### Design Token Alignment

| Token | Feature 001 Value | Feature 002 Usage | Status |
|-------|------------------|------------------|--------|
| `--color-bg` | #0f172a | Tile container background | ✅ Approved |
| `--color-text-primary` | #e2e8f0 | Placeholder text color | ✅ Approved |
| `--color-border` | #475569 | `.tile-unavailable` dashed border | ✅ Approved |
| `--color-warning` | #f97316 | Warning counter text (optional) | ✅ Optional |
| `--spacing-gap` | 0.5rem / 0.75rem / 1rem | Grid gaps per breakpoint | ✅ Approved |
| `--border-radius` | 10px | Tile container corners | ✅ Approved |

### Component State Consistency

| Component State | Feature 001 Pattern | Feature 002 Pattern | Alignment |
|-----------------|-------------------|-------------------|-----------|
| Loading | Subtle background animation | CSS loading skeleton (existing) | ✅ Inherited |
| Success | Image visible, caption below | Image with tile border | ✅ Consistent |
| Error | Grey background, icon overlay | Dashed border, placeholder text | ✅ Consistent |
| Empty | "No albums" message | "No photos in this album" | ✅ Tone match |
| Warning | "X albums unavailable" | "X preview(s) unavailable" | ✅ Tone match |

### Accessibility Consistency

| Requirement | Feature 001 Pattern | Feature 002 Pattern | Alignment |
|-------------|-------------------|-------------------|-----------|
| Focus outline | 2px cyan outline, 2px offset | Same on all tiles | ✅ Consistent |
| ARIA live announcements | `aria-live="polite"` for warnings | Same for warning counter | ✅ Consistent |
| Semantic navigation | Tab order follows DOM | Tab order unchanged | ✅ Consistent |
| Alt text for images | From manifest caption | From manifest caption | ✅ Unchanged |
| Empty state message | Informative, no jargon | Informative, no jargon | ✅ Consistent |

---

## Known Issues & Edge Cases

### Edge Case 1: Extreme Aspect Ratios

**Issue**: Portrait (1:10) or panorama (10:1) images can exceed tile boundaries.

**Mitigation**:
- Add `max-width: 100%` and `max-height: 100%` to `.tile-image`
- Document in data-model.md as expected behavior
- Allow user scroll in preview if needed; consider dedicated modal for inspection (Phase 6 enhancement)

### Edge Case 2: Missing Image Metadata

**Issue**: Browser cannot pre-calculate aspect ratio without Image Metadata API support.

**Mitigation**:
- Use CSS `aspect-ratio: auto` as fallback (browser detects from image)
- Add `img { aspect-ratio: auto }` to styles.css for older browsers
- Fallback behavior: image scales to fit; slight layout jank possible but no overflow

### Edge Case 3: Slow Network Images

**Issue**: Image load can exceed 100ms budget on slow networks.

**Mitigation**:
- Budget is p95; expect 5% of images to exceed 100ms
- Placeholder renders immediately; image decodes in background
- User sees placeholder briefly, then image appears (acceptable UX)

### Edge Case 4: Album with 1000+ Photos

**Issue**: CSS Grid with 1000 tiles can be slow to reflow.

**Mitigation**:
- Document performance limit: tested up to 300 photos (per Feature 001 budget)
- For larger albums, recommend paginating (Phase 6 enhancement)
- Current implementation acceptable for MVP scope

---

## Pre-Phase-2 Sign-Off Checklist

- [ ] **Plan.md**: Technical Context, Constitution Check, and Project Structure complete
- [ ] **Research.md**: All design decisions documented with rationale
- [ ] **Data-model.md**: PreviewTile, PreviewWarningState, ResponsiveTileDimensions defined
- [ ] **Contracts**: preview-tile.md contract defined with HTML/CSS/ARIA requirements
- [ ] **Acceptance Tests**: All 13 test scenarios above reviewed and approved
- [ ] **Performance**: Image decode timing and reflow timing instrumentation planned
- [ ] **UX Consistency**: Design tokens and component states aligned with Feature 001
- [ ] **Constitution Check (Post-Phase-1)**: All gates verified (see section above)
- [ ] **Agent Context**: update-agent-context.sh executed successfully
- [ ] **Approval**: Plan review complete; ready for `/speckit.tasks` phase

---

## Next Steps

1. **Update Agent Context** (in progress):
   ```bash
   .specify/scripts/bash/update-agent-context.sh copilot
   ```

2. **Run Phase 2 Tasks Breakdown**:
   ```bash
   /speckit.tasks
   ```

3. **Begin Phase 1 Implementation** (after tasks created):
   ```bash
   /speckit.implement Phase 1
   ```

4. **Proceed Through Phases 2-6** following task breakdown, with acceptance tests validating each phase.

---

## Summary

Feature 002 planning is complete. All design decisions are documented, contracts are defined, and acceptance tests are specified. The feature builds incrementally on Feature 001 with no breaking changes. Performance budgets are maintained, and UX consistency is preserved.

**Status**: ✅ **Ready for Phase 2 Task Breakdown** (via `/speckit.tasks`)
