---
title: Knowledge Base Redesign - Implementation Plan
date: 2026-04-27
status: ready for implementation
spec: docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md
approved_review: docs/superpowers/reviews/2026-04-27-codex-gpt-5-round-3.md
scope: S0 scaffolding + S1 workflows hub and tutorial migration
---

# Knowledge Base Redesign - Implementation Plan

## 0. Guardrails

- Do not introduce a build step, framework, package manager, or new external CDN runtime dependency.
- Do not add git commit / push steps. This local folder is a write-only working copy; verification is browser-based.
- Preserve current `index.html` chair behavior and current `tutorial.html` visual output until the S1 migration step replaces `tutorial.html` with a redirect stub.
- Keep all new shared JS under `/assets/js/*.js`; total new JS budget is 25KB minified, excluding existing home-page Three.js / UnicornStudio code.
- Use absolute-root URLs (`/assets/...`, `/workflows/...`) so GitHub Pages serves the same paths as local `python -m http.server`.

## 1. Implementation Sequence

### S0 - Scaffolding

1. Create shared directories:
   - `/assets/css/`
   - `/assets/js/`
   - `/assets/data/`
   - `/assets/img/`
   - `/assets/fonts/` only if needed for future migrated font assets; existing `/fonts/` remains valid for S0/S1
   - `/workflows/`, `/prompts/`, `/research/`, `/marketing/`, `/resources/`, `/about/`
   - `/docs/templates/`

2. Create CSS shell:
   - `/assets/css/tokens.css` with all tokens from spec §4.3-§4.5 plus `--nav-height`.
   - `/assets/css/base.css`, `nav.css`, `card.css`, `hub.css`, `article.css`, `editorial.css`, `cmdk.css`.
   - Non-token CSS files may start minimal, but must include component ownership comments.

3. Create JS shell:
   - `/assets/js/nav.js`
   - `/assets/js/footer.js`
   - `/assets/js/hub.js`
   - `/assets/js/cmdk.js`
   - `/assets/js/copy.js`
   - `/assets/js/progress.js`
   - `/assets/js/validate-kb.js`

4. Seed data:
   - `/assets/data/kb.json` with one `comfy-flux2-retouch` entry.
   - `/assets/data/tags.json` from Appendix B.
   - Keep JSON strict, not JSONC.

5. Create placeholder pages:
   - Each domain `index.html` gets a valid document shell, shared CSS links, `<a class="skip-link">`, `<div data-include="nav"></div>`, `<main id="main">`, a "Coming soon" placeholder, `<div data-include="footer"></div>`, and nav/footer scripts.
   - `/workflows/index.html` can be a placeholder in S0; it becomes the real hub in S1.

6. Create contributor docs:
   - `/docs/README.md`: repository map, local preview command, where data/content lives.
   - `/docs/adding-an-entry.md`: step-by-step entry creation workflow.
   - `/docs/templates/article-template.html`: copy Appendix C into a real template file, corrected to valid HTML.

7. S0 verification:
   - Run a local server: `python -m http.server 8000`.
   - Visit `/workflows/index.html`, `/prompts/index.html`, `/research/index.html`, `/marketing/index.html`, `/resources/index.html`, `/about/index.html`.
   - Confirm shared nav renders on each placeholder page.
   - Confirm `index.html` and `tutorial.html` still render as before.
   - Confirm `/assets/data/kb.json` parses as JSON.

### S1 - Tutorial Migration And Workflows Hub

1. Extract shared styles:
   - Move reusable tutorial tokens and base typography into `tokens.css` / `base.css`.
   - Move content-page glass cards, chapter styles, image captions, code/callout styles into `article.css`.
   - Keep migration conservative; do not redesign article content during extraction.

2. Migrate tutorial page:
   - Copy current `tutorial.html` to `/workflows/comfy-flux2-retouch.html`.
   - Replace its inline nav with shared nav include.
   - Add footer include if it does not disturb visual regression.
   - Replace original root `/tutorial.html` with a meta-refresh redirect stub plus fallback link.

3. Implement shared nav:
   - `nav.js` injects brand, five domain links, search icon button, About link, and mobile hamburger drawer.
   - Active state uses `location.pathname.startsWith()`.
   - Search button dispatches/opens the same modal as keyboard triggers.
   - Mobile keeps search visible next to the hamburger.

