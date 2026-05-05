# Spec Review - Codex GPT-5 Round 2 - 2026-04-27

**Status:** Issues Found

## Issues

- **[Section 4.3 vs Section 11 / Section 13]**: The `planned` status color is now contradictory. Section 4.3 maps `planned` to `--accent-pink`, but Section 11 deliverable 10 and Section 13 acceptance both require the seeded `status: "planned"` card to render with an amber status dot.
  - Why it matters for planning: The implementation plan cannot define a single card-status style rule or acceptance check until `planned` is either pink or amber.
  - Suggested resolution: Pick one source of truth. If the intended S1 planned placeholder is amber, update Section 4.3 status-to-color mapping and token comments so `planned -> --accent-amber`; otherwise change the S1 deliverable and acceptance wording from "amber" to "pink".

## Recommendations

- Add `/` and the nav search button to Section 13 acceptance so the newly confirmed supplementary triggers are explicitly smoke-tested, not only described in Sections 7/8/16.
- Clarify the "deferred to S1" wording in Section 7.9 for domain hub motifs. D3 already says S1 uses typography only, so "optional, deferred to S1" should become "deferred to later specs" or be removed.

## Confirmations

- The original CmdK trigger contradiction is resolved: Sections 8.1 and 16 D8 now both allow `Cmd/Ctrl+K` plus `/`.
- The original stub/fixture contradiction is resolved: the second entry is now explicitly production-visible, searchable, and non-interactive via `url: "#"`.
- `validate-kb.js`, nav search, and existing CDN dependency documentation are now represented in the relevant architecture/deliverable sections.


