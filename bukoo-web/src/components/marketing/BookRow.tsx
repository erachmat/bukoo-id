import React from 'react';
import { Book } from './bookData';

interface BookRowProps {
  id?: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  badgeBorderColor?: string;
  books: Book[];
}

export function BookRow({ id, title, badge, badgeColor, badgeBorderColor, books }: BookRowProps) {
  return (
    <section className="book-section" style={badgeColor ? { paddingTop: '0' } : {}}>
      <div className="section-header">
        <div className="section-title-row">
          <h2 className="section-h2">{title}</h2>
          {badge && (
            <span 
              className="section-badge" 
              style={{ 
                color: badgeColor || 'var(--amber)', 
                borderColor: badgeBorderColor || 'rgba(201,149,42,0.3)' 
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <span className="section-more">Lihat semua <span>→</span></span>
      </div>

      <div className="book-row" id={id}>
        {books.map((book, index) => (
          <div className="book-card" key={book.id}>
            {book.rank && (
              <div className="rank-overlay" style={book.rank === 10 ? { fontSize: '54px' } : {}}>
                {book.rank}
              </div>
            )}
            <div className={`book-cover ${book.bgClass}`}>
              <div className="bk-shine"></div>
              <div className="bk-edge"></div>
              <div className="book-cover-inner">
                {book.coverContent}
              </div>
              <div className="book-overlay"><div className="play-btn">▶</div></div>
            </div>

            {book.tags && book.rating && (
              <div className="book-tooltip">
                <div className="tt-title">{book.title}</div>
                <div className="tt-author">{book.author}</div>
                <div className="tt-tags">
                  {book.tags.map(tag => (
                    <span className="tt-tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="tt-rating">⭐ {book.rating} · {book.readers} pembaca</div>
              </div>
            )}

            <div className="book-meta-below">
              <div className="bm-title">{book.title}</div>
              <div className="bm-author">{book.author}</div>
              <div className="bm-rating" style={book.badge === 'ORIGINAL' ? { color: 'var(--teal)' } : {}}>
                {book.badge ? `✦ ${book.badge}` : `⭐ ${book.rating}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
