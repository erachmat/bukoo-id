"use client";

import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { useEffect, useRef, useState, useTransition } from "react";

interface TopbarProps {
  publisherName: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const topNavItems = [
  { id: "overview", label: "Overview" },
  { id: "katalog", label: "Katalog", href: "/publisher/books" },
  { id: "royalti", label: "Royalti" },
  { id: "pembaca", label: "Pembaca" },
];

const mobileRouteItems = [
  { id: "katalog", label: "Katalog", href: "/publisher/books" },
  { id: "upload", label: "Upload Buku", href: "/publisher/books/new" },
  { id: "notifikasi", label: "Notifikasi", href: "/publisher/notifications" },
  { id: "pengaturan", label: "Pengaturan", href: "/publisher/settings" },
  { id: "promosi", label: "Promosi", href: "/publisher/promotions" },
];

export function PublisherTopbar({
  publisherName,
  activeTab,
  onTabChange,
}: TopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const avatarWrapRef = useRef<HTMLDivElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const initial = publisherName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!avatarOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!avatarWrapRef.current?.contains(event.target as Node)) {
        setAvatarOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAvatarOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    avatarMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarOpen]);

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
        </nav>
        <button
          type="button"
          className="pds-mobile-menu-btn"
          aria-label="Buka navigasi penerbit"
          aria-expanded={mobileNavOpen}
          aria-controls="publisher-mobile-nav"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? "×" : "☰"}
        </button>
        {mobileNavOpen && (
          <nav id="publisher-mobile-nav" className="pds-mobile-nav" aria-label="Navigasi penerbit">
            <button type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange("overview"); }}>
              Overview
            </button>
            <button type="button" className="pds-mobile-nav-item" onClick={() => { setMobileNavOpen(false); onTabChange("royalti"); }}>
              Royalti
            </button>
            {mobileRouteItems.map((item) => (
              <Link key={item.id} href={item.href} className="pds-mobile-nav-item" onClick={() => setMobileNavOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="pds-tb-right">
        <div className="pds-pub-badge">✦ {publisherName}</div>
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
                  startSignOut(async () => {
                    await signOut({ redirectTo: "/publisher/daftar" });
                  });
                }}
              >
                🚪 {isSigningOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
