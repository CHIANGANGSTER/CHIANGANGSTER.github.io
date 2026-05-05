---
title: Knowledge Base Redesign — Design Spec
date: 2026-04-27
status: draft / awaiting review
authors:
  - Corvin (product / design owner)
  - Claude (Opus 4.7) — drafting agent
canonical_repo: https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io
methodology: superpowers:brainstorming (5.0.7) — applied manually, plugin not registered in active session
---

# Knowledge Base Redesign — Design Spec

> One-line goal: 把现有单页教程站升级为面向设计部多角色的 AI 知识库，沉淀工作流、Prompt 模板、调研流程、营销策略与跨组资源；保持零构建、GitHub Pages 直接托管。

This document is the **scope-1 spec**: site-wide infrastructure + first content domain migration. Subsequent content domains (research / marketing / resources) will each get their own spec when work begins on them.

> **Audience**: implementing developers and AI agents; cross-AI reviewers.

---

## 0. How to read this document

- All decisions are explicit. When you see "decision:" the choice is locked unless the user revises it during review.
- Where there is **deliberately deferred** detail, it is marked `[DEFERRED → spec-N]` with the spec it belongs to.
- Where input from the user is still pending, it is in the **Open Questions** section at the end.
- Acceptance criteria are testable; if a criterion cannot be objectively checked, it is rewritten or removed.

---

## 1. Goals & Non-goals

### 1.1 Goals (in priority order)

| ID | Goal | Why it matters | Verifiable how |
|----|------|----------------|----------------|
| G1 | Multi-domain information architecture replacing single-page layout | Single page can no longer absorb the volume of upcoming content (4 capability domains, ~25-40 entries projected) | Production URL has functional `/workflows/`, `/prompts/`, `/research/`, `/marketing/`, `/resources/` |
| G2 | Visual continuity with existing assets | Two distinct treatments already exist (`index.html` editorial, `tutorial.html` glassmorphism); both are shipped and recognised | Hero/cover pages render in editorial style; content pages render in glass style; both share design tokens |
| G3 | Zero-build deploy on GitHub Pages | No CI to maintain, no build to break | Pushing to `master` updates the live site within GitHub Pages' standard window |
| G4 | Adding a content entry requires editing one JSON file plus optionally one HTML file | Lowers contribution barrier so non-engineers can extend the KB | New entry visible on its domain hub after JSON edit + push |
| G5 | Global keyboard search across all KB entries | KB without search is unusable past ~15 entries | `Cmd/Ctrl+K` opens a modal that fuzzy-matches title/tags/summary and navigates on Enter |
| G6 | Tag-based filtering on hub pages | Users find content by category, not just by name | Clicking a tag chip filters cards client-side without page reload |
| G7 | Mobile-usable (≥ 360px viewport) | Same audience uses phones to look up references | Hub pages and content pages have no horizontal scroll, no overflowing UI at 360px |
| G8 | Accessible to keyboard and screen reader users at WCAG 2.1 AA contrast and basic semantics | Future-proof and inclusive | All interactive elements reachable by Tab; all text passes 4.5:1 contrast; landmarks present |

### 1.2 Non-goals (explicitly excluded from v1)

- NG1. Build system, bundler, framework. No Vite, Astro, Next, etc.
- NG2. CMS, authentication, comments, user-generated content.
- NG3. Light theme, theme toggle. Dark only.
- NG4. i18n / language toggle. Chinese is primary content language; English appears as typographic accent.
- NG5. Backend, server endpoints, databases. Static only.
- NG6. Analytics, tracking, telemetry. Out of scope; can be added later as `<script defer>` in `<head>`.
- NG7. Service worker / offline mode.
- NG8. RSS / sitemap.xml / structured data. Useful but not in this scope.
- NG9. Migration of all existing content into the new domains. Only the existing tutorial migrates in this spec; other domain content lands via subsequent specs.

---

## 2. Background (abstracted)

The site originated as a personal portfolio/workspace publishing one in-depth ComfyUI image-retouch workflow tutorial. Over the next several months it must absorb four kinds of content:

1. **Image production workflows** — ComfyUI / Midjourney / Stable Diffusion / Photoshop AI pipelines, Prompt templates with parameter slots
2. **Product research workflows** — competitor data collection, trend analysis, user-feedback keyword extraction
3. **Marketing assistance workflows** — selling-point distillation, short-video script frames, e-commerce visual narrative structures
4. **Cross-team resources** — Prompt case library, scene/keyword libraries, AI tool index, news feed

The audience splits roughly into three personas, each with different needs:

| Persona | Primary task | Frequency | Critical UX |
|---------|-------------|-----------|-------------|
| Designer (graphic / 3D / video / product) | Find a workflow or prompt to copy and adapt | Daily | Search and filter speed; copy-to-clipboard |
| Cross-team reviewer (manager / AI team) | Skim what has been shipped and how mature it is | Weekly | Visible status badges; clear scope per page |
| Author (Corvin) | Add or update entries without rewriting HTML | A few times a week | One JSON to edit; one Markdown-friendly content authoring surface |

