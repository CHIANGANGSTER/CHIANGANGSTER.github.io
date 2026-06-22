# Site Navigation Bar — Design Spec

Date: 2026-06-22
Status: Approved (design), pending implementation plan

## Goal

Add one consistent top navigation bar to every live content page of the static
site `chiangangster.github.io`. The homepage (`/` and `/index.html`) currently
has no top nav and must get one. Existing page-local back-links are preserved,
including `.glass-page-nav`, `.prompt-nav`, and workflow detail `.nav` bars.
The new bar sits above those page-local bars.

The bar's interactions are ported from two React Bits components:
- **Hover effect** = PillNav (pill fill circle + label slide).
- **Click effect** = GooeyNav (white/grey particle burst at the clicked pill).

No brand text (`CHIANGANGSTER`) anywhere.

## Constraints

- Site is **plain static HTML, no build step, no React, no bundler.**
- Site is served at the **root domain** (GitHub Pages) — absolute paths work.
- Site visual language is fixed: **black / dark / glass / minimal-tech, no
  colored theme** (see `assets/css/tokens.css` lines 48-55). The nav must obey
  this: neutral only, no rainbow particle colors.
- React Bits `PillNav` / `GooeyNav` are React + JSX + GSAP (PillNav also uses
  `react-router-dom`). They cannot be dropped in; they must be **ported to
  vanilla JS**, with GSAP loaded from CDN.
- `PillNav` and `GooeyNav` are two separate nav components with conflicting
  DOM/CSS. We do **not** run both. We build one custom vanilla component:
  **PillNav as the base bar, with GooeyNav's click particle burst grafted on.**

## Architecture

Injection mechanism (decision: JS injection, single source of truth):

- New `assets/js/site-nav.js`: renders the nav DOM and wires all behavior.
- New `assets/css/site-nav.css`: nav styling, tokens-based.
- GSAP powers PillNav hover timelines. See **GSAP delivery** below.
- Each live content page gets these added lines:
  - `<head>`: `<link rel="stylesheet" href="/assets/css/site-nav.css">`
  - before `</body>`, in this order:
    `<script defer src="/assets/js/vendor/gsap.min.js"></script>`
    then `<script defer src="/assets/js/site-nav.js"></script>`

### GSAP delivery

- **Self-host, pinned.** Vendor GSAP **3.12.5** to
  `assets/js/vendor/gsap.min.js` (download from
  `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`). Self-hosting
  matches the site's web-security preference (no third-party runtime origin, no
  SRI bookkeeping) and keeps the site working offline / behind strict CSP.
- **Script order is load-bearing.** `site-nav.js` references the global `gsap`.
  Both tags use `defer`, and deferred scripts execute in document order, so the
  GSAP tag MUST appear **before** the `site-nav.js` tag on every page. Reversed
  order throws `gsap is not defined`.
- `site-nav.js` must also guard: if `window.gsap` is missing, skip the hover/
  particle timelines and fall back to the plain CSS color transition (nav still
  renders and navigates).
- `site-nav.js` injects the nav near the top of `<body>`, but must preserve
  skip-link order. If a page has `.skip-link`, insert the nav **after** the
  skip-link and before the page-local nav. If there is no `.skip-link`, insert
  it as the first body child.
- `site-nav.js` adds `body.has-site-nav` after injection. CSS uses this hook to
  offset existing fixed page-local bars.

The nav HTML/data lives only in `site-nav.js`. Editing links = one file, whole
site updates. Adding a future page = paste the same two lines.

### Existing page types

Do not assume every subpage uses `.glass-page-nav`.

- Stub/hub pages (`about`, `marketing`, `research`, `resources`, `workflows`)
  use `<nav class="glass-page-nav">`.
- `prompts/index.html` uses `<nav class="prompt-nav">`.
- Workflow detail pages use `<nav class="nav">` with `← WORKFLOWS`.
- `tutorial.html` and `workflows/comfy-flux2-retouch.html` are redirect pages.
  Do not add the new nav to redirect-only pages unless the redirect behavior is
  removed.

## Component: `site-nav.js` (vanilla port)

