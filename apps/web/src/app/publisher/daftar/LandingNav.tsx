import React from "react";
import Link from "next/link";
import { PublisherLoginTrigger } from "@/components/publisher/publisher-login";

const LINKS = [
  { href: "/publisher/dashboard", label: "Dashboard" },
  { href: "/publisher/submit", label: "Submit judul" },
  { href: "/publisher/royalti", label: "Royalti" },
  { href: "/publisher/panduan", label: "Panduan Penerbit" },
];

/**
 * Landing-page navigation. Rendered inline over the hero so it can use the
 * dark translucent treatment from the design; the shared <PublisherNav> is
 * kept untouched for the other publisher pages.
 */
export function LandingNav({ currentTab }: { currentTab?: string }) {
  return (
    <header className="bl-nav">
      <div className="bl-nav-left">
        <Link href="/" className="bl-nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bukoo-logo.svg" alt="" className="bl-nav-logo-mark" />
          <span className="bl-nav-logo-word">BUKOO</span>
        </Link>
        <nav className="bl-nav-links" aria-label="Navigasi penerbit">
          <ul>
            {LINKS.map((link) => {
              const tab = link.href.replace("/publisher/", "");
              return (
                <li key={link.href}>
                  <Link href={link.href} className={currentTab === tab ? "on" : ""}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="bl-nav-right">
        <PublisherLoginTrigger callbackUrl="/publisher/dashboard" className="bl-btn-login">
          Masuk
        </PublisherLoginTrigger>
        <a href="#daftar" className="bl-btn-gold">
          Ajukan kemitraan
        </a>
      </div>
    </header>
  );
}
