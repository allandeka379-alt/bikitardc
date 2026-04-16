# Playwright smoke tests

Spec §11.1 deliverable. Covers the two critical end-to-end journeys plus a
public-pages smoke sweep.

## Running

```bash
# Install browser binaries once
pnpm exec playwright install chromium

# Run all smoke tests (starts the dev server automatically)
pnpm test:smoke

# Open the interactive runner
pnpm test:smoke:ui
```

## What's covered

- `journey-a-rates.spec.ts` — Resident logs in, pays the rates on Stand 4521 via
  EcoCash (with the dev toolbar forcing a successful outcome for determinism),
  and verifies the dashboard balance now shows as paid up.

- `journey-d-request.spec.ts` — Rates clerk logs in, opens the service-requests
  list, assigns a request to the Water & Sanitation team, and confirms the
  audit log captured the action.

- `public-pages.spec.ts` — Iterates over the transparency & civic pages
  (`/transparency`, `/news`, `/meetings`, `/tenders`, `/bylaws`, `/councillors`,
  `/wards`, `/budget`, `/about`) asserting each renders a top-level heading
  and no uncaught page errors fire.

Journey B (business licence) and Journey C (reconciliation) require multi-step
state that's easier to cover with component tests once that layer exists — they
are intentionally out of this smoke suite.
