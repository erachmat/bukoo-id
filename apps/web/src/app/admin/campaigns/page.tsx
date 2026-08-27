import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { books, publisherCampaignRequests } from '@bukoo/db';
import { desc, eq, inArray } from 'drizzle-orm';
import { ReviewCampaignButtons } from './ReviewCampaignButtons';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') redirect('/admin');
  const db = getDb();
  const campaigns = await db.select({ campaign: publisherCampaignRequests, bookTitle: books.title }).from(publisherCampaignRequests).leftJoin(books, eq(books.id, publisherCampaignRequests.bookId)).where(inArray(publisherCampaignRequests.status, ['SUBMITTED', 'IN_REVIEW'])).orderBy(desc(publisherCampaignRequests.submittedAt));
  return <div className="admin-page" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}><h1>Tinjauan Kampanye</h1><p style={{ color: '#667085' }}>Pengajuan promosi yang menunggu keputusan tim BUKOO.</p><table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}><thead><tr><th style={{ padding: 12, textAlign: 'left' }}>Kampanye</th><th style={{ padding: 12, textAlign: 'left' }}>Buku</th><th style={{ padding: 12, textAlign: 'left' }}>Periode</th><th style={{ padding: 12, textAlign: 'left' }}>Aksi</th></tr></thead><tbody>{campaigns.length === 0 ? <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#888' }}>Tidak ada kampanye menunggu review.</td></tr> : campaigns.map(({ campaign, bookTitle }) => <tr key={campaign.id} style={{ borderTop: '1px solid #eee' }}><td style={{ padding: 12 }}><b>{campaign.campaignName}</b><br /><small>{campaign.goal || 'Tanpa tujuan'}</small></td><td style={{ padding: 12 }}>{bookTitle || 'Buku dihapus'}</td><td style={{ padding: 12 }}>{campaign.startDate} – {campaign.endDate}</td><td style={{ padding: 12 }}><ReviewCampaignButtons campaignId={campaign.id} /></td></tr>)}</tbody></table></div>;
}