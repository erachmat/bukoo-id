"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

interface TopbarProps {
  publisherName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const topNavItems = [
  { id: "overview", label: "Dashboard" },
  { id: "upload", label: "Submit judul", href: "/publisher/books/new" },
  { id: "royalti", label: "Royalti" },
  { id: "pembaca", label: "Pembaca" },
];

const extraNavItems = [
  { id: "performa", label: "Performa buku" },
  { id: "waktu", label: "Waktu baca" },
  { id: "demografi", label: "Demografi" },
  { id: "geo", label: "Sebaran geografis" },
  { id: "metadata", label: "Metadata" },
  { id: "katalog", label: "Katalog", href: "/publisher/books" },
  { id: "promosi", label: "Promosi", href: "/publisher/promotions" },
  { id: "pengaturan", label: "Pengaturan", href: "/publisher/settings" },
  { id: "notifikasi", label: "Notifikasi", href: "/publisher/notifications" },
];

export function PublisherTopbar({
  publisherName,
  activeTab,
  onTabChange,
}: TopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [extraNavOpen, setExtraNavOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const avatarWrapRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const initial = publisherName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!avatarOpen && !extraNavOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!avatarWrapRef.current?.contains(event.target as Node)) {
        setAvatarOpen(false);
      }
      if (!(event.target as Element).closest(".pds-more-wrap")) setExtraNavOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAvatarOpen(false);
        setExtraNavOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    if (avatarOpen) avatarMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarOpen, extraNavOpen]);

  return (
    <div className="pds-topbar">
      <div className="pds-tb-left">
        <Link href="/publisher/dashboard" className="pds-logo">
          <img src="/bukoo-logo.svg" alt="BUKOO" className="pds-logo-img" />
          <span className="pds-logo-wm">BUKOO</span>
          <span className="pds-logo-sub">Publisher Portal</span>
        </Link>
        <nav className="pds-topnav">
          {topNavItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className={`pds-tn${activeTab === item.id ? " active" : ""}`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                className={`pds-tn${activeTab === item.id ? " active" : ""}`}
                onClick={() => onTabChange(item.id)}
              >
                {item.label}
              </button>
            )
          )}
          <div className="pds-more-wrap">
            <button
              type="button"
              className={`pds-tn${extraNavItems.some((item) => item.id === activeTab) ? " active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={extraNavOpen}
              onClick={() => setExtraNavOpen((open) => !open)}
            >
              Lainnya <span aria-hidden="true">⌄</span>
            </button>
            {extraNavOpen && (
              <div className="pds-more-menu" role="menu" aria-label="Navigasi lainnya">
                {extraNavItems.map((item) => item.href ? (
                  <Link key={item.id} role="menuitem" href={item.href} className="pds-more-item" onClick={() => setExtraNavOpen(false)}>{item.label}</Link>
                ) : (
                  <button key={item.id} type="button" role="menuitem" className="pds-more-item" onClick={() => { setExtraNavOpen(false); onTabChange(item.id); }}>{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </nav>
        <button
          type="button"
          className={`pds-mobile-menu-btn${mobileNavOpen ? " is-open" : ""}`}
          aria-label={mobileNavOpen ? "Tutup navigasi penerbit" : "Buka navigasi penerbit"}
          aria-expanded={mobileNavOpen}
          aria-controls="publisher-mobile-nav"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <span className="pds-mobile-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        {mobileNavOpen && (
          <nav id="publisher-mobile-nav" className="pds-mobile-nav" aria-label="Navigasi penerbit">
            <button type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange("overview"); }}>
              Dashboard
            </button>
            <button type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange("royalti"); }}>
              Royalti
            </button>
            <button type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange("pembaca"); }}>Pembaca</button>
            {topNavItems.filter((item) => item.id === "upload").map((item) => <Link key={item.id} href={item.href!} className="pds-mobile-nav-item" onClick={() => setMobileNavOpen(false)}>{item.label}</Link>)}
            {extraNavItems.map((item) => item.href ? (
              <Link key={item.id} href={item.href} className="pds-mobile-nav-item" onClick={() => setMobileNavOpen(false)}>{item.label}</Link>
            ) : (
              <button key={item.id} type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange(item.id); }}>{item.label}</button>
            ))}
          </nav>
        )}
      </div>
      <div className="pds-tb-right">
        <div className="pds-pub-badge">{publisherName}</div>
        <div ref={avatarWrapRef} style={{ position: "relative" }}>
          <button
            className="pds-avatar"
            title="Akun penerbit"
            aria-label="Buka menu akun penerbit"
            aria-haspopup="menu"
            aria-expanded={avatarOpen}
            aria-controls="publisher-avatar-menu"
            onClick={() => setAvatarOpen((v) => !v)}
            style={{ border: "none" }}
          >
            {initial}
          </button>
          {avatarOpen && (
            <div ref={avatarMenuRef} id="publisher-avatar-menu" className="pds-avatar-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="pds-avatar-item danger"
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", opacity: isSigningOut ? 0.6 : 1 }}
                disabled={isSigningOut}
                onClick={() => {
                  setAvatarOpen(false);
                  // Deterministic logout: /api/logout clears the session
                  // cookies on its own 303 response (the NextAuth
                  // server-action path can drop Set-Cookie on Cloudflare
                  // Workers, leaving the session alive after "Keluar").
                  startSignOut(() => {
                    window.location.assign("/api/logout");
                  });
                }}
              >
                {isSigningOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
