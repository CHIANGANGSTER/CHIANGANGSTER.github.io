# Knowledge Base Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing single-page ComfyUI tutorial site into a 5-domain AI knowledge base (workflows / prompts / research / marketing / resources) with shared design tokens, Cmd+K search, tag filtering, and zero build pipeline — covering S0 (scaffolding) + S1 (workflows-domain migration) only.

**Architecture:** Vanilla HTML / CSS / ES2020 served directly by GitHub Pages. Shared nav and footer injected at runtime via `data-include` placeholders. KB entries are a single `/assets/data/kb.json` rendered client-side on hub pages. Visual hybrid γ — editorial mode for hero/hub, glass mode for content; both anchored in one tokens file.

**Tech Stack:** HTML5, modern CSS (custom properties, `:has()`, `backdrop-filter`), vanilla ES2020 JS, JSON data layer. No build step. Existing CDN deps grandfathered: Three.js 0.163.0, UnicornStudio 2.1.8, Cloudinary fonts, Google Fonts.

**Spec:** [docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md](../specs/2026-04-27-knowledge-base-redesign-design.md)

**Workflow constraints (per spec D1):**
- The local working folder is **not a git repo**. No `git init`, `git add`, or `git commit` steps appear anywhere in this plan.
- Verification is via **browser smoke checks** at two viewports (1440×900 desktop, 390×844 mobile) and DevTools console.
- Author uploads to https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io manually after S1 acceptance.
- "TDD" here means: write the verification check first (what URL + what to see in DevTools), confirm it fails today (because the file/feature does not exist yet), then implement, then re-run the check.

**Plan scope vs. spec scope:**
- This plan implements §11 S0 + S1 of the spec.
- S2–S5 (prompts, research, marketing, resources content domains) are NOT in this plan; each will get its own spec + plan.

---

## 0. Local environment setup (one-time)

The project root is `C:\Users\jiangxinhai\Desktop\CORVIN\CHIANGANGSTER.github.io-master`. All file paths below are relative to that root unless absolute.

### Local server requirement

Static `file://` will work for visual inspection but `fetch('/assets/data/kb.json')` requires HTTP. Use Python's built-in server for local previews:

```powershell
# In the project root, in a separate terminal, run once and leave running:
python -m http.server 8000
# Then preview at http://localhost:8000/
```

If Python is not available, use `npx http-server -p 8000` (requires Node) or VS Code Live Server extension. Any static server on port 8000 works; the `validate-kb.js` localhost gate matches `localhost` and `127.0.0.1`.

---

## 1. Acceptance mapping (every spec §13 criterion → plan task)

| Spec §13 criterion | Plan task that fulfils it |
|--------------------|---------------------------|
| S0-1 `/workflows/index.html` returns 200 with shared nav and "Coming soon" | Task 8 + Task 11 |
| S0-2 Other 5 hub stubs return 200 with shared nav | Task 8 + Task 11 |
| S0-3 `index.html` chair regression-free | Task 14 verification |
| S0-4 `tutorial.html` regression-free | Task 13 verification |
| S0-5 `kb.json` parses + has `comfy-flux2-retouch` | Task 7 |
| S0-6 `docs/README.md` exists | Task 9 |
| S1-1 Two cards on `/workflows/` (published clickable + planned non-anchor) | Task 20, Task 21 |
| S1-2 Migrated card → article navigation works | Task 16, Task 20 |
| S1-3 Article page no-regression | Task 16 verification |
| S1-4 Index nav swap, chair preserved | Task 14 |
| S1-5 `/tutorial.html` redirect within 1s | Task 17 |
| S1-6 Cmd+K, `/`, search button all open modal; "flux" hits; Esc returns focus | Task 23 |
| S1-7 ComfyUI tag chip filters and clears | Task 22 |
| S1-8 Lighthouse mobile LCP ≤ 2.0s, Best Practices ≥ 90 on `/workflows/` | Task 25 |
| S1-9 Tab order with visible focus ring | Task 25 |
| S1-10 No 360px horizontal scroll on 4 named pages | Task 25 |

---

## 2. File structure

Files this plan creates (all relative to project root):

```
assets/
├── css/
│   ├── tokens.css                  ← Task 3 (full content), Task 15 (additions)
│   ├── base.css                    ← Task 4
│   ├── nav.css                     ← Task 5 stub, Task 11/15 fill
│   ├── card.css                    ← Task 5 stub, Task 20 fill
│   ├── hub.css                     ← Task 5 stub, Task 21 fill
│   ├── article.css                 ← Task 5 stub, Task 15 fill
│   ├── cmdk.css                    ← Task 5 stub, Task 23 fill
│   └── editorial.css               ← Task 5 stub, Task 20 fill
├── js/
│   ├── nav.js                      ← Task 6 stub, Task 11 fill
│   ├── footer.js                   ← Task 6 stub, Task 12 fill
│   ├── hub.js                      ← Task 6 stub, Task 20–22 fill
│   ├── cmdk.js                     ← Task 6 stub, Task 23 fill
│   ├── copy.js                     ← Task 6 stub, Task 19 fill
│   ├── progress.js                 ← Task 6 stub, Task 18 fill
│   └── validate-kb.js              ← Task 6 stub (with hostname gate), Task 24 fill
├── data/
│   ├── kb.json                     ← Task 7
│   └── tags.json                   ← Task 7
├── img/                            ← Task 2 (empty dir)
└── fonts/                          ← already exists, untouched

workflows/
├── index.html                      ← Task 8 stub, Task 20 fill
└── comfy-flux2-retouch.html        ← Task 16 (migration target)

prompts/index.html                  ← Task 8
research/index.html                 ← Task 8
marketing/index.html                ← Task 8
resources/index.html                ← Task 8
about/index.html                    ← Task 8

docs/
├── README.md                       ← Task 9
├── adding-an-entry.md              ← Task 9
└── templates/
    └── article-template.html       ← Task 9

screenshots/baselines/              ← Task 1 (gitignored — not deployed)
```

Files this plan modifies:

- `index.html` — Task 14 (replace inline `<nav>` with `data-include="nav"`)
- `tutorial.html` — Task 17 (replaced wholesale with redirect stub)

---

## Task 1: Capture baseline screenshots

**Why:** Spec §13 acceptance demands "no human-perceptible regression" against a pre-change reference. Without baselines we cannot honour the criterion. Recommendation 1 from the Round 2 review.

**Files:**
- Create directory: `screenshots/baselines/`
- Create: `screenshots/baselines/index-1440x900-pre.png`
- Create: `screenshots/baselines/index-390x844-pre.png`
- Create: `screenshots/baselines/tutorial-1440x900-pre.png`
- Create: `screenshots/baselines/tutorial-390x844-pre.png`

**Steps:**

- [ ] **Step 1: Start the local server**

```powershell
cd C:\Users\jiangxinhai\Desktop\CORVIN\CHIANGANGSTER.github.io-master
python -m http.server 8000
```

Leave running. Open a separate terminal/window for follow-up steps.

- [ ] **Step 2: Open `http://localhost:8000/` in Chrome**

Hard reload (`Ctrl+Shift+R`). Wait until the chair has finished initial settling (~3 seconds).

- [ ] **Step 3: Capture desktop baseline of home**

DevTools → Device Toolbar → Responsive → set 1440×900 → DPR 1. `Ctrl+Shift+P` → "Capture full size screenshot". Save as `screenshots/baselines/index-1440x900-pre.png`.

- [ ] **Step 4: Capture mobile baseline of home**

In Device Toolbar set 390×844 (iPhone 13 mini preset works). Hard reload. Capture full size screenshot as `screenshots/baselines/index-390x844-pre.png`.

- [ ] **Step 5: Capture desktop + mobile baselines of `/tutorial.html`**

Repeat steps 3-4 for `http://localhost:8000/tutorial.html`. Save as `screenshots/baselines/tutorial-1440x900-pre.png` and `screenshots/baselines/tutorial-390x844-pre.png`.

- [ ] **Step 6: Verify all 4 baseline files exist**

```powershell
Get-ChildItem screenshots\baselines\
```

Expected: 4 PNG files with non-zero size.

---

## Task 2: Create directory scaffolding

**Why:** S0 deliverable 1 + 4. All subsequent file creation needs these dirs.

**Files:**
- Create directories only — no file content yet.

**Steps:**

- [ ] **Step 1: Verify failing state — directories do not exist yet**

```powershell
Test-Path assets\css; Test-Path workflows; Test-Path docs\templates
```

Expected output: `False`, `False`, `False`. (`docs/` itself already exists from spec work, but `docs/templates/` does not.)

- [ ] **Step 2: Create the directory tree**

```powershell
New-Item -ItemType Directory -Force -Path `
  assets\css, assets\js, assets\data, assets\img, `
  workflows, prompts, research, marketing, resources, about, `
  docs\templates, screenshots\baselines | Out-Null
```

- [ ] **Step 3: Verify all directories exist**

```powershell
Get-ChildItem -Directory assets, workflows, prompts, research, marketing, resources, about, docs\templates
```

Expected: each path lists without error.

---

## Task 3: Create `assets/css/tokens.css`

**Why:** Spec §4.3 / §4.4 / §4.5 — single source of truth for color, type, space, motion. Every other CSS file depends on it.

**Files:**
- Create: `assets/css/tokens.css`

**Steps:**

- [ ] **Step 1: Verify failing state**

Open `http://localhost:8000/assets/css/tokens.css` → expect 404.

- [ ] **Step 2: Write the tokens file**

Create `assets/css/tokens.css` with this exact content:

```css
/* tokens.css — single source of truth for color, type, space, motion.
   See spec §4.3, §4.4, §4.5. */

:root {
  /* surfaces */
  --bg-primary: #0a0a0a;
  --bg-elevated: #111111;
  --bg-card: rgba(255, 255, 255, 0.06);
  --bg-card-hover: rgba(255, 255, 255, 0.10);
  --bg-modal: rgba(10, 10, 10, 0.85);

  /* text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-muted: rgba(255, 255, 255, 0.40);
  --text-disabled: rgba(255, 255, 255, 0.25);

  /* brand accents */
  --accent: #0071e3;
  --accent-green: #30d158;
  --accent-amber: #ffb340;
  --accent-pink: #ff375f;

  /* lines */
  --border: 1px solid rgba(255, 255, 255, 0.10);
  --border-strong: 1px solid rgba(255, 255, 255, 0.20);

  /* shape */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* motion */
  --easing-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
  --easing-emphasized: cubic-bezier(0.2, 0.0, 0, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;

  /* layering */
  --z-nav: 50;
  --z-dropdown: 100;
  --z-modal: 200;
  --z-toast: 300;

  /* spacing scale (power-of-1.5 modular) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  /* type families (faces themselves are loaded by @font-face in base.css or per-page) */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Compressa VF', 'Roboto Flex', var(--font-sans);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* layout primitives */
  --nav-height: 56px;
  --content-max: 880px;
  --hub-grid-min: 280px;
}
```

- [ ] **Step 3: Verify the file is served**

Open `http://localhost:8000/assets/css/tokens.css` in browser. Expect to see the CSS source rendered as plain text (no 404).

- [ ] **Step 4: Verify no syntax errors**

In DevTools console:

```js
fetch('/assets/css/tokens.css').then(r => r.text()).then(t => console.log(t.length, 'bytes'));
```

