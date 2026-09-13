import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import {
  books as booksTable,
  publisherProfiles,
  publisherRoyaltyPeriods,
  users as usersTable,
} from '@bukoo/db';
import { desc, eq, sql } from 'drizzle-orm';
import { ClosePeriodForm } from './ClosePeriodForm';

export const dynamic = 'force-dynamic';

export default async function AdminRoyaltyPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/admin');
  }

  const db = getDb();

  // Publishers with at least one book — the only ones a close can compute for.
  const publishers = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      bookCount: sql<number>`count(${booksTable.id})`,
    })
    .from(usersTable)
    .innerJoin(booksTable, eq(booksTable.publisherUserId, usersTable.id))
    .where(eq(usersTable.role, 'PUBLISHER'))
    .groupBy(usersTable.id, usersTable.name, usersTable.email)
    .orderBy(usersTable.email);

  const closedPeriods = await db
    .select({
      id: publisherRoyaltyPeriods.id,
      publisherUserId: publisherRoyaltyPeriods.publisherUserId,
      periodStart: publisherRoyaltyPeriods.periodStart,
      status: publisherRoyaltyPeriods.status,
      revenuePool: publisherRoyaltyPeriods.revenuePool,
      publisherShare: publisherRoyaltyPeriods.publisherShare,
      calcVersion: publisherRoyaltyPeriods.calcVersion,
      finalizedAt: publisherRoyaltyPeriods.finalizedAt,
    })
    .from(publisherRoyaltyPeriods)
    .orderBy(desc(publisherRoyaltyPeriods.periodStart))
    .limit(20);

  const publisherNames = new Map<string, string>();
  for (const p of publishers) publisherNames.set(p.id, p.name || p.email);
  const profiles = await db
    .select({ userId: publisherProfiles.userId, displayName: publisherProfiles.displayName })
    .from(publisherProfiles);
  for (const prof of profiles) {
    if (prof.displayName) publisherNames.set(prof.userId, prof.displayName);
  }

  const fmtIdr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ad-text)', marginBottom: 6 }}>
        Royalti penerbit
      </h1>
      <p style={{ color: 'var(--ad-dim)', marginBottom: 24 }}>
        Tutup periode bulanan untuk menghitung dan membekukan royalti penerbit (PPh 23 23%).
      </p>

      <ClosePeriodForm
        publishers={publishers.map((p) => ({ id: p.id, label: publisherNames.get(p.id) || p.email, bookCount: Number(p.bookCount) }))}
      />

      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ad-text)', margin: '32px 0 12px' }}>
        Periode terkunci (20 terakhir)
      </h2>
      {closedPeriods.length === 0 ? (
        <p style={{ color: 'var(--ad-dim)', fontSize: 14 }}>Belum ada periode yang ditutup.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--ad-panel)', borderRadius: 8 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #E5E9EE' }}>
                <th style={{ padding: '10px 12px' }}>Penerbit</th>
                <th style={{ padding: '10px 12px' }}>Periode</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Pool</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Bagian penerbit</th>
                <th style={{ padding: '10px 12px' }}>Difinalisasi</th>
              </tr>
            </thead>
            <tbody>
              {closedPeriods.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--ad-text)' }}>{publisherNames.get(row.publisherUserId) || row.publisherUserId}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ad-text)' }}>{row.periodStart.slice(0, 7)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: row.status === 'PAID' ? '#DFF5EC' : row.status === 'CALCULATED' ? '#E8F0FE' : '#F4F5F7',
                      color: row.status === 'PAID' ? '#16835F' : row.status === 'CALCULATED' ? '#2C5FB8' : '#555',
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--ad-text)' }}>{fmtIdr(row.revenuePool)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--ad-text)' }}>{fmtIdr(row.publisherShare)}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ad-dim)' }}>{row.finalizedAt?.slice(0, 16).replace('T', ' ') ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