Treating these three at once produces the central design tension: a KB grid (high information density) sitting next to an editorial cover (low density, brand identity). Section 4 resolves this tension.

---

## 3. Information Architecture

### 3.1 Top navigation (5 items + Home)

Decision: **Function-domain navigation**, supplemented by tag and status filters within each domain.

```
LOGO  |  WORKFLOWS  PROMPTS  RESEARCH  MARKETING  RESOURCES  |  ⌕  ABOUT
```

Localised labels (zh-CN primary, en accent in caps):

```
LOGO  |  工作流 WORKFLOWS  ·  Prompt 库 PROMPTS  ·  调研 RESEARCH
       ·  营销 MARKETING  ·  资源 RESOURCES                  |  ⌕ 搜索  ·  关于 ABOUT
```

The `⌕` glyph is a placeholder for the magnifying-glass SVG icon described in §7.1.

### 3.2 URL structure

```
/                                   ← editorial home (3D chair preserved)
/workflows/                         ← hub: card grid of workflow entries
/workflows/<slug>.html              ← individual workflow article (e.g. comfy-flux2-retouch)
/prompts/                           ← hub
/prompts/<slug>.html
/research/                          ← hub  (content: subsequent spec)
/research/<slug>.html
/marketing/                         ← hub  (content: subsequent spec)
/marketing/<slug>.html
/resources/                         ← hub  (content: subsequent spec)
/resources/<slug>.html
/about/                             ← single page
/tutorial.html                      ← preserved as redirect stub → /workflows/comfy-flux2-retouch.html
/assets/...                         ← shared CSS, JS, fonts, images, data
/docs/...                           ← contributor docs (not part of public site)
```

### 3.3 Domain-to-content mapping

Domain content is loaded from `/assets/data/kb.json`. Content categorisation follows the four capability areas described in §2. Each domain hub renders a filtered subset of `kb.json` matching `domain == <slug>`.

Tag taxonomy (closed list, expandable later):

- **Group tags**: `平面组` `3D 渲染组` `摄制组` `产品设计组`
- **Tool tags**: `ComfyUI` `Midjourney` `Stable Diffusion` `Photoshop AI` `Flux` `LoRA`
- **Phase tags**: `phase-1` `phase-2` `phase-3` `phase-4` (stored as `phase` integer field, rendered as a separate badge — not a free tag)
- **Type tags**: stored in `type` field, not duplicated as tag strings

Tag list is curated in `/assets/data/tags.json` with display label and color hint; cards reference tags by string id.

### 3.4 Hub page anatomy

A domain hub renders, top to bottom:

1. **Hero strip** — domain title (giant editorial type), one-line description, current entry count
2. **Filter bar** — status pills (All / Published / Testing / Planned), tag chips (multi-select), phase badges
3. **Card grid** — 3-column on desktop, 2-column tablet, 1-column mobile
4. **Empty state** — when filters return no results, friendly copy + clear-filters button

Cards are read-only previews. Clicking navigates to the content page.

### 3.5 Content page anatomy

A content page renders, top to bottom:

1. **Sticky breadcrumb + reading progress bar** (existing tutorial.html pattern, generalised)
2. **Article header** — title, summary, owner, last updated, status, tag chips
3. **Article body** — sections, code blocks, images, callouts; identical typographic system across all content pages
4. **"Copy this prompt" floating action** — appears when the page contains at least one `<pre data-copyable>` block
5. **Footer nav** — prev/next within the same domain (read from `kb.json` order)

---

## 4. Visual direction

Decision: **Hybrid γ** — editorial cover for hero/hub pages, glassmorphism for content pages, both governed by one design-token file.

### 4.1 Two-mode rationale

- Editorial mode is high impact, low information density. It sells the brand and gives orientation. Used for: home, domain hubs, about.
- Glass mode is medium impact, high information density. It carries reading load. Used for: content pages, search modal.
- Anchoring both in shared tokens prevents visual drift.

### 4.2 Type system

| Token | Editorial mode | Glass mode |
|-------|---------------|------------|
| Display heading | `--font-display` (Compressa VF or Roboto Flex), 14.5vw, weight 400, uppercase, line-height 0.85 | `--font-sans` (Inter), clamp(1.5rem, 4vw, 2.2rem), weight 700 |
| Body | `--font-sans` (Inter), 15-16px | Inter, 15-16px, line-height 1.8 |
| Decorative zh title (if any) | `AaFengKuangYuanShiRen` (already loaded in tutorial.html) | same |

### 4.3 Color tokens (locked)

Extends the existing `tutorial.html` palette; nothing in the existing palette is removed.

```css
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
  --accent: #0071e3;        /* link / primary action */
  --accent-green: #30d158;  /* status: published */
  --accent-amber: #ffb340;  /* status: testing */
  --accent-pink: #ff375f;   /* status: planned / new */

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
}
```

Status-to-color mapping: `published → --accent-green`, `testing → --accent-amber`, `planned → --accent-pink`, `archived → --text-muted`.

### 4.4 Spacing scale

