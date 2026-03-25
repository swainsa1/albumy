# Data Model — Increase Photo Preview Fit

**Date**: 2026-03-25 | **Feature**: 002-increase-preview-size  
**Phase**: Phase 1 (Design & Contracts)

## Overview

This document defines data entities and relationships for preview sizing improvements. Feature 002 extends Feature 001's existing Album, Photo, and DateGroup entities without breaking their structures or contracts.

---

## Entity: PreviewTile (NEW — VIEW MODEL)

**Purpose**: Represents a single preview tile in the album detail grid, including image container, fallback state, and caption.

**Lifecycle**: Computed from Photo entity; re-rendered on photo status changes or viewport resize.

**Fields**:
- `photoId` (string, required, immutable): Reference to source Photo
- `imageUrl` (string, required): Resolved `photo.src` under `photosBasePath`
- `status` (enum: `ready`, `unsupported`, `unreadable`, required): Photo availability status
- `displayMode` (enum: `image`, `placeholder`, required): Whether tile shows image or fallback
- `aspectRatio` (float, required): Computed from original image dimensions if available; default 1.0 (square)
- `containerWidth` (number, required): CSS pixel width of tile container (responsive)
- `containerHeight` (number, required): CSS pixel height of tile container (responsive)
- `caption` (string, optional): Human-readable label from `photo.caption`
- `ariaLabel` (string, required): Accessibility label for screen readers

**Validation Rules**:
- `photoId` MUST reference an existing Photo in state.
- `imageUrl` MUST resolve under configured `photosBasePath`.
- `aspectRatio` MUST be positive (> 0).
- `containerWidth` and `containerHeight` MUST match current viewport-driven tile dimensions.
- If `displayMode` is `image`, `status` MUST be `ready`.
- If `displayMode` is `placeholder`, `status` MUST be `unsupported` or `unreadable`.

**Computed Properties**:
- `computedImageDimensions()`: Returns `{width, height}` that fit `aspectRatio` within container bounds while preserving ratio
- `isFallback()`: Returns true if `displayMode === 'placeholder'`
- `isPortrait()`: Returns true if `aspectRatio < 1.0`
- `isLandscape()`: Returns true if `aspectRatio > 1.0`
- `isSquare()`: Returns true if `1.0 ± 0.1`

---

## Entity: PreviewWarningState (NEW — AGGREGATE STATE)

**Purpose**: Aggregate warning state for an album indicating count and presence of unavailable previews.

**Lifecycle**: Computed whenever photo statuses change or album details load.

**Fields**:
- `albumId` (string, required): Reference to Album
- `unavailableCount` (integer, required, >= 0): Count of photos with status `unsupported` or `unreadable`
- `totalPhotoCount` (integer, required, >= 0): Total photos in album
- `hasWarning` (boolean, derived): `unavailableCount > 0`
- `warningMessage` (string, derived): Human-readable message for users (e.g., "2 previews unavailable")

**Validation Rules**:
- `unavailableCount` MUST be <= `totalPhotoCount`.
- `albumId` MUST reference an existing Album in state.
- `warningMessage` MUST use consistent tone with sleek-retro design language (e.g., "ℹ️ [count] preview(s) unavailable").

---

## Entity: ResponsiveTileDimensions (NEW — VALUE OBJECT)

**Purpose**: Encapsulates responsive tile sizing rules for different viewport breakpoints.

**Lifecycle**: Computed once at app boot; cached in CSS custom properties.

**Fields**:
- `breakpointName` (string, required): e.g., `desktop`, `tablet`, `mobile`
- `minViewportWidth` (number, required): CSS pixel width threshold
- `tileWidth` (number, required): CSS pixel width for tile container
- `tileHeight` (number, required): CSS pixel height for tile container
- `columnsPerRow` (number, required): Target number of tiles per grid row
- `gapSize` (number, required): CSS pixel gap between tiles

**Validation Rules**:
- `minViewportWidth` values MUST be strictly increasing per breakpoint order.
- `tileWidth` and `tileHeight` MUST be positive.
- `columnsPerRow` MUST be positive and achievable given max viewport width.

