# Research & Design Decisions — Increase Photo Preview Fit

**Date**: 2026-03-25 | **Feature**: 002-increase-preview-size  
**Phase**: Phase 0 (Outline & Research)

## Overview

This document consolidates research, design decisions, and rationale for preview sizing improvements in the photo album organizer. All clarifications and technology choices are documented here before Phase 1 design begins.

---

## Decision: Aspect Ratio Preservation Mechanism

### What Was Chosen

Use CSS `aspect-ratio` property combined with `object-fit: contain` on `<img>` elements to preserve original photo dimensions within fixed-size preview tiles.

### Rationale

- **Native browser support**: `aspect-ratio` is supported in all modern browsers (Chrome 88+, Firefox 89+, Safari 15+)
- **No JavaScript overhead**: CSS handles layout calculations automatically
- **Graceful degradation**: Older browsers show functional previews with potential overflow; modern browsers show perfect aspect-ratio preservation
- **Performance**: Zero runtime performance cost for aspect-ratio calculation or resize listening
- **Simplicity**: Single CSS rule per image type simplifies maintenance and testing

### Alternatives Considered & Rejected

1. **JavaScript aspect-ratio calculation**:
   - ❌ Rejected: Requires `MutationObserver` or `ResizeObserver` for responsive changes
   - ❌ Adds runtime CPU cost for large photo counts
   - ❌ More complex error handling and teardown

2. **CSS `max-width`/`max-height` + padding trick**:
   - ❌ Rejected: Requires extra wrapper elements or pseudo-elements
   - ❌ Harder to reason about for non-landscape aspect ratios
   - ❌ Less maintainable than native `aspect-ratio`

3. **Server-side image resizing/thumbnails**:
   - ❌ Rejected: Contradicts static-only deployment model
   - ❌ Would require build step or external service
   - ❌ Increases deployment complexity

---

## Decision: Responsive Tile Sizing Strategy

### What Was Chosen

Implement responsive tile sizing using CSS Grid with automatic `repeat()` function that adapts column count based on viewport width. Use CSS custom properties (variables) for breakpoint-driven tile dimensions.

### Rationale

- **CSS Grid native responsiveness**: `repeat(auto-fit, minmax(...))` handles layout reflow without media queries or JavaScript
- **Token-based design**: Define tile sizes as CSS variables for consistency with sleek-retro design system
- **Viewport-aware**: Automatically adapts to desktop, tablet, and mobile without explicit breakpoint code
- **Accessibility**: Maintains semantic tile order; keyboard navigation unaffected by responsive reflowLayout:

### Alternatives Considered & Rejected

1. **Flexbox with `flex-wrap`**:
   - ❌ Rejected: Less predictable behavior for maintaining equal tile sizes across rows
   - ❌ Requires additional `flex-basis` calculations
   - ❌ Column alignment difficult without explicit widths

2. **JavaScript viewport listener + dynamic CSS classes**:
   - ❌ Rejected: Adds runtime CPU cost on resize events
   - ❌ Requires debouncing to avoid excessive reflows
   - ❌ More fragile than native CSS responsiveness

3. **Media queries with hardcoded breakpoints**:
   - ⚠️ Partially considered but combined with CSS Grid for dynamic adaptation
   - Default approach for legacy fallback, but Grid is superior for tile layouts

---

## Decision: Fallback UI for Unavailable Previews

### What Was Chosen

Extend existing Feature 001 placeholder styling with:
- Enhanced visual indication (dashed border, gradient background)
- Accessible fallback text ("Preview unavailable") with ARIA label
- Dynamic warning counter that reflects both initial unsupported + runtime failures
- No blocking alert; warning appears inline with tile count

### Rationale

- **Consistency with Feature 001**: Existing code already handles unsupported file detection and warning tracking
- **Graceful degradation**: User understands the photo is unavailable without alarm
- **Accessibility**: Semantic labels + ARIA ensure screen readers convey fallback state
- **Non-intrusive feedback**: Warning message integrates into album header, doesn't interrupt browsing
- **Testable state**: Fallback tiles are countable and verifiable in automated tests

### Alternatives Considered & Rejected

1. **Modal alert for unavailable previews**:
   - ❌ Rejected: Interrupts browsing flow and violates QTP-006 (non-breaking regression policy)
   - ❌ Poor UX on mobile with many unavailable items
   - ❌ Accessibility burden for keyboard users

2. **Hiding unavailable previews entirely**:
   - ❌ Rejected: Creates confusion about missing photos
   - ❌ User cannot distinguish between missing and deleted
   - ❌ Violates transparency principle in constitution

3. **Separate "Unavailable" tab/section**:
   - ❌ Rejected: Increases cognitive load and page complexity
   - ❌ Contradicts single-page album view design in Feature 001

---

## Decision: Testing Approach for Responsive Behavior

### What Was Chosen

