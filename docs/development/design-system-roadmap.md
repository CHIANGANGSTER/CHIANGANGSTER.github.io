# Design System Roadmap

本文件是 CHIANGANGSTER.github.io 网站设计系统整合的总控文档。

目标不是一次性重构全站，而是把重复的视觉效果、交互效果和页面结构逐步整理成可复用的公共系统。以后新增页面时，应优先使用已有公共 CSS / JS / token / 结构模板，而不是复制旧页面代码重新写一套。

---

## 0. 核心目标

最终网站应达到：

1. 网站有统一设计系统。
2. 字体、颜色、间距、圆角、玻璃、卡片、动效、弹窗、视频展示等效果尽量公共化。
3. 新页面只写内容、结构、路径和数据，不重复写视觉效果代码。
4. 每一种效果只保留一套标准实现。
5. 页面之间视觉一致。
6. 代码重复减少，后续维护更安全。
7. Agent 修改代码时有明确边界，不盲目复制旧页面。

---

## 1. 当前项目性质

项目是纯静态站：

* 原生 HTML / CSS / JS
* 无 React / Vue / Next / Vite
* 无 package.json
* 无构建工具
* 主要由 GitHub Pages 托管
* 页面使用绝对路径 `/assets/...`

因此设计系统应优先采用：

* 共享 CSS 文件
* 共享 JS 文件
* 统一 HTML 结构模板
* 明确的 class 命名
* 小步迁移
* 每阶段独立验证和提交

---

## 2. 当前主视觉方向

网站未来统一方向：

* 黑 / 白 / 暗色
* 中性玻璃
* 白色边框高光
* 极简科技感
* 少量蓝色仅作为链接、focus、进度或系统状态点缀

旧 workflow 详情页中的金红色：

* `#B09868`
* `#B08A62`
* `#7B1E25`

属于 legacy inline 残留，不应成为未来标准主题。

迁移旧页面时：

* 不要新建金红色标准 token
* 不要扩大金红色使用范围
* 如临时保留，必须标记为 `legacy migration only`
* 最终应逐步映射到黑白 / 暗色 / 中性玻璃体系

---

## 3. 禁止事项

任何阶段默认禁止：

1. 不要一次性重构全站。
2. 不要同时改多个高风险模块。
3. 不要把首页 WebGL / boot / intro 和普通页面一起重构。
4. 不要改 JSON schema，除非该阶段明确要求。
5. 不要删除资源文件，除非完成全站引用扫描并单独确认。
6. 不要把未验证的公共 JS 接入多个页面。
7. 不要让共享文件和 inline 版本同时运行。
8. 不要让同一个效果存在两套实现。
9. 不要把旧页面残留样式误认为设计标准。
10. 不要在没有浏览器验收的情况下提交视觉/动效重构。

---

## 4. 已有公共文件

**注意：本清单不是完整权威索引。执行任何阶段前，必须用 `ls / grep` 重新确认 `assets/css`、`assets/js`、`assets/data` 的真实文件状态。**

### CSS

* `assets/css/tokens.css`
  基础 token：颜色、字体、间距、圆角、z-index、动画变量等。

* `assets/css/base.css`
  全局基础样式、body、链接、focus、reduced motion 等。

* `assets/css/card.css`
  已有通用卡片体系。

* `assets/css/hub.css`
  Hub / 列表类页面布局。

* `assets/css/editorial.css`
  Research / Marketing / Resources 等内容页样式。

* `assets/css/cmdk.css`
  搜索 / 命令面板样式。

* `assets/css/reveal-motion.css`
  滚动 reveal 动画样式。

* `assets/css/workflow-detail.css`
  workflow 详情页部分共享样式。当前只部分接入，后续需谨慎扩展。

* `assets/css/article.css`
  文章 / 文档页样式。

* `assets/css/nav.css`
  导航样式。

* `assets/css/prompts.css`
  prompts 页样式。