**Breakpoint Defaults** (Defined in CSS variables):
| Breakpoint | Min Width | Tile Width | Tile Height | Columns | Gap |
|-----------|-----------|-----------|-----------|---------|-----|
| mobile | 0px | 160px | 160px | 2 | 0.5rem |
| tablet | 640px | 200px | 200px | 3 | 0.75rem |
| desktop | 1024px | 240px | 240px | 4 | 1rem |

---

## Relationship Summary

**Feature 001 Entities (UNCHANGED)**:
- `StorageConfiguration` → unchanged
- `Album` → unchanged (still has `photoIds`)
- `Photo` → unchanged (still has `src`, `status`, `caption`)
- `DateGroup` → unchanged (still groups albums by date)

**Feature 002 New Relationships**:
- `PreviewTile` is derived from `Photo` (1:1, computed on render)
- `PreviewWarningState` aggregates multiple `Photo` statuses per `Album` (N:1)
- `ResponsiveTileDimensions` is singleton (applies to all albums)

**Data Flow**:
```
PhotosBasePath (StorageConfiguration)
  ↓
Manifest.json → Photo entities → PreviewTile (computed)
  ↓ (status checked)
  ↓
PreviewWarningState aggregate ← Collected from all photos in album
  ↓ (rendered as header message)
  ↓
Album detail view
```

---

## State Transitions

### Photo Status (Unchanged from Feature 001)

```
       Manifest
         ↓
      ready ←→ unreadable (on load failure)
         ↓
     unsupported (detected from extension)
```

### PreviewTile DisplayMode (NEW)

```
Initial detection → image (if Photo.status === ready)
         ↓
      placeholder (if Photo.status === unsupported OR unreadable)
         ↓
Runtime error → placeholder (if image fails to decode)
```

### Viewport Resize (NEW)

```
Viewport width changes → ResponsiveTileDimensions lookup
         ↓
Container width/height updated → CSS Grid reflows
         ↓
PreviewTile.containerWidth/Height recalculated
         ↓
Image aspect ratio and scaling applied via CSS
```

---

## Validation & Error Cases

### Invalid Photo Reference
- **Cause**: `photo.src` does not resolve under `photosBasePath`
- **Handling**: Set `displayMode = placeholder`, `status = unreadable`
- **User Feedback**: Render fallback tile; increment warning counter

### Unsupported Image Format
- **Cause**: File extension not in `SUPPORTED_IMAGE_EXTENSIONS`
- **Handling**: Set `displayMode = placeholder`, `status = unsupported` at manifest load time
- **User Feedback**: Render fallback tile; increment warning counter

### Image Decode Failure
- **Cause**: Image tag fires `error` event at runtime
- **Handling**: Image error listener replaces `<img>` with placeholder; update `displayMode`
- **User Feedback**: Render fallback tile; increment warning counter

### Empty Album
- **Cause**: Album has no photos or all photos are unreadable/unsupported
- **Handling**: Render empty-state message instead of grid
- **User Feedback**: Display "No photos in this album" or "All photos unavailable" message

### Extreme Aspect Ratios
- **Cause**: Portrait (1:10) or panorama (10:1) photos
- **Handling**: Apply `max-width` or `max-height` constraints; allow scrolling in preview
- **User Feedback**: Image scales to fit within bounds; user can scroll if needed

---

## Extension Points for Future Features

1. **Photo metadata**: Add `width`, `height`, `format`, `fileSize` to Photo if detailed preview optimization needed
2. **Batch operations**: PreviewTile collection could support batch reorder/deletion
3. **Caching**: PreviewTile dimensions could be cached in localStorage for faster load
4. **Filtering**: Add `PreviewFilterState` if selective preview visibility needed

---

## Summary

Feature 002 data model adds three new entities:
- **PreviewTile**: View model for individual preview tiles with aspect-ratio preservation
- **PreviewWarningState**: Aggregate warning state per album
- **ResponsiveTileDimensions**: Value object for responsive tile sizing

All three are derived/computed from Feature 001 entities. No breaking changes to existing Album, Photo, or DateGroup structures. Clear validation rules and error handling maintain consistency with constitution requirements.