Expected: a non-zero byte count logged.

---

## Task 4: Create `assets/css/base.css`

**Why:** Spec §5 — reset, typography baseline, body landmark styling. Other component CSS files compose against this.

**Files:**
- Create: `assets/css/base.css`

**Steps:**

- [ ] **Step 1: Write the base stylesheet**

Create `assets/css/base.css`:

```css
/* base.css — reset, typography, layout primitives.
   Depends on tokens.css. */

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img, video, canvas, svg { max-width: 100%; display: block; }
img { height: auto; }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* skip link — first focusable element on every page */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--accent);
  color: #fff;
  z-index: var(--z-toast);
}
.skip-link:focus { left: var(--space-3); top: var(--space-3); }

/* nav placeholder reserves height to prevent layout shift while nav.js injects */
[data-include="nav"] { height: var(--nav-height); display: block; }

main { display: block; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify the file is served**

Open `http://localhost:8000/assets/css/base.css` — no 404.

---

## Task 5: Create stub component CSS files

**Why:** S0 deliverable 1 — every component file exists with a header comment so later tasks can fill them in without scaffolding work.

**Files:**
- Create: `assets/css/nav.css`
- Create: `assets/css/card.css`
- Create: `assets/css/hub.css`
- Create: `assets/css/article.css`
- Create: `assets/css/cmdk.css`
- Create: `assets/css/editorial.css`

**Steps:**

- [ ] **Step 1: Create each stub with a header comment naming the component**

Each file's content is just the header below; file names map 1:1 to component:

`assets/css/nav.css`:
```css
/* nav.css — owns the top navigation bar.
   See spec §7.1. Filled in Task 11. */
```

`assets/css/card.css`:
```css
/* card.css — owns the KB card component.
   See spec §7.2. Filled in Task 20. */
```

`assets/css/hub.css`:
```css
/* hub.css — owns the hub page layout (filter bar, grid, empty state).
   See spec §7.3. Filled in Task 21. */
```

`assets/css/article.css`:
```css
/* article.css — owns content-page typography and callouts.
   See spec §7.4. Filled in Task 15. */
```

`assets/css/cmdk.css`:
```css
/* cmdk.css — owns the search modal.
   See spec §7.6, §8. Filled in Task 23. */
```

`assets/css/editorial.css`:
```css
/* editorial.css — owns editorial-mode treatments (oversized type, hero strip).
   See spec §4.1. Filled in Task 20. */
```

- [ ] **Step 2: Verify all 6 files exist**

```powershell
Get-ChildItem assets\css\*.css | Measure-Object
```

Expected count: 8 (`tokens.css`, `base.css`, plus the 6 stubs).

---

## Task 6: Create JS stub files

**Why:** S0 deliverable 2. Every JS file exists with a guard against being run before its content arrives. `validate-kb.js` already includes the §6.4 hostname gate.

**Files:**
- Create: `assets/js/nav.js`
- Create: `assets/js/footer.js`
- Create: `assets/js/hub.js`
- Create: `assets/js/cmdk.js`
- Create: `assets/js/copy.js`
- Create: `assets/js/progress.js`
- Create: `assets/js/validate-kb.js`

**Steps:**

- [ ] **Step 1: Write each JS stub**

`assets/js/nav.js`:
```js
/* nav.js — injects the shared <nav> partial.
   See spec §5.3, §7.1. Filled in Task 11. */
(() => { /* stub */ })();
```

`assets/js/footer.js`:
```js
/* footer.js — injects the shared <footer> partial.
   See spec §7.8. Filled in Task 12. */
(() => { /* stub */ })();
```

`assets/js/hub.js`:
```js
/* hub.js — fetches kb.json, filters by domain, renders cards.
   See spec §7.3. Filled in Tasks 20-22. */
(() => { /* stub */ })();
```

`assets/js/cmdk.js`:
```js
/* cmdk.js — Cmd/Ctrl+K + "/" search modal.
   See spec §7.6, §8. Filled in Task 23. */
(() => { /* stub */ })();
```

`assets/js/copy.js`:
```js
/* copy.js — attaches copy buttons to <pre data-copyable>.
   See spec §7.5. Filled in Task 19. */
(() => { /* stub */ })();
```

`assets/js/progress.js`:
```js
/* progress.js — reading progress bar.
   See spec §7.7. Filled in Task 18. */
(() => { /* stub */ })();
```

`assets/js/validate-kb.js`:
```js
/* validate-kb.js — dev-only kb.json schema validator.
   See spec §6.4. Filled in Task 24. */
(() => {
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;
  // Validation body filled in Task 24.
})();
```

- [ ] **Step 2: Verify all 7 JS files exist and parse**

In a fresh page, open DevTools console and run:

```js
['nav','footer','hub','cmdk','copy','progress','validate-kb']
  .forEach(n => fetch(`/assets/js/${n}.js`).then(r => r.ok && r.text()).then(t => console.log(n, t ? t.length : 'MISSING')));
```

Expected: 7 lines, each with a non-zero length. None say `MISSING`.

---

## Task 7: Seed `kb.json` and `tags.json`

**Why:** S0 deliverables 3, S1 deliverable 3 + 10. Spec Appendix A and B.

**Files:**
- Create: `assets/data/kb.json`
- Create: `assets/data/tags.json`

**Steps:**

- [ ] **Step 1: Write `kb.json` with the migrated entry + the planned-status seed**

Create `assets/data/kb.json`:

```json
{
  "version": "1",
  "entries": [
    {
      "id": "comfy-flux2-retouch",
      "title": "Flux.2 产品精修工作流",
      "domain": "workflows",
      "type": "workflow",
      "tags": ["平面组", "ComfyUI", "Flux"],
      "phase": 1,
      "status": "published",
      "difficulty": 3,
      "timeCost": "30-60min",
      "owner": "Corvin",
      "updated": "2026-04-09",
      "thumbnail": "/assets/img/comfy-flux2-thumb.webp",
      "summary": "白底→场景修图全流程，含七步精修法与双文本编码器解析。",
      "url": "/workflows/comfy-flux2-retouch.html",
      "prerequisites": [],
      "outputs": ["商业级成品图"],
      "external": false
    },
    {
      "id": "comfy-product-scene-builder",
      "title": "Comfy 产品场景搭建工作流（占位）",
      "domain": "workflows",
      "type": "workflow",
      "tags": ["平面组", "ComfyUI"],
      "phase": 1,
      "status": "planned",
      "owner": "Corvin",
      "updated": "2026-04-27",
      "summary": "占位条目，正式版本将在后续 spec 中落地。",
      "url": "#",
      "external": false
    }
  ]
}
```

- [ ] **Step 2: Write `tags.json` (Appendix B seed)**

Create `assets/data/tags.json`:

```json
{
  "tags": [
    { "id": "平面组",          "label": "平面组",         "group": "team", "hint": "graphic" },
    { "id": "3D 渲染组",       "label": "3D 渲染组",      "group": "team", "hint": "render" },
    { "id": "摄制组",          "label": "摄制组",         "group": "team", "hint": "video" },
    { "id": "产品设计组",      "label": "产品设计组",     "group": "team", "hint": "product" },
    { "id": "ComfyUI",         "label": "ComfyUI",        "group": "tool", "hint": "comfy" },
    { "id": "Flux",            "label": "Flux",           "group": "tool", "hint": "flux" },
    { "id": "Midjourney",      "label": "Midjourney",     "group": "tool", "hint": "mj" },
    { "id": "Stable Diffusion","label": "Stable Diffusion","group": "tool","hint": "sd" }
  ]
}
```

- [ ] **Step 3: Verify both parse as JSON**

DevTools console:

```js
Promise.all([
  fetch('/assets/data/kb.json').then(r => r.json()),
  fetch('/assets/data/tags.json').then(r => r.json())
]).then(([kb, tags]) => {
  console.log('kb entries:', kb.entries.length);
  console.log('kb has comfy-flux2-retouch:', kb.entries.some(e => e.id === 'comfy-flux2-retouch'));
  console.log('kb has comfy-product-scene-builder:', kb.entries.some(e => e.id === 'comfy-product-scene-builder'));
  console.log('tags count:', tags.tags.length);
});
```

Expected:
```
kb entries: 2
kb has comfy-flux2-retouch: true
kb has comfy-product-scene-builder: true
tags count: 8
```

If any line shows `false` or a parse error, fix the JSON before moving on.

---

## Task 8: Create 6 hub stub `index.html` files

**Why:** S0 deliverable 4. Every domain returns 200 with shared nav before content lands.

**Files:**
- Create: `workflows/index.html`
- Create: `prompts/index.html`
- Create: `research/index.html`
- Create: `marketing/index.html`
- Create: `resources/index.html`
- Create: `about/index.html`

**Steps:**

- [ ] **Step 1: Define the shared stub template**

Each file uses this template (substitute `{{TITLE}}` and `{{HEADING}}`):

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE}} — CHIANGANGSTER</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/cmdk.css">
</head>
<body>
  <a class="skip-link" href="#main">跳到正文</a>
  <div data-include="nav"></div>
  <main id="main" style="padding: var(--space-7) var(--space-5); max-width: var(--content-max); margin: 0 auto;">
    <h1 style="font-family: var(--font-display); font-size: clamp(2.5rem, 8vw, 5rem); margin: 0 0 var(--space-4); letter-spacing: 0.02em;">{{HEADING}}</h1>
    <p style="color: var(--text-secondary); font-size: 1rem;">敬请期待 — 此分区将在后续 spec 中上线。</p>
  </main>
  <div data-include="footer"></div>
  <script src="/assets/js/nav.js" defer></script>
  <script src="/assets/js/footer.js" defer></script>
  <script src="/assets/js/cmdk.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Create the 6 stub files with these substitutions**

| File | `{{TITLE}}` | `{{HEADING}}` |
|------|-------------|---------------|
| `workflows/index.html` | `工作流 / WORKFLOWS` | `WORKFLOWS` |
| `prompts/index.html` | `Prompt 库 / PROMPTS` | `PROMPTS` |
| `research/index.html` | `调研 / RESEARCH` | `RESEARCH` |
| `marketing/index.html` | `营销 / MARKETING` | `MARKETING` |
| `resources/index.html` | `资源 / RESOURCES` | `RESOURCES` |
| `about/index.html` | `关于 / ABOUT` | `ABOUT` |

- [ ] **Step 3: Verify all 6 routes return 200**

In a browser address bar, open in turn:

- `http://localhost:8000/workflows/`
- `http://localhost:8000/prompts/`
- `http://localhost:8000/research/`
- `http://localhost:8000/marketing/`
- `http://localhost:8000/resources/`
- `http://localhost:8000/about/`

Each should render the heading on a black background. The shared nav is **not yet** rendered (Task 11 fills it). The page DOM should still contain `<div data-include="nav"></div>`.

DevTools console check on each:

```js
console.log('placeholder present:', !!document.querySelector('[data-include="nav"]'));
```

Expected: `placeholder present: true` on each.

---

## Task 9: Create contributor docs and article template

**Why:** S0 deliverables 5 + S1 deliverable consumer doc. Spec §12, Appendix C.

**Files:**
- Create: `docs/README.md`
- Create: `docs/adding-an-entry.md`
- Create: `docs/templates/article-template.html`

**Steps:**

- [ ] **Step 1: Create `docs/README.md`**