* `assets/css/workflows-index.css`
  workflows 列表页样式。

* `assets/css/glass.css`
  公共毛玻璃契约（Phase 3C）：`.glass` 及变体。

* `assets/css/media.css`
  DemoMedia 共享样式（Phase 3D）：`.demo-media*`、`workflow-demo-rise`。

* `assets/css/magic-bento.css`
  MagicBento 卡片样式（Phase 3E）：`.mb-card` / `.mb-ripple`。

* `assets/css/image-modal.css`
  图片放大/灯箱样式（Phase 3B）。

### JS

* `assets/js/utils.js`
  公共工具函数，目前包含 `AppUtils.escapeHtml`。

* `assets/js/cmdk.js`
  搜索 / 命令面板。

* `assets/js/reveal-motion.js`
  滚动 reveal 动画。

* `assets/js/smooth-scroll.js`
  平滑滚动。

* `assets/js/progress.js`
  阅读进度 / 滚动进度相关逻辑。

* `assets/js/nav.js`
  普通页面导航。

* `assets/js/footer.js`
  页脚。

* `assets/js/copy.js`
  复制功能 / 剪贴板工具。

* `assets/js/hub.js`
  Hub / 列表类页面逻辑。

* `assets/js/prompts-gallery.js`
  Prompts gallery 相关逻辑。

* `assets/js/validate-kb.js`
  数据验证工具。

* `assets/js/image-modal.js`
  图片放大/灯箱（Phase 3B）；接管 `[data-image-modal]`。

* `assets/js/magic-bento.js`
  卡片 hover/glow/tilt/ripple（Phase 3E，**已重建**）；`window.__kbMagicBento` 守卫。

* `assets/js/light-rays.js`
  WebGL god-rays 背景（Phase 3F）；`window.__kbLightRays` 守卫。

* `assets/js/liquid-glass.js`
  SVG displacement map（Phase 3F，**已重建**）；`window.__kbLiquidGlass` 守卫。

### Data

* `assets/data/kb.json`
  知识库数据。

* `assets/data/prompts.json`
  Prompts 数据。

* `assets/data/style-system.json`
  设计系统 / token 定义（与 tokens.css 关系待确认）。

* `assets/data/tags.json`
  标签数据。

---

## 5. 当前已知风险

### 5.1 workflow 详情页仍有大量 inline 代码

5 个 workflow detail 页面仍保留不少 inline CSS / JS，包括：

* `initLightRays`
* `initMagicBento`
* `initLiquidGlassMap`
* `initDemoMagnetism`
* `initImageModal`
* inline SVG filter
* inline page-level CSS
* legacy 金红色样式

这些不能一次性抽离。

---

### 5.2 magic-bento.js / liquid-glass.js 历史

这两个文件曾在 Phase 3A 作为未引用死文件删除，**但已在后续阶段基于真实页面 class 重新设计并重建**：

* `assets/js/magic-bento.js` —— Phase 3E 重建（接管标准 4 页卡片 hover/glow/tilt/ripple + `[data-demo-magnet]`）。
* `assets/js/liquid-glass.js` —— Phase 3F 重建（SVG displacement map，view/text/fusion 3 页引用）。

**当前状态：两文件均存在并被运行时引用。** 不要再把它们描述为已删除。comfy/multi 的 inline 变体见 design-system.md §3E.3 / §3F 例外清单。

---

### 5.3 首页是特殊页面

`index.html` 包含：

* boot mask
* intro
* WebGL / Three.js
* Unicorn
* 首页独立动效

首页暂不纳入普通页面设计系统整合。

---

### 5.4 Jekyll / 下划线目录风险

当前网站使用 GitHub Pages，默认以 Jekyll 方式托管。Jekyll 会忽略下划线开头目录（`_*` 目录）。

当前下划线目录：

* `_imports`、`_backups`、`_tmp_framia_inspect` 等

