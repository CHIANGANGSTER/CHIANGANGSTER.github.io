# 设计系统开发文档

> 适用范围：CHIANGANGSTER 知识库静态站点（原生 HTML/CSS/JS，无框架、无构建、无 Tailwind，GitHub Pages 托管）。
> 目标：新增页面时统一复用已有字体、颜色、卡片、毛玻璃、动画、滚动、cmdk、footer、nav，避免每页重复 inline 一套效果。

## 0. 本次设计系统目标（最重要）

本次最关键目标**不是**“把旧页面所有 inline 效果原样抽出来”，而是建立一套全站共享、单一来源的视觉系统：

- **一个字体系统**，全站复用（`--font-sans` / `--font-display` / `--font-mono`）。
- **一个颜色系统**，全站复用（黑白 / 暗色 / 玻璃 / 中性色 + 全局 token）。
- **一个卡片效果**，全站复用。
- **一个毛玻璃效果**，全站复用。
- **一个动画 preset**，全站复用（`reveal-motion`）。
- **一个滚动 reveal 逻辑**，全站复用（`reveal-motion.js`）。
- **一个侧边/阅读进度条逻辑**，全站复用（`article.css` + `progress.js`）。
- **一个页面布局规范**，全站复用。
- 新页面**只引用**公共 class / 公共 JS / 公共 token。
- 页面**不再各自重复写** `backdrop-filter`、`box-shadow`、`border-radius`、`transition`、`hover`、`ripple`、`scroll progress` 等视觉效果。

**主视觉方向：黑 / 白 / 暗色 / 玻璃 / 中性色 / 极简科技感。** 不引入彩色主题。旧 workflow 详情页的金红色见 §2，属遗留色，不制度化。

---

## 1. 设计系统文件结构

### CSS（`assets/css/`）

| 文件 | 作用 | 关键内容 |
|---|---|---|
| `tokens.css` | 全站根变量 | 颜色、间距 `--space-*`、圆角 `--radius-*`、字体 `--font-*`、缓动 `--easing-*`、时长 `--duration-*`、层级 `--z-*`、`--wf-*`（workflow 详情子主题） |
| `base.css` | reset + 全局排版 | `box-sizing`、body 字体/背景、`a`/`button`、`:focus-visible`、`.skip-link`、`prefers-reduced-motion` 全局降级 |
| `nav.css` | 导航 + footer | `.kb-nav`（hub 顶栏）、`.glass-page-nav`（详情/内容页玻璃顶栏）、`.kb-footer` |
| `card.css` | 知识库卡片 | `.kb-grid`、`.kb-card`（blur(18px) 毛玻璃）、`.kb-chip`、`.kb-status` |
| `hub.css` | 域首页布局 | `.hub-page`（径向渐变背景）、`.hub-shell`、`.hub-hero`、`.hub-title`、`.hub-filter` |
| `editorial.css` | 占位/说明页 | `.editorial-stub`、大标题排版 |
| `article.css` | 长文内容页 | `.reading-progress`/`.progress-bar`（阅读进度条）、`.article-shell`、`.content`、`.copy-button` |
| `prompts.css` | 提示词画廊 | 画廊网格、灯箱 |
| `workflows-index.css` | 工作流列表页 | `.workflow-resource-section`、`.chapter`、`.mb-card`、快捷键表 |
| `cmdk.css` | 命令面板 | `.cmdk-modal`（blur(8px) 背景） |
| `reveal-motion.css` | 滚动揭示动画 | `.line-reveal`/`.line-reveal-item`、`.card-rise` + reduced-motion 降级 |
| `workflow-detail.css` | **（Phase 3A.2 新增）** workflow 详情页共享样式 | 计划承载 `.workflow-page` 布局、`.hero`、`.chapter`、`.info-card`、`.mb-card/.mb-ripple` |
| `media.css` | **（Phase 3D.2 新增）** DemoMedia 共享样式 | 承载 `.demo-media*`、`.workflow-demo-grid` 与 `workflow-demo-rise` |

### JS（`assets/js/`）

