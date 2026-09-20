# Changelog

## 0.2.0 — 2026-09-20

Draggable resize handle.

- Settings dialog now ships with a vertical grip on its right edge — drag to resize live (1:1 with pointer motion)
- Double-click the handle to reset to the default 720px
- Persist via `localStorage.dsh_settings_width` on pointer-up
- Console helper `window.__setSettingsWidth(px)` still works (range 360–1600)
- **Fix**: removed `!important` on the `--dsh-settings-width` CSS variable so inline `style.setProperty()` during drag actually updates the layout (was locked to the load-time value)
- Add `package.json` `exports` map (`.`, `./client`, `./package.json`) for proper resolution through DSH's client-modules loader

## 0.1.0 — 2026-09-20

Initial release.

- Widen DSH Settings dialog from default 380px → 720px (configurable 360–1600px)
- Persist width via `localStorage.dsh_settings_width`
- Expose `window.__setSettingsWidth(px)` for runtime adjustment
- Local-link install via `pnpm add link:...` (symlinked source — edit and restart to pick up changes)
