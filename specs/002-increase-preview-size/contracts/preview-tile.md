# Preview Tile Rendering Contract

**Version**: 1.0.0  
**Date**: 2026-03-25  
**Feature**: 002-increase-preview-size

## Summary

This contract defines the interface and behavior for rendering individual photo preview tiles in the album detail grid. It specifies HTML structure, CSS classes, ARIA attributes, and validation rules that must be met by the rendering implementation.

---

## HTML Structure Contract

### Preview Tile Container

```html
<div class="tile" data-photo-id="[photo-id]" data-status="[status]" role="img" aria-label="[label]">
  <!-- Image or placeholder content here -->
</div>
```

**Requirements**:
- `class="tile"`: Required for all preview tiles
- `data-photo-id="[id]"`: Must match Photo.id from state
- `data-status="[status]"`: Must be one of: `ready`, `unsupported`, `unreadable`
- `role="img"`: Semantic role for screen readers
- `aria-label="[label]"`: Human-readable description for accessibility

---

### Preview Image Tile (Status: Ready)

```html
<div class="tile" data-photo-id="[photo-id]" data-status="ready" role="img" aria-label="[caption or album + index]">
  <img 
    src="[resolved-url]" 
    alt="[caption]"
    class="tile-image"
    loading="lazy"
  />
</div>
```

**Requirements**:
- `<img>` must have `class="tile-image"` for CSS targeting
- `src` must be resolved under `photosBasePath`
- `alt` must contain photo caption or meaningful description
- `loading="lazy"` must be set for performance
- Image MUST NOT have `width` or `height` attributes (CSS controls dimensions)

**CSS Assertions**:
- Image MUST fit within tile container using `object-fit: contain`
- Image aspect ratio MUST be preserved
- Image MUST NOT overflow tile boundaries

---

### Preview Placeholder Tile (Status: Unsupported or Unreadable)

```html
<div class="tile tile-unavailable" data-photo-id="[photo-id]" data-status="unsupported|unreadable" role="img" aria-label="[album + index + unavailable indicator]">
  <div class="tile-placeholder">
    <span class="placeholder-icon">📷</span>
    <span class="placeholder-text">Preview unavailable</span>
  </div>
</div>
```

**Requirements**:
- `class="tile tile-unavailable"`: Both classes required for fallback styling
- Placeholder content MUST include icon and text
- `aria-label` MUST include "unavailable" indicator for accessibility
- Placeholder MUST NOT be interactive or clickable

**CSS Assertions**:
- Tile MUST display dashed border (visual indication)
- Tile MUST have gradient background (visual distinction from ready tiles)
- Placeholder text MUST be centered and visible

---

## CSS Classes Contract

### Tile Container Classes

| Class | Applied When | Purpose |
|-------|--------------|---------|
| `.tile` | Always | Base styling for all preview tiles |
| `.tile-unavailable` | Photo status is `unsupported` or `unreadable` | Fallback/error state styling |
| `.tile-image` | Photo is ready and rendered | Image-specific styling |
| `.tile-placeholder` | Fallback is displayed | Placeholder content wrapper |

### Responsive Sizing Classes (Optional)

| Class | Applied When | Purpose |
|-------|--------------|---------|
| `.tile-mobile` | Viewport width < 640px | Mobile-specific dimensions |
| `.tile-tablet` | Viewport width 640px-1023px | Tablet-specific dimensions |
| `.tile-desktop` | Viewport width >= 1024px | Desktop-specific dimensions |

*Alternative*: Use CSS Grid with `repeat(auto-fit, minmax(...))` instead of explicit classes.

---

## ARIA Accessibility Contract

### Tile Aria Labels

**For ready images**:
```
aria-label="[Album Title], [Photo Index of Total], [Caption if available]"
Example: "Roadtrip, photo 3 of 12, Scenic overlook"
```

**For unavailable images**:
```
aria-label="[Album Title], [Photo Index of Total], preview unavailable"
Example: "Roadtrip, photo 5 of 12, preview unavailable"
```

### Keyboard Navigation

- Tiles MUST be part of semantic tab order (via album container semantics)
- Tiles MUST NOT trap focus or require special keyboard handling
- Tab navigation MUST traverse tiles in reading order (left-to-right, top-to-bottom)

### Screen Reader Announcements

- Warning state (`PreviewWarningState`) MUST be announced in album header
- Message format: `aria-live="polite"` element with text "X preview(s) unavailable"
- Announcements MUST NOT interrupt existing content reading

---

## CSS Aspect Ratio Preservation Contract

### Image Sizing Rules

```css
.tile-image {
  width: 100%;
  height: 100%;
  object-fit: contain;        /* Preserve aspect ratio */
  object-position: center;    /* Center within container */
}
```

