import React from "react";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import { PublisherDashboardShowcase } from "./showcase";

export const metadata = {
  title: "BUKOO — Publisher Dashboard",
  description: "Dashboard penerbit BUKOO — insight pembacaan, royalti, dan katalog.",
};

export default async function PublisherDashboardPage() {
  const session = await auth();
  const user = session?.user;
  const userRole = (user as { role?: string } | undefined)?.role;

  if (user && userRole === "PUBLISHER") {
    return <DashboardClient user={user} />;
  }

  return <PublisherDashboardShowcase />;
}
