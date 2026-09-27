"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PublisherSidebar } from "../sidebar-client";

interface DashboardShellProps {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const TAB_ROUTES: Record<string, string> = {
  katalog: "/publisher/books",
  upload: "/publisher/books/new",
  promosi: "/publisher/promotions",
  pengaturan: "/publisher/settings",
  notifikasi: "/publisher/notifications",
};

export function DashboardShell({ user, children, activeTab: controlledTab, onTabChange: controlledChange }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalTab, setInternalTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const name = user.name || "Mitra Penerbit";
  const activeTab = controlledTab ?? (pathname.startsWith('/publisher/books/new') ? 'upload' : pathname.startsWith('/publisher/books') ? 'katalog' : internalTab);
  const lightCatalog = pathname.startsWith('/publisher/books');

  const handleTabChange = (tab: string) => {
    setSidebarOpen(false);
    if (TAB_ROUTES[tab]) router.push(TAB_ROUTES[tab]);
    else if (controlledChange) controlledChange(tab);
    else setInternalTab(tab);
  };

  return (
    <div className={`pub-dashboard-shell pds-figma-shell${activeTab === "overview" || lightCatalog ? " is-overview" : ""}`}>
      <div className="pds-layout">
        {sidebarOpen && <button type="button" className="pds-sidebar-scrim" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}
        <PublisherSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />
        <div className="pds-workspace">
          <header className="pds-appbar">
            <button
              type="button"
              className="pds-appbar-menu"
              aria-label={sidebarOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <span /><span /><span />
            </button>
            <Link href="/publisher/dashboard" className="pds-mobile-brand">BUKOO</Link>
            <div className="pds-appbar-user">
              <span>Hi, {name}</span>
              <Link href="/publisher/settings" aria-label="Pengaturan" title="Pengaturan" className="pds-appbar-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.1 13.6 1.1.9-1.3 2.3-1.4-.5a7.7 7.7 0 0 1-1.7 1l-.2 1.5h-2.7l-.3-1.5a7.7 7.7 0 0 1-1.7-1l-1.4.5-1.3-2.3 1.1-.9a7.8 7.8 0 0 1 0-2l-1.1-.9 1.3-2.3 1.4.5a7.7 7.7 0 0 1 1.7-1l.3-1.5h2.7l.2 1.5a7.7 7.7 0 0 1 1.7 1l1.4-.5 1.3 2.3-1.1.9a7.8 7.8 0 0 1 0 2Z"/></svg>
              </Link>
              <Link href="/publisher/notifications" aria-label="Notifikasi" title="Notifikasi" className="pds-appbar-icon pds-notification-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>
              </Link>
            </div>
          </header>
          <main className="pds-main pds-figma-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
