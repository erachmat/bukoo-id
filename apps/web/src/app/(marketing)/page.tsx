import { Hero } from '@/components/marketing/Hero';
import { HomepageSections } from '@/components/marketing/HomepageSections';
import { PricingTeaser } from '@/components/marketing/PricingTeaser';
import { FAQ } from '@/components/marketing/FAQ';
import { CallToAction } from '@/components/marketing/CallToAction';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HomepageSections />
      <PricingTeaser />
      <FAQ />
      <CallToAction />
    </>
  );
}