这些目录**当前无法发布**到 GitHub Pages（Jekyll 默认忽略 `_` 开头路径）。

**最终策略**：
- `_imports/` 保持 dev-only，不发布到 GitHub Pages。
- 前端 JSON 不再暴露 `_imports/` 路径。
- 不添加 `.nojekyll`。
- 不迁移 `_imports/` 文件。

---

## 6. 执行原则

所有设计系统工作按阶段执行。

每阶段必须满足：

1. 任务目标单一。
2. 开始前 `git status --short` 必须干净。
3. 人工先执行 `git pull --ff-only origin checkfiles`；Agent 可检查 `git status --short`。如 Agent 执行 pull 遇到权限或网络问题，必须停止并报告，不要自行修复 Git 内部文件。
4. 每轮只允许修改明确列出的文件。
5. 修改后必须运行基本验证。
6. 视觉/交互改动必须人工浏览器验收。
7. 通过后单独 commit。
8. 不同类型修改不要混在一个 commit。

---

## 6.5 Phase 0 待办事项

在继续任何 token / 设计数据 / 公共样式整合前，应先确认：

1. **确认 `assets/data/style-system.json` 用途**
   
   仓库中存在 `style-system.json`。必须确认：
   - 这个文件是否在被消费（哪些页面引用）
   - 内容是否与 `tokens.css` / `docs/development/design-system.md` 的设计规则产生冲突
   - 是否应该与 tokens 系统统一
   
   不要盲目推导出新 token 系统，先查清现状。

---

## 7. 标准验证命令

每个代码阶段至少运行：

```powershell
git status --short
Get-ChildItem assets/js/*.js | ForEach-Object { node --check $_.FullName }
```

JSON 验证：

```powershell
python -c "import json,glob; [json.load(open(p,encoding='utf-8')) for p in glob.glob('assets/data/*.json')]; print('JSON OK')"
```

本地服务：

```powershell
python -m http.server 8080
```

核心页面 HTTP / 浏览器检查：

* `/`
* `/workflows/`
* `/prompts/`
* `/workflows/comfy-flux2-retouch/`
* `/workflows/flux2-klein-text-to-image/`
* `/workflows/flux2-klein-light-fusion/`
* `/workflows/multi-model-image-workflows/`
* `/workflows/view-angle-transform/`

---

## 8. 推荐执行阶段

### Phase 3A：workflow detail 基础收口

当前状态：已完成 & 提交。

目标：

* 清理死共享文件
* 修正文档误导
* 确认 workflow detail 页面当前真实状态
* 不盲目继续整合

已完成并提交：

* 删除无用 CTA（commit: `ui: remove workflow detail CTA buttons`）
* 返回链接改为 `← WORKFLOWS`（commit: `ui: point workflow detail back link to workflows`）
* 添加 workflow 页面 dark first-paint guard（commit: `fix: add dark first paint guard to workflow pages`）
* 删除未使用的 `magic-bento.js` / `liquid-glass.js`（commit: `chore: remove unused workflow shared scripts`）

下一步（审计）：

* 只读审计 workflow detail 可公共化模块（由 Phase 3B–3G 负责）
* 确认优先级顺序

---

### Phase 3B：Image Modal / Lightbox 公共化

模式：READ-ONLY（审计）→ WRITE（单页试点）
输出：审计报告 + 单页试点实现

目标：

把图片放大、背景毛玻璃、关闭按钮、弹出动画整理成统一模块。

建议产物：

* `assets/css/image-modal.css`
* `assets/js/image-modal.js`

执行顺序：

1. 只读审计所有 image modal / lightbox 实现。
2. 设计公共结构和 class。
3. 选择一个页面试点。
4. 验证视觉和交互。
5. 再迁移其他页面。
6. 删除重复 inline modal 逻辑。

风险：

* 图片尺寸
* backdrop-filter
* 关闭逻辑
* ESC / 点击背景关闭
* 移动端尺寸

---

