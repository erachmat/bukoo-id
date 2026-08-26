"use client";

import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { useState } from "react";

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
  { id: "promosi", label: "Promosi" },
];

export function PublisherTopbar({
  publisherName,
  activeTab,
  onTabChange,
}: TopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const initial = publisherName.charAt(0).toUpperCase();

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
      </div>
      <div className="pds-tb-right">
        <div className="pds-pub-badge">✦ {publisherName}</div>
        <div style={{ position: "relative" }}>
          <button
            className="pds-avatar"
            title="Akun penerbit"
            onClick={() => setAvatarOpen((v) => !v)}
            style={{ border: "none" }}
          >
            {initial}
          </button>
          {avatarOpen && (
            <div className="pds-avatar-menu">
              <button
                type="button"
                className="pds-avatar-item danger"
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setAvatarOpen(false);
                  signOut({ redirectTo: "/publisher/daftar" });
                }}
              >
                🚪 Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
