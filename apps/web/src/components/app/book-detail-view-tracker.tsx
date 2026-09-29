'use client';

import { useEffect, useRef } from 'react';
import {
  createBookDetailViewReporter,
  sendBookDiscoveryEvent,
} from '@/lib/book-discovery-client';

export function BookDetailViewTracker({ bookId }: { bookId: string }) {
  const reporter = useRef(
    createBookDetailViewReporter((id) =>
      sendBookDiscoveryEvent(id, 'detail_view'),
    ),
  );

  useEffect(() => {
    reporter.current(bookId);
  }, [bookId]);

  return null;
}
