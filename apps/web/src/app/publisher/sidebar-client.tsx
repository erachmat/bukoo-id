"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function PublisherSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const name = user.name || "Gramedia Pustaka Utama";
  const initial = name.charAt(0).toUpperCase();

  const navItems = [
    { name: "Ringkasan Royalti", href: "/publisher/dashboard", icon: "📊" },
    { name: "Koleksi Buku", href: "/publisher/books", icon: "📖" },
    { name: "Unggah Buku Baru", href: "/publisher/books/new", icon: "➕" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-bukoo">BUKOO</div>
        <div className="logo-sub">Publisher Portal</div>
      </div>

      <div className="sidebar-pub">
        <div className="pub-avatar">{initial}</div>
        <div className="pub-name">{name}</div>
        <div className="pub-tier">Mitra Penerbit · Tier 65%</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="nav-section" style={{ flex: 1 }}>
          <div className="nav-label">Menu Utama</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span> {item.name}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="nav-item"
            style={{
              background: "none",
              border: "none",
              color: "#EF4444",
              width: "100%",
              textAlign: "left",
              padding: "10px 0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            <span className="nav-icon" style={{ opacity: 1 }}>🚪</span> Keluar
          </button>
        </div>
      </nav>
    </aside>
  );
}
