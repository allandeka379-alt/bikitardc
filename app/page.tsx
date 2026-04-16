import { LandingNav } from './_marketing/landing-nav';
import { HeroSection } from './_marketing/hero-section';
import { LiveStatsStrip } from './_marketing/live-stats-strip';
import { ServicesGrid } from './_marketing/services-grid';
import { TransparencySection } from './_marketing/transparency-section';
import { BuildingBikita } from './_marketing/building-bikita';
import { NewsAndNotices } from './_marketing/news-and-notices';
import { WardSpotlight } from './_marketing/ward-spotlight';
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
        <TransparencySection />
        <NewsAndNotices />
        <WardSpotlight />
        <CtaBand />
      </main>
      <LandingFooter />
    </>
  );
}
