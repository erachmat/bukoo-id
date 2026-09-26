"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublisherLoginTrigger } from "@/components/publisher/publisher-login";

const LINKS = [
  { href: "/publisher/dashboard", label: "Dashboard" },
  { href: "/publisher/submit", label: "Submit judul" },
  { href: "/publisher/royalti", label: "Royalty" },
  { href: "/publisher/panduan", label: "Panduan Penerbit" },
];

/**
 * Landing-page navigation. Rendered inline over the hero so it can use the
 * transparent overlay treatment from the design; the shared <PublisherNav> is
 * kept untouched for the other publisher pages.
 */
export function LandingNav({ currentTab }: { currentTab?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`bl-nav${menuOpen ? " menu-open" : ""}`}>
      <Link href="/" className="bl-nav-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bukoo-logo.svg" alt="" className="bl-nav-logo-mark" />
        <span className="bl-nav-logo-word">BUKOO</span>
      </Link>
      <button
        type="button"
        className="bl-nav-toggle"
        aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={menuOpen}
        aria-controls="bl-nav-panel"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="bl-nav-panel" id="bl-nav-panel">
        <nav className="bl-nav-links" aria-label="Navigasi penerbit">
          <ul>
            {LINKS.map((link) => {
              const tab = link.href.replace("/publisher/", "");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={currentTab === tab ? "on" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="bl-nav-right">
          <PublisherLoginTrigger callbackUrl="/publisher/dashboard" className="bl-btn-login">
            Masuk
          </PublisherLoginTrigger>
          <a href="#daftar" className="bl-btn-gold" onClick={() => setMenuOpen(false)}>
            Daftar sebagai penerbit
          </a>
        </div>
      </div>
    </header>
  );
}