Single self-initializing module. Responsibilities:

1. **Render** the pill bar from a static `items` array.
2. **Hover (PillNav port):** per-pill GSAP timeline — fill circle scales up from
   the bottom, base label slides up, hover label slides in. Replaces
   `react-router-dom` `<Link>` with native `<a>`. Recomputes geometry on resize
   and on `document.fonts.ready`.
3. **Click (GooeyNav port):** on pill click, spawn white/grey particle burst
   (SVG blur filter) at the clicked pill, then navigate. For same-origin normal
   left-clicks, prevent default briefly, play the burst for roughly 150-250ms,
   then set `location.href`. Preserve browser defaults for Cmd/Ctrl-click,
   Shift-click, Alt-click, middle-click, right-click, downloads, and external
   links. Particle colors are neutral; drop the original `--color-1..4`
   rainbow.
   - **SVG filter is a singleton.** The gooey blur uses one SVG `<filter>`
     element with a fixed `id`. Inject exactly one such `<svg>`/`filter` for the
     whole page (e.g. once when the nav mounts) and reuse it for every pill —
     never one filter per pill, or the duplicated `id`s collide and the effect
     breaks.
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

- `/` and `/index.html` match only the homepage.
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
- `z-index: var(--z-dropdown)` (100): above `glass-page-nav`
  (`--z-nav` = 50).
- Define `--site-nav-height` in `site-nav.css`. Use it to offset existing
  page-local fixed nav bars:
  - `.glass-page-nav { top: var(--site-nav-height); }`
  - `.prompt-nav { top: var(--site-nav-height); }`
  - workflow detail `.nav { top: var(--site-nav-height); }`
- Update any sticky controls that currently assume the old 56px top bar. Example:
  `prompts/index.html` has `.prompt-toolbar { top: 56px; }`; after the new nav,
  it should use `calc(var(--site-nav-height) + 56px)` or the final stacked
  offset.
- **Subpages:** new bar is the topmost nav. Existing page-local back-links
  (`← HOME` or `← WORKFLOWS` + section label) are kept and explicitly offset
  below it.
- **Homepage:** bar floats over the dark (`#111`) content. The boot mask
  (`#boot-mask`, z `2147483647`) stays above the nav so the startup animation is
  not blocked; the nav becomes visible once boot completes.

## Pages in scope

### Live content pages (12)

`index.html`,
`about/index.html`, `marketing/index.html`, `prompts/index.html`,
`research/index.html`, `resources/index.html`, `workflows/index.html`,
and the 5 workflow detail pages:
`workflows/comfy-flux2-retouch/index.html`,
`workflows/flux2-klein-light-fusion/index.html`,
`workflows/flux2-klein-text-to-image/index.html`,
`workflows/multi-model-image-workflows/index.html`,
`workflows/view-angle-transform/index.html`.

### Redirect pages (excluded from nav injection)

- `tutorial.html`: redirects to `/workflows/comfy-flux2-retouch/`.
- `workflows/comfy-flux2-retouch.html`: redirects to
  `/workflows/comfy-flux2-retouch/`.

Excluded: `*.backup-*.html`, `index.html.backup-*`, anything under `_tmp`,
and `docs/templates/article-template.html` (template, not a live page), though
the template MAY be updated so future pages inherit the two lines (optional,
flagged in plan).

## Verification

Per page:
- Nav renders and is visible.
- All 7 links present, correct hrefs, navigate correctly.
- Current page is highlighted (`is-active`).
- Hover animates the pill fill.
- Click triggers the particle burst, then navigates.
- Mobile: hamburger opens/closes the popover.
- Subpages: existing page-local nav (`← HOME` or `← WORKFLOWS`) still present,
  visually below the new bar, with no overlap.
- Pages with `.skip-link`: the skip link remains the first keyboard shortcut to
  the main content.
- Homepage: boot animation not obscured; nav appears after boot.
- `prefers-reduced-motion`: animations suppressed, nav still usable.

## Out of scope

- No redesign of existing page content or the `glass-page-nav` back-link.
- No new colored theme.
- No `tutorial.html` link in the nav.
- No server/build tooling changes.