### Phase 3C：Glass / Card 公共化

模式：READ-ONLY（审计）→ WRITE（单页试点）+ 冻结 class 契约
输出：审计报告 + 单页试点实现

目标：

统一毛玻璃卡片、边框、圆角、阴影、hover 状态。

建议产物：

* `assets/css/glass.css`
* `assets/css/components.css`

执行顺序：

1. 审计卡片和玻璃效果。
2. 定义 `.glass-card`、`.section-card`、`.stat-card`、`.media-card`。
3. 单页试点。
4. 再逐页迁移。

**重要：class 名契约**

此阶段定义的卡片 class 名（如 `.tech-card`、`.step-card` 等）是 Phase 3E（MagicBento）选择器的依赖。统一卡片样式时不得随意改名；如必须改名，必须同步更新 Phase 3E 的选择器计划。

注意：

不要一次性替换所有 `.chapter` / `.tech-card` / `.step-card`，必须逐页验证。

---

### Phase 3D：DemoMedia / MP4 模块重做

模式：READ-ONLY（审计）→ WRITE（单页试点）
输出：审计报告 + 单页试点实现

目标：

统一视频展示模块。

建议结构：

```html
<article class="demo-media">
  <h2 class="demo-media__label">标签</h2>
  <div class="demo-media__motion" data-demo-magnet>
    <div class="demo-media__frame">
      <video class="demo-media__video" autoplay loop muted playsinline preload="metadata">
        <source src="..." type="video/mp4">
      </video>
    </div>
  </div>
  <p class="demo-media__note">说明文字</p>
</article>
```

注意：

过去 DemoMedia 迁移曾引发白屏和半接入问题。下一次必须重新从当前真实代码开始，不复用旧 WIP 记忆。

执行顺序：

1. 只读审计所有 video / MP4 / demo。
2. 确认哪些页面需要迁移。
3. 建立公共 CSS。
4. 只迁移一个页面。
5. 浏览器验收。
6. 通过后继续。

---

### Phase 3E：MagicBento 重新设计

模式：READ-ONLY（审计）→ WRITE（单页试点）
依赖：Phase 3C class 契约已冻结
输出：审计报告 + 单页试点实现

目标：

统一卡片 hover / glow / ripple / tilt。

状态：**已完成（Phase 3E）**。`magic-bento.css` + `magic-bento.js` 已重建并接入标准 4 页；comfy 保留 inline 变体（见 design-system.md §3E.3）。

可能目标 class：

* `.tech-card`
* `.step-card`
* `.qa-card`
* `.workflow-note-card`
* `.chapter`
* `.workflow-shot`

但不能直接把 `.chapter` 当成 card，需逐项确认。

执行顺序：

1. 审计各页卡片 class。
2. 决定哪些元素应该有 hover / glow / ripple。
3. 设计新 JS。
4. 单页试点。
5. 验证无重复事件绑定。
6. 再逐页接入。

---

### Phase 3F：LiquidGlass 重新设计

模式：READ-ONLY（审计）→ WRITE（单页试点）
输出：审计报告 + 单页试点实现

目标：

统一 liquid glass filter / displacement map。

状态：**已完成（Phase 3F）**。`liquid-glass.js` + `light-rays.js` 已重建并接入 view/text/fusion 3 页；comfy（SDF）与 multi（shader 格式）保留 inline 变体（见 design-system.md §3F）。SVG filter 定义仍 inline（liquid-glass.js 依赖）。

执行顺序：

1. 审计当前所有 `liquid-glass-filter`。
2. 确认哪些页面需要 filter。
3. 决定保留 inline SVG 还是 JS 注入。
4. 避免重复 filter id。
5. 单页试点。
6. 验证毛玻璃视觉。

---

### Phase 3G：LightRays 审计

模式：READ-ONLY
输出：审计报告 + 可公共化性评估

目标：

处理 WebGL god-rays / light-rays 重复代码。

