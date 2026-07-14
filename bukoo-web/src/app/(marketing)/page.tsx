import { Hero } from '@/components/marketing/Hero';
import { Marquee } from '@/components/marketing/Marquee';
import { BookRow } from '@/components/marketing/BookRow';
import { Stats } from '@/components/marketing/Stats';
import { Features } from '@/components/marketing/Features';
import { PublisherLogos } from '@/components/marketing/PublisherLogos';
import { Pricing } from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQ } from '@/components/marketing/FAQ';
import { CallToAction } from '@/components/marketing/CallToAction';
import { trendingBooks, originalBooks } from '@/components/marketing/bookData';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Marquee />
      <BookRow 
        id="trending-row"
        title="🔥 Trending di Indonesia" 
        badge="Minggu Ini" 
        books={trendingBooks} 
      />
      <BookRow 
        title="✦ BUKOO Originals" 
        badge="Eksklusif" 
        badgeColor="var(--teal)"
        badgeBorderColor="rgba(0,201,167,.3)"
        books={originalBooks} 
      />
      <Stats />
      <Features />
      <PublisherLogos />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CallToAction />
    </>
  );
}
