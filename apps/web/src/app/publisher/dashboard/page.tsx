import React from "react";
import { auth } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "BUKOO — Publisher Dashboard",
  description: "Dashboard penerbit BUKOO — insight pembacaan, royalti, dan katalog.",
};

export default async function PublisherDashboardPage() {
  const session = await auth();
  const user = session?.user;
  return <DashboardClient user={user ?? null} />;
}