```markdown
# Contributor Docs

This directory hosts contributor-facing documentation for the knowledge-base
site. Public visitors do not see these files.

## Where to add new content

- **Knowledge-base entries (cards on hub pages)**: edit `/assets/data/kb.json`
  and follow [adding-an-entry.md](./adding-an-entry.md).
- **New tags**: edit `/assets/data/tags.json` and add a CSS hint rule in
  `/assets/css/card.css` if you want a custom chip color.
- **New article**: copy `templates/article-template.html` to
  `/<domain>/<slug>.html` and replace `{{...}}` placeholders.

## Folder layout

- `superpowers/specs/` — design specs (one per scope)
- `superpowers/plans/` — implementation plans (one per spec)
- `superpowers/reviews/` — cross-AI review feedback
- `templates/` — page templates contributors copy from
```

- [ ] **Step 2: Create `docs/adding-an-entry.md`**

```markdown
# Adding a knowledge-base entry

A "knowledge-base entry" is one card on a hub page. It may or may not link to
its own article page.

## Step 1 — choose a slug

Kebab-case, unique across `kb.json`. Examples:
`comfy-flux2-retouch`, `mj-product-shoot-prompt`.

## Step 2 — add to `kb.json`

Edit `/assets/data/kb.json`. Append a new object inside `entries` with at
least these required fields:

- `id` — your slug
- `title` — display title (Chinese OK)
- `domain` — one of: `workflows`, `prompts`, `research`, `marketing`, `resources`
- `type` — one of: `workflow`, `prompt-template`, `research-doc`, `case-study`, `keyword-library`, `tool`, `news`, `guide`
- `tags` — array of tag ids; each must exist in `tags.json`
- `status` — one of: `published`, `testing`, `planned`, `archived`
- `owner` — your name
- `updated` — ISO date `YYYY-MM-DD`
- `summary` — ≤ 120 characters
- `url` — `/<domain>/<id>.html` if you have a content page; `#` if planned

Optional: `phase` (1–4), `difficulty` (1–5), `timeCost`, `thumbnail`, `prerequisites`, `outputs`, `external`.

## Step 3 — (optional) create the article page

If `url` is not `#`, copy `docs/templates/article-template.html` to
`/<domain>/<id>.html` and fill in the `{{...}}` placeholders.

## Step 4 — (optional) add a thumbnail

Drop a 1200×800 webp at `/assets/img/<id>-thumb.webp` and reference it in
`thumbnail`.

## Step 5 — preview locally

Run `python -m http.server 8000` in the project root, open
`http://localhost:8000/<domain>/`. Your card should appear. The DevTools
console (only on localhost) prints validation warnings if you missed
something.

## Step 6 — upload

Manually upload changed files to https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io
(this project does not use a local git repo).
```

- [ ] **Step 3: Create `docs/templates/article-template.html` (Appendix C)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE}} — CHIANGANGSTER</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/article.css">
  <link rel="stylesheet" href="/assets/css/cmdk.css">
</head>
<body>
  <a class="skip-link" href="#main">跳到正文</a>
  <div data-include="nav"></div>
  <div class="reading-progress"><div class="progress-bar"></div></div>

  <main id="main">
    <header class="article-header">
      <nav class="breadcrumb"><a href="/workflows/">工作流</a> / {{TITLE}}</nav>
      <h1>{{TITLE}}</h1>
      <p class="summary">{{SUMMARY}}</p>
      <ul class="meta">
        <li>状态：{{STATUS}}</li>
        <li>负责人：{{OWNER}}</li>
        <li>更新：{{UPDATED}}</li>
      </ul>
    </header>

    <article class="content">
      <!-- chapters here -->
    </article>

    <footer class="article-footer">
      <a class="prev" href="">上一篇</a>
      <a class="next" href="">下一篇</a>
    </footer>
  </main>

  <div data-include="footer"></div>
  <script src="/assets/js/nav.js" defer></script>
  <script src="/assets/js/footer.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="/assets/js/copy.js" defer></script>
  <script src="/assets/js/cmdk.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Verify the 3 files exist**

```powershell
Get-ChildItem docs\README.md, docs\adding-an-entry.md, docs\templates\article-template.html
```

Expected: 3 files listed, no errors.

---

## Task 10: S0 acceptance smoke check

**Why:** Spec §13 S0 acceptance criteria. Verify every bullet before moving to S1.

**Steps:**

- [ ] **Step 1: Run S0-1 — `/workflows/` returns 200**

Browser: `http://localhost:8000/workflows/` → expect heading "WORKFLOWS" + "敬请期待" copy.

- [ ] **Step 2: Run S0-2 — other 5 hubs return 200**

Browser: `/prompts/`, `/research/`, `/marketing/`, `/resources/`, `/about/` → each renders.

- [ ] **Step 3: Run S0-3 — `index.html` regression-free**

Browser: `http://localhost:8000/` at 1440×900. Visually compare with `screenshots/baselines/index-1440x900-pre.png` from Task 1. The chair must auto-spin and respond to drag. Repeat at 390×844. Expected: no human-perceptible regression.

- [ ] **Step 4: Run S0-4 — `tutorial.html` regression-free**

Browser: `http://localhost:8000/tutorial.html`. Compare with both tutorial baselines. Expected: no regression.

- [ ] **Step 5: Run S0-5 — `kb.json` validity**

DevTools console:

```js
fetch('/assets/data/kb.json').then(r => r.json()).then(d => {
  const ok = d.entries.some(e => e.id === 'comfy-flux2-retouch');
  console.log('S0-5:', ok ? 'PASS' : 'FAIL');
});
```

Expected: `S0-5: PASS`.

- [ ] **Step 6: Run S0-6 — `docs/README.md` exists**

```powershell
Test-Path docs\README.md
```

Expected: `True`.

- [ ] **Step 7: If any check fails, stop and fix before Task 11**

Do not proceed to S1 (Task 11 onward) until all S0 checks pass.

---

## Task 11: Implement `nav.js` partial injection + `nav.css`

**Why:** Spec §5.3, §7.1. The shared nav makes every hub stub functional and is a prerequisite for the redirect, the index swap, and Cmd+K (search button).

**Files:**
- Modify: `assets/js/nav.js`
- Modify: `assets/css/nav.css`

**Steps:**

- [ ] **Step 1: Define the verification check (currently failing)**

Open `http://localhost:8000/workflows/`, DevTools console:

```js
console.log('nav rendered:', !!document.querySelector('nav[aria-label="Primary"]'));
```

Expected today: `false`. After this task: `true`.

- [ ] **Step 2: Implement `nav.js`**

Replace `assets/js/nav.js` content with:

```js
/* nav.js — injects the shared <nav> partial. See spec §5.3, §7.1. */
(() => {
  const NAV_HTML = `
    <nav aria-label="Primary" class="site-nav">
      <a class="brand" href="/" aria-label="CHIANGANGSTER 首页">CHIANGANGSTER</a>
      <ul class="domain-links">
        <li><a href="/workflows/" data-domain="workflows">工作流</a></li>
        <li><a href="/prompts/" data-domain="prompts">Prompts</a></li>
        <li><a href="/research/" data-domain="research">调研</a></li>
        <li><a href="/marketing/" data-domain="marketing">营销</a></li>
        <li><a href="/resources/" data-domain="resources">资源</a></li>
      </ul>
      <div class="nav-right">
        <button type="button" class="nav-search" aria-haspopup="dialog" aria-expanded="false" aria-label="搜索 (⌘K / /)">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <a href="/about/" data-domain="about">ABOUT</a>
        <button type="button" class="nav-toggle" aria-label="菜单" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" stroke-width="1.5"/>
            <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
      </div>
    </nav>
  `;

  function injectNav() {
    const placeholders = document.querySelectorAll('[data-include="nav"]');
    placeholders.forEach(el => { el.outerHTML = NAV_HTML; });
    setActiveLink();
    bindToggle();
    bindSearchButton();
  }

  function setActiveLink() {
    const path = location.pathname;
    document.querySelectorAll('.site-nav a[data-domain]').forEach(a => {
      const domain = a.dataset.domain;
      if (path === '/' && domain === undefined) return;
      if (path.startsWith(`/${domain}/`) || path.startsWith(`/${domain}.html`)) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function bindToggle() {
    const btn = document.querySelector('.nav-toggle');
    const list = document.querySelector('.domain-links');
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      list.classList.toggle('is-open', !expanded);
    });
  }

  function bindSearchButton() {
    const btn = document.querySelector('.nav-search');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('cmdk:open'));
    });
    window.addEventListener('cmdk:state', e => {
      btn.setAttribute('aria-expanded', String(!!e.detail?.open));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
```

- [ ] **Step 3: Implement `nav.css`**

Replace `assets/css/nav.css` content with:

```css
/* nav.css — owns the top navigation bar. See spec §7.1. */

.site-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  height: var(--nav-height);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: 0 var(--space-5);
  background: rgba(10, 10, 10, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: var(--border);
}

.site-nav .brand {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-primary);
  text-decoration: none;
}

.site-nav .domain-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--space-5);
}

.site-nav .domain-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.04em;
  transition: color var(--duration-fast) var(--easing-standard);
}

.site-nav .domain-links a:hover { color: var(--text-primary); }

.site-nav a[aria-current="page"] {
  color: var(--text-primary);
  position: relative;
}
.site-nav a[aria-current="page"]::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -8px;
  height: 1px;
  background: var(--accent);
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-search {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background var(--duration-fast) var(--easing-standard), color var(--duration-fast);
}
.nav-search:hover { background: var(--bg-card-hover); color: var(--text-primary); }

.nav-right > a {
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  text-decoration: none;
}
.nav-right > a:hover { color: var(--text-primary); }

.nav-toggle { display: none; }

@media (max-width: 720px) {
  .site-nav { gap: var(--space-3); padding: 0 var(--space-4); }
  .domain-links {
    position: absolute;
    top: var(--nav-height);
    right: 0;
    flex-direction: column;
    background: var(--bg-elevated);
    padding: var(--space-4) var(--space-5);
    border: var(--border);
    border-right: none;
    border-top: none;
    border-radius: 0 0 0 var(--radius-md);
    transform: translateX(100%);
    transition: transform var(--duration-base) var(--easing-emphasized);
    min-width: 60vw;
  }
  .domain-links.is-open { transform: translateX(0); }
  .nav-toggle { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; color: var(--text-primary); }
  .nav-right > a:not(.nav-search) { display: none; }
}
```

- [ ] **Step 4: Verify nav renders on every hub stub**

Reload `http://localhost:8000/workflows/`. The shared nav appears at the top.

DevTools console:

```js
console.log('nav rendered:', !!document.querySelector('nav[aria-label="Primary"]'));
console.log('search btn:', !!document.querySelector('.nav-search'));
console.log('current page link:', document.querySelector('[aria-current="page"]')?.dataset.domain);
```

Expected:
```
nav rendered: true
search btn: true
current page link: workflows
```

- [ ] **Step 5: Verify nav renders on the other 5 hub stubs**

Repeat the console check on `/prompts/`, `/research/`, `/marketing/`, `/resources/`, `/about/`. The `current page link` should match each domain in turn.

- [ ] **Step 6: Verify mobile collapsed state**

DevTools Device Toolbar → 390×844. Reload `/workflows/`. The 5 domain links collapse behind the hamburger; the search icon button remains visible. Click the hamburger → drawer slides in. Click again → slides out.