Layer three test levels:
1. **Unit tests**: Photo object status validation (ready/unsupported/unreadable)
2. **Contract tests**: Preview tile rendering API contracts (dimensions, ARIA attributes)
3. **Integration tests**: Full album preview across multiple viewport sizes using Playwright

### Rationale

- **Test pyramid alignment**: Many unit tests, fewer integration tests
- **Feature isolation**: Contract tests verify tile rendering independent of album logic
- **Regression prevention**: Integration tests catch responsive reflow bugs early
- **Performance validation**: Include render time assertions in integration tests
- **Existing infrastructure**: Reuse Node test runner + Playwright setup from Feature 001

### Alternatives Considered & Rejected

1. **Visual regression testing (screenshot comparison)**:
   - ⚠️ Considered but deferred: Requires additional tool (Percy, Chromatic)
   - ⚠️ High maintenance cost for breakpoint coverage
   - Default: Use manual acceptance checks during Phase 3-5 implementation

2. **Synthetic performance profiling**:
   - ⚠️ Considered but deferred: Requires DevTools protocol access
   - Use simple timer-based assertions for now; full profiling in Phase 6 polish

---

## Decision: Edge Case Handling

### What Was Chosen

Implement these edge case handlers:

| Edge Case | Solution |
|-----------|----------|
| Portrait photos with extreme aspect ratios (e.g., 1:10) | Use `max-height` limit on tile container; allow vertical scroll in preview or cap tile height at 80vh |
| Panorama photos with extreme aspect ratios (e.g., 10:1) | Use `max-width` limit on tile container; allow horizontal scroll in preview or cap tile width at 95vw |
| Album with only unavailable photos | Show full-width warning message; render placeholder tiles with count |
| Album with no photos | Show empty state message ("No photos in this album") |
| Preview fails to load after successful initial render | Image error listener replaces with placeholder; update warning counter |

### Rationale

- **Graceful degradation**: User can always access content, even with extreme dimensions
- **Consistency**: All edge cases use same fallback UI as Feature 001
- **Accessibility**: Screen readers receive semantic empty-state messages
- **Testing**: Each case is independently verifiable in unit + integration tests

---

## Decision: Performance Budget & Measurement

### What Was Chosen

Maintain Feature 001 performance budgets; add specific measurement points for preview rendering:

| Metric | Budget | Measurement Method |
|--------|--------|-------------------|
| Album list render | <2s for 200 albums | `performance.mark()` at render start/end |
| Album detail render | <2s for 300 photos | `performance.mark()` at album load start/detail render end |
| Reorder feedback | <1s per drag-end | Existing Feature 001 assertions |
| **NEW: Image decode time** | <100ms per tile (p95) | `Image.onload` event timing |
| **NEW: CSS aspect-ratio overhead** | 0ms (native CSS, no JS) | N/A (theoretical) |

### Rationale

- **Feature 001 compatibility**: No regression in existing performance baselines
- **New metrics are lightweight**: Image decode timing requires minimal instrumentation
- **Realistic constraints**: 100ms per-image budget accommodates network variation
- **Validation in acceptance tests**: Performance assertions prevent regressions

---

## Decision: Deployment & Iteration

### What Was Chosen

Feature 002 is built incrementally on Feature 001 using same deployment model:
- No breaking changes to manifest.json structure
- No new runtime dependencies
- CSS-first approach (changes isolated to styles.css)
- Selective js/render.js enhancements for fallback handling
- GitHub Pages static deployment unchanged

### Rationale

- **Low risk**: Existing Feature 001 functionality remains intact and testable
- **Incremental validation**: Each phase can be deployed independently if needed
- **Rollback simplicity**: Revert CSS and render.js changes to restore Feature 001
- **Parallel work possible**: Feature 002 implementation doesn't block Feature 001 bug fixes

---

## Summary of Design Decisions

| Decision | Key Benefit | Risk Mitigation |
|----------|-------------|-----------------|
| CSS `aspect-ratio` + `object-fit` | Native, zero-cost, maintainable | Graceful fallback in older browsers |
| CSS Grid responsive tiles | Automatic reflow, no JS overhead | Media queries for edge cases |
| Extended Feature 001 fallback UI | Consistent, accessible, non-intrusive | Warning counter tested thoroughly |
| Layered testing (unit/contract/integration) | Comprehensive regression prevention | Existing infrastructure reused |
| Maintained performance budgets | No regression risk | New image decode timing added |
| Incremental Feature 001 build | Low risk, clear rollback path | Breaking changes explicitly blocked |

---

## Next Steps

All clarifications resolved. Plan is ready for Phase 1 (Design & Contracts):
1. Generate data-model.md with PreviewTile and PreviewWarningState entities
2. Create contracts/ with preview tile rendering API
3. Create quickstart.md with acceptance tests and validation workflow
4. Run update-agent-context.sh to register design decisions
5. Proceed to Phase 2 (/speckit.tasks) for detailed task breakdown