Power-of-1.5 modular scale for consistency:

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  24px
--space-6:  32px
--space-7:  48px
--space-8:  64px
--space-9:  96px
--space-10: 128px
```

### 4.5 Motion principles

- Hover and focus transitions: `--duration-fast` `--easing-standard`.
- Modal / page-level reveals: `--duration-base` `--easing-emphasized`.
- Respect `prefers-reduced-motion`: all transforms and transitions reduce to opacity-only or to instant.

---

## 5. Tech stack

Decision: **Vanilla HTML/CSS/JS with a small JSON data layer and shared partials injected at runtime.** No build step.

### 5.1 Files and where they live

```
/                                   ← repo root + GitHub Pages root
├── index.html                      ← editorial home (existing, will be lightly amended for nav)
├── tutorial.html                   ← redirect stub
├── workflows/
│   ├── index.html                  ← hub
│   └── comfy-flux2-retouch.html    ← migrated from existing tutorial.html
├── prompts/      index.html        ← hub (placeholder until S2 spec)
├── research/     index.html        ← hub (placeholder until S2 spec)
├── marketing/    index.html        ← hub (placeholder until S3 spec)
├── resources/    index.html        ← hub (placeholder until S4 spec)
├── about/        index.html        ← single page
├── assets/
│   ├── css/
│   │   ├── tokens.css              ← color, type, space, motion tokens
│   │   ├── base.css                ← reset, typography, layout primitives
│   │   ├── nav.css                 ← top navigation
│   │   ├── card.css                ← KB card component
│   │   ├── hub.css                 ← hub page (filter bar, grid, empty state)
│   │   ├── article.css             ← content-page typography, callouts
│   │   ├── cmdk.css                ← search modal
│   │   └── editorial.css           ← editorial-mode-only treatments
│   ├── js/
│   │   ├── nav.js                  ← injects shared <nav> partial
│   │   ├── footer.js               ← injects shared <footer> partial
│   │   ├── hub.js                  ← reads kb.json, renders cards, applies filters
│   │   ├── cmdk.js                 ← Cmd/Ctrl+K search modal
│   │   ├── copy.js                 ← attaches copy buttons to <pre data-copyable>
│   │   ├── progress.js             ← reading progress bar
│   │   └── validate-kb.js          ← dev-only kb.json schema validator (logs warnings on localhost only)
│   ├── data/
│   │   ├── kb.json                 ← knowledge-base entries (single source of truth)
│   │   └── tags.json               ← tag display metadata
│   ├── img/                        ← thumbnails, illustrations, screenshots
│   └── fonts/                      ← (existing) AaFengKuangYuanShiRen, etc.
├── docs/
│   ├── README.md                   ← contributor onboarding
│   ├── adding-an-entry.md          ← step-by-step for non-engineers
│   └── superpowers/specs/          ← this file lives here
└── README.md                       ← public repo README (existing)
```

### 5.2 Why no build

- GitHub Pages serves the repo as-is. No Actions to maintain.
- Project is < 40 entries projected for the next 12 months. Vanilla scales fine to that range.
- `kb.json` is small enough to ship to the client (< 100KB even at 50 entries with descriptions).
- Re-evaluation point: when `kb.json` exceeds 100KB **or** the number of distinct content pages exceeds 40, revisit moving to Astro/11ty.

### 5.3 Partials injection mechanism

Each page contains:

```html
<div data-include="nav"></div>
<!-- page content -->
<div data-include="footer"></div>
<script src="/assets/js/nav.js" defer></script>
<script src="/assets/js/footer.js" defer></script>
```

`nav.js` defines the `<nav>` HTML as a template string and replaces the placeholder. Same pattern for `footer.js`. This trades a small flash of unstyled placeholder for zero build complexity. To eliminate the flash, the placeholder reserves the correct height via CSS:

```css
[data-include="nav"] { height: var(--nav-height, 56px); }
```

Active-link highlighting is computed by `nav.js` from `location.pathname`.

### 5.4 Browser support

Target: last 2 versions of Chrome, Edge, Safari, Firefox. No IE.

Required APIs: `fetch`, `Promise`, `URL`, ES2020. CSS: custom properties, `clamp()`, `:has()` (used optionally with `@supports` fallback), `backdrop-filter` (already used in `tutorial.html`).

### 5.5 No new external runtime dependencies

The existing CDN dependencies inherited from `index.html` are documented and grandfathered:

- `three@0.163.0` plus `three/addons/` from `cdn.jsdelivr.net` (loaded via importmap)
- `unicornstudio.js@v2.1.8` from `cdn.jsdelivr.net` (dynamic `<script>` injection)
- `CompressaPRO-GX.woff2` from `res.cloudinary.com`
- Google Fonts: `Inter`, `Roboto Flex`

This redesign **does not add** any new external runtime dependencies. No jQuery, no React, no Lit, no fuzzy-search library (Fuse.js etc.), no animation library, no icon library beyond inline SVG. The total amount of new JavaScript shipped (sum of `/assets/js/*.js`) should not exceed 25KB minified across all files combined. CSS budgets are tracked separately in §10.

---

## 6. Knowledge-base data schema

### 6.1 `/assets/data/kb.json`

Top-level: `{ "version": "1", "entries": [ … ] }`

Each entry:

```jsonc
{
  "id": "comfy-flux2-retouch",          // slug, kebab-case, immutable, must equal filename
  "title": "Flux.2 产品精修工作流",
  "domain": "workflows",                 // one of: workflows | prompts | research | marketing | resources
  "type": "workflow",                    // one of: workflow | prompt-template | research-doc | case-study | keyword-library | tool | news | guide
  "tags": ["平面组", "ComfyUI", "Flux"], // strings; must exist in tags.json
  "phase": 1,                            // integer 1-4; 0 if not aligned to a phase
  "status": "published",                 // published | testing | planned | archived
  "difficulty": 3,                       // 1-5 (1 trivial, 5 expert)
  "timeCost": "30-60min",                // free-form short string
  "owner": "Corvin",
  "updated": "2026-04-09",               // ISO date YYYY-MM-DD
  "thumbnail": "/assets/img/comfy-flux2-thumb.webp",  // optional; falls back to gradient
  "summary": "白底→场景修图全流程，含七步精修法",      // ≤ 120 chars
  "url": "/workflows/comfy-flux2-retouch.html",
  "prerequisites": [],                   // optional array of entry ids
  "outputs": ["商业级成品图"],          // optional array of free strings
  "external": false                      // if true, url points outside the site; opens in new tab
}
```

### 6.2 Required vs optional fields

Required: `id`, `title`, `domain`, `type`, `tags`, `status`, `owner`, `updated`, `summary`, `url`.
Optional: `phase`, `difficulty`, `timeCost`, `thumbnail`, `prerequisites`, `outputs`, `external`.

**About `id` values**: `id` is an opaque exact-match string used to join `kb.json` entries to `tags.json` records and to drive the `[data-tag-id="…"]` attribute selector. It is not constrained to URL-safe characters because it is never used in URLs. Display label is the `label` field. Color hint is the `hint` field, which **is** required to be URL-safe / CSS-attribute-safe (lowercase ASCII, hyphens). Two tags may share a `hint` to share a chip color.

### 6.3 `/assets/data/tags.json`

```jsonc
{
  "tags": [
    { "id": "平面组",   "label": "平面组",         "group": "team",  "hint": "graphic" },
    { "id": "3D 渲染组", "label": "3D 渲染组",     "group": "team",  "hint": "render" },
    { "id": "ComfyUI",  "label": "ComfyUI",        "group": "tool",  "hint": "comfy" },
    { "id": "Flux",     "label": "Flux",           "group": "tool",  "hint": "flux" }
    // …
  ]
}
```

`hint` is a short identifier the CSS uses to pick a chip color via `[data-hint="comfy"]` selectors. Adding a new hint means adding one CSS rule.

### 6.4 Validation

A small `/assets/js/validate-kb.js` script runs on the hub pages **only in development** (gated by `localhost` hostname check) and warns in console if:

- Any entry has a missing required field.
- Any entry references a tag id not in `tags.json`.
- Any entry's `url` does not match `/<domain>/<id>.html` for non-external entries.
- Two entries share the same `id`.

This is a soft check — failure does not break the page in production.

### 6.5 Schema evolution

The top-level `version` field exists so future schema changes can be detected. Today it is `"1"`. If we add new required fields, bump to `"2"` and write a migration in `validate-kb.js`.

---

## 7. Component inventory

Each component below is owned by one CSS file and at most one JS file. No component reaches into another's selectors.

### 7.1 `Nav`
- Anatomy: brand mark (left) + 5 domain links (center) + search icon button + About link (right).
- **Search icon button**: opens the Cmd+K modal on click; mirrors the keyboard shortcut for mouse and mobile-touch users. Icon: 16×16 magnifying-glass SVG, inherits `currentColor`. `aria-label="搜索 (⌘K / /)"`. Implemented as `<button type="button" aria-haspopup="dialog">`.
- Sticky top, glass background, `--z-nav`.
- Active-link styling derived from `location.pathname.startsWith()`.
- Responsive: collapses to a hamburger toggle below 720px (drawer slides from right). Search button **remains visible** in the collapsed bar, positioned to the left of the hamburger so search stays one-tap on phones.
- A11y: `<nav aria-label="Primary">`; current page link gets `aria-current="page"`; hamburger is a button with `aria-expanded`; search button has `aria-haspopup="dialog"` and toggles `aria-expanded` mirroring modal state.

### 7.2 `Card` (KB entry preview)
- Anatomy: thumbnail (or gradient fallback), title, summary, tag chips, status dot, phase badge, footer line (owner + updated).
- **Interactive variant** (`status` is `published` or `testing`): wrapper is `<a href="{entry.url}">`. Hover: lift 2px, increase background opacity, show subtle outline. `cursor: pointer`.
- **Non-interactive variant** (`status` is `planned` or `archived`, OR `entry.url === "#"`): wrapper is `<div role="article">`. No hover lift, no outline, `cursor: default`. A small `待发布` (planned) or `已归档` (archived) text label appears next to the status dot to make the non-interactive state legible.
- A11y — interactive: `<a>` has accessible name "{title} — {type} — {status}". A11y — non-interactive: wrapper has no role beyond `article`, the status text label provides the cue. Status dot is always `aria-hidden="true"` because the text label duplicates it.

### 7.3 `Hub`
- Composition: hero strip + filter bar + grid + empty state.
- Filter bar: status pills (single-select), tag chips (multi-select OR), search input (filters by title substring).
- Grid: CSS Grid `repeat(auto-fill, minmax(280px, 1fr))`.
- Filtering is purely client-side, applied to the in-memory entry list. No URL state in v1; this is a deferred enhancement (see Open Questions).
- A11y: filter pills are `<button role="switch" aria-checked>`; search input has visible label.

### 7.4 `Article` (content page wrapper)
- Reuses `tutorial.html`'s sectioning patterns (`.chapter`, `.section-header`, `.img-fluid`, `.img-caption`).
- Adds: breadcrumb, article header card (title + meta), prev/next footer nav.
- Floating "Copy" buttons on `<pre data-copyable>` (see CopyButton).

### 7.5 `CopyButton`
- Attached automatically by `copy.js` on DOM ready to every `<pre data-copyable>` element.
- States: idle ("Copy") → success ("Copied ✓", 2s) → idle.
- Uses `navigator.clipboard.writeText`. If unavailable, falls back to `document.execCommand('copy')` on a temporary `<textarea>`.

### 7.6 `CmdK` (search modal)
- Trigger: `Cmd+K` on macOS, `Ctrl+K` elsewhere; also clickable button on Nav (mobile-friendly).
- Modal: full-viewport overlay; focus traps inside; `Esc` closes.
- Search algorithm (simple, no library):
  - For each query token (split on whitespace), build a case-insensitive regex.
  - For each entry, score = matches in `title` × 3 + matches in `tags` joined × 2 + matches in `summary` × 1.
  - Boost if ALL tokens match.
  - Sort descending; show top 8.
- Empty query: show 5 most-recently updated entries.
- Keyboard: `↑` / `↓` to navigate; `Enter` to navigate to result; `Tab` to next field.
- A11y: `role="dialog" aria-modal="true"`; result list is `<ul role="listbox">`; items are `<li role="option" aria-selected>`.

### 7.7 `ProgressBar` (reading progress)
- Already exists in `tutorial.html`. Lift to `progress.js` and apply to all content pages.
- Reads `window.scrollY / (document.body.scrollHeight - window.innerHeight)`.
- Throttled via `requestAnimationFrame`.

### 7.8 `Footer`
- Minimal: copyright, repo link, "Last updated" stamp populated from a simple build-date constant in `footer.js` (manual bump on release; OK because deploys are infrequent).

### 7.9 `EditorialHero`
- Used on home and domain hubs.
- Anatomy: oversized type, optional 3D motif slot, descriptor lines.
- Home reuses the existing 3D chair. Domain hubs do not get 3D in S1 — they use oversized typography only. Per-domain 2D motifs are deferred to later specs.

---

## 8. Cmd+K search — full spec

### 8.1 Trigger contract
- `keydown` listener on `window`. Open if `(e.metaKey || e.ctrlKey) && e.key === 'k'` and the active element is not an `<input>` / `<textarea>` / `[contenteditable]`.
- Pressing `/` while not in an input also opens the modal (alternative trigger; common KB convention).
- Mobile: a search-icon button in `Nav` opens the same modal.

### 8.2 Index build
- On modal open, lazily `fetch('/assets/data/kb.json')`. Cache the result on `window.__kbIndex` for the page session.
- Subsequent opens reuse the cache. No staleness handling because the data is not user-mutable in v1.

### 8.3 Render
- Modal occupies center column, max-width 640px, max-height 70vh.
- Top: search input with placeholder `搜索工作流、Prompt、模板…  ⌘K`.
- Below: result list. Each row: title (left), domain + status (right), tags (small chips below).
- Bottom: thin help bar `↑↓ 选择 · ↵ 打开 · esc 关闭`.
- **Non-navigable rows**: entries where `url === "#"` (i.e. `status: "planned"` placeholders) render as visually-disabled rows: `aria-disabled="true"`, `tabindex="-1"`, dimmed to `--text-muted`, with a trailing `· 即将上线` hint. They are skipped by ↑↓ keyboard navigation and Enter is a no-op when one is highlighted by mouse hover. Implementation: in the keydown handler, before calling `location.assign(row.url)`, guard with `if (row.url === '#' || row.url === '') return;`.

### 8.4 Performance budget
- Cold open (first time on the page) ≤ 200ms (network kb.json fetch dominates).
- Warm open ≤ 50ms.
- Search-while-typing must keystroke-respond ≤ 16ms (one frame) at 50 entries.

---

## 9. Accessibility

WCAG 2.1 AA baseline. Concrete requirements:

- **Contrast**: All text against its background ≥ 4.5:1 (normal) / 3:1 (large 18pt+ or 14pt bold). The token palette in §4.3 satisfies this for `--text-primary` and `--text-secondary` on `--bg-primary` and `--bg-card`. `--text-muted` on `--bg-card` is **below** AA — use it only for non-essential decorative text (e.g., uppercase metadata stamps, image captions) and never for primary content.
- **Keyboard**: every interactive element reachable by Tab in DOM order; visible focus ring (custom, not default browser, but visible). No keyboard traps except the explicit modal focus trap.
- **Landmarks**: `<header>` (or `<nav>` directly), `<main>`, `<footer>` on every page. Skip-to-content link as the first focusable element.
- **Screen reader**: status dot color is supplemented by text inside an `aria-label` or visually-hidden span. Cards announce their full state.
- **Motion**: honour `prefers-reduced-motion: reduce`. Disable hero parallax and 3D auto-spin, keep page-level transitions opacity-only.
- **Form labels**: every input has a programmatic label (visible or `aria-label`).

Out of scope for v1: full screen-reader audit, captions on any video. Add to backlog.

---

## 10. Performance budget

| Metric | Budget | How measured |
|--------|--------|--------------|
| Largest Contentful Paint (home) | ≤ 2.5s on 4G | Lighthouse mobile |
| LCP (hub pages) | ≤ 2.0s | Lighthouse mobile |
| LCP (content pages) | ≤ 2.5s | Lighthouse mobile |
| Total JS shipped (excluding Three.js on home) | ≤ 25KB minified | sum of `assets/js/*.js` byte size |
| Total CSS shipped | ≤ 60KB | sum of `assets/css/*.css` byte size |
| Hub page initial paint without `kb.json` | renders skeleton, no layout shift when data arrives | manual review via DevTools throttling |
| Image format | webp preferred; png/jpg only when needed | grep for non-webp in `/assets/img/` |
| Image lazy-loading | every `<img>` below the fold has `loading="lazy"` | code review |

Three.js on home is exempt from JS budget because it predates this scope and is the headline brand asset.

---

## 11. Implementation phases (this spec covers S0 + S1 only)

### S0 — Scaffolding (estimated 1-2 days)

Deliverables:
1. Create `/assets/css/tokens.css` populated with the full §4.3 color tokens, §4.4 spacing scale, §4.5 motion tokens. Create `base.css`, `nav.css`, `card.css`, `hub.css`, `article.css`, `editorial.css`, `cmdk.css` — each as a stylesheet with at minimum a header comment naming the component it owns and an empty body. (`tokens.css` is the only file required to have content in S0.)
2. Create `/assets/js/nav.js`, `footer.js`, `hub.js`, `cmdk.js`, `copy.js`, `progress.js`, `validate-kb.js` — minimal stubs. `validate-kb.js` already includes the §6.4 hostname gate (early return on non-localhost) but its check body is empty in S0 and is filled in during S1 (deliverable 11).
3. Create `/assets/data/kb.json` (with one entry: the existing tutorial) and `/assets/data/tags.json` (seeded per Appendix B).
4. Create directory placeholders `workflows/`, `prompts/`, `research/`, `marketing/`, `resources/`, `about/`, each with a stub `index.html` containing only `<title>` and the `data-include="nav"` placeholder.
5. Create `/docs/README.md` and `/docs/adding-an-entry.md`.

Acceptance:
- Visiting `/workflows/`, `/prompts/`, etc. returns a page with the shared nav rendered.
- `index.html` and `tutorial.html` continue to render exactly as today.

### S1 — Migrate existing tutorial + ship workflows hub (estimated 2-3 days)

Deliverables:
1. Extract shared CSS from `tutorial.html` into the appropriate component CSS files.
2. Move `tutorial.html` → `workflows/comfy-flux2-retouch.html`. Replace `tutorial.html` with a minimal HTML stub that uses `<meta http-equiv="refresh" content="0; url=/workflows/comfy-flux2-retouch.html">` plus a fallback link.
3. Wire up `kb.json` with the migrated entry filled in.
4. Implement `hub.js`: fetches `kb.json`, filters by domain, renders cards.
5. Implement filter bar and tag chips on `/workflows/`.
6. Add the editorial hero to `/workflows/`.
7. Update `index.html` to include the shared nav (replace its inline `<nav>` block).
8. Implement `nav.js`, `footer.js`, `progress.js`, `copy.js`.
9. Implement `cmdk.js` and verify it can search across the seeded entries.
10. Seed **one additional `kb.json` entry** with `status: "planned"` so the hub renders more than one card and filter-chip / search behaviour is observable. This entry is production-visible (counted in cards, searchable, listed in hubs); its purpose is dual — exercise the filter mechanism *and* serve as the first concrete demo of `status: planned` rendering (pink status dot, non-clickable card per §7.2). Suggested values: `id: "comfy-product-scene-builder"`, `domain: "workflows"`, `tags: ["平面组", "ComfyUI"]`, `summary: "占位条目，正式版本将在后续 spec 中落地。"`, `url: "#"`, `phase: 1`, `status: "planned"`. Replace or remove this entry once a real second workflow entry ships in a later spec.

11. Fill in `/assets/js/validate-kb.js` logic per §6.4: required-field check (every entry contains all required fields listed in §6.2), tag-reference check (every tag id in `kb.json` exists in `tags.json`), url-shape check (non-external, non-`#` urls match `/<domain>/<id>.html`), duplicate-id check. On any failure, `console.warn` with the offending entry id and the rule violated. The script self-gates on `location.hostname === 'localhost' || location.hostname === '127.0.0.1'` and returns early on production hostnames.

Acceptance criteria — see §13.

### S2-S5 — Subsequent content domains

**Out of scope for this spec.** Each gets its own design spec when work begins:

- S2 spec — Prompts domain (parameterised templates, copy mechanism, parameter surface).
- S3 spec — Research domain (data-collection workflows, source list).
- S4 spec — Marketing domain (frame templates, narrative structures).
- S5 spec — Resources domain (case library, keyword library, news feed).

---

## 12. Contributor workflow (adding an entry)

Documented in `docs/adding-an-entry.md`. Steps:

1. Pick a slug, e.g., `mj-product-shoot-prompt`. Must be unique across `kb.json`.
2. Add a new object to `/assets/data/kb.json` with all required fields (see §6.1).
3. If the entry has a content page, create `/{domain}/{slug}.html` using the article template (provided in `docs/templates/article-template.html`).
4. If the entry has a thumbnail, drop it in `/assets/img/{slug}-thumb.webp`. Optimal dimensions: 1200×800.
5. If you introduce a new tag, add it to `/assets/data/tags.json` and add a corresponding `[data-hint="…"]` rule in `/assets/css/card.css`.
6. Push to `master`. The site updates within GitHub Pages' standard window.

A future improvement (deferred) is a small Node script that validates `kb.json` and exits non-zero if any required field is missing — runs as a pre-commit check or GitHub Action. Out of scope for v1.

---

## 13. Acceptance criteria for S0 + S1

Each item is independently checkable.

All visual-regression checks below are performed by side-by-side review of the live page against a pre-change screenshot at two viewports: **1440×900** (desktop) and **390×844** (mobile). Acceptance = no human-perceptible regression in layout, type, color, or interactive state. Pixel-perfect tooling is not required.

S0:
- [ ] Visiting `/workflows/index.html` returns 200 with the shared nav and a "Coming soon" placeholder.
- [ ] Visiting `/prompts/index.html`, `/research/index.html`, `/marketing/index.html`, `/resources/index.html`, `/about/index.html` each return 200 with the shared nav.
- [ ] Existing `index.html` still renders the chair (auto-spinning, drag-interactive) with no human-perceptible regression at the two viewports above.
- [ ] Existing `tutorial.html` still renders with no human-perceptible regression.
- [ ] `/assets/data/kb.json` parses as JSON and contains one valid entry whose `id` is `comfy-flux2-retouch`.
- [ ] `/docs/README.md` exists and explains where to add content.

S1:
- [ ] Navigating to `/workflows/` shows two cards: the migrated "Flux.2 产品精修工作流" entry (`status: published`, green dot, clickable) and the seeded placeholder entry from §11 S1 deliverable 10 (`status: planned`, pink dot, rendered as non-anchor `<div>`, no hover lift).
- [ ] Clicking the migrated card navigates to `/workflows/comfy-flux2-retouch.html`.
- [ ] The article page renders with no human-perceptible regression versus the previous `tutorial.html` content.
- [ ] After the nav swap on `/index.html`, the 3D chair still loads, auto-spins, and accepts drag interaction; the new shared nav appears in place of the old inline `<nav>` block; no human-perceptible regression elsewhere.
- [ ] Visiting `/tutorial.html` redirects (via meta refresh) to `/workflows/comfy-flux2-retouch.html` within 1 second.
- [ ] Pressing `Cmd+K` (or `Ctrl+K`) on any page opens the search modal; pressing `/` while focus is not inside an input also opens it; clicking the nav search button opens the same modal; typing "flux" returns the migrated entry; pressing Enter navigates to it; pressing `Esc` closes the modal and returns focus to the trigger.
- [ ] On `/workflows/`, clicking the `ComfyUI` tag chip narrows the grid such that only entries tagged `ComfyUI` remain visible; clicking it again clears the filter.
- [ ] Lighthouse mobile run on `/workflows/` reports LCP ≤ 2.0s and Best Practices ≥ 90.
- [ ] Tabbing through `/workflows/` reaches every interactive element (nav links, search trigger, status pills, tag chips, each card) with a visible focus ring.
- [ ] Resizing browser to 360px wide produces no horizontal scroll on any of: `/`, `/workflows/`, `/workflows/comfy-flux2-retouch.html`, `/about/`.

---

## 14. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Partial-injection nav causes layout flash | Medium | Low | Reserve nav height in CSS via `[data-include="nav"] { height: var(--nav-height) }` |
| `kb.json` grows past 100KB | Low (12-month horizon) | Medium | Re-evaluate to SSG when threshold hit; spec already names trigger |
| Search modal feels sluggish on mobile | Medium | Medium | Keep search algorithm O(n) and entries < 50; defer fuzzy library until needed |
| Visual drift between editorial and glass modes | Medium | Medium | One token file is the only source of color/space/motion |
| Existing inbound links to `/tutorial.html` break | High if moved without redirect | High | Keep stub redirect file; do not delete the URL |
| GitHub Pages caching delays surface stale data | Low | Low | No mitigation needed; cadence acceptable |
| Contributor edits malformed JSON | Medium | Medium | `validate-kb.js` console warning in dev; future pre-commit hook |

---

## 15. Out of scope (explicit)

- Light theme.
- Bilingual UI.
- User accounts.
- Search backed by Algolia / Pagefind.
- Sitemap, RSS, structured data.
- Analytics.
- Service worker / offline.
- Auto-deploy via GitHub Actions.
- A real CMS surface for non-engineers (the JSON edit is the surface).
- Pre-commit validation hooks.
- Migration of all four future content domains (only S0 + S1 are in this spec).

---

## 16. Decisions (resolved from initial open questions)

All 8 questions raised during the brainstorming pass have been resolved. Answers are recorded here so reviewers see decided state rather than pending state.

- D1. **Repository / git workflow.** No `git init` in the local working tree. The local copy at `C:\Users\jiangxinhai\Desktop\CORVIN\CHIANGANGSTER.github.io-master` is treated as a write-only working folder; the author previews changes in a local browser and uploads to the canonical repo (https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io) manually when satisfied. Implementation plan steps will therefore not include `git commit` actions; verification gates are browser-based smoke checks.
- D2. **Nav brand mark.** Plain text wordmark `CHIANGANGSTER` rendered in `Compressa VF`, all caps, font-size 14px, weight 400, letter-spacing 0.1em. No logo image.
- D3. **Domain hero motifs.** Home keeps the existing 3D chair. Domain hubs in S1 use oversized typography only — no per-domain visual motif. Per-domain motifs may be added in subsequent specs but are not required.
- D4. **Tag color hints.** `hint` field on each tag drives a CSS attribute selector (`[data-hint="comfy"]`). Hints are open strings (constraint: lowercase ASCII + hyphens). Adding a hint requires adding one CSS rule. No closed enum.
- D5. **Filter URL state.** Filter selections are NOT reflected in the URL in v1. Sharing pre-filtered hub views is deferred. Implementation must keep filter state in plain JS variables, not in `history.pushState`, so the future migration is purely additive.
- D6. **Footer "last updated" stamp.** A single constant `BUILD_DATE` exported from `/assets/js/footer.js`, bumped manually on each deploy. No per-page meta scraping.
- D7. **Reduced-motion override on home.** Under `prefers-reduced-motion: reduce`, the chair stops its auto-spin loop but the drag-to-rotate interaction remains available. Hero scroll-driven rotation is also disabled.
- D8. **Search trigger keys.** Primary: `Cmd+K` / `Ctrl+K`. Supplementary: `/` (industry KB convention — GitHub, Linear, Notion, Vercel/Stripe docs all support both modifier-K and slash). No IME-specific alternative is needed because both triggers fire correctly under composition state in all target browsers. The `keydown` handler matches `(e.metaKey || e.ctrlKey) && e.key === 'k'` for the modifier path and `e.key === '/'` for the slash path, both gated on the active element not being an `<input>` / `<textarea>` / `[contenteditable]`. A `e.code === 'KeyK'` fallback is also accepted for keyboard-layout safety.

---

## 17. References

- Existing assets: `index.html` (editorial home with Three.js chair), `tutorial.html` (glass-mode workflow article).
- Existing typography: `Inter`, `Roboto Flex`, `Compressa VF`, `AaFengKuangYuanShiRen` (already loaded in current pages).
- Brainstorming methodology: superpowers plugin v5.0.7 (read manually; not registered as a callable skill in this session).
- WCAG 2.1 quick reference: <https://www.w3.org/WAI/WCAG21/quickref/>

---

## Appendix A — Minimal `kb.json` seed for S1

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

## Appendix B — Minimal `tags.json` seed for S1

```json
{
  "tags": [
    { "id": "平面组",     "label": "平面组",     "group": "team", "hint": "graphic" },
    { "id": "3D 渲染组",  "label": "3D 渲染组",  "group": "team", "hint": "render" },
    { "id": "摄制组",     "label": "摄制组",     "group": "team", "hint": "video" },
    { "id": "产品设计组", "label": "产品设计组", "group": "team", "hint": "product" },
    { "id": "ComfyUI",   "label": "ComfyUI",    "group": "tool", "hint": "comfy" },
    { "id": "Flux",      "label": "Flux",       "group": "tool", "hint": "flux" },
    { "id": "Midjourney","label": "Midjourney", "group": "tool", "hint": "mj" },
    { "id": "Stable Diffusion", "label": "Stable Diffusion", "group": "tool", "hint": "sd" }
  ]
}
```

## Appendix C — Article template skeleton (`docs/templates/article-template.html`)

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

---

*End of spec. Cross-AI reviewers: please flag CRITICAL or HIGH issues against the categories in §13 (acceptance) or §10 (performance) directly. Open Questions in §16 are author-decisions, not review items.*


