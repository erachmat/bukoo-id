import React from "react";

/* Line-art icons for the publisher landing page.
   All draw with `currentColor` so the parent sets the stroke colour. */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconTiles() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <rect x="4" y="10" width="20" height="20" rx="3" transform="rotate(-8 14 20)" />
      <rect x="16" y="10" width="20" height="20" rx="3" transform="rotate(8 26 20)" />
    </svg>
  );
}

export function IconFingerHeart() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <path d="M14 20c-3 0-5-2.2-5-5s2-5 5-5c1.6 0 3 .8 4 2" />
      <path d="M18 12c1-1.2 2.4-2 4-2 3 0 5 2.2 5 5 0 2.4-1.5 4.3-3.6 4.9" />
      <path d="M13 24h13a4 4 0 0 1 0 8H16l-4-4" />
    </svg>
  );
}

export function IconBookRibbon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <path d="M9 6h22v28l-11-6-11 6V6z" />
      <path d="M15 6v12l6-3.5L27 18V6" />
    </svg>
  );
}

export function IconQuotes() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <path d="M17 12c-4 0-7 3-7 7s2.5 5.5 5 5.5c2 0 3.5-1.3 3.5-3.2 0-1.8-1.2-3-2.8-3-.4 0-.8.1-1 .2.3-1.7 1.7-3.2 3.8-3.7" />
      <path d="M33 12c-4 0-7 3-7 7s2.5 5.5 5 5.5c2 0 3.5-1.3 3.5-3.2 0-1.8-1.2-3-2.8-3-.4 0-.8.1-1 .2.3-1.7 1.7-3.2 3.8-3.7" />
    </svg>
  );
}

export function IconStream() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <rect x="3" y="8" width="16" height="12" rx="2" transform="rotate(-10 11 14)" />
      <rect x="20" y="20" width="16" height="12" rx="2" transform="rotate(-10 28 26)" />
      <path d="M30 6a7 7 0 0 1 5 5" />
      <path d="M10 34a7 7 0 0 1-5-5" />
    </svg>
  );
}

export function IconCartHeart() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <path d="M20 12c1.4-2.2 4-3 6-2s2.8 3.4 1.6 5.6L20 24l-7.6-8.4C11.2 13.4 12 10.9 14 10s4.6-.2 6 2z" />
      <path d="M6 6h4l3.5 16h17L34 12" />
      <circle cx="16" cy="30" r="2.5" />
      <circle cx="29" cy="30" r="2.5" />
    </svg>
  );
}

export function IconBars() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...base}>
      <rect x="7" y="22" width="6" height="12" rx="3" />
      <rect x="17" y="8" width="6" height="26" rx="3" />
      <rect x="27" y="16" width="6" height="18" rx="3" />
    </svg>
  );
}

/** Scalloped rosette badge with a centred checkmark — used for list items. */
export function IconCheckBadge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth={1.5}>
      <path d="M12 2.6l1.9 1.5 2.3-.6 1 2.2 2.3.6-.3 2.4 1.6 1.8-1.6 1.8.3 2.4-2.3.6-1 2.2-2.3-.6L12 21.4l-1.9-1.5-2.3.6-1-2.2-2.3-.6.3-2.4L3.2 13l1.6-1.8-.3-2.4 2.3-.6 1-2.2 2.3.6L12 2.6z" />
      <path d="M9 12.2l2.1 2.1 4-4.4" strokeWidth={2} />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg viewBox="0 0 40 32" aria-hidden="true" {...base} strokeWidth={4}>
      <path d="M4 16h30" />
      <path d="M26 7l8 9-8 9" />
    </svg>
  );
}

/* ── footer social glyphs (stroke-width 1.6 for 16px optical size) ── */
const social = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...social}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...social}>
      <path d="M7.5 10v7" />
      <circle cx="7.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-7" />
      <path d="M11.5 13.2c0-1.8 1.2-3.2 3-3.2s3 1.4 3 3.2V17" />
    </svg>
  );
}

export function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...social}>
      <path d="M14.5 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14.5 6.5c.8 1.6 2.2 2.6 4 2.8" />
    </svg>
  );
}

export function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...social}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
