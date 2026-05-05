# Using codex-plugin-cc in this project

Quick reference for running OpenAI Codex reviews via the Claude Code plugin
[openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) on the
knowledge-base redesign.

## Installation (one-time, type these in Claude Code)

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

`/codex:setup` should report Codex 0.125.0 already installed and the
`~/.codex/auth.json` credentials present. If not, run `!codex login`.

## Project-specific config

A project-level `.codex/config.toml` exists at the repo root. It pins the
review model to `gpt-5.4-mini` at high reasoning effort. Override at any time
by editing `.codex/config.toml` or by passing `--model` on a single command.

## Important: no git repo here

Per D1, this project has no local `git init`. The plugin's `--base <ref>` and
default `/codex:review` (reviews uncommitted changes) flows therefore won't
work — they need a git working tree to diff against.

For this project, prefer the **freeform** modes that take focus text:

| Use case | Command |
|----------|---------|
| Round-2 review of plan vs spec | `/codex:adversarial-review` with focus text |
| Ask Codex to investigate a specific file | `/codex:rescue` |
| Background long task | append `--background` then `/codex:status`, `/codex:result` |

## Round-2 adversarial review of the implementation plan

The pending action right now is: get a second AI to confirm the implementation
plan has zero blocking issues against the spec.

Run this in Claude Code (paste verbatim, single line — or break across lines if
your terminal supports it):

```
/codex:adversarial-review --background pressure-test docs/superpowers/plans/2026-04-27-knowledge-base-redesign.md against docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md. Focus on: (a) every spec §13 acceptance criterion has a concrete plan task, (b) no missing files / dead references / type-name drift between tasks, (c) the §8.3 non-navigable rule is correctly enforced in cmdk.js code, (d) the validate-kb.js localhost gate cannot leak warnings into production, (e) Task 16 article migration would actually pass the no-regression check, (f) hidden ordering / dependency bugs across the 26 tasks. Output blocking vs advisory issues like a normal code review. Treat the existing index.html and tutorial.html as ground truth.
```

Then check progress:

```
/codex:status
```

When done:

```
/codex:result
```

Save the result to `docs/superpowers/reviews/2026-04-28-codex-plan-review.md`
so it sits next to the prior reviews.

## Other useful commands for this project

### Ask Codex to review just the spec changes (in case spec is ever updated again)

```
/codex:adversarial-review pressure-test docs/superpowers/specs/2026-04-27-knowledge-base-redesign-design.md. Treat §16 decisions D1-D8 as locked. Look for self-contradictions, missing acceptance coverage, and over-specified scope.
```

### Delegate a coding sub-task to Codex (use during implementation)

```
/codex:rescue --background implement Task 23 (cmdk.js + cmdk.css) per docs/superpowers/plans/2026-04-27-knowledge-base-redesign.md. Strictly follow the code blocks in that plan. Do not deviate from spec §7.6 or §8. Verify by opening /workflows/ in a browser with python -m http.server 8000.
```

### Cancel a running background task

```
/codex:cancel
```

## Cost / quota notes

- The `gpt-5.4-mini` at `high` effort burns ChatGPT subscription quota faster
  than the default. For lighter passes drop to `medium` by editing
  `.codex/config.toml` or appending `--effort medium` to a single command.
- Background runs continue even if you close Claude Code; cancel explicitly
  with `/codex:cancel` if you change your mind.
- The plugin's review-gate (`/codex:setup --enable-review-gate`) creates a
  Stop hook that blocks Claude on every reply until Codex agrees — leave it
  **off** unless you're actively monitoring, per the plugin's own warning.
