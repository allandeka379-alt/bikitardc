// ─────────────────────────────────────────────
// Public route-group layout
//
// Wraps the transparency / civic engagement pages
// (news, meetings, tenders, by-laws, councillors,
// wards, budget, about) in the landing-style nav +
// footer so they inherit the brand shell.
//
// The landing page itself stays at app/page.tsx
// outside this group because it renders its own
// full-bleed hero.
// ─────────────────────────────────────────────

import type { ReactNode } from 'react';
import { LandingFooter } from '../_marketing/landing-footer';
import { LandingNav } from '../_marketing/landing-nav';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LandingNav />
      <main id="main-content">{children}</main>
      <LandingFooter />
    </>
  );
}
