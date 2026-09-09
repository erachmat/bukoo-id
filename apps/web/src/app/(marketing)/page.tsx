import { Hero } from '@/components/marketing/Hero';
import { HomepageSections } from '@/components/marketing/HomepageSections';
import { Pricing } from '@/components/marketing/Pricing';
import { FAQ } from '@/components/marketing/FAQ';
import { CallToAction } from '@/components/marketing/CallToAction';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HomepageSections />
      <Pricing />
      <FAQ />
      <CallToAction />
    </>
  );
}
