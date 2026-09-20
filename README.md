# dsh-settings-width

[English](#english) | [中文](#中文)

---

## 中文

调宽 DSH 网页**设置弹窗**的宽度。DSH 原生把设置弹窗限制在 `width: min(380px, 100%)`，在大屏显示器上阅读表单字段、表格行非常局促；本插件在弹窗右缘加上**可拖拽的把手**（类似 dsh-chat-width 的聊天宽度把手），实时调整宽度。

### 调整宽度

两种方式，任选其一：

1. **拖拽设置弹窗右缘把手**（推荐）：鼠标按住把手左右拖，**1:1 跟手**，松开自动记忆到 `localStorage.dsh_settings_width`。**双击把手**恢复默认 720px。把手的半透明样式与主题融合，悬停/拖动时高亮。
2. **浏览器开发者控制台**（F12 → Console）：
   ```js
   __setSettingsWidth(960)    // 设成 960px
   __setSettingsWidth(1200)   // 设成 1200px
   ```
   范围 **360 ~ 1600**，越界自动回退到默认。

直接编辑 localStorage 也行（键名 `dsh_settings_width`，数值字符串如 `"960"`）。选择会持久化到 `localStorage`，下次打开设置弹窗仍然生效。

### 安装

**方式一：插件市场** —— 在 DSH 网页的 设置 → 插件市场中搜索 `dsh-settings-width`，一键安装（待上架）。

**方式二：本地安装**：

```bash
dsh plugin --profile web add file:/path/to/dsh-settings-width
```

**方式三：直接 link**（开发模式，改源码自动生效）：

```bash
# 在 web profile 目录（~/.dsh/profiles/web）下
pnpm add link:/path/to/dsh-settings-width
# 然后在 package.json 的 dsh.profile.bundles 加入 "dsh-settings-width"
# 重启 dsh web
```

### 实现原理

1. 通过 `window.__ModuleLoader__.load()` 注册为 DSH 客户端模块；
2. `apply(ctx)` 内用 `ctx.effect()` 注入 `<style data-dsh-settings-width>`；
3. CSS 用**稳定选择器**（`[role="dialog"][aria-modal="true"][data-dsh-settings-width]`） + 加倍类名（`.VOzbGW_panel.VOzbGW_panel`）覆盖 DSH 默认 `width: min(380px, 100%)`，特异性 `(0,2,0)`；
4. 注入**绝对定位的把手**到 panel 右缘（`right: 0; transform: translate(50%, -50%)`），监听 `pointerdown` / `pointermove` / `pointerup`，实时设 `--dsh-settings-width`；
5. localStorage 记忆选择，松手时持久化。

### 卸载

从 `package.json` 的 `dependencies` 与 `dsh.profile.bundles` 移除 `dsh-settings-width`，然后：

```bash
pnpm install
# 重启 dsh web
```

---

## English

Widen the **Settings dialog** in DeepSeek Harness Web UI. DSH ships the Settings dialog at `width: min(380px, 100%)` — too narrow on wide monitors. This plugin overrides that rule to **720px by default** (configurable).

### Adjust width

**Option 1: Browser DevTools Console** (F12 → Console):

```js
__setSettingsWidth(960)    // Set to 960px
__setSettingsWidth(1200)   // Set to 1200px
```

Range **360 ~ 1600**, values out of range fall back to default.

**Option 2: Edit localStorage directly**: key `dsh_settings_width`, numeric string (e.g. `"960"`).

Persisted across sessions.

### Install

**Option 1: Plugin Market** (in DSH Web → Settings → Plugins, search `dsh-settings-width`).

**Option 2: Local install**:

```bash
dsh plugin --profile web add file:/path/to/dsh-settings-width
```

**Option 3: pnpm link** (development mode, hot reload from source):

```bash
cd ~/.dsh/profiles/web
pnpm add link:/path/to/dsh-settings-width
# add "dsh-settings-width" to dsh.profile.bundles in package.json
# restart dsh web
```

### How it works

1. Register as a DSH client module via `window.__ModuleLoader__.load()`;
2. Inject `<style data-dsh-settings-width>` from `apply(ctx)` via `ctx.effect()`;
3. Doubled selector `._dialog_w1urq_22._dialog_w1urq_22` raises specificity to `(0,2,0)`, beating DSH's `(0,1,0)` regardless of style load order;
4. Persist preference in localStorage; CSS regenerates on change.

### Uninstall

Remove `dsh-settings-width` from `dependencies` and `dsh.profile.bundles` in `package.json`, then:

```bash
pnpm install
# restart dsh web
```

---

## License

MIT
