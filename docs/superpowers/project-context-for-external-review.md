# Project Context For External AI Review

Use this file as the briefing document when asking another AI to review the knowledge-base redesign spec. Attach this file together with the required source files listed below.

## 1. What This Project Is

This repository is a static GitHub Pages website for Corvin Chiang / CHIANGANGSTER.

Current production shape:

- `index.html` is the editorial home page.
- `tutorial.html` is a long-form glassmorphism tutorial page for a Flux.2 / ComfyUI product retouch workflow.
- The site is zero-build: plain HTML, CSS, JavaScript, static assets, and GitHub Pages hosting.
- There is no framework, bundler, backend, CMS, database, authentication, analytics, or CI pipeline.

The redesign goal is to turn the current single-workflow tutorial site into a small AI knowledge base for a design department, while preserving the existing visual identity and zero-build deployment model.

## 2. Why The Redesign Exists

The current site contains one deep tutorial. The future site needs to hold multiple kinds of reusable AI work material:

- Image production workflows: ComfyUI, Midjourney, Stable Diffusion, Photoshop AI, Flux, LoRA, product retouching pipelines.
- Prompt templates: copyable prompts and reusable parameterized structures.
- Product research workflows: competitor research, trend analysis, keyword extraction, feedback analysis.
- Marketing workflows: selling-point distillation, short-video scripts, e-commerce visual narratives.
- Cross-team resources: prompt case libraries, scene keyword libraries, tool index, news or reference feed.

The expected audience includes:

- Designers who need to quickly find and reuse workflows or prompts.
- Managers / reviewers who need to skim what has shipped and what is planned.
- Corvin as the author, who needs a low-friction way to add entries without rebuilding the site.

## 3. Current Visual System

There are two shipped visual modes:

### Editorial Home Mode

Reference file: `index.html`

Characteristics:

- Dramatic editorial composition.
- Large type.
- Dark background.
- 3D chair rendered with Three.js.
- Scroll and pointer-driven interaction.
- Existing external runtime dependencies include Three.js, UnicornStudio, Google Fonts, and a Cloudinary-hosted Compressa font.

The redesign must preserve this home-page identity.

### Glass Content Mode

Reference file: `tutorial.html`

Characteristics:

- Dark glassmorphism reading surface.
- Long-form tutorial layout.
- Cards, chapters, image blocks, captions, code/callout-like sections.
- Liquid glass filter, Magic Bento-style hover effects, progress/scroll interactions.
- Existing Chinese/English mixed typography.

The redesign must preserve this content-page reading style for migrated workflow articles.

## 4. Target Architecture

The proposed site stays static and zero-build.

Target route structure:

```text
/                                   home / editorial cover
/workflows/                         workflow hub
/workflows/<slug>.html              workflow article
/prompts/                           prompt hub
/research/                          research hub
/marketing/                         marketing hub
/resources/                         resources hub
/about/                             about page
/tutorial.html                      redirect stub to migrated workflow article
/assets/css/                        shared CSS
/assets/js/                         shared JavaScript
/assets/data/kb.json                knowledge-base entry source of truth
/assets/data/tags.json              tag metadata
/docs/                              contributor and planning docs
```

The first implementation scope is intentionally limited:

- S0: scaffolding, shared tokens, shared nav/footer/data structure, placeholder domain pages.
- S1: migrate the existing tutorial into `/workflows/comfy-flux2-retouch.html`, build the `/workflows/` hub, implement shared nav, global search, filtering, cards, copy buttons, progress bar, and basic validation.

Future content domains are out of scope until separate specs are written.

## 5. Core Product Requirements

The redesigned site should support:

- Multi-domain navigation: Workflows, Prompts, Research, Marketing, Resources, About.
- Hub pages with editorial-style hero typography.
- Content pages with glassmorphism tutorial-style reading layout.
- A shared token system so the two visual modes feel connected.
- `kb.json` as the single source of truth for entries.
- `tags.json` as tag metadata.
- Client-side filtering by status, tags, phase, and title search.
- Global search modal opened by `Cmd/Ctrl+K`, `/`, or a nav search button.
- Two initial workflow entries:
  - The migrated Flux.2 product retouch workflow, `status: published`.
  - A production-visible planned placeholder entry, `status: planned`, `url: "#"`.