4. Implement footer:
   - `footer.js` injects copyright, repo link, and manual `BUILD_DATE`.
   - Keep footer minimal and non-blocking.

5. Implement cards and hub:
   - `hub.js` fetches `/assets/data/kb.json` and `/assets/data/tags.json`.
   - Determine current domain from pathname.
   - Render hero count, status pills, tag chips, phase filter, grid, and empty state.
   - Published/testing cards render as `<a>`.
   - Planned/archived or `url === "#"` cards render as non-anchor `<div role="article">` with no hover lift.
   - Filtering: status single-select, tags multi-select OR, title substring search.

6. Seed second workflow entry:
   - Add `comfy-product-scene-builder` to `kb.json`.
   - `status: "planned"`, `url: "#"`, tags include `平面组` and `ComfyUI`.
   - Verify it appears on `/workflows/`, is searchable, and renders as pink non-interactive planned card.

7. Implement CmdK:
   - `cmdk.js` opens on `Cmd/Ctrl+K`, `/`, and nav search button.
   - Ignore keyboard triggers when active element is input/textarea/contenteditable.
   - Lazy-load and cache `kb.json` in `window.__kbIndex`.
   - Empty query shows five most recently updated entries.
   - Query scoring follows spec §7.6.
   - Modal traps focus, closes on Esc, restores focus to trigger, and Enter navigates selected interactive result.

8. Implement supporting JS:
   - `progress.js`: requestAnimationFrame-throttled reading progress for content pages.
   - `copy.js`: attach copy buttons to `<pre data-copyable>`, with clipboard fallback.
   - `validate-kb.js`: localhost-only required fields, tag references, url shape, duplicate ids.

9. Update home:
   - Replace inline root `index.html` nav with shared nav include.
   - Preserve chair canvas, importmap, UnicornStudio, existing scripts, and start tutorial transition.
   - Update "START TUTORIAL" href only if the redirect stub is insufficient for UX; otherwise leave it pointed at `/tutorial.html` to exercise redirect compatibility.

10. S1 verification:
   - Local server smoke test for `/`, `/workflows/`, `/workflows/comfy-flux2-retouch.html`, `/tutorial.html`, `/about/`.
   - Compare pre-change screenshots at `1440x900` and `390x844`.
   - At 360px width, confirm no horizontal scroll on `/`, `/workflows/`, `/workflows/comfy-flux2-retouch.html`, `/about/`.
   - Tab through `/workflows/`; every interactive element has visible focus.
   - Test `Cmd/Ctrl+K`, `/`, and nav search button.
   - Test `ComfyUI` tag chip toggle.
   - Run Lighthouse mobile on `/workflows/`; target LCP <= 2.0s and Best Practices >= 90.

## 2. Acceptance Mapping

| Spec acceptance | Plan steps |
|-----------------|------------|
| Placeholder domain pages render shared nav | S0.5-S0.7 |
| Existing home and tutorial preserve visuals | S0.7, S1.1-S1.2, S1.9-S1.10 |
| Valid `kb.json` with migrated entry | S0.4, S1.6, S1.8 |
| `/workflows/` shows published + planned cards | S1.5-S1.6 |
| Migrated card navigates to article | S1.5, S1.10 |
| `/tutorial.html` redirects within 1 second | S1.2, S1.10 |
| Search modal works by keyboard and nav button | S1.3, S1.7, S1.10 |
| Tag filter narrows workflow cards | S1.5, S1.10 |
| Lighthouse and mobile no-overflow checks | S1.10 |

## 3. Implementation Notes

- Preserve current image paths used by `tutorial.html`; do not move `tutorial-imgs/`, `comfyui-workflow.png`, `flux2-product-retouch-v1.0.json`, `double-chair.glb`, or `mtc_dark.webp` in S1.
- If absolute `/fonts/...` paths already work locally and on GitHub Pages, keep them. Do not duplicate fonts under `/assets/fonts/` unless a later cleanup spec requires it.
- If the planned card appears in CmdK results, pressing Enter on it should not navigate to `#`; show it as disabled/non-navigable in the result row, or ignore Enter for that selected row.
- Do not implement URL filter state, sitemap, RSS, analytics, pre-commit hooks, service worker, or future domain content.

## 4. Done Definition

The implementation is done when every S0/S1 acceptance item in spec §13 passes locally, `docs/README.md` and `docs/adding-an-entry.md` exist, and the approved review remains valid without new blocking contradictions introduced by implementation-specific choices.


