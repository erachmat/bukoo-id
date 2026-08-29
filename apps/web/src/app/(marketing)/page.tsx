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
import { trendingBooks } from '@/components/marketing/bookData';
import { FeaturedBooks } from '@/components/marketing/FeaturedBooks';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Suspense fallback={<div className="featured-skeleton" style={{ minHeight: 480 }} aria-hidden /> }>
        <FeaturedBooks />
      </Suspense>
      <BookRow 
        id="trending-row"
        title="🔥 Trending di Indonesia" 
        badge="Minggu Ini" 
        books={trendingBooks} 
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
