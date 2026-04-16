import { LandingNav } from './_marketing/landing-nav';
import { HeroSection } from './_marketing/hero-section';
import { LiveStatsStrip } from './_marketing/live-stats-strip';
import { ServicesGrid } from './_marketing/services-grid';
import { BuildingBikita } from './_marketing/building-bikita';
import { WardSpotlight } from './_marketing/ward-spotlight';
import { TransparencySection } from './_marketing/transparency-section';
import { VisitBikita } from './_marketing/visit-bikita';
import { NewsAndNotices } from './_marketing/news-and-notices';
import { CtaBand } from './_marketing/cta-band';
import { LandingFooter } from './_marketing/landing-footer';

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main id="main-content">
        <HeroSection />
        <LiveStatsStrip />
        <ServicesGrid />
        <BuildingBikita />
        <WardSpotlight />
        <VisitBikita />
        <TransparencySection />
        <NewsAndNotices />
        <CtaBand />
      </main>
      <LandingFooter />
    </>
  );
}
