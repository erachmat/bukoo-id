"use client";

import React, { useState } from "react";
import { PublisherTopbar } from "../topbar-client";
import { PublisherSidebar } from "../sidebar-client";
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
  katalog:      "/publisher/books",
  upload:       "/publisher/books/new",
  notifikasi:   "/publisher/notifications",
  pengaturan:   "/publisher/settings",
};

export function DashboardShell({
  user,
  children,
  activeTab: controlledTab,
  onTabChange: controlledChange,
}: DashboardShellProps) {
  const router = useRouter();
  const [internalTab, setInternalTab] = useState("overview");
  const name = user.name || "Gramedia Pustaka Utama";

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
            <PublisherSidebar
              user={user}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            <div className="pds-main">
              {children}
            </div>
          </div>
          <div className="pds-foot">
            <div className="pds-fnote">
              Portal Penerbit BUKOO · Data real-time dari katalog dan aktivitas baca.
              <br />© 2026 PT BUKOO DIGITAL INDONESIA · Publisher Portal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

