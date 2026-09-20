/**
 * dsh-settings-width — widen the Settings dialog with a draggable resize handle.
 *
 * Pattern mirrors dsh-chat-width:
 *   1. Inject a <style> setting the panel width via a CSS variable
 *      (`--dsh-settings-width`) so the right-edge handle can read it back
 *      and so we can override dsh's hard-coded `width: min(360px,100%)`.
 *   2. Append a vertical grip on the right edge of the settings panel.
 *      Drag → live resize. Double-click → restore default.
 *   3. Persist the chosen width to localStorage.dsh_settings_width.
 *
 * The handle is anchored at the right edge of the panel via `right: 0` so it
 * stays in place as the panel grows; this works for a flex row layout (the
 * settings panel's flex direction is row — nav on the left, content on the
 * right) without us having to know the panel's exact class hash.
 */
window.__ModuleLoader__.load({
	id: "dsh-settings-width",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		var LS_KEY = "dsh_settings_width";
		var DEFAULT_W = 720;
		var MIN_W = 360;
		var MAX_W = 1600;

		function clamp(v) {
			if (!Number.isFinite(v)) return DEFAULT_W;
			return Math.max(MIN_W, Math.min(MAX_W, Math.round(v)));
		}

		function loadW() {
			return clamp(Number(localStorage.getItem(LS_KEY)));
		}

		// ── CSS ──────────────────────────────────────────────────────────
		// CRITICAL: do NOT use !important on width here. !important locks the
		// CSS variable (--dsh-settings-width) to a fixed value and prevents
		// inline `style.setProperty()` calls from updating it during a drag.
		// DSH's panel does not use `width: min(...)` directly — it lets the
		// flex layout compute it — so we just override the variable.
		function pluginCSS() {
			var w = loadW();
			return [
				/* Outer panel — define the CSS variable (no !important on the
				   variable itself; let inline style override). */
				".VOzbGW_panel,",
				"[role=\"dialog\"][aria-modal=\"true\"][data-dsh-settings-width] {",
				"  width: min(var(--dsh-settings-width, " + w + "px), calc(100vw - 48px));",
				"  max-width: min(var(--dsh-settings-width, " + w + "px), calc(100vw - 48px));",
				"  --dsh-settings-width: " + w + "px;",
				"}",
				/* Content pane — keep at least MIN_W - nav so it doesn't get crushed */
				".VOzbGW_content,",
				"[role=\"dialog\"][aria-modal=\"true\"] > [class*=\"_content\"] {",
				"  min-width: " + Math.max(360, w - 220) + "px;",
				"  flex: 1 1 auto;",
				"}",
				/* Drag handle (anchored to panel's right edge) */
				".dsh-sw-handle {",
				"  position: absolute;",
				"  top: 50%;",
				"  right: 0;",
				"  width: 14px;",
				"  height: 72px;",
				"  transform: translate(50%, -50%);",
				"  z-index: 9;",
				"  cursor: ew-resize;",
				"  touch-action: none;",
				"  user-select: none;",
				"  -webkit-user-select: none;",
				"  display: flex;",
				"  align-items: center;",
				"  justify-content: center;",
				"  border-radius: 7px;",
				"  background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #141c2c) 72%, transparent);",
				"  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.14));",
				"  box-shadow: 0 2px 10px rgba(0,0,0,0.28);",
				"  opacity: 0.45;",
				"  transition: opacity 0.15s ease, background-color 0.15s ease;",
				"}",
				".dsh-sw-handle:hover,",
				".dsh-sw-handle.dragging {",
				"  opacity: 1;",
				"  background: color-mix(in srgb, var(--dsw-alias-button-floating-hover, #1b2942) 90%, transparent);",
				"}",
				".dsh-sw-grip {",
				"  width: 3px;",
				"  height: 30px;",
				"  border-radius: 2px;",
				"  background: var(--dsw-alias-label-tertiary, rgba(255,255,255,0.5));",
				"}",
				".dsh-sw-label {",
				"  position: absolute;",
				"  top: -28px;",
				"  left: 50%;",
				"  transform: translateX(-50%);",
				"  display: none;",
				"  padding: 2px 8px;",
				"  border-radius: 6px;",
				"  font-size: 11px;",
				"  line-height: 16px;",
				"  white-space: nowrap;",
				"  color: var(--dsw-alias-label-primary, #eafff3);",
				"  background: color-mix(in srgb, var(--dsw-alias-bg-overlay, #0f192b) 90%, transparent);",
				"  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.14));",
				"  pointer-events: none;",
				"  z-index: 10;",
				"}",
				".dsh-sw-handle.dragging .dsh-sw-label { display: block; }",
			].join("\n");
		}

		// ── DOM helpers ──────────────────────────────────────────────────
		function findPanel() {
			// Stable marker (used by dsh-market & friends)
			var byMarker = document.querySelector(
				'[role="dialog"][aria-modal="true"][data-dsh-settings-width]',
			);
			if (byMarker) return byMarker;
			// Hashed class fallback (current: VOzbGW_panel)
			var byHash = document.querySelector(".VOzbGW_panel");
			if (byHash) return byHash;
			// Last resort
			var dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
			for (var i = 0; i < dialogs.length; i++) {
				var r = dialogs[i].getBoundingClientRect();
				if (r.width > 0 && r.height > 0) return dialogs[i];
			}
			return null;
		}

		function refreshCSS() {
			document
				.querySelectorAll("style[data-dsh-settings-width]")
				.forEach(function (el) {
					el.textContent = pluginCSS();
				});
		}

		function setWidthOn(panel, w) {
			w = clamp(w);
			panel.style.setProperty("--dsh-settings-width", w + "px");
			panel.style.width =
				"min(var(--dsh-settings-width), calc(100vw - 48px))";
			panel.style.maxWidth =
				"min(var(--dsh-settings-width), calc(100vw - 48px))";
			panel.setAttribute("data-dsh-settings-width", String(w));
			refreshCSS();
			return w;
		}

		// ── Drag handle ──────────────────────────────────────────────────
		function makeHandle() {
			var el = document.createElement("div");
			el.className = "dsh-sw-handle";
			el.title = "拖拽调整 Settings 宽度 · 双击恢复默认";
			var grip = document.createElement("div");
			grip.className = "dsh-sw-grip";
			var label = document.createElement("div");
			label.className = "dsh-sw-label";
			el.append(grip, label);

			var dragging = false;
			var startX = 0;
			var startW = DEFAULT_W;

			var currentW = function () {
				var root = el.parentElement;
				if (!root) return loadW();
				var v = parseFloat(root.style.getPropertyValue("--dsh-settings-width"));
				return Number.isFinite(v) ? v : loadW();
			};

			var persist = function () {
				localStorage.setItem(LS_KEY, String(Math.round(currentW())));
			};

			var onMove = function (e) {
				if (!dragging) return;
				var root = el.parentElement;
				if (!root) return;
				// The handle is at `right: 0; transform: translate(50%,-50%)`,
				// so the visible center is at the panel's right edge. Pointer
				// displacement == width delta (1:1).
				var w = startW + (e.clientX - startX);
				var v = setWidthOn(root, w);
				label.textContent = v + "px";
				// Throttled log so we don't flood the console.
				if (Math.random() < 0.05) console.log("[dsh-settings-width] move →", v, "px");
			};

			var onUp = function () {
				if (!dragging) return;
				dragging = false;
				el.classList.remove("dragging");
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("pointerup", onUp);
				window.removeEventListener("pointercancel", onUp);
				el.removeEventListener("pointermove", onMove);
				el.removeEventListener("pointerup", onUp);
				el.removeEventListener("pointercancel", onUp);
				console.log("[dsh-settings-width] drag end @", currentW(), "px, saved to ls");
				persist();
			};

			var onDown = function (e) {
				e.preventDefault();
				e.stopPropagation();
				dragging = true;
				startX = e.clientX;
				startW = currentW();
				el.classList.add("dragging");
				label.textContent = Math.round(startW) + "px";
				// Capture pointer to the handle so we still receive move/up
				// events if the cursor leaves the handle area while dragging.
				try {
					el.setPointerCapture(e.pointerId);
				} catch (err) {
					/* old browsers ignore */
				}
				// IMPORTANT: after setPointerCapture, move/up events fire on
				// `el`, NOT on `window`. Listen on BOTH so dispatchEvent
				// simulations (window-scoped) still work.
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				window.addEventListener("pointercancel", onUp);
				el.addEventListener("pointermove", onMove);
				el.addEventListener("pointerup", onUp);
				el.addEventListener("pointercancel", onUp);
				console.log("[dsh-settings-width] drag start @", startW);
			};

			var onDbl = function () {
				localStorage.setItem(LS_KEY, String(DEFAULT_W));
				var root = el.parentElement;
				if (root) setWidthOn(root, DEFAULT_W);
				label.textContent = DEFAULT_W + "px";
				console.log(
					"[dsh-settings-width] reset to default " + DEFAULT_W + "px",
				);
			};

			el.addEventListener("pointerdown", onDown);
			el.addEventListener("dblclick", onDbl);
			return el;
		}

		// ── Lifecycle ────────────────────────────────────────────────────
		// Track the currently-attached handle so we don't double-attach
		// (querySelector(":scope > .dsh-sw-handle") is unreliable across browsers).
		var currentHandle = null;
		function attachHandleTo(panel) {
			if (!panel) return;

			// If a handle is already attached to THIS panel, do nothing.
			// Use .contains() instead of === because React may re-create
			// the panel element under a new node identity while keeping
			// the same class.
			if (currentHandle && currentHandle.isConnected &&
			    currentHandle.parentElement &&
			    (currentHandle.parentElement === panel || panel.contains(currentHandle))) {
				return;
			}

			// Otherwise: detach any stale handle (from a previous panel that
			// React unmounted, or a now-orphaned handle). Try multiple ways.
			if (currentHandle) {
				try {
					if (currentHandle.parentElement) {
						currentHandle.parentElement.removeChild(currentHandle);
					}
				} catch (e) {
					/* ignore */
				}
				try {
					currentHandle.remove();
				} catch (e) {
					/* ignore */
				}
				currentHandle = null;
			}

			var cs = getComputedStyle(panel);
			if (cs.position === "static") {
				panel.style.position = "relative";
			}
			var h = makeHandle();
			panel.appendChild(h);
			currentHandle = h;
			console.log("[dsh-settings-width] handle attached to", panel.className);
		}

		function apply(ctx) {
			ctx.effect(function () {
				// 1) Inject style
				if (!document.querySelector("style[data-dsh-settings-width]")) {
					var style = document.createElement("style");
					style.dataset.dshSettingsWidth = "dsh-settings-width";
					style.textContent = pluginCSS();
					document.head.appendChild(style);
				}

				// 2) Apply width to any panel already mounted
				var initial = findPanel();
				if (initial) {
					setWidthOn(initial, loadW());
					attachHandleTo(initial);
				}

				// 3) Watch for new panels (settings dialog may mount later)
				var raf = 0;
				var mo = new MutationObserver(function () {
					if (raf) return;
					raf = requestAnimationFrame(function () {
						raf = 0;
						var p = findPanel();
						if (p) {
							setWidthOn(p, loadW());
							attachHandleTo(p);
						}
					});
				});
				mo.observe(document.body, { childList: true, subtree: true });

				// 4) Backup: periodic re-scan. The settings panel may be
				// re-mounted by React without triggering the subtree observer
				// in some edge cases; this guarantees we catch it.
				var intervalId = window.setInterval(function () {
					var p = findPanel();
					if (p) {
						setWidthOn(p, loadW());
						attachHandleTo(p);
					}
				}, 1000);

				// 4) Console helper for runtime adjustment
				window.__setSettingsWidth = function (px) {
					var v = clamp(Number(px));
					localStorage.setItem(LS_KEY, String(v));
					refreshCSS();
					var p = findPanel();
					if (p) setWidthOn(p, v);
					console.log(
						"[dsh-settings-width] Settings dialog width → " +
							v +
							"px (dsh native 360px, default " +
							DEFAULT_W +
							"px)",
					);
				};

				console.log(
					"[dsh-settings-width] loaded · default " +
						DEFAULT_W +
						"px · ls " +
						LS_KEY +
						"=" +
						(localStorage.getItem(LS_KEY) || "(unset)") +
						" · current " +
						loadW() +
						"px",
				);

				return function () {
					mo.disconnect();
					if (raf) cancelAnimationFrame(raf);
					window.clearInterval(intervalId);
					document
						.querySelectorAll("style[data-dsh-settings-width]")
						.forEach(function (el) {
							el.remove();
						});
					document
						.querySelectorAll(".dsh-sw-handle")
						.forEach(function (el) {
							el.remove();
						});
					currentHandle = null;
					if (window.__setSettingsWidth) delete window.__setSettingsWidth;
				};
			}, "dsh-settings-width: apply");
		}

		exports.isPlugin = true;
		exports.inject = [];
		exports.apply = apply;
		return module.exports;
	},
});
