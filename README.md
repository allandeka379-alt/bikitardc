# Bikita RDC — Frontend Demo

Demo frontend for the **Bikita Rural District Council Unified Digital Services Platform**.
A single responsive web app with a citizen portal and an internal ERP behind a shared login.

> **DEMO — Not a live service.** All data is mocked. Do not enter real personal information.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3.4** with design tokens in `app/globals.css`
- **next-intl** for EN/SN bilingual UI
- **TanStack Query** for fetching mock data
- **MSW** (Mock Service Worker) for local API fixtures
- **React Hook Form** + **Zod** for forms
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Demo credentials

| Role              | Email                   | Password  | Lands on             |
|-------------------|-------------------------|-----------|----------------------|
| Resident          | tendai@demo.bikita      | Demo1234  | `/portal/dashboard`  |
| Rates Clerk       | clerk@demo.bikita       | Demo1234  | `/erp/dashboard`     |
| Dual-role         | both@demo.bikita        | Demo1234  | `/choose-role`       |

OTP on registration: any 6-digit code works **except** `000000`.

## Project structure

```
app/                   Next.js App Router
  _marketing/          Landing page sections
  login/  register/    Auth screens
  portal/  erp/        Role-scoped dashboards (stubs in milestone 1)
  globals.css          Design tokens
  layout.tsx           Root shell
  providers.tsx        Client-side providers
components/
  motion/              IntersectionObserver-powered primitives
  ui/                  Design-system primitives
lib/
  charts/              Recharts tokens + formatters
  cn.ts  format.ts     Utilities
messages/              next-intl locale files (en / sn)
mocks/                 MSW handlers + fixtures
public/                Static assets + PWA manifest
```

## Milestone 1 scope

- Foundation, design system, i18n scaffold
- Public landing page (`/`) — hero, live stats, services, transparency, news
- Auth: `/login`, `/register`, `/choose-role`
- Error surfaces: 404, 500, offline

Coming in later milestones: citizen dashboard, property detail, payment flow,
PDF receipts, service applications, service requests, ERP, reconciliation,
applications kanban, service-requests map, reports, admin.

See the full spec in `bikita-rdc-frontend-demo-spec.docx`.

## Notes

- Shona translations are placeholders (`[SN]`) to be reviewed by a native speaker.
- Service worker / offline caching is deferred to milestone 2.
- Login is purely cosmetic — credentials match client-side against `mocks/fixtures/users.ts`.
