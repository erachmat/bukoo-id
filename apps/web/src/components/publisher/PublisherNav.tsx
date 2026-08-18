"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublisherNavProps {
  currentTab?: "daftar" | "dashboard" | "submit" | "royalti" | "panduan";
}

export function PublisherNav({ currentTab }: PublisherNavProps) {
  const pathname = usePathname();

  const getTabClass = (tabName: string) => {
    if (currentTab === tabName) return "subnav-link on";
    if (pathname.includes(`/publisher/${tabName}`)) return "subnav-link on";
    return "subnav-link";
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="pub-nav">
        <Link href="/publisher/daftar" className="pub-nav-logo">
          BUKOO <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dim)", marginLeft: "6px" }}>Publisher</span>
        </Link>
        <ul className="pub-nav-links">
          <li>
            <Link href="/" style={{ color: "var(--text-dim)" }}>Situs Utama BUKOO</Link>
          </li>
          <li>
            <Link href="/publisher/daftar" className={pathname === "/publisher/daftar" || pathname === "/publisher" ? "on" : ""}>
              Portal Penerbit
            </Link>
          </li>
          <li>
            <Link href="/publisher/panduan" className={pathname.includes("panduan") ? "on" : ""}>
              Panduan
            </Link>
          </li>
        </ul>
        <div className="pub-nav-right">
          <Link href="/login" className="btn-ghost">
            Masuk
          </Link>
          <Link href="/publisher/daftar" className="btn-cta">
            Daftar Sekarang
          </Link>
        </div>
      </header>

      {/* Main Publisher Subnav Menu Bar */}
      <nav className="pub-subnav">
        <div className="pub-subnav-in">
          <span className="pub-subnav-tag">Menu Utama Penerbit</span>
          <Link href="/publisher/daftar" className={getTabClass("daftar")}>
            Daftar Penerbit
          </Link>
          <Link href="/publisher/dashboard" className={getTabClass("dashboard")}>
            Dashboard
          </Link>
          <Link href="/publisher/submit" className={getTabClass("submit")}>
            Submit Judul
          </Link>
          <Link href="/publisher/royalti" className={getTabClass("royalti")}>
            Kebijakan Royalti
          </Link>
          <Link href="/publisher/panduan" className={getTabClass("panduan")}>
            Panduan Penerbit
          </Link>
          <Link href="https://bukoo.id" className="pub-subnav-back">
            ← Kembali ke bukoo.id
          </Link>
        </div>
      </nav>
    </>
  );
}
