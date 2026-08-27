import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { publisherProfiles, publisherPayoutAccounts } from "@bukoo/db";
import { eq } from "drizzle-orm";
import { SettingsForm } from "./SettingsForm";
import { DashboardShell } from "../(protected)/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function PublisherSettingsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const db = getDb();
  const profile = await db.query.publisherProfiles.findFirst({
    where: eq(publisherProfiles.userId, user.id ?? ''),
  });
  const payout = await db.query.publisherPayoutAccounts.findFirst({
    where: eq(publisherPayoutAccounts.publisherUserId, user.id ?? ''),
  });

  return (
    <DashboardShell user={user} activeTab="pengaturan">
      <SettingsForm
        initialName={user.name ?? ''}
        initialEmail={user.email ?? ''}
        profile={{
          displayName: profile?.displayName ?? '',
          legalName: profile?.legalName ?? '',
          contactEmail: profile?.contactEmail ?? '',
          contactPhone: profile?.contactPhone ?? '',
          website: profile?.website ?? '',
        }}
        payout={{
          method: payout?.method ?? 'BANK',
          bankCode: payout?.bankCode ?? '',
          accountHolderName: payout?.accountHolderName ?? '',
          maskedAccount: payout?.maskedAccount ?? '',
        }}
      />
    </DashboardShell>
  );
}