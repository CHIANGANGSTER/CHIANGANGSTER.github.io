# Site Navigation Bar — Design Spec

Date: 2026-06-22
Status: Approved (design), pending implementation plan

## Goal

Add one consistent top navigation bar to every live page of the static site
`chiangangster.github.io`. The homepage (`/index.html`) currently has no top
nav and must get one. Subpages already have a `← HOME` back-link
(`<nav class="glass-page-nav">`); the new bar sits **above** that back-link,
which is preserved.

The bar's interactions are ported from two React Bits components:
- **Hover effect** = PillNav (pill fill circle + label slide).
- **Click effect** = GooeyNav (white/grey particle burst at the clicked pill).

No brand text (`CHIANGANGSTER`) anywhere.

## Constraints

- Site is **plain static HTML, no build step, no React, no bundler.**
- Site is served at the **root domain** (GitHub Pages) — absolute paths work.
- Site visual language is fixed: **black / dark / glass / minimal-tech, no
  colored theme** (see `assets/css/tokens.css` lines 48-55). The nav must obey
  this — neutral only, no rainbow particle colors.
- React Bits `PillNav` / `GooeyNav` are React + JSX + GSAP (PillNav also uses
  `react-router-dom`). They cannot be dropped in; they must be **ported to
  vanilla JS**, with GSAP loaded from CDN.
- `PillNav` and `GooeyNav` are two separate nav components with conflicting
  DOM/CSS. We do **not** run both. We build one custom vanilla component:
  **PillNav as the base bar, with GooeyNav's click particle burst grafted on.**

## Architecture

Injection mechanism (decision: JS injection — single source of truth):

- New `assets/js/site-nav.js` — renders the nav DOM and wires all behavior.
- New `assets/css/site-nav.css` — nav styling, tokens-based.
- GSAP via CDN `<script defer>` (PillNav hover timelines depend on it).
- Each live page gets exactly two added lines:
  - `<head>`: `<link rel="stylesheet" href="/assets/css/site-nav.css">`
  - before `</body>`: GSAP CDN `<script defer>` + `<script defer src="/assets/js/site-nav.js"></script>`
- `site-nav.js` injects the nav as the **first child of `<body>`**, so on
  subpages it lands above the existing `<nav class="glass-page-nav">`.

The nav HTML/data lives only in `site-nav.js`. Editing links = one file, whole
site updates. Adding a future page = paste the same two lines.

## Component: `site-nav.js` (vanilla port)

Single self-initializing module. Responsibilities:

1. **Render** the pill bar from a static `items` array.
2. **Hover (PillNav port):** per-pill GSAP timeline — fill circle scales up from
   the bottom, base label slides up, hover label slides in. Replaces
   `react-router-dom` `<Link>` with native `<a>`. Recomputes geometry on resize
   and on `document.fonts.ready`.
3. **Click (GooeyNav port):** on pill click, spawn white/grey particle burst
   (SVG blur filter) at the clicked pill, then allow normal navigation (the
   burst is a departure flourish; default `<a>` navigation is not prevented).
   Particle colors are neutral — the original `--color-1..4` rainbow is dropped.
4. **Active state:** read `location.pathname`, match against item hrefs, add
   `is-active` to the current item.
5. **Mobile:** hamburger button + popover menu (from PillNav), opening/closing
   with GSAP.

### Items (data)

```
Home       → /
Workflows  → /workflows/
Prompts    → /prompts/
Research   → /research/
Marketing  → /marketing/
Resources  → /resources/
About      → /about/
```

Order is fixed: Workflows before Prompts. `tutorial.html` is intentionally
omitted. Hrefs are absolute (root-domain).

### Active-path matching

- `/` matches only the homepage.
- `/workflows/` matches `/workflows/` and any `/workflows/<sub>/` page (workflow
  detail pages highlight "Workflows").
- Other sections match their path prefix.

## Styling: `site-nav.css`

All values from `assets/css/tokens.css` — no new palette.

- Base bar: `background: rgba(255,255,255,0.06)`, `border: var(--border)`,
  `backdrop-filter: blur(...)`, pill radius `9999px`.
- Pill text: `--text-secondary`; hover/active text: `--text-primary`.
- Hover fill circle: pale white glass (not a bright color).
- Gooey particles: white / grey scale only.
- Respect `prefers-reduced-motion`: disable hover timelines and particle burst,
  keep a plain color transition.

## Positioning

- `position: sticky; top: 0;` centered horizontally.
- `z-index: var(--z-dropdown)` (100) — above `glass-page-nav`
  (`--z-nav` = 50).
- **Subpages:** new bar is the topmost element; existing `glass-page-nav`
  (`← HOME` + section label) shifts below it and is kept as-is.
- **Homepage:** bar floats over the dark (`#111`) content. The boot mask
  (`#boot-mask`, z `2147483647`) stays above the nav so the startup animation is
  not blocked; the nav becomes visible once boot completes.

## Pages in scope (14 live)

`index.html`, `tutorial.html`,
`about/index.html`, `marketing/index.html`, `prompts/index.html`,
`research/index.html`, `resources/index.html`, `workflows/index.html`,
and the 5 workflow detail pages:
`workflows/comfy-flux2-retouch/index.html`,
`workflows/flux2-klein-light-fusion/index.html`,
`workflows/flux2-klein-text-to-image/index.html`,
`workflows/multi-model-image-workflows/index.html`,
`workflows/view-angle-transform/index.html`.

Excluded: `*.backup-*.html`, `index.html.backup-*`, anything under `_tmp`,
and `docs/templates/article-template.html` (template, not a live page) — though
the template MAY be updated so future pages inherit the two lines (optional,
flagged in plan).

Note: `workflows/comfy-flux2-retouch.html` (flat duplicate of the
`comfy-flux2-retouch/` directory page) — confirm during planning whether it is
live; if yes, include it; if a stale duplicate, leave it.

## Verification

Per page:
- Nav renders and is visible.
- All 7 links present, correct hrefs, navigate correctly.
- Current page is highlighted (`is-active`).
- Hover animates the pill fill.
- Click triggers the particle burst, then navigates.
- Mobile: hamburger opens/closes the popover.
- Subpages: `← HOME` still present, directly below the new bar.
- Homepage: boot animation not obscured; nav appears after boot.
- `prefers-reduced-motion`: animations suppressed, nav still usable.

## Out of scope

- No redesign of existing page content or the `glass-page-nav` back-link.
- No new colored theme.
- No `tutorial.html` link in the nav.
- No server/build tooling changes.