- Mobile usability down to 360px wide.
- Keyboard and screen-reader accessibility baseline.
- Performance budgets small enough for GitHub Pages and a plain static site.

## 6. Important Constraints

Do not recommend changes that violate these constraints unless they are truly necessary to prevent implementation failure:

- No build step.
- No framework.
- No backend.
- No CMS.
- No search service such as Algolia or Pagefind.
- No new external runtime dependency for the redesign.
- No analytics.
- No service worker.
- No sitemap/RSS/structured data in this scope.
- No migration of all future content domains in this scope.
- No git workflow assumptions; the local folder is treated as a write-only working copy and the author uploads manually.

## 7. Key Files To Attach

Attach these files to the external AI reviewer:

1. `docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md`
   - The spec under review.
2. `index.html`
   - Existing editorial home / 3D chair reference.
3. `tutorial.html`
   - Existing glassmorphism content page reference.
4. `README.md`
   - Existing project notes and conventions.
5. `docs/superpowers/project-context-for-external-review.md`
   - This briefing file.

Optional:

- `docs/superpowers/plans/2026-04-27-knowledge-base-redesign-implementation-plan.md`
  - Attach only if you want the reviewer to check whether the implementation plan follows the spec.

## 8. What The Reviewer Should Focus On

The reviewer should review the design spec as a planning artifact, not as a design taste exercise.

They should flag only issues that would seriously disrupt implementation planning:

- Missing sections.
- Contradictory requirements.
- Undefined schema fields.
- Requirements that two engineers would implement differently.
- Scope leaks that implicitly require out-of-scope work.
- Accessibility gaps for named components.
- Performance budgets that are incompatible with the proposed architecture.
- Acceptance criteria that a non-author cannot independently verify.

They should not re-litigate:

- Dark visual direction.
- Editorial vs glass hybrid direction.
- Color taste.
- Typeface taste.
- Whether a framework would be nicer.
- Whether a CMS would be nicer.

## 9. Prompt To Paste To External AI

Paste this prompt after attaching the required files:

```markdown
You are a spec document reviewer. Your job is to verify this spec is complete,
consistent, and ready for an implementation plan to be written against it.

You are reviewing a static GitHub Pages website redesign. The current project is
a zero-build personal / departmental AI workflow site with:

- `index.html` as an editorial home page with a Three.js 3D chair.
- `tutorial.html` as a glassmorphism long-form Flux.2 / ComfyUI product retouch tutorial.
- `README.md` documenting the current project and conventions.
- `docs/superpowers/project-context-for-external-review.md` explaining the project background.

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
| Visual continuity | Given §4 token system and existing `index.html` / `tutorial.html`, will the proposed γ hybrid compose without visual seams? |
| Accessibility | Do §9 requirements cover the §7 component inventory? Any component without an a11y story? |
| Performance budget | Are §10 budgets achievable given §5 architecture? Flag obvious cost not accounted for. |
| Acceptance criteria | Is each item in §13 independently testable by a non-author? |

### Calibration

Only flag issues that would cause real problems during implementation planning.
A missing section, a contradiction, or a requirement so ambiguous it could be
interpreted two different ways are issues. Minor wording improvements, stylistic
preferences, taste-level disagreements, and "I would use a framework/CMS" are
not issues.

Approve unless there are serious gaps that would lead to a flawed implementation plan.

### Output format

Return your review in this exact structure:

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

Keep the review under 800 words. If you have nothing to add to a section,
omit it rather than padding.
```

## 10. How To Save External Reviews

After receiving the review, save the full response as:

```text
docs/superpowers/reviews/2026-04-27-<reviewer-name>.md
```

Examples:

```text
docs/superpowers/reviews/2026-04-27-claude-opus.md
docs/superpowers/reviews/2026-04-27-gemini-pro.md
docs/superpowers/reviews/2026-04-27-deepseek.md
```