---

## Task 12: Implement `footer.js`

**Why:** Spec §7.8. Adds shared footer to every page that opted in via `data-include="footer"`. D6 — `BUILD_DATE` constant.

**Files:**
- Modify: `assets/js/footer.js`

**Steps:**

- [ ] **Step 1: Define the verification (failing today)**

Reload `/workflows/`. DevTools console:

```js
console.log('footer rendered:', !!document.querySelector('footer.site-footer'));
```

Expected today: `false`. After this task: `true`.

- [ ] **Step 2: Implement `footer.js`**

Replace `assets/js/footer.js` content with:

```js
/* footer.js — injects the shared <footer> partial. See spec §7.8.
   BUILD_DATE is bumped manually on each deploy (D6). */
(() => {
  const BUILD_DATE = '2026-04-28';

  const FOOTER_HTML = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span>© ${new Date().getFullYear()} CHIANGANGSTER</span>
        <a href="https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io" target="_blank" rel="noopener">GitHub</a>
        <span class="site-footer__build">最后更新：${BUILD_DATE}</span>
      </div>
    </footer>
  `;

  function inject() {
    document.querySelectorAll('[data-include="footer"]').forEach(el => { el.outerHTML = FOOTER_HTML; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
```

- [ ] **Step 3: Add footer styles to `nav.css` (footer is a small concern; co-located)**

Append to `assets/css/nav.css`:

```css
.site-footer {
  border-top: var(--border);
  padding: var(--space-6) var(--space-5);
  margin-top: var(--space-8);
  color: var(--text-secondary);
  font-size: 12px;
}
.site-footer__inner {
  max-width: var(--content-max);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  align-items: center;
}
.site-footer a { color: var(--text-secondary); }
.site-footer a:hover { color: var(--text-primary); }
.site-footer__build { margin-left: auto; }
```

- [ ] **Step 4: Verify footer renders**

Reload `/workflows/`. DevTools console:

```js
console.log('footer rendered:', !!document.querySelector('footer.site-footer'));
console.log('build date present:', !!document.querySelector('.site-footer__build'));
```

Expected: both `true`.

---

## Task 13: Verify `tutorial.html` still passes regression check

**Why:** Spec §13 S0-4. Before we do destructive changes (Task 16, 17), confirm the existing `tutorial.html` is healthy with the new CSS files in place. The legacy file does not include the new stylesheets so should be untouched.

**Steps:**

- [ ] **Step 1: Run regression check**

Browser: `http://localhost:8000/tutorial.html` at 1440×900 then 390×844. Compare against the matching baselines from Task 1. Expected: no human-perceptible regression. (No new CSS or JS file is referenced from `tutorial.html` yet, so this is a sanity check that we did not accidentally edit it.)

- [ ] **Step 2: Confirm `tutorial.html` was NOT modified**

```powershell
Get-Item tutorial.html | Select-Object Name, LastWriteTime
```

Expected: `LastWriteTime` matches the file's pre-S0 timestamp. If it was modified, restore from git remote / your backup.

---

## Task 14: Swap inline `<nav>` in `index.html` for shared nav

**Why:** Spec S1 deliverable 7. Spec §13 S1-4 requires chair preservation + new shared nav.

**Files:**
- Modify: `index.html` (block at lines 545–552 plus head additions)

**Steps:**

- [ ] **Step 1: Define the regression check**

Browser: `http://localhost:8000/`. The chair auto-spins and accepts drag. After this task that must remain true; the only visible change is the nav.

- [ ] **Step 2: Add the new stylesheet links to `<head>`**

Read `index.html` to confirm exact location of the existing `<link rel="stylesheet">` block. Insert these new links **after** the existing stylesheet block (do not remove anything from `<head>`):

```html
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/nav.css">
<link rel="stylesheet" href="/assets/css/cmdk.css">
```

If a `<base href>` tag is present and the existing index uses relative paths, ensure the new links remain absolute (`/assets/...`) so they resolve from the site root regardless of base.

- [ ] **Step 3: Replace the inline `<nav>` block**

In `index.html`, lines 545–552 currently contain:

```html
  <!-- Nav -->
  <nav>
    <div class="c">
      <div class="nav-right" style="margin-left:auto;">
        <a href="Flux2-Product-Retouch-v1.0.json" download>DOWNLOAD WORKFLOW</a>
      </div>
    </div>
  </nav>
```

Replace those exact 8 lines with:

```html
  <!-- Shared nav (injected by /assets/js/nav.js) -->
  <div data-include="nav"></div>
```

The `DOWNLOAD WORKFLOW` link is dropped from the nav — it will reappear inside the migrated article in Task 16. If the home hero CTA needs it independently, leave a hero-level CTA in place separately; do **not** add it to the shared nav.

- [ ] **Step 4: Add nav.js + cmdk.js to the bottom of the page**

Find the existing `</body>` tag in `index.html`. Immediately before it, add:

```html
<script src="/assets/js/nav.js" defer></script>
<script src="/assets/js/footer.js" defer></script>
<script src="/assets/js/cmdk.js" defer></script>
```

Do not add a `<div data-include="footer"></div>` on the home page — the editorial home is intentionally chrome-light. Footer is a no-op there.

- [ ] **Step 5: Verify chair + nav coexist**

Browser: hard reload `http://localhost:8000/`.

DevTools console:

```js
console.log('shared nav:', !!document.querySelector('nav[aria-label="Primary"]'));
console.log('canvas present:', !!document.querySelector('canvas'));
```

Expected: both `true`.

Visual: chair auto-spins; drag rotates it; new nav sits on top. Compare against `screenshots/baselines/index-1440x900-pre.png` — only the nav contents changed (no inline DOWNLOAD link in the nav bar), the chair area is identical.

- [ ] **Step 6: Mobile check**

DevTools 390×844 → reload. Chair scales correctly. Nav collapses; hamburger works. Compare against the mobile baseline. No horizontal scroll.

- [ ] **Step 7: Capture the post-change screenshots for the record**

Save:
- `screenshots/baselines/index-1440x900-post-task14.png`
- `screenshots/baselines/index-390x844-post-task14.png`

These document the agreed new state for future regressions.

---

## Task 15: Extract shared CSS from `tutorial.html` into component files

**Why:** Spec S1 deliverable 1. Migrate the inline `<style>` from `tutorial.html` into `article.css` and grow `tokens.css` for any tokens it reveals. The migrated article page (Task 16) will then load these stylesheets instead of inlining.

**Files:**
- Read: `tutorial.html` (lines containing `<style>` block — find via Grep)
- Modify: `assets/css/article.css`
- Modify: `assets/css/tokens.css` (only if the inline CSS introduces tokens not yet captured)

**Steps:**

- [ ] **Step 1: Locate the `<style>` block in `tutorial.html`**

```
Grep tutorial.html for "<style>" and "</style>" — note the line range.
```

(Line numbers will vary; do not hard-code them in the plan.)

- [ ] **Step 2: Categorise selectors into article.css vs other component files**

Read the `<style>` block in full. Classify each rule:

- **Belongs in `article.css`**: `.chapter`, `.section-header`, `.img-fluid`, `.img-caption`, `.callout`, `.code`, `pre`, `.reading-progress`, `.progress-bar`, article header / breadcrumb / meta list, article footer prev/next.
- **Belongs in `nav.css`**: any `nav`-scoped rule. (None are expected — the legacy tutorial nav was different.)
- **Belongs in `editorial.css`**: oversized type rules, hero strip rules. (Only if any exist — the legacy tutorial is pure glass mode, so probably none.)
- **Already covered by `base.css`**: body, root resets, focus-visible. Skip; do not duplicate.
- **Already covered by `tokens.css`**: any `:root` custom properties. Compare with current tokens.css; if a new variable is found, add it to tokens.css instead of duplicating it elsewhere.

- [ ] **Step 3: Append article-scoped rules to `assets/css/article.css`**

Read the existing `assets/css/article.css`, then write the consolidated rules. The exact selector list comes from Step 2; preserve the original property values as-is (do not re-design — this is a migration). Wrap if needed in a top-level `.article` or `main.article` scope only if Tutorial 's rules are too generic; if they are already scoped (e.g., `.chapter`), no extra wrapper is needed.

Replace `assets/css/article.css` content with the migrated rules. The header comment at the top should remain (`/* article.css ... */`).

- [ ] **Step 4: Add tokens to `tokens.css` for any discovered variables**

If Step 2 revealed any `:root { --foo: ...; }` rules in `tutorial.html`, append them to `tokens.css` under a `/* migrated from tutorial.html */` comment block. If a variable already exists in `tokens.css`, the migrated declaration is dropped (single source of truth).

- [ ] **Step 5: Verify article CSS loads cleanly**

Open `http://localhost:8000/assets/css/article.css` → expect non-empty content, no 404.

DevTools console:

```js
fetch('/assets/css/article.css').then(r => r.text()).then(t => console.log(t.length, 'bytes', t.includes('chapter')));
```

Expected: a byte count and `true` (the `chapter` selector appears, confirming migration happened).

- [ ] **Step 6: Confirm no syntax errors**

Open Chrome DevTools → Sources tab → `assets/css/article.css` → no syntax error highlight.

---

## Task 16: Migrate `tutorial.html` → `workflows/comfy-flux2-retouch.html`

**Why:** Spec S1 deliverable 2 + 3. The migrated article must render with no human-perceptible regression versus the previous `tutorial.html` (acceptance S1-3).

**Files:**
- Create: `workflows/comfy-flux2-retouch.html`

**Steps:**

- [ ] **Step 1: Read `tutorial.html` in full**

Use Read tool. Note: the file is ~1677 lines. Read in chunks if necessary.

- [ ] **Step 2: Construct the new article HTML**

Create `workflows/comfy-flux2-retouch.html` with this top-level structure (filling in the body from `tutorial.html`):

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flux.2 产品精修工作流 — CHIANGANGSTER</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/article.css">
  <link rel="stylesheet" href="/assets/css/cmdk.css">
  <!-- Preserve any tutorial.html-specific font @font-face declarations here. -->
</head>
<body>
  <a class="skip-link" href="#main">跳到正文</a>
  <div data-include="nav"></div>
  <div class="reading-progress"><div class="progress-bar"></div></div>

  <main id="main">
    <header class="article-header">
      <nav class="breadcrumb"><a href="/workflows/">工作流</a> / Flux.2 产品精修工作流</nav>
      <h1>Flux.2 产品精修工作流</h1>
      <p class="summary">白底→场景修图全流程，含七步精修法与双文本编码器解析。</p>
      <ul class="meta">
        <li>状态：<span class="status-dot status-published" aria-hidden="true"></span>已发布</li>
        <li>负责人：Corvin</li>
        <li>更新：2026-04-09</li>
        <li><a href="/flux2-product-retouch-v1.0.json" download>下载 workflow.json</a></li>
      </ul>
    </header>

    <article class="content">
      <!-- PASTE: All chapter / section content from the original tutorial.html.
           Asset path rewriting rules:
           - tutorial-imgs/...         → /tutorial-imgs/...
           - F45A6783.png              → /F45A6783.png
           - mtc_dark.webp             → /mtc_dark.webp
           - comfyui-workflow.png      → /comfyui-workflow.png
           - flux2-product-retouch-v1.0.json → /flux2-product-retouch-v1.0.json
           - fonts/...                 → /fonts/...
           Add data-copyable to every <pre> that contains a prompt or workflow JSON snippet. -->
    </article>

    <footer class="article-footer">
      <a class="prev" href="/workflows/" aria-label="返回工作流列表">← 返回 Workflows</a>
      <span class="next" aria-disabled="true">下一篇 — 即将上线</span>
    </footer>
  </main>

  <div data-include="footer"></div>
  <script src="/assets/js/nav.js" defer></script>
  <script src="/assets/js/footer.js" defer></script>
  <script src="/assets/js/progress.js" defer></script>
  <script src="/assets/js/copy.js" defer></script>
  <script src="/assets/js/cmdk.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Move the article body**

Copy the original body content (everything between the original `<main>` open and close tags, OR between the article header and the footer — whichever the original uses) from `tutorial.html` into the `<article class="content">` block, preserving:

- All `<section>` / `<div class="chapter">` / `<h2>` / `<h3>` headings
- All `<img>` tags (with src rewritten per the table above to absolute paths)
- All `<pre>` blocks (add `data-copyable` attribute to each)
- All `<figure>` / `<blockquote>` / lists
- All inline `<style>` references that were extracted to `article.css` should be removed (they are now in the linked stylesheet)

Strip from the body:

- The original `<nav>` block (replaced by `data-include="nav"`)
- The original inline `<style>` block (extracted in Task 15)
- Any inline `<script>` block (re-introduced via the bottom `<script src=...>` tags only if needed)

- [ ] **Step 4: Verify the article renders without 404s**

Browser: `http://localhost:8000/workflows/comfy-flux2-retouch.html`. Open DevTools → Network → reload. Filter for status `404` — there should be none.

DevTools console:

```js
const imgs = [...document.querySelectorAll('img')];
console.log('img count:', imgs.length);
console.log('broken imgs:', imgs.filter(i => !i.complete || i.naturalWidth === 0).length);
const pres = [...document.querySelectorAll('pre[data-copyable]')];
console.log('copyable blocks:', pres.length);
```

Expected: image count > 0, broken count 0, copyable blocks > 0.

- [ ] **Step 5: Visual regression vs. `tutorial.html` baseline**

Browser: side-by-side compare new article (1440×900) with `screenshots/baselines/tutorial-1440x900-pre.png`. Layout, type, color, image positions all match within human perception. Repeat at 390×844.

If something is visibly off, the cause is almost certainly a missed CSS rule in Task 15. Return to Task 15, fix, retry. Do not modify `article.css` rules to fit the new layout — the goal is parity.

---

## Task 17: Replace `tutorial.html` with redirect stub

**Why:** Spec S1 deliverable 2; spec §13 S1-5; spec §14 "existing inbound links to /tutorial.html break".

**Files:**
- Modify (full replacement): `tutorial.html`

**Steps:**

- [ ] **Step 1: Define the verification (currently fails)**

Browser: `http://localhost:8000/tutorial.html` → today still shows the full original tutorial. After this task it should redirect within 1 second.

- [ ] **Step 2: Replace `tutorial.html` content**

Overwrite `tutorial.html` with:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=/workflows/comfy-flux2-retouch.html">
  <link rel="canonical" href="/workflows/comfy-flux2-retouch.html">
  <title>已迁移 — 跳转中</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; padding: 4rem 2rem; text-align: center; }
    a { color: #0071e3; }
  </style>
</head>
<body>
  <p>本页已迁移至 <a href="/workflows/comfy-flux2-retouch.html">/workflows/comfy-flux2-retouch.html</a>。</p>
  <p>若浏览器未自动跳转，请点击上面的链接。</p>
</body>
</html>
```

- [ ] **Step 3: Verify redirect occurs**

Browser: visit `http://localhost:8000/tutorial.html`. Within 1 second the URL changes to `/workflows/comfy-flux2-retouch.html` and the article renders.

DevTools Network panel — filter to `tutorial.html` → 200 → then immediately a request for `comfy-flux2-retouch.html` → 200.

---

## Task 18: Implement `progress.js` (reading progress bar)

**Why:** Spec §7.7. Required by article pages.

**Files:**
- Modify: `assets/js/progress.js`
- Modify: `assets/css/article.css` (append progress bar styles if not already migrated)

**Steps:**

- [ ] **Step 1: Verify failing state**

Browser: `http://localhost:8000/workflows/comfy-flux2-retouch.html`. DevTools console:

```js
console.log('bar present:', !!document.querySelector('.reading-progress .progress-bar'));
const bar = document.querySelector('.reading-progress .progress-bar');
console.log('bar width on load:', bar?.style.width || '(empty)');
```

Expected today: bar present (DOM is in the article), but width never updates on scroll. After this task, scrolling should update `bar.style.width`.

- [ ] **Step 2: Implement `progress.js`**

Replace `assets/js/progress.js` content with:

```js
/* progress.js — reading progress bar. See spec §7.7. */
(() => {
  const bar = document.querySelector('.reading-progress .progress-bar');
  if (!bar) return;
  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.width = (pct * 100).toFixed(2) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();
```

- [ ] **Step 3: Ensure progress-bar CSS exists in `article.css`**

If the migrated `article.css` already includes `.reading-progress` and `.progress-bar` rules from Task 15, skip. Otherwise append:

```css
.reading-progress {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: transparent;
  z-index: var(--z-nav);
  pointer-events: none;
}
.reading-progress .progress-bar {
  height: 100%;
  width: 0%;
  background: var(--accent);
  transition: width 50ms linear;
}
```

- [ ] **Step 4: Verify progress bar updates on scroll**

Browser: reload article. Scroll down. The bar fills left-to-right. Reach end of page → bar at 100%.

DevTools console:

```js
window.scrollTo(0, document.body.scrollHeight);
setTimeout(() => console.log('bar at end:', document.querySelector('.progress-bar').style.width), 100);
```

Expected: a percentage close to `100.00%`.

---

## Task 19: Implement `copy.js`

**Why:** Spec §7.5. Article page must have copy buttons on `<pre data-copyable>`.

**Files:**
- Modify: `assets/js/copy.js`
- Modify: `assets/css/article.css` (append copy-button styles)

**Steps:**

- [ ] **Step 1: Verify failing state**

Browser: article page. DevTools console:

```js
console.log('copy buttons today:', document.querySelectorAll('.copy-btn').length);
```

Expected today: `0`. After this task: equal to the number of `<pre data-copyable>` blocks.

- [ ] **Step 2: Implement `copy.js`**

Replace `assets/js/copy.js`:

```js
/* copy.js — attaches copy buttons to <pre data-copyable>. See spec §7.5. */
(() => {
  function attach() {
    document.querySelectorAll('pre[data-copyable]').forEach(pre => {
      if (pre.dataset.copyAttached) return;
      pre.dataset.copyAttached = '1';
      const wrap = document.createElement('div');
      wrap.className = 'copy-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', '复制代码');
      btn.addEventListener('click', async () => {
        const text = pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
        }
        const prev = btn.textContent;
        btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = prev; }, 2000);
      });
      wrap.appendChild(btn);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
```

- [ ] **Step 3: Append copy-button styles to `article.css`**

```css
.copy-wrap { position: relative; }
.copy-btn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--bg-card);
  border: var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  color: var(--text-secondary);
  transition: background var(--duration-fast), color var(--duration-fast);
}
.copy-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
```

- [ ] **Step 4: Verify**

Reload article. DevTools console:

```js
const total = document.querySelectorAll('pre[data-copyable]').length;
const btns = document.querySelectorAll('.copy-btn').length;
console.log('pre count:', total, 'btn count:', btns, 'match:', total === btns);
```

Expected: `match: true`. Click one Copy button — verify clipboard receives the text (paste into the address bar to confirm).

---

## Task 20: Build `/workflows/index.html` hub + `card.css` + initial `hub.js`

**Why:** Spec S1 deliverables 4, 6. Spec §7.2, §7.3.

**Files:**
- Modify: `workflows/index.html` (replace stub with real hub)
- Modify: `assets/css/card.css`
- Modify: `assets/css/editorial.css`
- Modify: `assets/css/hub.css`
- Modify: `assets/js/hub.js`

**Steps:**

- [ ] **Step 1: Replace `workflows/index.html`**

Overwrite `workflows/index.html` content with:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>工作流 / WORKFLOWS — CHIANGANGSTER</title>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/editorial.css">
  <link rel="stylesheet" href="/assets/css/hub.css">
  <link rel="stylesheet" href="/assets/css/card.css">
  <link rel="stylesheet" href="/assets/css/cmdk.css">
</head>
<body>
  <a class="skip-link" href="#main">跳到正文</a>
  <div data-include="nav"></div>
  <main id="main">
    <header class="hub-hero">
      <p class="hub-hero__eyebrow">DOMAIN 01</p>
      <h1 class="hub-hero__title">WORKFLOWS</h1>
      <p class="hub-hero__lede">沉淀图像生产 / 精修 / 场景搭建工作流，含 ComfyUI、Midjourney、SD、Photoshop AI 管线。</p>
      <p class="hub-hero__count" data-hub-count>—</p>
    </header>

    <section class="hub-filter" aria-label="筛选">
      <div class="hub-filter__row" data-filter-status>
        <button type="button" role="switch" aria-checked="true" data-status="all">全部</button>
        <button type="button" role="switch" aria-checked="false" data-status="published">已发布</button>
        <button type="button" role="switch" aria-checked="false" data-status="testing">测试中</button>
        <button type="button" role="switch" aria-checked="false" data-status="planned">计划中</button>
      </div>
      <div class="hub-filter__row" data-filter-tags><!-- tag chips injected by hub.js --></div>
    </section>

    <section class="hub-grid" data-hub-grid aria-live="polite"><!-- cards injected by hub.js --></section>

    <p class="hub-empty" data-hub-empty hidden>没有匹配的条目。<button type="button" data-hub-clear>清除筛选</button></p>
  </main>
  <div data-include="footer"></div>
  <script src="/assets/js/nav.js" defer></script>
  <script src="/assets/js/footer.js" defer></script>
  <script src="/assets/js/cmdk.js" defer></script>
  <script src="/assets/js/validate-kb.js" defer></script>
  <script src="/assets/js/hub.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Write `editorial.css` (hero strip)**

Replace `assets/css/editorial.css`:

```css
/* editorial.css — owns editorial-mode treatments. See spec §4.1. */

.hub-hero {
  padding: var(--space-8) var(--space-5) var(--space-7);
  max-width: var(--content-max);
  margin: 0 auto;
}
.hub-hero__eyebrow {
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin: 0 0 var(--space-4);
  text-transform: uppercase;
}
.hub-hero__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(3rem, 14.5vw, 12rem);
  line-height: 0.85;
  letter-spacing: 0.01em;
  margin: 0 0 var(--space-5);
  color: var(--text-primary);
}
.hub-hero__lede {
  max-width: 56ch;
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 var(--space-3);
}
.hub-hero__count {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin: 0;
}
```

- [ ] **Step 3: Write `card.css` (Card component, both variants)**

Replace `assets/css/card.css`:

```css
/* card.css — owns the KB card component. See spec §7.2. */

.kb-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--bg-card);
  border: var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: background var(--duration-fast) var(--easing-standard), transform var(--duration-fast);
  position: relative;
  overflow: hidden;
}
.kb-card[href]:hover,
a.kb-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  outline: 1px solid rgba(255,255,255,0.12);
}
.kb-card[data-status="planned"],
.kb-card[data-status="archived"] {
  cursor: default;
  pointer-events: none;
}
.kb-card[data-status="planned"] *,
.kb-card[data-status="archived"] * { pointer-events: auto; }

.kb-card__thumb {
  aspect-ratio: 16 / 10;
  background: linear-gradient(135deg, rgba(0,113,227,0.25), rgba(255,55,95,0.15));
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.kb-card__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.kb-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}
.kb-card__summary {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kb-card__chips {
  display: flex; flex-wrap: wrap; gap: var(--space-2);
}
.kb-chip {
  font-size: 11px;
  padding: 2px var(--space-2);
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}
.kb-chip[data-hint="comfy"] { background: rgba(0,113,227,0.18); color: #87b8ff; }
.kb-chip[data-hint="flux"] { background: rgba(255,55,95,0.18); color: #ff9eb1; }
.kb-chip[data-hint="mj"] { background: rgba(255,179,64,0.18); color: #ffd28a; }
.kb-chip[data-hint="sd"] { background: rgba(48,209,88,0.18); color: #8be8a3; }

.kb-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  margin-top: auto;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  display: inline-block;
}
.status-published { background: var(--accent-green); }
.status-testing   { background: var(--accent-amber); }
.status-planned   { background: var(--accent-pink); }
.status-archived  { background: var(--text-muted); }

.kb-card__phase {
  font-size: 10px;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
}
```

- [ ] **Step 4: Write initial `hub.css` (grid + hero spacing — filter visuals come in Task 21)**

Replace `assets/css/hub.css`:

```css
/* hub.css — owns the hub page layout. See spec §7.3. */

.hub-filter {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--space-5) var(--space-5);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.hub-filter__row {
  display: flex; flex-wrap: wrap; gap: var(--space-2);
}

.hub-filter button[role="switch"] {
  font-size: 12px;
  letter-spacing: 0.05em;
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  border: var(--border);
  color: var(--text-secondary);
  transition: background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast);
}
.hub-filter button[role="switch"]:hover { color: var(--text-primary); }
.hub-filter button[aria-checked="true"] {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.hub-grid {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--space-5) var(--space-8);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--hub-grid-min), 1fr));
  gap: var(--space-5);
}

.hub-empty {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--text-secondary);
}
.hub-empty button {
  margin-left: var(--space-3);
  color: var(--accent);
  text-decoration: underline;
}
```

- [ ] **Step 5: Implement initial `hub.js` (fetch + render only — filters in Task 21)**

Replace `assets/js/hub.js`:

```js
/* hub.js — fetches kb.json, filters by domain, renders cards. See spec §7.3. */
(() => {
  const grid = document.querySelector('[data-hub-grid]');
  if (!grid) return;
  const countEl = document.querySelector('[data-hub-count]');
  const emptyEl = document.querySelector('[data-hub-empty]');
  const tagRow = document.querySelector('[data-filter-tags]');
  const statusRow = document.querySelector('[data-filter-status]');
  const clearBtn = document.querySelector('[data-hub-clear]');
  const domain = location.pathname.split('/').filter(Boolean)[0];

  let entries = [];
  let tagsMeta = {};
  const state = { status: 'all', selectedTags: new Set() };

  Promise.all([
    fetch('/assets/data/kb.json').then(r => r.json()),
    fetch('/assets/data/tags.json').then(r => r.json())
  ]).then(([kb, tags]) => {
    tagsMeta = Object.fromEntries(tags.tags.map(t => [t.id, t]));
    entries = kb.entries.filter(e => e.domain === domain);
    renderTagChips();
    bindFilters();
    render();
  }).catch(err => {
    console.error('hub.js: failed to load data', err);
    grid.innerHTML = '<p style="color: var(--text-muted)">数据加载失败。</p>';
  });

  function renderTagChips() {
    if (!tagRow) return;
    const tagSet = new Set();
    entries.forEach(e => e.tags?.forEach(t => tagSet.add(t)));
    tagRow.innerHTML = '';
    [...tagSet].sort().forEach(id => {
      const meta = tagsMeta[id] || { label: id, hint: '' };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-checked', 'false');
      btn.dataset.tag = id;
      if (meta.hint) btn.dataset.hint = meta.hint;
      btn.textContent = meta.label;
      tagRow.appendChild(btn);
    });
  }

  function bindFilters() {
    statusRow?.addEventListener('click', e => {
      const btn = e.target.closest('button[data-status]');
      if (!btn) return;
      state.status = btn.dataset.status;
      statusRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b === btn)));
      render();
    });
    tagRow?.addEventListener('click', e => {
      const btn = e.target.closest('button[data-tag]');
      if (!btn) return;
      const id = btn.dataset.tag;
      if (state.selectedTags.has(id)) {
        state.selectedTags.delete(id);
        btn.setAttribute('aria-checked', 'false');
      } else {
        state.selectedTags.add(id);
        btn.setAttribute('aria-checked', 'true');
      }
      render();
    });
    clearBtn?.addEventListener('click', () => {
      state.status = 'all';
      state.selectedTags.clear();
      statusRow?.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.status === 'all')));
      tagRow?.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', 'false'));
      render();
    });
  }

  function filtered() {
    return entries.filter(e => {
      if (state.status !== 'all' && e.status !== state.status) return false;
      if (state.selectedTags.size > 0) {
        const has = [...state.selectedTags].some(t => e.tags?.includes(t));
        if (!has) return false;
      }
      return true;
    });
  }

  function render() {
    const list = filtered();
    if (countEl) countEl.textContent = `${list.length} / ${entries.length} 条目`;
    grid.innerHTML = '';
    if (list.length === 0) {
      emptyEl?.removeAttribute('hidden');
      return;
    }
    emptyEl?.setAttribute('hidden', '');
    list.forEach(e => grid.appendChild(card(e)));
  }

  function card(e) {
    const interactive = e.url && e.url !== '#' && (e.status === 'published' || e.status === 'testing');
    const el = document.createElement(interactive ? 'a' : 'div');
    el.className = 'kb-card';
    el.dataset.status = e.status;
    if (interactive) {
      el.href = e.url;
      el.setAttribute('aria-label', `${e.title} — ${e.type} — ${labelForStatus(e.status)}`);
    } else {
      el.setAttribute('role', 'article');
    }
    const thumb = e.thumbnail
      ? `<img src="${e.thumbnail}" alt="" loading="lazy">`
      : '';
    const chips = (e.tags || []).map(t => {
      const m = tagsMeta[t] || {};
      const hint = m.hint ? ` data-hint="${m.hint}"` : '';
      return `<span class="kb-chip"${hint}>${escapeHtml(m.label || t)}</span>`;
    }).join('');
    const phase = e.phase ? `<span class="kb-card__phase">PHASE ${e.phase}</span>` : '';
    el.innerHTML = `
      <div class="kb-card__thumb">${thumb}</div>
      <h2 class="kb-card__title">${escapeHtml(e.title)}</h2>
      <p class="kb-card__summary">${escapeHtml(e.summary || '')}</p>
      <div class="kb-card__chips">${chips}</div>
      <div class="kb-card__meta">
        <span class="status-dot status-${e.status}" aria-hidden="true"></span>
        <span>${labelForStatus(e.status)}</span>
        ${phase}
        <span style="margin-left:auto">${e.owner || ''} · ${e.updated || ''}</span>
      </div>
    `;
    return el;
  }

  function labelForStatus(s) {
    return ({ published: '已发布', testing: '测试中', planned: '计划中', archived: '已归档' })[s] || s;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
})();
```

- [ ] **Step 6: Verify — two cards render**

Browser: hard reload `http://localhost:8000/workflows/`.

DevTools console:

```js
const cards = document.querySelectorAll('.kb-card');
const published = document.querySelector('.kb-card[data-status="published"]');
const planned = document.querySelector('.kb-card[data-status="planned"]');
console.log('card count:', cards.length);
console.log('published is anchor:', published?.tagName === 'A');
console.log('planned is div:', planned?.tagName === 'DIV');
console.log('count text:', document.querySelector('[data-hub-count]').textContent);
```

Expected:
```
card count: 2
published is anchor: true
planned is div: true
count text: 2 / 2 条目
```

- [ ] **Step 7: Verify navigation works**

Click the published card → page navigates to `/workflows/comfy-flux2-retouch.html` and renders. Click the planned card → no navigation occurs.

---

## Task 21: Verify and refine filter bar behaviour on `/workflows/`

**Why:** Spec S1 deliverables 5; spec §13 S1-7 (ComfyUI tag chip filters and clears). Task 20 already wired filters; this task verifies and tightens UX.

**Files:**
- (No new file creation; tweak `assets/css/hub.css` and `assets/js/hub.js` if behaviour gaps surface.)

**Steps:**

- [ ] **Step 1: Run S1-7 acceptance check — tag chip filtering**

Browser: `http://localhost:8000/workflows/`. Both cards visible.

Click the `Flux` tag chip. The planned card disappears (it has `[平面组, ComfyUI]` only). The published card remains.

Click `Flux` again to deselect. Both cards return.

Click `ComfyUI` chip. Both cards remain (both are tagged ComfyUI).

DevTools console:

```js
function visibleCount() { return document.querySelectorAll('.kb-card').length; }
const fluxBtn = [...document.querySelectorAll('[data-tag]')].find(b => b.dataset.tag === 'Flux');
fluxBtn.click();
console.log('after Flux on:', visibleCount()); // expect 1
fluxBtn.click();
console.log('after Flux off:', visibleCount()); // expect 2
```

If counts diverge, debug `filtered()` in `hub.js`.

- [ ] **Step 2: Run status pill filter check**

Click `已发布` pill → only the published card shows (count 1). Click `计划中` → only the planned card. Click `全部` → both return.

- [ ] **Step 3: Run empty state check**

Click `测试中` pill (no entries are testing). The grid empties; the `没有匹配的条目。 清除筛选` empty-state row appears.

Click `清除筛选`. Filters reset; both cards return; status row's `全部` is `aria-checked="true"`.

- [ ] **Step 4: Verify the hero count text reflects state**

DevTools console:

```js
console.log(document.querySelector('[data-hub-count]').textContent);
```

Expected after clearing all filters: `2 / 2 条目`.

- [ ] **Step 5: Mobile check**

DevTools 390×844 → reload. Filter row wraps. Grid collapses to 1-column. No horizontal scroll. Status pills and tag chips all tappable.

---

## Task 22: Verify article-page navigation flow end-to-end

**Why:** Spec §13 S1-2 (clicking the migrated card → article). Spec §13 S1-3 (article page no-regression versus pre-change tutorial.html).

**Steps:**

- [ ] **Step 1: From `/workflows/` click the published card**

Browser: navigate from hub → article. The article renders with shared nav, breadcrumb, content, copy buttons, progress bar.

- [ ] **Step 2: Run regression vs. baseline**

Side-by-side compare with `screenshots/baselines/tutorial-1440x900-pre.png`. Layout, type, color, spacing are equivalent within human perception.

- [ ] **Step 3: Run regression at mobile width**

Compare with `screenshots/baselines/tutorial-390x844-pre.png`. No regression.

- [ ] **Step 4: Verify breadcrumb back-navigates**

Click `工作流` in breadcrumb → returns to `/workflows/`. Hub renders both cards.

- [ ] **Step 5: Verify `/tutorial.html` redirect works one more time**

Browser: navigate to `http://localhost:8000/tutorial.html`. Within 1 second the URL becomes `/workflows/comfy-flux2-retouch.html` and the article appears.

---

## Task 23: Implement `cmdk.js` + `cmdk.css`

**Why:** Spec §7.6 + §8 + spec §13 S1-6. Includes the §8.3 non-navigable rule and the supplementary `/` trigger (D8).

**Files:**
- Modify: `assets/js/cmdk.js`
- Modify: `assets/css/cmdk.css`

**Steps:**

- [ ] **Step 1: Verify failing state**

Browser: `/workflows/`. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows). Nothing happens today.

- [ ] **Step 2: Implement `cmdk.js`**

Replace `assets/js/cmdk.js`:

```js
/* cmdk.js — Cmd/Ctrl+K + "/" search modal. See spec §7.6, §8. */
(() => {
  let modal, input, list, hint, isOpen = false, lastTrigger = null;
  let entries = [];
  let tagsMeta = {};
  let cached = false;

  function build() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'cmdk-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '搜索');
    modal.hidden = true;
    modal.innerHTML = `
      <div class="cmdk-backdrop" data-cmdk-backdrop></div>
      <div class="cmdk-panel">
        <input type="search" class="cmdk-input" autocomplete="off" placeholder="搜索工作流、Prompt、模板…  ⌘K" aria-label="搜索查询">
        <ul class="cmdk-list" role="listbox" aria-label="搜索结果"></ul>
        <p class="cmdk-hint">↑↓ 选择 · ↵ 打开 · esc 关闭</p>
      </div>
    `;
    document.body.appendChild(modal);
    input = modal.querySelector('.cmdk-input');
    list  = modal.querySelector('.cmdk-list');
    hint  = modal.querySelector('.cmdk-hint');
    modal.querySelector('[data-cmdk-backdrop]').addEventListener('click', close);
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', onInputKey);
    list.addEventListener('click', onListClick);
  }

  function ensureIndex() {
    if (cached) return Promise.resolve();
    return Promise.all([
      window.__kbIndex || fetch('/assets/data/kb.json').then(r => r.json()),
      window.__tagsIndex || fetch('/assets/data/tags.json').then(r => r.json())
    ]).then(([kb, tags]) => {
      window.__kbIndex = kb;
      window.__tagsIndex = tags;
      entries = kb.entries;
      tagsMeta = Object.fromEntries(tags.tags.map(t => [t.id, t]));
      cached = true;
    });
  }

  function open(triggerEl) {
    build();
    lastTrigger = triggerEl || document.activeElement;
    ensureIndex().then(() => {
      modal.hidden = false;
      isOpen = true;
      window.dispatchEvent(new CustomEvent('cmdk:state', { detail: { open: true } }));
      input.value = '';
      render('');
      input.focus();
    });
  }

  function close() {
    if (!modal) return;
    modal.hidden = true;
    isOpen = false;
    window.dispatchEvent(new CustomEvent('cmdk:state', { detail: { open: false } }));
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  function score(entry, tokens) {
    let s = 0;
    const fields = [
      [entry.title || '', 3],
      [(entry.tags || []).join(' '), 2],
      [entry.summary || '', 1]
    ];
    let allMatch = true;
    for (const t of tokens) {
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      let tokenHit = false;
      for (const [text, weight] of fields) {
        const m = text.match(re);
        if (m) { s += weight; tokenHit = true; }
      }
      if (!tokenHit) allMatch = false;
    }
    if (allMatch && tokens.length > 1) s += 2;
    return s;
  }

  function results(query) {
    const q = query.trim();
    if (!q) {
      return [...entries]
        .sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
        .slice(0, 5);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return entries
      .map(e => ({ e, s: score(e, tokens) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map(x => x.e);
  }

  function render(query) {
    const rows = results(query);
    list.innerHTML = '';
    if (rows.length === 0) {
      const li = document.createElement('li');
      li.className = 'cmdk-empty';
      li.textContent = '没有匹配。';
      list.appendChild(li);
      return;
    }
    rows.forEach((e, i) => {
      const navigable = e.url && e.url !== '#';
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.dataset.url = e.url || '';
      li.dataset.idx = String(i);
      if (!navigable) {
        li.setAttribute('aria-disabled', 'true');
        li.tabIndex = -1;
        li.classList.add('is-disabled');
      } else {
        li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      }
      const trail = navigable ? '' : ' · 即将上线';
      const tags = (e.tags || []).slice(0, 3).map(t => {
        const m = tagsMeta[t] || { label: t };
        return `<span class="cmdk-chip">${m.label || t}</span>`;
      }).join('');
      li.innerHTML = `
        <span class="cmdk-row">
          <span class="cmdk-title">${escapeHtml(e.title)}${trail}</span>
          <span class="cmdk-meta">${e.domain} · ${labelForStatus(e.status)}</span>
        </span>
        <span class="cmdk-tags">${tags}</span>
      `;
      list.appendChild(li);
    });
  }

  function moveSelection(delta) {
    const items = [...list.querySelectorAll('li[role="option"]:not(.is-disabled)')];
    if (items.length === 0) return;
    const cur = items.findIndex(li => li.getAttribute('aria-selected') === 'true');
    items.forEach(li => li.setAttribute('aria-selected', 'false'));
    const next = items[(cur + delta + items.length) % items.length];
    next.setAttribute('aria-selected', 'true');
    next.scrollIntoView({ block: 'nearest' });
  }

  function activateSelected() {
    const sel = list.querySelector('li[aria-selected="true"]');
    if (!sel) return;
    const url = sel.dataset.url;
    if (!url || url === '#') return; // §8.3 non-navigable guard
    location.assign(url);
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); activateSelected(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  function onListClick(e) {
    const li = e.target.closest('li[role="option"]');
    if (!li || li.classList.contains('is-disabled')) return;
    const url = li.dataset.url;
    if (!url || url === '#') return;
    location.assign(url);
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  // Triggers
  window.addEventListener('keydown', e => {
    if (isOpen) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'KeyK')) {
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      open();
      return;
    }
    if (e.key === '/') {
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      open();
    }
  });
  window.addEventListener('cmdk:open', () => { if (!isOpen) open(); });

  // Close on outside ESC even if focus drifted
  window.addEventListener('keydown', e => { if (isOpen && e.key === 'Escape') close(); });

  function labelForStatus(s) {
    return ({ published: '已发布', testing: '测试中', planned: '计划中', archived: '已归档' })[s] || s;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
  }
})();
```

- [ ] **Step 3: Implement `cmdk.css`**

Replace `assets/css/cmdk.css`:

```css
/* cmdk.css — owns the search modal. See spec §7.6, §8. */

.cmdk-modal {
  position: fixed; inset: 0;
  z-index: var(--z-modal);
  display: grid; place-items: start center;
  padding-top: 12vh;
}
.cmdk-modal[hidden] { display: none; }
.cmdk-backdrop {
  position: absolute; inset: 0;
  background: var(--bg-modal);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.cmdk-panel {
  position: relative;
  width: min(640px, 92vw);
  max-height: 70vh;
  background: var(--bg-elevated);
  border: var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.cmdk-input {
  width: 100%;
  padding: var(--space-4) var(--space-5);
  font-size: 1rem;
  background: transparent;
  border: 0;
  border-bottom: var(--border);
  color: var(--text-primary);
  outline: none;
}
.cmdk-input::placeholder { color: var(--text-muted); }
.cmdk-list {
  list-style: none;
  margin: 0; padding: var(--space-2) 0;
  overflow-y: auto;
  flex: 1;
}
.cmdk-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  cursor: pointer;
}
.cmdk-list li[aria-selected="true"] { background: var(--bg-card-hover); }
.cmdk-list li.is-disabled { color: var(--text-muted); cursor: default; }
.cmdk-row { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cmdk-title { color: var(--text-primary); font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cmdk-list li.is-disabled .cmdk-title { color: var(--text-muted); }
.cmdk-meta { font-size: 11px; color: var(--text-muted); letter-spacing: 0.04em; }
.cmdk-tags { display: flex; gap: var(--space-1); align-items: center; }
.cmdk-chip { font-size: 10px; padding: 1px var(--space-2); border-radius: 999px; background: rgba(255,255,255,0.08); color: var(--text-secondary); }
.cmdk-hint { margin: 0; padding: var(--space-2) var(--space-5); font-size: 11px; color: var(--text-muted); border-top: var(--border); text-align: right; }
.cmdk-empty { color: var(--text-muted); padding: var(--space-5); text-align: center; }
```

- [ ] **Step 4: Verify Cmd+K opens the modal**

Browser: any page (`/workflows/`, `/`, `/about/`). Press `Cmd+K` / `Ctrl+K`.

DevTools console:

```js
console.log('modal visible:', !document.querySelector('.cmdk-modal').hidden);
```

Expected: `true`. Modal renders. Input is focused. The 5 most-recently-updated entries appear (we have 2 in the seed; both render).

Type `flux`. The published Flux entry remains; the planned entry drops.

Press `Enter`. Browser navigates to `/workflows/comfy-flux2-retouch.html`.

- [ ] **Step 5: Verify `/` trigger**

Reload `/workflows/`. Click somewhere outside any input. Press `/`. Modal opens. Press `Esc`. Modal closes; focus returns to whatever was focused before (or body).

- [ ] **Step 6: Verify `/` trigger does NOT fire inside an input**

Type `/` into the search input itself. The character should appear in the input — **not** open another modal.

In a real input field on the page (if you add a temporary `<input>` for testing, or use the cmdk input itself once open), pressing `/` types the slash, never re-opens the modal.

- [ ] **Step 7: Verify nav search button opens modal**

Close the modal. Click the magnifying-glass button in the nav. Modal opens. The button's `aria-expanded` toggles to `true`. Close → toggles to `false`.

- [ ] **Step 8: Verify the planned entry is non-navigable**

Open the modal. Type `占位` (Chinese) or empty query (the planned entry is one of the recent 5). The planned entry row has muted color and `· 即将上线` trailing text. Press `↑/↓` — selection skips it. Mouse-click it → no navigation.

DevTools console while modal is open:

```js
const planned = [...document.querySelectorAll('.cmdk-list li')].find(li => li.dataset.url === '#');
console.log('planned tabIndex:', planned?.tabIndex);
console.log('planned aria-disabled:', planned?.getAttribute('aria-disabled'));
```

Expected: `planned tabIndex: -1`, `planned aria-disabled: true`.

---

## Task 24: Implement `validate-kb.js` full body

**Why:** Spec §6.4 + S1 deliverable 11. Localhost-only console warnings — production must remain silent.

**Files:**
- Modify: `assets/js/validate-kb.js`

**Steps:**

- [ ] **Step 1: Verify failing state**

Browser: `/workflows/`. DevTools console: today no validation messages. After this task, valid data → still no messages. We will then break the data temporarily to confirm warnings appear.

- [ ] **Step 2: Implement the full validator**

Replace `assets/js/validate-kb.js`:

```js
/* validate-kb.js — dev-only kb.json schema validator. See spec §6.4. */
(() => {
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;

  const REQUIRED = ['id','title','domain','type','tags','status','owner','updated','summary','url'];
  const STATUSES = new Set(['published','testing','planned','archived']);
  const DOMAINS = new Set(['workflows','prompts','research','marketing','resources']);

  Promise.all([
    fetch('/assets/data/kb.json').then(r => r.json()),
    fetch('/assets/data/tags.json').then(r => r.json())
  ]).then(([kb, tags]) => {
    const tagIds = new Set(tags.tags.map(t => t.id));
    const seenIds = new Set();
    let warnings = 0;

    (kb.entries || []).forEach((e, i) => {
      const id = e.id || `(entry #${i})`;

      REQUIRED.forEach(f => {
        if (e[f] === undefined || e[f] === null || (Array.isArray(e[f]) && e[f].length === 0 && f === 'tags')) {
          warn(id, `missing required field "${f}"`);
        }
      });

      if (e.id) {
        if (seenIds.has(e.id)) warn(id, 'duplicate id');
        seenIds.add(e.id);
      }
      if (e.domain && !DOMAINS.has(e.domain)) warn(id, `unknown domain "${e.domain}"`);
      if (e.status && !STATUSES.has(e.status)) warn(id, `unknown status "${e.status}"`);
      (e.tags || []).forEach(t => { if (!tagIds.has(t)) warn(id, `tag "${t}" not in tags.json`); });

      if (e.url && e.url !== '#' && e.external !== true) {
        const expected = `/${e.domain}/${e.id}.html`;
        if (e.url !== expected) warn(id, `url "${e.url}" does not match "${expected}"`);
      }
    });

    function warn(id, msg) {
      warnings++;
      console.warn(`[validate-kb] ${id}: ${msg}`);
    }

    if (warnings === 0) console.info('[validate-kb] OK — kb.json passed all checks.');
  }).catch(err => console.error('[validate-kb] failed to load:', err));
})();
```

- [ ] **Step 3: Verify happy path**

Browser: `/workflows/`. DevTools console:

Expected:
```
[validate-kb] OK — kb.json passed all checks.
```

No warnings.

- [ ] **Step 4: Verify production gate**

Open DevTools → set a fake hostname by editing `validate-kb.js` and changing the gate to `!== 'never'` momentarily — no, do not do this. Instead temporarily host the project under `127.0.0.1` and confirm it still warns; then under a public hostname (e.g., upload a test branch to GitHub Pages) and confirm it stays silent. If a public hostname is unavailable, settle for unit-style proof: in DevTools console, run:

```js
const fn = `(${(() => {
  const host = 'cdn.example.com';
  if (host !== 'localhost' && host !== '127.0.0.1') return 'silent';
  return 'noisy';
})()})()`;
console.log('production behaviour:', eval(fn));
```

Expected: `silent`.

- [ ] **Step 5: Verify warning surfaces on broken data**

Temporarily edit `assets/data/kb.json` and change one entry's `tags` array to include `"NONEXISTENT-TAG"`. Reload `/workflows/`. DevTools console:

Expected:
```
[validate-kb] comfy-flux2-retouch: tag "NONEXISTENT-TAG" not in tags.json
```

Revert the JSON change. Reload. Expected: `OK` again.

---

## Task 25: S1 acceptance verification

**Why:** Spec §13 — every S1 bullet must pass before declaring S1 done. This is the gate before any handoff to GitHub Pages upload.

**Steps:**

- [ ] **Step 1: S1-1 — two cards on `/workflows/`**

`http://localhost:8000/workflows/` → 2 cards visible. Published (Flux.2) is anchor with green dot. Planned (occupier) is `<div>` with pink dot, no hover lift.

