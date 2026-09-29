import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppDownloadCta } from './app-download-cta';

describe('AppDownloadCta', () => {
  it('binds book-specific store CTAs to the canonical book ID', () => {
    const html = renderToStaticMarkup(
      createElement(AppDownloadCta, { bookId: 'canonical-book-42' } as never),
    );

    expect(
      html.match(/data-book-discovery-book-id="canonical-book-42"/g),
    ).toHaveLength(2);
    expect(
      html.match(/data-book-discovery-event="app_cta_click"/g),
    ).toHaveLength(2);
  });
});
