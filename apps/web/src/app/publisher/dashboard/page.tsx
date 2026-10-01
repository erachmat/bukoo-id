import React from "react";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";
import { PublisherDashboardShowcase } from "./showcase";
import { getPublisherCatalog, getPublisherDashboardOverview, getPublisherDiscoveryFunnelExport } from "./queries";

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
    const periodInput = {
      period: value('period'),
      from: value('from'),
      to: value('to'),
      now: new Date(),
    };
    const [overview, catalog, discoveryReport] = await Promise.all([
      getPublisherDashboardOverview(user.id ?? '', user.name, periodInput),
      getPublisherCatalog(user.id ?? ''),
      getPublisherDiscoveryFunnelExport(user.id ?? '', periodInput).catch(() => null),
    ]);
    const tabs = ['overview', 'katalog', 'royalti', 'performa', 'pembaca', 'demografi', 'geo', 'waktu', 'metadata'];
    const tab = tabs.includes(value('tab') ?? '') ? value('tab')! : 'overview';
    return <DashboardClient
      user={user}
      overview={overview}
      catalog={catalog}
      tab={tab}
      discoveryFunnel={{
        status: discoveryReport ? 'ready' : 'error',
        period: overview.period,
        rows: discoveryReport?.rows ?? [],
      }}
    />;
  }

  return <PublisherDashboardShowcase />;
}
