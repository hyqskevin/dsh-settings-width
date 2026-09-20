/**
 * dsh-settings-width — widen the Settings dialog (browser side).
 *
 * DSH ships the Settings dialog at width: min(380px, 100%) — too narrow on
 * a wide monitor. This plugin overrides the ._dialog_w1urq_22 rule that
 * backs the Settings sheet so the panel grows.
 *
 *   - Default: 720px
 *   - localStorage key: dsh_settings_width
 *   - Console helper: window.__setSettingsWidth(px)
 */

(function () {
  if (typeof window === "undefined" || !window.__ModuleLoader__) return;

  window.__ModuleLoader__.load({
    id: "dsh-settings-width",
    factory: function (require) {
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
        var raw = parseFloat(window.localStorage.getItem(LS_KEY));
        return clamp(raw);
      }

      function css() {
        var w = loadW();
        return [
          // The Settings dialog root uses the ._dialog_w1urq_22 class.
          // Doubling the selector raises specificity above dsh's own rule.
          "._dialog_w1urq_22._dialog_w1urq_22 {",
          "  width: min(" + w + "px, calc(100vw - 48px));",
          "  max-width: calc(100vw - 48px);",
          "}",
        ].join("\n");
      }

      function apply(ctx) {
        ctx.effect(function () {
          if (!document.querySelector('style[data-dsh-settings-width]')) {
            var s = document.createElement("style");
            s.dataset.dshSettingsWidth = "dsh-settings-width";
            s.textContent = css();
            document.head.appendChild(s);
          }

          window.__setSettingsWidth = function (px) {
            var v = clamp(Number(px));
            window.localStorage.setItem(LS_KEY, String(v));
            document
              .querySelectorAll('style[data-dsh-settings-width]')
              .forEach(function (el) {
                el.textContent = css();
              });
            console.log(
              "[dsh-settings-width] Settings dialog width → " +
                v +
                "px (dsh native 380px, default " +
                DEFAULT_W +
                "px)",
            );
          };

          return function () {
            document
              .querySelectorAll('style[data-dsh-settings-width]')
              .forEach(function (el) {
                el.remove();
              });
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
})();
