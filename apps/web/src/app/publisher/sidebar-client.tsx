"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onNavigate?: () => void;
}

const analyticsNav = [
  { id: "overview",   label: "Overview" },
  { id: "performa",   label: "Performa Buku" },
  { id: "royalti-info", label: "Royalti", href: "/publisher/royalti" },
  { id: "royalti",    label: "Royalti Per Judul" },
  { id: "pembaca",    label: "Pembaca" },
  { id: "waktu",      label: "Waktu Baca" },
  { id: "demografi",  label: "Demografi" },
  { id: "geo",        label: "Sebaran Geo" },
];

const contentNav = [
  { id: "katalog",   label: "Katalog", href: "/publisher/books" },
  { id: "upload",    label: "Upload Buku", href: "/publisher/books/new" },
  { id: "promosi",   label: "Promosi", href: "/publisher/promotions" },
  { id: "metadata",  label: "Metadata" },
];

export function PublisherSidebar({ activeTab, onTabChange, isOpen = false, onNavigate }: SidebarProps) {
  const [isSigningOut, startSignOut] = useTransition();

  const handleSignOut = () => {
    // Deterministic logout: /api/logout clears the session cookies on its own
    // 303 response (the NextAuth server-action path can drop Set-Cookie on
    // Cloudflare Workers, leaving the session alive after "Keluar").
    startSignOut(() => {
      window.location.assign("/api/logout");
    });
  };

  const renderItem = (item: { id: string; label: string; href?: string; badge?: string }) => {
    const isActive = activeTab === item.id;
    const cls = `pds-side-item${isActive ? " active" : ""}`;

    if (item.href) {
      return (
        <Link key={item.id} href={item.href} className={cls} onClick={onNavigate}>
          <span className="pds-side-icon" aria-hidden="true">{item.id === "royalti-info" ? "◈" : "▤"}</span>
          {item.label}
        </Link>
      );
    }
    return (
      <button key={item.id} className={cls} aria-current={isActive ? "page" : undefined} onClick={() => { onTabChange(item.id); onNavigate?.(); }}>
        <span className="pds-side-icon" aria-hidden="true">{({ overview: "⌂", performa: "⌁", royalti: "▤", pembaca: "♙", waktu: "◷", demografi: "♧", geo: "◎", katalog: "▣", upload: "⇧", promosi: "◇", metadata: "▧" } as Record<string, string>)[item.id] ?? "•"}</span>
        {item.label}
        {item.badge && <span className="pds-side-badge">{item.badge}</span>}
      </button>
    );
  };

  return (
    <aside className={`pds-sidebar${isOpen ? " is-open" : ""}`}>
      <Link href="/publisher/dashboard" className="pds-side-brand" onClick={onNavigate}>
        <Image src="/bukoo-logo.svg" alt="" width={25} height={25} />
        <span>BUKOO</span>
      </Link>
      <div className="pds-side-label">Menu</div>
      {analyticsNav.map(renderItem)}

      <div className="pds-side-label">Konten</div>
      {contentNav.map(renderItem)}
      <div className="pds-side-foot">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--pds-coral)",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--pds-sans)",
            padding: 0,
            width: "100%",
            textAlign: "left",
            opacity: isSigningOut ? 0.6 : 1,
          }}
        >
          {isSigningOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </aside>
  );
}
