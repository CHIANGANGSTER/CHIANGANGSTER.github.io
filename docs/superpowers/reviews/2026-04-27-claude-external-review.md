# Spec Review — Claude Self-Review — 2026-04-28

**Status:** Approved

## Issues (blocking — must be addressed before implementation planning)

None found.

## Recommendations (advisory — do not block approval)

- Baseline screenshots before S1: Take pre-change screenshots of `index.html` and `tutorial.html` at both 1440×900 and 390×844 before beginning implementation. The spec says "no human-perceptible regression" but has no photographic reference to verify against.
- `planned` card in CmdK results: If a user opens search and the planned entry appears in results, pressing Enter should not navigate to `#`. Ensure the CmdK result renderer treats `url === "#"` as non-navigable (skip or disable the row). The plan mentions this; flagging it here as an explicit verification item.

## Confirmations (optional, for the author's confidence)

### Completeness

- No TODOs, TBDs, or placeholders remain in the spec body. All deferred items have explicit `[DEFERRED → spec-N]` markers pointing to named future specs (S2–S5).
- §16 documents all 8 resolved open questions; no unresolved questions remain.
- §13 acceptance criteria are all independently testable without the author's involvement.

### Consistency

- `status` enum (`published | testing | planned | archived`) is used consistently across §4.3 color mapping, §7.2 card variants, §11 S1 deliverable 10, §13 acceptance criteria, and the `kb.json` seed. `planned → --accent-pink` is now consistent.
- `phase` is an integer (1–4), rendered as a separate badge — not mixed into free-form tag chips. No cross-contamination with the tag taxonomy.
- URL shape rule (non-external, non-`#` entries must match `/<domain>/<id>.html`) is enforced in §6.4 validation logic and reflected in the plan.
- Search trigger is consistent: Cmd/Ctrl+K + `/` + nav button, confirmed across §7.6, §8.1, §16 D8, and §13 acceptance items.

### Clarity

- "Editorial mode" vs "glass mode" are explicitly scoped in §4.1 with clear use-case assignments. No ambiguity about which mode applies where.
- `id` field is explicitly marked opaque and not URL-constrained; display label comes from `tags.json` label. Prevents a common implementer mistake of treating `id` as human-readable.
- `kb.json` / `tags.json` boundary is clean: entries own tag-id references; `tags.json` owns display labels and hint color keys. No cross-talk.
- §6.2 required/optional field distinction is unambiguous.

### Scope

- S0 + S1 is cleanly isolated. S2–S5 are out of scope with named spec stubs.
- §15 "Out of scope" is explicit; no section in the spec implicitly requires work outside it.
- The `tutorial.html` → redirect stub decision is documented in §11 S1 deliverable 2, with the broken-links risk captured in §14.

### YAGNI

- No Algolia/Pagefind. Simple O(n) regex scorer; spec names re-evaluation trigger (100KB `kb.json` or >40 content pages).
- No pre-commit hooks. Acknowledged as a future improvement in §12; correctly deferred.
- No URL filter state in v1. Plan avoids `history.pushState` so future migration is purely additive.
- No service worker, RSS, analytics, light theme, i18n, or CMS — all correctly excluded in §15.

### Visual continuity

- `tokens.css` is the single source of truth for both editorial and glass modes. §4.3 locks the palette; nothing in the existing palette is removed.
- Both reference files (`index.html` and `tutorial.html`) already use `--bg-primary: #0a0a0a`. Glass tokens (`--bg-card: rgba(255,255,255,0.06)`) already exist in `tutorial.html`. The hybrid γ design extends rather than replaces.
- Editorial hero uses Compressa VF at 14.5vw; glass content uses Inter at `clamp(1.5rem,4vw,2.2rem)`. Shared `--font-sans: Inter` and spacing scale connect the two modes.

### Accessibility

- §9 covers all required dimensions: contrast ratios (4.5:1 / 3:1), keyboard reach with visible focus ring, landmark structure with skip-to-content, screen reader status announcements (status dot supplemented by text), reduced motion, and form labels.
- §7 component a11y coverage is complete: Nav (`aria-current`, `aria-expanded`, `aria-haspopup`), Card (accessible name / non-interactive role), Hub (`role=switch aria-checked`), CmdK (`dialog/modal/listbox/option`), ProgressBar (semantic HTML), Footer (static text).
- Full screen-reader audit and video captions are explicitly noted as backlog, not forgotten.

### Performance budget

- LCP budgets (≤2.5s home, ≤2.0s hub, ≤2.5s content) are anchored to Lighthouse mobile. Testable.
- 25KB JS budget for all new JS combined (excluding existing Three.js on home) is achievable with vanilla JS.
- `kb.json` cold open ≤200ms is achievable; warm open ≤50ms via `window.__kbIndex` caching. O(n) search is ≤16ms at 50 entries.
- Image lazy-loading (`loading="lazy"`) is mandated in §10 and already practiced in `tutorial.html`.
- CSS ≤60KB is reasonable for this scope.

### Acceptance criteria

- Every §13 item maps to at least one plan step (verified against plan's §2 Acceptance Mapping).
- Visual regression standard is "no human-perceptible regression" at two viewports — practical and unambiguous. Requires baseline screenshots as a prerequisite (see Recommendations).
- Mobile overflow check at 360px on four named pages is concrete and tooling-free.
- Lighthouse thresholds (LCP ≤2.0s, Best Practices ≥90) are industry-standard and achievable.
- All nine items can be verified by a non-author using browser DevTools and Lighthouse.

### Plan alignment

- All guardrails in plan §0 match spec non-goals and constraints.
- Plan does not introduce a build step, new CDN dependency, or git workflow.
- Every §13 acceptance criterion has a corresponding step in the plan.
- S0/S1 scope boundary matches spec §11 definitions.