**Requirements**:
- Container width/height MUST be set explicitly (via CSS Grid or flex sizing)
- `object-fit: contain` MUST be applied (no cropping)
- `object-position: center` MUST be set
- Images MUST scale to fit largest possible dimension within container bounds

### Test Cases (Aspect Ratio Preservation)

| Scenario | Expected Behavior |
|----------|-------------------|
| Landscape image (16:9) in square tile | Image fills tile width, margins on top/bottom |
| Portrait image (9:16) in square tile | Image fills tile height, margins on sides |
| Square image (1:1) in square tile | Image fills tile completely, no margin |
| Extreme portrait (1:10) in square tile | Image scaled to fit height; letterbox on sides |
| Extreme panorama (10:1) in square tile | Image scaled to fit width; pillarbox on top/bottom |

**Acceptance**: 100% of tested aspect ratios must render without overflow or clipping.

---

## Responsive Tile Sizing Contract

### Breakpoint Dimensions

| Breakpoint | Min Viewport | Tile Size | Columns | Gap |
|-----------|--------------|-----------|---------|-----|
| Mobile | 0px | 160×160px | 2 | 0.5rem |
| Tablet | 640px | 200×200px | 3 | 0.75rem |
| Desktop | 1024px | 240×240px | 4 | 1rem |

**Requirements**:
- Tiles MUST maintain square aspect ratio at each breakpoint
- Columns per row MUST match specified counts (allowing for viewport max-width)
- Gap size MUST match specified values for visual consistency
- Responsive behavior MUST NOT require JavaScript

### Test Cases (Responsive Behavior)

| Scenario | Expected Behavior |
|----------|-------------------|
| Desktop viewport (1440px) | 4-column grid, 240×240 tiles, 1rem gaps |
| Tablet viewport (768px) | 3-column grid, 200×200 tiles, 0.75rem gaps |
| Mobile viewport (375px) | 2-column grid, 160×160 tiles, 0.5rem gaps |
| Viewport resize (1440 → 375) | Grid reflows without page reload; tiles maintain aspect ratio |
| Max viewport width | Grid maintains centered alignment; gap on sides |

**Acceptance**: 100% of tested viewports must render grid correctly; reflow must complete within 50ms.

---

## Error Handling Contract

### Image Load Failure

**Trigger**: `<img>` element fires `error` event

**Response**:
1. JavaScript error listener removes `<img>`
2. Replaces with placeholder content (`tile-placeholder`)
3. Adds `tile-unavailable` class to tile container
4. Updates `data-status` attribute to `unreadable`
5. Increments warning counter in album header

**Acceptance**: Failed image must be visually indistinguishable from unsupported placeholder.

### Missing Album Context

**Trigger**: Album detail view attempts to render without Photo entities

**Response**:
1. Render empty-state message
2. Display: `<div class="empty-state">No photos in this album</div>`
3. Center message on page
4. Maintain ARIA label accessibility

**Acceptance**: Empty state must be perceivable and accessible to keyboard/screen reader users.

---

## Performance Contract

### Rendering Latency

| Operation | Budget | Measurement |
|-----------|--------|------------|
| Tile HTML render | <5ms per tile | `performance.mark()` |
| CSS aspect-ratio layout | <1ms per tile | Native browser metric |
| Image load/decode | <100ms (p95) | `Image.onload` timing |
| Grid reflow on resize | <50ms | Viewport resize event → reflow complete |

**Acceptance**: All operations must meet budgets; performance assertions in integration tests.

### Memory Usage

- Tile HTML elements MUST NOT create permanent listeners or memory leaks
- Error listeners MUST be cleaned up when tile removed from DOM
- No retained references to DOM elements after unmount

---

## Validation Rules Contract

### Input Validation

- `photoId` MUST match existing Photo entity
- `imageUrl` MUST resolve under configured `photosBasePath`
- `status` MUST be one of: `ready`, `unsupported`, `unreadable`
- Container dimensions MUST be positive numbers

### Output Validation

- Rendered tile MUST contain exactly one image (`<img>`) OR placeholder (`<div class="tile-placeholder">`)
- Tile MUST have `data-photo-id` attribute
- Tile MUST have `data-status` attribute
- Tile MUST have accessible `aria-label`

---

## Summary

This contract ensures:
1. ✅ Consistent HTML structure across all preview tiles
2. ✅ Aspect ratio preservation without overflow
3. ✅ Responsive scaling across breakpoints
4. ✅ Accessible ARIA labels and semantic markup
5. ✅ Graceful fallback for unavailable previews
6. ✅ Performance budgets met for large photo counts
7. ✅ Clear error handling and state transitions

**Implementation Verification**: Contract test suite will validate each requirement above.
