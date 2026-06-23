# Site Navigation Implementation Change Report

Date: 2026-06-22
Status: Implemented locally, not committed
Scope: Static site navigation, homepage return behavior, homepage archive removal, GooeyNav click effect

## Summary

This update fixes the site-wide top navigation behavior and visual interaction issues found during local browser review.

The navigation now uses a single injected component from `assets/js/site-nav.js` and `assets/css/site-nav.css`, with bilingual labels and a React Bits-style GooeyNav click effect. Secondary pages now route `HOME 主页` back to the entered chair hero state instead of the removed archive/domain-navigation module.

## User-Facing Behavior Changes

- `HOME 主页` now links to `/?home=hero`.
- On homepage load with `?home=hero`, the page immediately cleans the URL back to `/`.
- Entering from secondary pages lands at the chair hero top, not the old archive/module area.
- Direct address-bar entry to `/` still shows the normal `click to enter` entry screen.
- Refreshing `/` still returns to the normal entry flow.
- The old homepage archive/domain module containing `COMFYUI WORKFLOWS`, `PROMPTS`, `RESEARCH`, `MARKETING`, and `RESOURCES` has been removed from the live homepage markup.
- Site nav labels are bilingual and ordered as:
  - `HOME 主页`
  - `WORKFLOWS 工作流`
  - `PROMPTS 提示词`
  - `RESEARCH 研究`
  - `MARKETING 营销`
  - `RESOURCES 资源`
- `ABOUT` is not included in the top navigation.
- Secondary pages with existing glass top bars now hide their old page-local nav and use the unified top navigation on the same glass layer.

## Navigation Implementation

Primary files:

- `assets/js/site-nav.js`
- `assets/css/site-nav.css`
- `assets/js/vendor/gsap.min.js`
- `assets/js/nav.js` legacy include compatibility update

Key implementation points:

- `assets/js/site-nav.js` now injects the unified top nav.
- `HOME 主页` uses `/?home=hero` instead of `/?home=archive`.
- Navigation labels are bilingual in the JS source.
- The component detects page-local glass nav elements and applies `site-nav--glass-page` behavior.
- Old page-local nav elements are hidden when unified nav is present.
- Cache-busting was updated to `20260622-gooey-reactbits-homehero` across injected pages.

## GooeyNav Click Effect

The previous custom ring/glow burst was removed.

The click effect now follows the React Bits GooeyNav structure more closely:

- `site-nav__goo-filter`
- `site-nav__goo-text`
- `site-nav__goo-particle`
- `site-nav__goo-point`

Configured Gooey parameters:

- Particle Count: `15`
- Animation Variance: `300`
- Radius Factor: `100`
- Animation Time: `600ms`
- Particle Distances: `[90, 10]`

Removed old ad-hoc classes:

- `site-nav__particles`
- `site-nav__particle`
- `site-nav__goo-burst`
- `site-nav__goo-ring`
- `is-clicking`

## Homepage Changes

Primary file:

- `index.html`

Changes:

- Added/kept `window.__HOME_RETURN_HERO` handling for `?home=hero`.
- `?home=hero` is cleaned with `history.replaceState(null, '', '/')`.
- Removed archive return events and scroll-to-archive behavior.
- Deleted the old archive/domain-navigation section from live homepage markup.
- Removed archive-related CSS block from homepage styles.
- Chair transparency logic was kept as a fixed-position fade near the Unicorn module.
- Old `archiveFly` naming was cleaned to `chairFade` for the chair fade behavior.

## Pages Updated With Cache-Busted Nav References

The following live pages now reference:

- `/assets/css/site-nav.css?v=20260622-gooey-reactbits-homehero`
- `/assets/js/site-nav.js?v=20260622-gooey-reactbits-homehero`

Updated pages:

- `index.html`
- `about/index.html`
- `marketing/index.html`
- `prompts/index.html`
- `research/index.html`
- `resources/index.html`
- `workflows/index.html`
- `workflows/comfy-flux2-retouch/index.html`
- `workflows/flux2-klein-light-fusion/index.html`
- `workflows/flux2-klein-text-to-image/index.html`
- `workflows/multi-model-image-workflows/index.html`
- `workflows/view-angle-transform/index.html`

## Verification Performed

Static checks:

- `node --check assets/js/site-nav.js` passed.
- `node --check assets/js/nav.js` passed.
- Searched and confirmed no live references remain for:
  - `home=archive`
  - `archive-behind`
  - `archive-front`
  - `home:return-archive`
  - `COMFYUI WORKFLOWS`
  - `site-nav__particles`
  - `site-nav__goo-burst`
  - `site-nav__goo-ring`
  - `is-clicking`

Browser checks on `http://localhost:8080/`:

- `workflows/` renders unified nav with 6 bilingual items.
- Clicking `WORKFLOWS 工作流` creates 15 Gooey particles.
- From `workflows/`, clicking `HOME 主页` returns to `http://localhost:8080/`.
- Returned homepage has `scrollY = 0` and does not contain the old `COMFYUI WORKFLOWS` archive title.
- `prompts/` uses `HOME 主页` as `/?home=hero` and has the glass nav background active.
- `workflows/flux2-klein-light-fusion/` uses `HOME 主页` as `/?home=hero` and has the glass nav background active.

Observed browser verification values:

```json
{
  "gooeyParticles": 15,
  "homeHref": "/?home=hero",
  "homeReturnUrl": "http://localhost:8080/",
  "containsOldArchiveTitle": false,
  "scrollY": 0,
  "navCount": 6
}
```

## Git / Commit State

No commit was created.

Current relevant changed files include:

- `assets/js/site-nav.js`
- `assets/css/site-nav.css`
- `assets/js/nav.js`
- `index.html`
- the HTML pages listed above with cache-busted nav references

Known unrelated/pre-existing worktree entries were left untouched:

- `assets/js/reveal-motion.js`
- `.codegraph/`
- `.serena/`

## Notes

`assets/js/vendor/gsap.min.js` is present as the self-hosted GSAP runtime used by the navigation animation.

The report documents local implementation state only. Final commit should wait for visual confirmation.