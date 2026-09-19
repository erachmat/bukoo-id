import React from "react";
import Link from "next/link";
import {
  IconInstagram,
  IconLinkedIn,
  IconTikTok,
  IconYouTube,
} from "./icons";

const COMPANY = [
  { href: "https://bukoo.id/", label: "Homepage Pembaca" },
  { href: "/tentang", label: "Tentang BUKOO" },
  { href: "/newsroom", label: "Newsroom" },
  { href: "/kontak", label: "Kontak" },
];

const PUBLISHER = [
  { href: "/", label: "Daftar Penerbit" },
  { href: "/publisher/dashboard", label: "Dashboard" },
  { href: "/publisher/submit", label: "Submit judul" },
  { href: "/publisher/royalti", label: "Kebijakan Royalti" },
  { href: "/publisher/panduan", label: "Panduan Penerbit" },
];

const LEGAL = [
  { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
  { href: "/privasi", label: "Privasi" },
  { href: "/privasi#aksesibilitas", label: "Aksesibilitas" },
  { href: "/privasi#cookie", label: "Cookie" },
];

export function LandingFooter() {
  return (
    <footer className="bl-footer">
      <div className="bl-footer-inner">
        <div className="bl-footer-main">
          <div className="bl-footer-brand">
            <div className="bl-footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bukoo-logo.svg" alt="" className="bl-footer-logo-mark" />
              <span className="bl-footer-logo-word">BUKOO</span>
            </div>
            <p className="bl-footer-tagline">Pustaka Dalam Genggaman</p>
            <p className="bl-footer-desc">
              Platform langganan buku digital Indonesia.
              <br />
              Baca tanpa batas, mulai dari Rp 29.900/bulan.
            </p>
            <div className="bl-social-row">
              <a
                className="bl-social"
                href="https://www.instagram.com/bukooid"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                className="bl-social"
                href="https://www.linkedin.com/company/bukoo-indonesia/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <IconLinkedIn />
              </a>
              <a
                className="bl-social"
                href="https://www.tiktok.com/@bukooid"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <IconTikTok />
              </a>
              <a
                className="bl-social"
                href="https://www.youtube.com/@bukooid"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <IconYouTube />
              </a>
            </div>
          </div>

          <div className="bl-footer-cols">
            <div>
              <div className="bl-footer-col-title">Perusahaan</div>
              <ul className="bl-footer-links">
                {COMPANY.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="bl-footer-col-title">Penerbit</div>
              <ul className="bl-footer-links">
                {PUBLISHER.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bl-footer-bottom">
          <div>&copy; 2026 PT BUKOO DIGITAL INDONESIA &middot; Semua hak dilindungi</div>
          <div className="bl-footer-legal">
            {LEGAL.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
