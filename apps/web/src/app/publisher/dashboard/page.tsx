import React from "react";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import { PublisherDashboardShowcase } from "./showcase";
import { getPublisherDashboardOverview } from "./queries";

export const metadata = {
  title: "BUKOO — Publisher Dashboard",
  description: "Dashboard penerbit BUKOO — insight pembacaan, royalti, dan katalog.",
};

export const dynamic = "force-dynamic";

export default async function PublisherDashboardPage() {
  const session = await auth();
  const user = session?.user;
  const userRole = (user as { role?: string } | undefined)?.role;

  if (user && userRole === "PUBLISHER") {
    const overview = await getPublisherDashboardOverview(user.id ?? '');
    return <DashboardClient user={user} overview={overview} />;
  }

  return <PublisherDashboardShowcase />;
}