| 文件 | 作用 | 备注 |
|---|---|---|
| `nav.js` | 注入/高亮导航 | 全站引用 |
| `footer.js` | 注入 footer | 全站引用 |
| `utils.js` | 共享工具（`AppUtils`/`escapeHtml` 等） | **cmdk/hub 依赖，必须先于它们加载** |
| `cmdk.js` | 命令面板搜索 | 依赖 `utils.js` |
| `hub.js` | 域首页卡片渲染 | 读取 `assets/data/kb.json` |
| `prompts-gallery.js` | 提示词画廊 | 读取 `assets/data/prompts.json` |
| `reveal-motion.js` | 滚动揭示 | IntersectionObserver + MutationObserver 自动接管 `.line-reveal` 与卡片选择器；幂等（`window.__kbRevealMotion` 守卫） |
| `smooth-scroll.js` | 滚轮平滑 | 幂等守卫 + reduced-motion 退出 |
| `progress.js` | 阅读进度条 | 仅在存在 `.progress-bar` 时启动 |
| `copy.js` | 代码块复制按钮 | 内容页用 |

### 数据（`assets/data/`）

`kb.json`、`prompts.json`、`tags.json`、`style-system.json` —— 页面内容数据，**设计迁移不得改动**。

---

## 2. 使用规范

### 字体
- 正文：`var(--font-sans)`（Inter 栈）。
- 展示大标题：`var(--font-display)`（Compressa VF / Roboto Flex 栈）。
- 等宽：`var(--font-mono)`。
- 字号用 `clamp()` 响应式层级（参考 `.hub-title`、`.workflow-resource-title`、`.article-header h1`）。
- ❌ 不在页面 inline 重写 `font-family`，除首页 `index.html`（特殊页，自带 `@font-face`）。

### 颜色
- **全站主视觉：黑 / 白 / 暗色 / 玻璃 / 中性色。** 底色 `--bg-primary #0a0a0a`、`--bg-elevated`、玻璃面 `--bg-card`；文字 `--text-primary/secondary/muted/disabled`。
- 强调色（蓝）：`--accent: #0071e3`，用于链接、focus、进度条等少量点缀。状态色：`--accent-green`（已发布）、`--accent-amber`（测试）、`--accent-pink`（计划）。
- **新页面一律使用上述全局中性 token，不引入彩色主题。**
- ⚠️ **金红色为遗留色，禁止制度化**：`#B09868` / `#B08A62` / `#7B1E25` 目前**只**出现在 5 个 workflow 详情页的 inline 样式中（hub/内容/首页/共享 CSS 均无），属旧代码残留，**不**作为未来标准。
  - workflow 详情页迁移时，应优先把这些金红色**替换/映射到全站中性体系**（`--text-*` / `--bg-*` / 白色玻璃 rgba）。
  - 仅当某页不替换就会视觉破裂时，才临时保留旧色，并显式标注 **legacy migration only**，不得写进长期设计系统规范。
  - `tokens.css` **不提供** `--wf-accent*` 等金红色 token（已故意不创建）；workflow 颜色直接复用全局中性 token。
- ❌ 不硬编码十六进制/rgba，一律用 token。

### 卡片
- 知识库列表卡：`.kb-card`（`card.css`）。
- workflow 玻璃卡：`.chapter` / `.info-card`（Phase 3A.2 起来自 `workflow-detail.css`）。
- ❌ 不在页面 inline 重写 `border`/`border-radius`/`background`/`backdrop-filter` 复刻卡片。

### 毛玻璃
- 标准卡：`card.css` 的 `backdrop-filter: blur(18px)`。
- 弹窗/面板：`cmdk.css` 的 `blur(8px)`。
- workflow 液态玻璃：`var(--wf-glass-filter)`（`url(#liquid-glass-filter) blur(8px) ...`）。
- ❌ 不在每页 inline 复制 `<svg><filter id="liquid-glass-filter">` 定义。

