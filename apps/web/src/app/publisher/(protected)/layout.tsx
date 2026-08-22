import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./dashboard-shell";

// Protected publisher layout — requires PUBLISHER role.
// Wraps: books (and sub-routes) inside this route group. NOTE: /publisher/dashboard
// and /publisher/submit live OUTSIDE this group and are gated by middleware
// (PUBLISHER role required) — keep both in sync if moving routes.
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
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
