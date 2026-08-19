"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublisherNavProps {
  currentTab?: "daftar" | "dashboard" | "submit" | "royalti" | "panduan";
}

export function PublisherNav({ currentTab }: PublisherNavProps) {
  const pathname = usePathname();

  const getNavItemClass = (tabName: string) => {
    if (currentTab === tabName) return "on";
    if (pathname.includes(`/publisher/${tabName}`)) return "on";
    return "";
  };

  return (
    <header className="pub-nav">
      <Link href="penerbit-daftar.html" className="pub-nav-logo">
        BUKOO <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dim)", marginLeft: "6px" }}>Publisher</span>
      </Link>
      <ul className="pub-nav-links">
        <li>
          <Link href="penerbit-daftar.html" className={getNavItemClass("daftar")}>
            Daftar Penerbit
          </Link>
        </li>
        <li>
          <Link href="penerbit-dashboard.html" className={getNavItemClass("dashboard")}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="penerbit-submit.html" className={getNavItemClass("submit")}>
            Submit Judul
          </Link>
        </li>
        <li>
          <Link href="penerbit-royalti.html" className={getNavItemClass("royalti")}>
            Kebijakan Royalti
          </Link>
        </li>
        <li>
          <Link href="penerbit-panduan.html" className={getNavItemClass("panduan")}>
            Panduan Penerbit
          </Link>
        </li>
      </ul>
      <div className="pub-nav-right">
        <Link href="/login" className="btn-ghost">
          Masuk
        </Link>
        <Link href="penerbit-daftar.html" className="btn-cta">
          Daftar Sekarang
        </Link>
      </div>
    </header>
  );
}