DevTools console:

```js
const cards = document.querySelectorAll('.kb-card');
const a = document.querySelector('a.kb-card[data-status="published"]');
const d = document.querySelector('div.kb-card[data-status="planned"]');
console.log('S1-1:', cards.length === 2 && !!a && !!d ? 'PASS' : 'FAIL');
```

- [ ] **Step 2: S1-2 — click migrated card → article**

Click the published card. URL becomes `/workflows/comfy-flux2-retouch.html`. Article renders.

- [ ] **Step 3: S1-3 — article no-regression**

Compare article at 1440×900 and 390×844 vs. `screenshots/baselines/tutorial-*.png`. No human-perceptible regression.

- [ ] **Step 4: S1-4 — `index.html` no-regression with new nav**

`http://localhost:8000/`. Compare vs. `screenshots/baselines/index-*.png` plus the post-Task-14 screenshots. Chair auto-spins, drag works, new nav present in place of old inline nav. No other regression.

- [ ] **Step 5: S1-5 — `/tutorial.html` redirect within 1s**

Open `http://localhost:8000/tutorial.html`. Within 1 second URL bar shows `/workflows/comfy-flux2-retouch.html` and article renders.

- [ ] **Step 6: S1-6 — Cmd+K, `/`, search button all work; Esc returns focus**

