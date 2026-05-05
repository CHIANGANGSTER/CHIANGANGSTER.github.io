# Spec Review — Claude Self-Review — 2026-04-27

**Status:** Approved

---

## Issues (blocking — must be addressed before implementation planning)

None. The spec passes all nine dimensions.

---

## Recommendations (advisory — do not block approval)

- **§4.3 / §7.2 consistency**: The `planned` status color is now pink (`--accent-pink`) per the round-3 resolution. Verify that §7.2's interactive/non-interactive card variant description and §4.3's token mapping are the only places referencing this — they are consistent. No action needed.
- **`/docs/templates/` directory**: The plan (S0 step 6) calls for creating `/docs/templates/article-template.html`, but the spec's §12 references this file without specifying where it lives. The plan correctly places it under `/docs/templates/`.确认了。No spec amendment needed.
- **Baseline screenshots**: Per round-3 recommendation, take baseline screenshots of `index.html` and `tutorial.html` at 1440×900 and 390×844 before S1 begins. This is operational, not a spec gap.

---

## Confirmations (things I actively verified are sound)

### Completeness
- All 9 acceptance criteria in §13 are independently testable.
- Every `[DEFERRED → spec-N]` marker points to a future spec (S2–S5), not to undefined work.
- §16 Documents all 8 resolved open questions. No unresolved open questions remain.
- §6.1 JSON schema has all required/optional fields clearly delineated; §6.2 makes the distinction unambiguous.

### Consistency
- `status` enum values: `published | testing | planned | archived` — used consistently in §4.3 (color mapping), §7.2 (card variants), §11 (S1 deliverable 10), §13 (acceptance), and `kb.json` seed.
- Phase tags: stored as integer `phase` field (1–4), rendered as separate badge. Not mixed with free-form tag chips. Correct.
- URL shape rule: non-external, non-`#` urls must match `/<domain>/<id>.html` — enforced in §6.4 validation and Plan S1.5.
- Search trigger: `Cmd/Ctrl+K` + `/` + nav button — consistent across §7.6, §8.1, §16 D8, §13 acceptance items.

### Clarity
- "editorial mode" vs "glass mode" are explicitly defined in §4.1 with use-case scopes (home/hub vs content/search). No ambiguity.
- The `id` field is explicitly marked opaque and not URL-constrained (§6.2). Display label comes from `tags.json` `label` field. This prevents a common class of implementer confusion.
- The `kb.json` vs `tags.json` boundary is clean: `kb.json` owns entries and tag-id references; `tags.json` owns display labels and color hints. No cross-talk.

### Scope
- S0+S1 scope is isolated. S2–S5 are explicitly out of scope with named spec stubs.
- No implicit requirements outside §15 "Out of scope". §2 background is correctly scoped to the multi-domain KB without dictating how other domains behave.
- The "redirect stub" treatment of `tutorial.html` is described in §11 S1 deliverable 2, and the risk mitigation (broken inbound links) appears in §14.

### YAGNI
- No Algolia/Pagefind search. The simple O(n) regex scorer is sufficient at ≤50 entries; the spec names the trigger for re-evaluation.
- No pre-commit hooks. The spec acknowledges the future improvement and correctly defers it.
- No URL filter state in v1. The plan explicitly avoids `history.pushState` so future migration is purely additive.
- No service worker, no RSS, no analytics, no light theme — all correctly excluded.

### Visual continuity
- Tokens (`tokens.css`) govern both editorial and glass modes. §4.3 is the single source of truth.
- `index.html` (editorial, 3D chair) and `tutorial.html` (glass mode) are both referenced as context for the reviewer. Both use the same `--bg-primary: #0a0a0a` base. The glass card tokens (`--bg-card: rgba(255,255,255,0.06)`) are already present in `tutorial.html`'s existing palette.
- §4.3 locks the palette; nothing in the existing palette is removed. Visual continuity is preserved by construction.
- Editorial hero uses `Compressa VF` at 14.5vw; glass content uses Inter at clamp(1.5rem,4vw,2.2rem). The two modes are visually distinct but share `--font-sans: Inter` and the spacing scale.

### Accessibility
- §9 covers contrast (4.5:1 / 3:1), keyboard reach, landmarks, screen reader status announcements, reduced motion, and form labels.
- §7.2 a11y story for cards (interactive: accessible name; non-interactive: status text label) is concrete.
- §7.1 Nav a11y (aria-current, aria-expanded, aria-haspopup) is concrete.
- §7.6 CmdK a11y (dialog role, modal, listbox/option roles, aria-selected) is concrete.
- Out-of-scope items (full screen-reader audit, video captions) are explicitly noted as backlog, not forgotten.

### Performance budget
- LCP budgets are anchored to Lighthouse mobile. §10 budgets are testable.
- JS budget: 25KB minified for all new JS combined, excluding existing Three.js on home. This is realistic for vanilla JS.
- Image lazy-loading mandate (`loading="lazy"`) appears in §10 and is already applied in `tutorial.html` (confirming existing practice).
- kb.json fetch is ≤200ms cold open (network-dominant). Warm open ≤50ms is achievable with in-session caching on `window.__kbIndex` as specified.

### Acceptance criteria
- Every §13 item maps to a plan step (verified in plan's §2 Acceptance Mapping).
- All visual regression checks are anchored to specific viewports (1440×900, 390×844) and "no human-perceptible regression" as the standard — practical and unambiguous.
- Mobile overflow check (360px, four specific pages) is concrete and testable without tooling.
- Lighthouse thresholds (LCP ≤2.0s, Best Practices ≥90) are industry-standard and achievable with the zero-build vanilla approach.

### Plan alignment
- Implementation plan maps cleanly to spec. Every §13 acceptance criterion has a corresponding plan step.
- Guardrails in plan (§0) correctly reflect non-goals and constraints from spec §1.2, §5, §15.
- Plan does not introduce build step, new CDN dependency, or git workflow — all consistent with spec intent.
- Plan's S0/S1 scope boundary matches spec's §11 phase definitions.

---

## Comparison with Codex GPT-5 Round 2 & Round 3

| Issue | Codex Round 2 | My finding |
|-------|---------------|------------|
| `planned` status color contradiction (amber vs pink) | Raised as blocking issue | Resolved in round 3. Round 3 approved. I confirm: §4.3 says pink, S1 deliverables say pink — consistent. |
| `/` and nav search button not in §13 acceptance | Raised as recommendation | Valid. Codex flagged this; round 3 confirmed resolution. |
| "deferred to S1" wording in §7.9 EditorialHero | Raised as recommendation | Valid but non-blocking. |

My review found **no additional issues** beyond what Codex already raised and resolved in round 3. The spec is clean.