注意：

`comfy-flux2-retouch` 的 `initLightRays` 可能与其他 4 页不同。不能盲目合并。

执行顺序：

1. 比较 5 页 `initLightRays`。
2. 判断 4/5 相同代码是否可抽。
3. 单独处理 comfy 变体。
4. 确认性能、canvas 层级、移动端表现。
5. 再决定是否公共化。

---

### Phase 3H：新页面模板

模式：READ-ONLY（模板需求审计）→ WRITE（文档 / 模板文件）
输出：文档 + 可选 HTML 模板

目标：

为未来 Research / Marketing / Resources / Dashboard 等新页面建立标准模板。

建议产物：

* `docs/development/page-template.md`
* 可选：`docs/templates/page-template.html`

模板应明确：

* CSS 引用顺序
* JS 引用顺序
* page shell
* section block
* glass card
* image modal
* demo media
* command menu
* footer
* mobile 验收

---

### Phase 3I：Navigation 统一审计

模式：READ-ONLY
状态：暂缓执行（待 Phase 3A–3H 稳定）
输出：审计报告 + 统一方案草案

目标：

审计并规划导航系统统一。

当前已知不一致：

* workflow detail 页可能有硬编码 nav
* 普通页面使用 `nav.js` + `nav.css`
* 导航组件在不同页面的实现差异大
* 未来统一 nav 的爆炸半径大（影响所有页面）

执行顺序：

1. 审计所有页面导航实现（HTML 结构 / CSS class / JS 逻辑）。
2. 绘制当前导航版本分布图。
3. 设计统一方案（优先级：兼容性 > 新功能）。
4. 制定迁移计划（不在本 Phase 执行）。

注意：

此阶段**禁止修改任何导航代码或样式**，仅审计和规划。导航统一涉及所有 20+ 页面，不能盲目同步。

---

## 9. 模型 / 工具分工

### Claude Sonnet

适合：

* 小范围明确修改
* 文档更新
* 删除按钮
* 改链接
* 加 meta
* 单文件试点
* 简单扫描

不适合：

* 一次性全站重构
* 多模块同时迁移
* 高风险动效系统重写

### Codex Rescue

适合：

* 明确代码任务
* 扫描引用
* 删除死文件
* 小范围重构
* 自动验证

### Codex Review

适合：

* 审查本地 diff
* 检查是否误改
* 找风险点

### Opus / 高级模型

只用于：

* 架构判断
* 阶段设计
* 高风险交叉验证
* 复杂失败复盘

---

## 10. Commit 规范

每个阶段单独 commit。

建议格式：

```text
docs: update design system roadmap
ui: remove workflow detail CTA buttons
fix: add dark first paint guard to workflow pages
chore: remove unused workflow shared scripts
refactor: extract image modal module
refactor: unify demo media structure
```

不要把以下内容混在同一 commit：

* 文档
* 视觉重构
* 删除资源
* JS 公共化
* CTA 文案
* 路由修复

---

## 11. 如果 roadmap 需要修改

如果执行中发现 roadmap 有问题，不要继续硬做。

标准流程：

1. 停止当前代码修改。
2. 输出发现的问题。
3. 修改本 roadmap。
4. 单独提交 roadmap 更新。
5. 再按新 roadmap 执行。

也就是说：

```text
先修规则，再修代码。
```

---

## 12. 下一步执行建议

当前下一步建议：

1. 先执行只读审计，确认当前 workflow detail 页面真实重复点。
2. 不要恢复历史废弃版本的 JS 文件；`magic-bento.js` / `liquid-glass.js` 已在 Phase 3E / 3F 重新设计并重建，当前以公共模块清单为准。
3. 不继续旧 WIP。
4. 优先考虑 Image Modal / Lightbox 公共化，或重新设计 DemoMedia。
5. 每次只做一个模块。
6. 每次只迁移一个页面试点。
7. 通过后再迁移剩余页面。
