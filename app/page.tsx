import { LandingNavbar } from '@/components/landing/navbar';
import { LandingHero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { LandingInstruments } from '@/components/landing/instruments';
import { LandingStats } from '@/components/landing/stats';
import { LandingCTA } from '@/components/landing/cta';
import { LandingFooter } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FAFAF7] dark:bg-[#0F0F12]">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingInstruments />
      <LandingStats />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}