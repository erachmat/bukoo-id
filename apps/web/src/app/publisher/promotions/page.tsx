import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { books, publisherCampaignRequests } from "@bukoo/db";
import { eq, desc } from "drizzle-orm";
import { DashboardShell } from "../(protected)/dashboard-shell";
import { CampaignsClient, type EligibleBook, type ClientCampaign } from "./CampaignsClient";

export const dynamic = "force-dynamic";

export default async function PublisherPromotionsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const db = getDb();

  // All publisher-owned books (the client picker is filtered to published ones).
  const ownedBooks = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverKey: books.coverKey,
      isPublished: books.isPublished,
      publicationStatus: books.publicationStatus,
    })
    .from(books)
    .where(eq(books.publisherUserId, user.id ?? ''))
    .orderBy(desc(books.createdAt));

  const eligibleBooks: EligibleBook[] = ownedBooks
    .filter((b) => b.isPublished && b.publicationStatus === 'PUBLISHED')
    .map((b) => ({ id: b.id, title: b.title, author: b.author, coverKey: b.coverKey }));

  const requests = await db
    .select()
    .from(publisherCampaignRequests)
    .where(eq(publisherCampaignRequests.publisherUserId, user.id ?? ''))
    .orderBy(desc(publisherCampaignRequests.createdAt));

  const bookTitleById = new Map(ownedBooks.map((b) => [b.id, b.title]));

  const campaigns: ClientCampaign[] = requests.map((r) => ({
    id: r.id,
    campaignName: r.campaignName,
    bookId: r.bookId,
    bookTitle: bookTitleById.get(r.bookId) ?? 'Buku',
    startDate: r.startDate,
    endDate: r.endDate,
    goal: r.goal,
    notes: r.notes,
    budget: r.budget,
    status: r.status,
    submittedAt: r.submittedAt,
  }));

  return (
    <DashboardShell user={user} activeTab="promosi">
      <CampaignsClient books={eligibleBooks} campaigns={campaigns} />
    </DashboardShell>
  );
}
