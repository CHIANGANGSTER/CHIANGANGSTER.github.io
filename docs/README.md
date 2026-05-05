# CHIANGANGSTER Knowledge Base Docs

This folder documents how to maintain the static AI knowledge base.

## Content Model

- Edit `/assets/data/kb.json` to add or update visible entries.
- Edit `/assets/data/tags.json` when a new tag label or color hint is needed.
- Create an HTML page under the matching domain folder only when the entry is ready to publish.
- Planned entries may use `"url": "#"`; they render as non-clickable cards and disabled CmdK rows.

## Current Scope

S0 and S1 ship the shared site infrastructure plus the first migrated workflow:

- `/workflows/`
- `/workflows/comfy-flux2-retouch.html`
- `/tutorial.html` redirect stub

Prompts, research, marketing, and resources are route placeholders until their future specs are approved.
