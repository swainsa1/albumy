# Data Model — Photo Album Organizer

## Entity: StorageConfiguration

**Purpose**: Represents runtime source-path settings for photo data in a static deployment.

**Fields**:
- `photosBasePath` (string, required): same-origin absolute or relative path; default `/photos`
- `resolvedManifestPath` (string, derived): `${photosBasePath}/manifest.json`
- `lastValidatedAt` (ISO datetime, optional)
- `validationStatus` (enum: `valid`, `invalid`, `unreachable`)

**Validation Rules**:
- `photosBasePath` MUST start with `/` or `./`.
- `photosBasePath` MUST NOT contain path traversal segments (`..`).

## Entity: Album

**Purpose**: Top-level grouping of photos displayed and reordered on main page.

**Fields**:
- `id` (string, required, unique)
- `title` (string, required, 1–80 chars)
- `date` (string, required, ISO date `YYYY-MM-DD`)
- `sortOrder` (integer, required, >= 0)
- `photoIds` (array<string>, required, may be empty)

**Validation Rules**:
- `title` MUST be trimmed and non-empty.
- `date` MUST parse as valid calendar date.
- Album hierarchy depth MUST equal 1 (no parent album references).

## Entity: Photo

**Purpose**: Media item shown in album tile previews.

**Fields**:
- `id` (string, required, unique)
- `albumId` (string, required)
- `src` (string, required; relative or same-origin URL)
- `thumbnailSrc` (string, optional)
- `caption` (string, optional, max 140 chars)
- `sortOrder` (integer, required, >= 0)
- `status` (enum: `ready`, `unsupported`, `unreadable`)

**Validation Rules**:
- `albumId` MUST reference an existing album.
- `src` MUST resolve under configured `photosBasePath`.

## Entity: DateGroup

**Purpose**: UI grouping view-model that clusters albums by date.

**Fields**:
- `groupKey` (string, required): normalized date key
- `label` (string, required): human-readable date heading
- `albumIds` (array<string>, required)

**Validation Rules**:
- `albumIds` MUST contain unique values.
- Group ordering MUST be deterministic (descending date then `sortOrder`).

## Entity: ThemeProfile

**Purpose**: Holds design tokens for sleek-retro style consistency.

**Fields**:
- `name` (string, required): `sleek-retro`
- `colors` (object, required): background/surface/text/accent/danger tokens
- `typography` (object, required): heading/body/font-size scales
- `focusOutline` (string, required)

## Relationship Summary

- One `StorageConfiguration` controls one manifest source path.
- One `Album` has many `Photo` items.
- One `DateGroup` has many `Album` items.
- `ThemeProfile` applies globally across all pages.

## State Transitions

### Album
- `created` -> `displayed` -> `reordered` -> `persisted`
- `displayed` -> `deleted`

### Drag/Reorder Interaction
- `idle` -> `dragging` -> (`dropped-valid` | `dropped-invalid` | `cancelled`)
- `dropped-valid` -> `persisted`
- `dropped-invalid` -> `restored`

### Photo Preview
- `placeholder` -> (`ready` | `unsupported` | `unreadable`)
