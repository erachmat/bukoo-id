import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { notifications as notificationsTable } from "@bukoo/db";
import { eq, desc } from "drizzle-orm";
import { NotificationsClient, type ClientNotification } from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function PublisherNotificationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id ?? ''))
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

  return <NotificationsClient initial={initial} />;
}