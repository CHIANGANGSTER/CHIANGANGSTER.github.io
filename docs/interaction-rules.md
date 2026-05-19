# Interaction Rules

Use these rules for all new knowledge-base pages unless a later decision explicitly overrides them.

## Home Return

- Any `HOME` / `← HOME` link on a subpage points to `/?home=archive`.
- Returning from a subpage must skip the click-to-enter intro state.
- The home page should land on the archive/domain navigation section, so the user immediately sees the page jump links.

## Modal And Image Preview

- Card clicks open the card/detail view.
- Image clicks open the full-size image preview.
- Detail modals and full-size image previews use the same opening language as `workflows/comfy-flux2-retouch.html`:
  - liquid-glass / frosted-glass backdrop;
  - centered scale-in animation;
  - click backdrop or press `Esc` to close;
  - lock `html` and `body` scrolling while the overlay is open.

## Scrolling

- Content pages use the same smooth wheel behavior as the chair home page.
- New static content pages should load `/assets/js/smooth-scroll.js` unless they already implement the same clamped wheel delta and interpolated scroll position locally.
- Modal and image-preview overlays must prevent wheel events from passing through to the page.
- Long scrollable text boxes inside modals, such as Prompt Detail `PROMPT` and `JSON PROMPT`, use the same smooth wheel logic as the page: clamped wheel delta, interpolated scroll position, and no wheel event leaking to the background page.

## BlurText Reveal

- Project-wide text reveal means the home-page BlurText effect, adapted from React Bits `BlurText`.
- Use the vanilla HTML/CSS equivalent already used by the chair home page, not a separate page-specific reveal:
  - source state: `opacity: 0`, `filter: blur(10px)`, `transform: translateY(-50px)`;
  - final state: `opacity: 1`, `filter: blur(0)`, `transform: translateY(0)`;
  - per-segment transition: `0.35s linear`;
  - stagger: `200ms` per word or segment through `--blur-delay`, matching the chair home page delay;
  - trigger: `IntersectionObserver` with `threshold: 0.18` and `rootMargin: 0px 0px -8% 0px`.
- Use `[data-blur-text]` for normal text and `.blur-text-manual` only when inline styling must be preserved, such as the red/blue `YAHEETECH` split.
- Do not tune BlurText delay per page; future pages inherit the same `200ms` delay unless the home page itself changes.
- If a user asks for "逐行动画", "BlurText", or "和首页一样的逐行动画", this rule applies unless they explicitly request a different animation.

## Line And Card Reveal

- When page copy should appear line by line, wrap each visual line in `.line-reveal-item` inside `.line-reveal` and load `/assets/css/reveal-motion.css` plus `/assets/js/reveal-motion.js`.
- Card modules on content pages use the shared upward slide reveal from `/assets/js/reveal-motion.js`.
- The shared card reveal targets `.kb-card`, `.prompt-card`, `.tech-card`, `.step-card`, `.shortcut-item`, `.qa-card`, `.workflow-note-card`, `.stage-card`, `.compliance-box`, and `.comparison-item`.
- Future pages should reuse this shared reveal instead of hand-writing page-specific card entrance animations.
