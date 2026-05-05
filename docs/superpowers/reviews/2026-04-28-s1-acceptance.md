# S1 Acceptance Notes — 2026-04-28

## Passed

- Static routes on `http://127.0.0.1:8080/` returned 200 for `/`, `/tutorial.html`, `/workflows/`, `/workflows/comfy-flux2-retouch.html`, `/prompts/`, `/research/`, `/marketing/`, `/resources/`, and `/about/`.
- `/assets/data/kb.json` and `/assets/data/tags.json` parse as JSON.
- Local schema check passed for required fields, tag references, duplicate-sensitive URL shape, and planned `url: "#"` handling.
- All files in `/assets/js/*.js` pass `node --check`.
- CmdK implementation includes the required non-navigable guard for `url === "#"` rows and renders planned rows with `aria-disabled="true"` and `tabIndex = -1`.

## Not Completed In-Agent

- Exact baseline screenshots and Lighthouse could not be completed from the agent environment. The in-app browser and headless Chrome/Edge both hit local permission barriers. Manual browser verification on `http://127.0.0.1:8080/` is still required for visual regression and Lighthouse metrics.

## Manual Checks To Run

- Compare `/`, `/workflows/`, and `/workflows/comfy-flux2-retouch.html` at 1440x900 and 390x844.
- Verify Cmd/Ctrl+K, `/`, and nav search open CmdK; `flux` returns the published entry; Enter navigates; Esc closes and restores focus.
- Verify `/tutorial.html` redirects to `/workflows/comfy-flux2-retouch.html` within 1 second.
- Run Lighthouse mobile on `/workflows/` and confirm LCP <= 2.0s and Best Practices >= 90.
- Check 360px width for no horizontal scroll on `/`, `/workflows/`, `/workflows/comfy-flux2-retouch.html`, and `/about/`.