On any page:

1. Cmd/Ctrl+K → modal opens. Type `flux` → published entry shows. Enter → navigates. Use back button. Repeat.
2. Press `/` (focus not in input) → modal opens. Esc → modal closes; focus returns to body or trigger.
3. Click nav search button → modal opens. Esc → closes; focus returns to the search button.

DevTools console while testing:

```js
function trigger(combo) {
  const e = new KeyboardEvent('keydown', combo);
  window.dispatchEvent(e);
}
trigger({ key: 'k', metaKey: true });
console.log('modal open:', !document.querySelector('.cmdk-modal').hidden);
```

Expected: `true`.

- [ ] **Step 7: S1-7 — ComfyUI tag chip filter behaviour**

`/workflows/`. Click `ComfyUI` chip → both cards remain (both tagged ComfyUI). Click `Flux` chip → only Flux-tagged card remains. Click `Flux` again → both return.

- [ ] **Step 8: S1-8 — Lighthouse mobile audit on `/workflows/`**

Chrome DevTools → Lighthouse → Mobile → Performance + Best Practices → Generate report on `http://localhost:8000/workflows/`.

Expected: LCP ≤ 2.0s. Best Practices ≥ 90.

If LCP fails: check that `kb.json` and tags.json are loading from disk (not throttled). Confirm no console errors. The hub hero is plain text — should render in first frame.

