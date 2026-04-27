import re

with open('src/app/(marketing)/redesign.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Split the content at the mobile responsiveness header
parts = content.split("/*──────────────────────────────────────────\n  MOBILE RESPONSIVENESS\n──────────────────────────────────────────*/")
base_content = parts[0]

new_mobile_css = """/*──────────────────────────────────────────
  MOBILE RESPONSIVENESS
──────────────────────────────────────────*/
@media (max-width: 768px) {
  /* Navbar */
  .nav { padding: 0 20px; }
  .nav-links { display: none; }
  .nav-right { display: none; }
  .nav-mobile-menu { display: flex; align-items: center; justify-content: center; }
  .nav-logo { font-size: 20px; }

  /* Hero */
  .hero { padding: 100px 20px 40px; }
  .hero-h1 { font-size: clamp(32px, 10vw, 48px); }
  .hero-sub { font-size: 14px; margin-bottom: 24px; }
  .hero-input-row { flex-direction: column; max-width: 100%; gap: 12px; }
  .hero-input, .hero-btn { border-radius: 8px !important; width: 100%; border: 1.5px solid rgba(255,255,255,0.15); height: 54px !important; font-size: 15px !important; }
  .hero-btn { margin-left: 0; }
  .hero-shelf { overflow-x: auto; padding-bottom: 15px; justify-content: flex-start; scroll-snap-type: x mandatory; margin-top: 20px; }
  .shelf-book { scroll-snap-align: start; }
  .hero-shelf::-webkit-scrollbar { display: none; }

  /* Book Rows */
  .book-section { padding: 40px 20px !important; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 14px; }
  .section-title-row { flex-wrap: wrap; }
  .section-badge, .section-more { white-space: nowrap; }
  
  .book-row { overflow-x: auto; padding-bottom: 20px; -webkit-overflow-scrolling: touch; gap: 16px; margin: 0; padding: 0 0 20px 0; }
  .book-row::-webkit-scrollbar { display: block; height: 4px; }
  .book-row::-webkit-scrollbar-thumb { background: var(--forest-l); border-radius: 4px; }
  .book-row::-webkit-scrollbar-track { background: var(--forest-dd); }
  .book-row::after { display: none; }
  .book-card { flex: 0 0 auto; }
  
  /* Features */
  .features-section, section[style*="padding"] { padding-left: 20px !important; padding-right: 20px !important; }
  .feature-row { flex-direction: column !important; gap: 40px; padding: 40px 0; }
  .feature-text, .feature-visual { width: 100%; }
  .feature-h2 { font-size: clamp(28px, 8vw, 36px); }
  .feature-p { font-size: 15px; }

  /* Pricing */
  .pricing-section { padding: 40px 20px !important; }
  .pricing-grid { grid-template-columns: 1fr; border: none; gap: 20px; background: transparent; }
  .price-card { border: 1px solid var(--border); border-radius: 12px; background: rgba(255,255,255,0.02); }
  .price-card:last-child { border-right: 1px solid var(--border); }
  .price-card.featured { border: 1px solid var(--amber); }

  /* Testimonials */
  .testi-section { padding: 40px 20px !important; }
  .testi-grid { grid-template-columns: 1fr; gap: 20px; margin-top: 32px; }

  /* Stats */
  .stats-section { padding: 40px 20px !important; grid-template-columns: 1fr 1fr; gap: 12px; background: transparent; border: none; }
  .stat-item { padding: 24px; border: 1px solid var(--border); border-radius: 12px; }
  .stat-num { font-size: clamp(28px, 6vw, 36px); }

  /* FAQ */
  .faq-section { padding: 40px 20px !important; }
  .faq-q { padding: 16px; font-size: 14px; }
  .faq-a { padding: 0 16px 16px; font-size: 13px; }

  /* Publisher */
  .publisher-section { padding: 40px 20px !important; }
  .publisher-logos { gap: 24px; }

  /* CTA Final */
  .cta-final { padding: 60px 20px !important; }
  .cta-h2 { font-size: clamp(28px, 8vw, 36px); }
  .cta-input-row { flex-direction: column; gap: 12px; max-width: 100%; }
  .cta-input, .cta-btn { border-radius: 8px !important; width: 100%; border: 1px solid rgba(255,255,255,0.15) !important; height: 54px !important; font-size: 15px !important; }
  
  /* Footer */
  .footer { padding: 40px 20px 20px !important; }
  .footer-grid { grid-template-columns: 1fr; gap: 40px; }
  .footer-bottom { flex-direction: column; align-items: flex-start; gap: 16px; padding-top: 20px; }
  .footer-legal { flex-wrap: wrap; gap: 12px; }
}
"""

with open('src/app/(marketing)/redesign.css', 'w', encoding='utf-8') as f:
    f.write(base_content + new_mobile_css)
