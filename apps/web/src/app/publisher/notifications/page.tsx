import React from "react";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { notifications as notificationsTable } from "@bukoo/db";
import { eq, desc } from "drizzle-orm";
import { getPublisherUser } from "@/lib/publisher-auth";
import { DashboardShell } from "../(protected)/dashboard-shell";
import { NotificationsClient, type ClientNotification } from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function PublisherNotificationsPage() {
  let user;
  try {
    user = await getPublisherUser();
  } catch {
    redirect("/login");
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const initial: ClientNotification[] = rows.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: !!n.readAt,
  }));

  return (
    <DashboardShell user={user} activeTab="notifikasi">
      <NotificationsClient initial={initial} />
    </DashboardShell>
  );
}