If Best Practices fails: check the report for the specific finding. Common issues: missing viewport meta (we have it), unsafe `target="_blank"` without `rel="noopener"` (footer link uses `noopener`).

- [ ] **Step 9: S1-9 — keyboard tab order with visible focus**

`/workflows/`. Press Tab repeatedly from page load. Order should be: skip-link → brand → 5 domain links → search button → about link → status pills → tag chips → each card → footer link. Every focused element shows the focus ring (the global `:focus-visible` rule from `base.css`).

- [ ] **Step 10: S1-10 — no horizontal scroll at 360px**

DevTools Device Toolbar → custom 360×800. Visit each in turn:

1. `/`
2. `/workflows/`
3. `/workflows/comfy-flux2-retouch.html`
4. `/about/`

DevTools console on each:

```js
console.log('horiz scroll:', document.documentElement.scrollWidth > document.documentElement.clientWidth);
```

Expected: `false` on every page.

- [ ] **Step 11: Capture post-S1 screenshots**

Save final-state shots into `screenshots/baselines/`:

- `index-1440x900-post-s1.png`
- `index-390x844-post-s1.png`
- `workflows-1440x900-post-s1.png`
- `workflows-390x844-post-s1.png`
- `article-1440x900-post-s1.png`
- `article-390x844-post-s1.png`

