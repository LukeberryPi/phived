# macOS Web Parity Design

## Source of truth

The React app in `apps/web` defines product behavior. The native macOS app
must expose the same task model and desktop workflows while using native
SwiftUI controls and macOS input conventions.

## Domain and persistence

The old native model stored exactly five strings. Replace it with:

- A finite 6000 x 4000 canvas.
- Any number of task lists.
- Per-list id, tag, position, width, stacking order, and dynamic task rows.
- At least five rows per list and a trailing empty row after content.
- History entries that remember the source list id and optional tag.
- A persisted viewport with pan and zoom.

Existing `storedGeneralTasks` data migrates into a centered list. Persist new
data under `canvasLists` and `canvasViewport`, matching the web storage names.

## Interactions

Users can create a list from the canvas controls or by double-clicking the
background, edit its tag, move it, resize it, focus it, and delete it. Empty
lists delete immediately; populated lists require confirmation. Clearing the
canvas leaves one empty centered list.

Rows support add, complete, drag reorder, arrow navigation, Enter/Shift+Enter
insertion, Option+Arrow reorder, Command/Control+Enter completion, Escape
unfocus, and Backspace removal for extra empty rows. Restoring history targets
the original list when it still exists, then the first list, then a new
centered list.

## Presentation

The native app keeps the web app's brutalist cards, dotted canvas, theme
sequence, floating header, drawers, dialogs, copy, and control placement.
SwiftUI gestures provide canvas pan, magnification, card movement, and resize.
Native accessibility labels describe all icon-only controls.

## Verification

XCTest covers normalization, migration, list lifecycle, row insertion/removal,
completion, restoration fallback, ordering, clamping, viewport zoom, deletion,
and persistence. The packaged binary runs a domain smoke test. Web lint,
typecheck, tests, and build remain required so the monorepo merge cannot
silently change the source of truth.
