import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PublisherSidebar } from "../sidebar-client";

// Protected publisher layout — requires PUBLISHER role.
// Wraps: dashboard, submit, books (and their sub-routes).
export default async function PublisherProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  return (
    <div className="pub-container" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <PublisherSidebar user={user} />
      <div style={{ marginLeft: "260px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
