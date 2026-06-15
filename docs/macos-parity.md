# Native macOS parity

The SwiftUI app mirrors the desktop web app's current canvas workflow:

- Multiple tagged task lists on a finite canvas.
- Persisted list position, width, stacking order, tasks, and viewport.
- Canvas pan, pinch zoom, zoom controls, new-list control, and background
  double-click list creation.
- List movement, resizing, focus mode, deletion, and clear-canvas behavior.
- Dynamic task rows, keyboard insertion/navigation/reordering/completion,
  drag reordering, and trailing empty-row normalization.
- History provenance, original-list restoration, fallback restoration, and
  destructive confirmation.
- Matching help, history, hotkeys, theme sequence, toast copy, and dialogs.

## Verification

Run all checks available with Command Line Tools:

```sh
bun run lint
bun run typecheck
bun run test:app
bun run build
bun run test:macos
```

The native binary smoke test exercises list creation, task completion, history,
and row normalization through the packaged `.app`.

The XCTest suite provides deeper domain coverage:

```sh
bun run test:macos:xctest
```

`XCTest` requires a full Xcode installation selected with `xcode-select`.
Apple Command Line Tools alone can build and package the app but do not include
the XCTest module.

Snapshot fixtures are available through `PHIVED_SNAPSHOT_STATE` values
`populated`, `dialog`, `hotkeys`, and `light`. Set `PHIVED_SNAPSHOT_PATH` to
write the rendered window to a PNG.