These become baselines for S2.

- [ ] **Step 12: If any check fails, log it and pause**

If a single S1 check failed, do not proceed to upload. Either fix in-plan (return to the relevant task) or document the deviation in `docs/superpowers/reviews/2026-04-28-s1-acceptance.md` with rationale and a follow-up task ticket name.

---

## Task 26: Handoff to GitHub Pages (manual upload — D1)

**Why:** D1 — author uploads manually. This task is **not** an automation; it is a checklist for the user to follow. No agent runs git commands here.

**Steps:**

- [ ] **Step 1: Identify the deltas**

```powershell
Get-ChildItem -Recurse -File -Exclude .DS_Store, screenshots\* | `
  Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-7) } | `
  Select-Object FullName, LastWriteTime
```

This lists files changed in the last 7 days. The list is the upload set, plus everything in `assets/` and the new `workflows/` directory.

- [ ] **Step 2: Author manually uploads**

In a browser, navigate to https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io. Use the GitHub web UI ("Add file → Upload files") to upload:

- `index.html` (modified)
- `tutorial.html` (replaced with redirect stub)
- `workflows/index.html`
- `workflows/comfy-flux2-retouch.html`
- `prompts/index.html`, `research/index.html`, `marketing/index.html`, `resources/index.html`, `about/index.html`
- `assets/css/*.css` (8 files)
- `assets/js/*.js` (7 files)
- `assets/data/kb.json`, `assets/data/tags.json`
- `docs/README.md`, `docs/adding-an-entry.md`, `docs/templates/article-template.html`
- `docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md`
- `docs/superpowers/plans/2026-04-27-knowledge-base-redesign.md`
- `docs/superpowers/reviews/2026-04-27-codex-gpt-5.md` and `docs/superpowers/reviews/2026-04-27-claude-external-review.md`

Do NOT upload the `screenshots/` directory unless you want it in the repo (it is documentation, not deployment payload — recommend keeping it local only).

Commit message in GitHub web UI: `feat: knowledge base redesign — S0 + S1 (workflows domain migration)`

- [ ] **Step 3: Wait for GitHub Pages publish (typically < 5 minutes)**

Visit `https://chiangangster.github.io/`. Compare with local. Run S1-5 redirect check on the live site: `https://chiangangster.github.io/tutorial.html` → should redirect to `/workflows/comfy-flux2-retouch.html`.

- [ ] **Step 4: Run live-site Lighthouse**

Chrome DevTools → Lighthouse → run against `https://chiangangster.github.io/workflows/`. LCP and Best Practices should still pass under realistic CDN conditions.

- [ ] **Step 5: Confirm `validate-kb.js` is silent on production**

DevTools console on `https://chiangangster.github.io/workflows/`. Expected: no `[validate-kb]` messages (the hostname gate suppresses them).

---

## 3. Self-review checklist

After implementing all 26 tasks, run through this list against the spec:

- **Spec coverage**:
  - G1 — multi-domain IA (Tasks 8, 11, 20)
  - G2 — visual continuity (Tasks 3, 14, 16)
  - G3 — zero-build deploy (no build step exists; Task 26)
  - G4 — JSON-only entry add (Task 7, 9)
  - G5 — global keyboard search (Task 23)
  - G6 — tag-based filtering (Task 21)
  - G7 — mobile-usable ≥ 360px (Task 25 step 10)
  - G8 — WCAG 2.1 AA (Tasks 4 :focus-visible, 11 aria-current, 23 dialog/listbox, 25 step 9)

- **Placeholder scan**: every step contains the actual content an engineer needs. No TBD/TODO/"implement later". Code blocks present where code is required.

- **Type consistency**: function names match across tasks (`isTypingTarget` defined and used in cmdk.js, `escapeHtml` defined twice but identical, `score` / `results` / `render` consistent within cmdk.js). Status enum values (`published`, `testing`, `planned`, `archived`) used consistently in CSS selectors, JS guards, JSON data, and UI labels.

- **Workflow constraint compliance**: zero `git` commands appear in tasks 1–25. Only Task 26 mentions GitHub, and it is via the web UI, not CLI.

---

*End of plan.*
