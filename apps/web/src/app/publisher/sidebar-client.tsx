"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const analyticsNav = [
  { id: "overview",  label: "Overview",      icon: "📊" },
  { id: "performa",  label: "Performa Buku", icon: "📈" },
  { id: "royalti",   label: "Royalti",       icon: "💰" },
  { id: "pembaca",   label: "Pembaca",        icon: "👥" },
  { id: "demografi", label: "Demografi",      icon: "🧬" },
  { id: "geo",       label: "Sebaran Geo",    icon: "🗺️" },
  { id: "waktu",     label: "Waktu Baca",     icon: "⏱️" },
];

const contentNav = [
  { id: "katalog",   label: "Katalog",        icon: "📚", href: "/publisher/books" },
  { id: "upload",    label: "Upload Buku",    icon: "➕", href: "/publisher/books/new" },
  { id: "promosi",   label: "Promosi",         icon: "📣" },
  { id: "metadata",  label: "Metadata",        icon: "📝" },
];

const accountNav = [
  { id: "pengaturan",  label: "Pengaturan",    icon: "⚙️" },
  { id: "notifikasi",  label: "Notifikasi",    icon: "🔔", badge: "4" },
];

export function PublisherSidebar({ user: _user, activeTab, onTabChange }: SidebarProps) {
  const pathname = usePathname();

  const renderItem = (item: { id: string; label: string; icon: string; href?: string; badge?: string }) => {
    const isActive = item.href ? pathname === item.href : activeTab === item.id;
    const cls = `pds-side-item${isActive ? " active" : ""}`;

    if (item.href) {
      return (
        <Link key={item.id} href={item.href} className={cls}>
          <span className="pds-side-icon">{item.icon}</span>
          {item.label}
        </Link>
      );
    }
    return (
      <button key={item.id} className={cls} onClick={() => onTabChange(item.id)}>
        <span className="pds-side-icon">{item.icon}</span>
        {item.label}
        {item.badge && <span className="pds-side-badge">{item.badge}</span>}
      </button>
    );
  };

  return (
    <aside className="pds-sidebar">
      <div className="pds-side-label">Menu</div>
      {analyticsNav.map(renderItem)}

      <div className="pds-side-label">Konten</div>
      {contentNav.map(renderItem)}

      <div className="pds-side-label">Akun</div>
      {accountNav.map(renderItem)}

      <div className="pds-side-foot">
        <div className="up">
          Model royalti: <b style={{ color: "var(--pds-teal)" }}>65%</b> · tanpa cap<br />
          Payout berikutnya: 5 Sep 2026
        </div>
        <button
          type="button"
          onClick={() => signOut({ redirectTo: "/publisher/daftar" })}
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
          }}
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}

