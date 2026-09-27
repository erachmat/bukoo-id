"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublisherTopbar } from "../topbar-client";
import { IconInstagram, IconLinkedIn, IconTikTok, IconYouTube } from "../daftar/icons";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// Tab → route mapping for navigation tabs that have real pages
const TAB_ROUTES: Record<string, string> = {
  upload:       "/publisher/books/new",
  notifikasi:   "/publisher/notifications",
  pengaturan:   "/publisher/settings",
  promosi:      "/publisher/promotions",
};

const FOOTER_COMPANY = [
  { href: "https://bukoo.id/", label: "Homepage Pembaca" },
  { href: "/tentang", label: "Tentang BUKOO" },
  { href: "/newsroom", label: "Newsroom" },
  { href: "/kontak", label: "Kontak" },
];
const FOOTER_PUBLISHER = [
  { href: "/", label: "Daftar sebagai penerbit" },
  { href: "/publisher/dashboard", label: "Dashboard" },
  { href: "/publisher/books/new", label: "Submit judul" },
  { href: "/publisher/dashboard?tab=royalti", label: "Royalti" },
  { href: "/publisher/panduan", label: "Panduan Penerbit" },
];

export function DashboardShell({
  user,
  children,
  activeTab: controlledTab,
  onTabChange: controlledChange,
}: DashboardShellProps) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState("overview");
  const name = user.name || "Mitra Penerbit";

  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (tab: string) => {
    if (TAB_ROUTES[tab]) {
      router.push(TAB_ROUTES[tab]);
    } else if (controlledChange) {
      controlledChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div className="pub-dashboard-shell">
      <div className="pds-app">
        <div className="pds-frame">
          <PublisherTopbar
            publisherName={name}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <div className="pds-body">
            <div className="pds-main">
              {children}
            </div>
          </div>
          <div className="pds-foot">
            <div className="pds-foot-inner">
              <div className="pds-foot-main">
                <div className="pds-foot-brand">
                  <div className="pds-foot-logo"><img src="/bukoo-logo.svg" alt="" /><span>BUKOO</span></div>
                  <p className="pds-foot-tagline">Pustaka Dalam Genggaman</p>
                  <p className="pds-foot-desc">Platform langganan buku digital Indonesia.<br />Baca tanpa batas, mulai dari Rp 29.900/bulan.</p>
                  <div className="pds-foot-socials">
                    <a href="https://www.instagram.com/bukooid" aria-label="Instagram"><IconInstagram /></a>
                    <a href="https://www.linkedin.com/company/bukoo-indonesia/" aria-label="LinkedIn"><IconLinkedIn /></a>
                    <a href="https://www.tiktok.com/@bukooid" aria-label="TikTok"><IconTikTok /></a>
                    <a href="https://www.youtube.com/@bukooid" aria-label="YouTube"><IconYouTube /></a>
                  </div>
                </div>
                <nav className="pds-foot-links" aria-label="Tautan footer">
                  <div><h2>Perusahaan</h2>{FOOTER_COMPANY.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</div>
                  <div><h2>Penerbit</h2>{FOOTER_PUBLISHER.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</div>
                </nav>
              </div>
              <div className="pds-foot-bottom">
                <span>© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</span>
                <div><Link href="/syarat-ketentuan">Syarat & Ketentuan</Link><Link href="/privasi">Privasi</Link></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
