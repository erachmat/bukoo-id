import React from "react";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import { PublisherDashboardShowcase } from "./showcase";
import { getPublisherCatalog, getPublisherDashboardOverview } from "./queries";

export const metadata = {
  title: "BUKOO — Publisher Dashboard",
  description: "Dashboard penerbit BUKOO — insight pembacaan, royalti, dan katalog.",
};

export const dynamic = "force-dynamic";

export default async function PublisherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const user = session?.user;
  const userRole = (user as { role?: string } | undefined)?.role;

  if (user && userRole === "PUBLISHER") {
    const params = await searchParams;
    const value = (key: string) => {
      const entry = params[key];
      return Array.isArray(entry) ? entry[0] : entry;
    };
    const overview = await getPublisherDashboardOverview(user.id ?? '', user.name, {
      period: value('period'),
      from: value('from'),
      to: value('to'),
    });
    const catalog = await getPublisherCatalog(user.id ?? '');
    const tabs = ['overview', 'katalog', 'royalti', 'performa', 'pembaca', 'demografi', 'geo', 'waktu', 'metadata'];
    const tab = tabs.includes(value('tab') ?? '') ? value('tab')! : 'overview';
    return <DashboardClient user={user} overview={overview} catalog={catalog} tab={tab} />;
  }

  return <PublisherDashboardShowcase />;
}
