# Changelog

## 0.1.0 — 2026-09-20

Initial release.

- Widen DSH Settings dialog from default 380px → 720px (configurable 360–1600px)
- Persist width via `localStorage.dsh_settings_width`
- Expose `window.__setSettingsWidth(px)` for runtime adjustment
- Local-link install via `pnpm add link:...` (symlinked source — edit and restart to pick up changes)