### 动画
- 滚动揭示：给元素加 `line-reveal`/`line-reveal-item` 或卡片 class，`reveal-motion.js` 自动接管，无需写脚本。
- 平滑滚轮：引入 `smooth-scroll.js` 即可。
- 所有动画必须遵守 `prefers-reduced-motion: reduce` 降级（`base.css` 已全局兜底，自定义脚本需自行判断）。
- 缓动/时长用 `--easing-*` / `--duration-*` token。

### 滚动
- 阅读进度条：内容页放 `.reading-progress > .progress-bar` 并引 `progress.js`。
- 平滑滚轮：`smooth-scroll.js`。
- ❌ 不在页面 inline 重写滚动监听逻辑。

### cmdk（命令面板）
- 引 `cmdk.css` + `cmdk.js`（cmdk.js 依赖 utils.js，顺序见 §4）。全站统一，禁止另写搜索框。

### footer
- 放 `<div data-include="footer"></div>` + 引 `footer.js`。

### nav
- hub/列表页：`.kb-nav`（`nav.css`）。
- 内容/详情页：`.glass-page-nav`（玻璃顶栏，含返回 HOME + 页名）。
- 引 `nav.js`。

---

## 3. workflow 详情页应使用的共享文件

> 详情迁移对象 **只包括目录页**：`workflows/<slug>/index.html`。
> ⚠️ `workflows/comfy-flux2-retouch.html` 是轻量 redirect 页面，**不是**详情页，**不得**改回大页面。

Phase 3A.2 完成后，workflow 详情页标准引用：

```html
<!-- CSS -->
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/card.css">
<link rel="stylesheet" href="/assets/css/cmdk.css">
<link rel="stylesheet" href="/assets/css/reveal-motion.css">
<link rel="stylesheet" href="/assets/css/workflow-detail.css">
<link rel="stylesheet" href="/assets/css/media.css">

<!-- JS（顺序见 §4） -->
<script src="/assets/js/nav.js" defer></script>
<script src="/assets/js/utils.js" defer></script>
<script src="/assets/js/cmdk.js" defer></script>
<script src="/assets/js/smooth-scroll.js" defer></script>
<script src="/assets/js/reveal-motion.js" defer></script>
<script src="/assets/js/footer.js" defer></script>
```

页面 HTML 只负责内容（hero 文案、chapter、info-card），视觉与行为全部来自共享文件。

---

## 4. 允许复用 vs 禁止 inline

| 效果 | 复用方式 | 是否允许页面 inline |
|---|---|---|
| 设计 token | `tokens.css` 变量 | ❌ 禁止重声明 `:root`（首页除外） |
| reset/排版 | `base.css` | ❌ 禁止 inline `* {box-sizing}` / body reset |
| 卡片 | `card.css` / `workflow-detail.css` | ❌ 禁止 inline 复刻 |
| 毛玻璃 | `card.css` / `cmdk.css` / `--wf-glass-filter` | ❌ 禁止 inline 复制 SVG filter |
| 滚动揭示 | `reveal-motion.css` + `reveal-motion.js`（加 class 即可） | ❌ 禁止 inline 写 observer |
| 平滑滚动 | `smooth-scroll.js` | ❌ 禁止 inline |
| cmdk / nav / footer | 共享 CSS + JS | ❌ 禁止另写 |

**唯一例外：** `index.html`（首页 WebGL / intro 体验）是特殊页面，自带 inline token、字体、加载动画，**暂不纳入统一**，不要重构它。

---

## 5. 标准引用顺序

### CSS 顺序（先底层后专用）
`tokens` → `base` → `nav` → `(editorial | hub | article)` → `card` → `(workflows-index | workflow-detail | prompts)` → `reveal-motion` → `cmdk`

### JS 顺序（依赖在前）
1. `nav.js`
2. `utils.js` —— **必须在 cmdk.js / hub.js 之前**（提供 `AppUtils`/`escapeHtml`）
3. `cmdk.js`
4. `smooth-scroll.js`
5. `reveal-motion.js`
7. （内容页）`progress.js`、`copy.js`
8. `footer.js`

全部用 `defer`。**不使用 ES module。**

---

## 6. 回退与验证

