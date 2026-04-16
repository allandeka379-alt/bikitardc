# Mock data layer

Demo fixtures for Bikita RDC. All data is fabricated — no real residents or
properties are represented.

## Structure

```
mocks/
  fixtures/    Typed seed data (users, stats, news, budget, wards, …)
```

Public endpoints are served by **Next.js Route Handlers** under `app/api/public/*`
(chosen over MSW for simplicity — no service-worker wiring needed and SSR-friendly).
Each route reads from `mocks/fixtures/*` and returns JSON.

| Endpoint                  | Fixture               | Notes                           |
|---------------------------|-----------------------|---------------------------------|
| `GET /api/public/stats`   | `stats.ts`            | Jittered on each call           |
| `GET /api/public/news`    | `news.ts`             | Static list                     |
| `GET /api/public/budget`  | `budget.ts`           | Ward-level collected vs spent   |

Role-based auth is matched **client-side** in `app/login/page.tsx` against
`findDemoUser()` in `fixtures/users.ts`.
