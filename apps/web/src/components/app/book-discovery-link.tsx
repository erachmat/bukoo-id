'use client';

import type { CSSProperties, ReactNode } from 'react';
import { sendBookDiscoveryEvent } from '@/lib/book-discovery-client';

export function BookDiscoveryLink({
  href,
  bookId,
  children,
  target,
  rel,
  className,
  style,
  ariaLabel,
}: {
  href: string;
  bookId: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={style}
      aria-label={ariaLabel}
      data-book-discovery-book-id={bookId}
      data-book-discovery-event="app_cta_click"
      onClick={() => sendBookDiscoveryEvent(bookId, 'app_cta_click')}
    >
      {children}
    </a>
  );
}