### 验证（每次改动后）
```bash
# JS 语法
node --check assets/js/*.js

# JSON 可解析
# 校验 assets/data/*.json

# 本地服务
python -m http.server 8080
```

逐页 HTTP 200 检查：
- `/`（首页，应不受设计迁移影响）
- `/workflows/`（列表页）
- `/workflows/view-angle-transform/`（试点详情页）
- `/prompts/`
- `/workflows/comfy-flux2-retouch.html`（redirect 页，保持轻量）
- `/workflows/comfy-flux2-retouch/`（详情目录页）

视觉/行为核对：
- 详情页视觉逐像素不变（hero 入场、玻璃卡、光晕、倾斜、涟漪、液态玻璃）
- 滚动揭示正常、cmdk 搜索正常
- Console 无 `AppUtils is undefined` / `escapeHtml is not defined` / 重复事件绑定报错
- 移动端 390px 不变形

### 回退
- 每个迁移页面独立 commit，出问题 `git revert` 单页即可。
- 共享文件为新增（不改旧文件值），删除新文件即可恢复 inline 旧行为。
- `_backups/` 目录保留历史快照兜底。

---

## 7. 迁移进度

| 阶段 | 内容 | 状态 |
|---|---|---|
| 3A.1 | 本文档 + `tokens.css` 追加 `--wf-*` | 进行中 |
| 3A.2 | `view-angle-transform` 单页试点（新增 `workflow-detail.css`） | 待批准 |
| 后续 | 其余 4 个详情页迁移（逐页） | 未开始 |

> 首页 `index.html` 永久排除在统一重构之外。
> `workflows/comfy-flux2-retouch.html` 保持 redirect，不迁移。

---

## Phase 3C.1 Shared Glass/Card Contract

### `assets/css/glass.css`

Public glass utilities:

| Class | Use | Override variables |
|---|---|---|
| `.glass` | Base translucent surface with backdrop blur. | `--glass-blur`, `--glass-bg`, `--glass-border`, `--glass-radius`, optional `--glass-filter` |
| `.glass--panel` | Slightly stronger panel tint for larger grouped surfaces. | Same variables as `.glass` |
| `.glass--card` | Card-shaped glass surface with shared radius and border. | `--glass-radius`, `--glass-border` |
| `.glass--media` | Tighter media container with hidden overflow. | `--glass-media-padding`, plus glass variables |
| `.glass--subtle` | Low-tint secondary surface with minimal blur. | Same variables as `.glass` |

Use page-level variables when a legacy page needs its existing liquid-glass SVG filter:

```css
:root {
  --glass-filter: url(#liquid-glass-filter) blur(8px) contrast(1.08) brightness(1.04) saturate(1.1);
  --glass-border: var(--border);
}
```

### `assets/css/card.css`

New shared card helpers:

| Class | Use | Override variables |
|---|---|---|
| `.card-surface` | Neutral reusable card surface with background, radius, and shadow. | `--card-surface-bg`, `--card-surface-radius`, `--card-surface-shadow` |
| `.card-hover` | Standard lift/shadow hover state. | `--card-hover-shadow` |
| `.section-card` | Larger section-level card spacing. | `--section-card-padding`, `--section-card-gap` |

### Phase 3C.1 onboarded pages

- `workflows/view-angle-transform/index.html`
- `workflows/multi-model-image-workflows/index.html`

---

## Phase 3D.2 Shared DemoMedia Contract

### `assets/css/media.css`

Public demo media selectors:

| Selector | Use |
|---|---|
| `@keyframes workflow-demo-rise` | Shared entrance animation for workflow demo media. |
| `.workflow-demo-grid` | Vertical grid wrapper for multiple demo media blocks. |
| `.demo-media` | Outer demo media block; label and note stay outside the transformed surface. |
| `.demo-media__label` | Demo label heading. |
| `.demo-media__motion` | Transform target for demo magnetism. |
| `.demo-media__frame` | Clipped rounded media frame. |
| `.demo-media__video` | Responsive demo video element. |
| `.demo-media__note` | Supporting demo note text. |
