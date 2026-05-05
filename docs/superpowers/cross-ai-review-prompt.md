# Cross-AI Spec Review Prompt

Use this prompt when handing the design spec to another AI model for cross-validation.

It is adapted from the canonical `spec-document-reviewer-prompt.md` template in the
`superpowers:brainstorming` skill (v5.0.7), retaining its calibration rules so the
reviewer flags real planning blockers rather than stylistic preferences.

---

## How to use

1. Open the receiving AI (Claude / GPT / Gemini / DeepSeek / etc.).
2. Attach the files listed under **"Files to attach"** below.
3. Paste the **Reviewer prompt** into the chat verbatim.
4. After you receive the reviewer's response, save the full response as
   `docs/superpowers/reviews/2026-04-27-<reviewer-name>.md` so multiple
   reviews can be compared.

## Files to attach

Required (every reviewer needs these):

1. `docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md` — the spec under review
2. `index.html` — current editorial home page (visual continuity reference)
3. `tutorial.html` — current glass-mode content page (visual continuity reference)
4. `README.md` — project README (existing tech stack and conventions)

Optional (only for reviewers asked to cross-check the spec against the original
requirements — must be a trusted recipient because it contains internal labelling):

5. The original requirements PDF (only if you intend the reviewer to verify spec
   coverage against the source). Otherwise skip — the spec's §2 Background is
   self-contained.

## Reviewer prompt

Copy everything below this line into the receiving model's chat.

---

You are a spec document reviewer. Your job is to verify this spec is complete,
consistent, and ready for an implementation plan to be written against it. The
spec covers the redesign of a static knowledge-base website (zero-build,
GitHub Pages hosted, vanilla HTML/CSS/JS).

**Spec to review:** `docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md`

**Existing assets for context:** `index.html`, `tutorial.html`, `README.md`

### What to check

| Category | What to look for |
|----------|------------------|
| Completeness | TODOs, placeholders, "TBD", incomplete sections, undefined references |
| Consistency | Internal contradictions, sections that disagree on the same field, schema fields used in one section but absent from §6 |
| Clarity | Requirements ambiguous enough that two engineers could build different things from them |
| Scope | Is the spec focused on a single, plannable sub-project (infrastructure + S1)? Is anything outside §15 "Out of scope" implicitly required by other sections? |
| YAGNI | Unrequested features, over-engineering, abstractions without a current consumer |
| Visual continuity | Given §4 token system and existing `index.html` / `tutorial.html`, will the proposed γ hybrid actually compose without visual seams? |
| Accessibility | Do §9 requirements actually cover the §7 component inventory? Any component without an a11y story? |
| Performance budget | Are §10 budgets achievable given §5 architecture? Flag any obvious cost not accounted for. |
| Acceptance criteria | Is each item in §13 independently testable by a non-author? |

### Calibration

**Only flag issues that would cause real problems during implementation planning.**
A missing section, a contradiction, or a requirement so ambiguous it could be
interpreted two different ways — those are issues. Minor wording improvements,
stylistic preferences, "this section is shorter than that section", taste-level
disagreements about color tokens or font choices, are NOT issues. The spec
author has chosen the visual direction deliberately; you are not asked to
re-litigate it.

Approve unless there are serious gaps that would lead to a flawed plan.

### Output format

Return your review in this exact structure (Markdown):

```markdown
# Spec Review — [Your model name + date]

**Status:** Approved | Issues Found

## Issues (blocking — must be addressed before implementation planning)

- **[Section X]**: [specific issue]
  - Why it matters for planning: [one sentence]
  - Suggested resolution: [optional]

## Recommendations (advisory — do not block approval)

- [suggestion 1]
- [suggestion 2]

## Confirmations (optional, for the author's confidence)

- [things you actively verified are sound]
```

The fenced Markdown template above is complete; keep the closing triple backticks
out of your response unless you are explicitly wrapping the whole review in a
code block.

Keep the review under 800 words. If you have nothing to add to a section,
omit it rather than padding.

---

End of prompt. Paste everything from "You are a spec document reviewer..."
through "End of prompt." into the receiving AI.


