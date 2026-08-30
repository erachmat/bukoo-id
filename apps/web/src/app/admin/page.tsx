import Link from 'next/link'
import { getDb } from '@/lib/db'
import { books as booksTable, users as usersTable } from '@bukoo/db'
import { count, ne, eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const db = getDb()
  const [[{ totalBooks }], [{ totalUsers }], [{ premiumBooks }], [{ freeBooks }]] = await Promise.all([
    db.select({ totalBooks: count() }).from(booksTable),
    db.select({ totalUsers: count() }).from(usersTable),
    db.select({ premiumBooks: count() }).from(booksTable).where(ne(booksTable.subscriptionRequired, 'FREE')),
    db.select({ freeBooks: count() }).from(booksTable).where(eq(booksTable.subscriptionRequired, 'FREE')),
  ])

  const recentUsers = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, createdAt: usersTable.createdAt })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(5)

  const recentBooksRaw = await db
    .select({ id: booksTable.id, title: booksTable.title, author: booksTable.author, subscriptionRequired: booksTable.subscriptionRequired, genre: booksTable.genre })
    .from(booksTable)
    .orderBy(desc(booksTable.createdAt))
    .limit(5)

  const recentBooks = recentBooksRaw.map((b: typeof recentBooksRaw[number]) => ({
    ...b,
    genre: typeof b.genre === 'string' ? JSON.parse(b.genre || '[]') : b.genre,
  }))

  const stats = [
    { label: 'Total Buku', value: totalBooks.toLocaleString('id-ID'), icon: '📚', sub: `${premiumBooks} premium · ${freeBooks} gratis`, live: true },
    { label: 'Total Pengguna', value: totalUsers.toLocaleString('id-ID'), icon: '👥', sub: 'Terdaftar di platform', live: true },
    { label: 'Total Pendapatan', value: 'Rp —', icon: '💰', sub: 'Belum tersedia (Phase 6)', live: false },
    { label: 'Sesi Aktif', value: '—', icon: '📈', sub: 'Belum tersedia (Phase 6)', live: false },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--ad-dim)', marginTop: 6, fontSize: 14 }}>Ringkasan performa platform BUKOO.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: 'var(--ad-panel)', borderRadius: 16, border: '1px solid var(--ad-border)', padding: '20px 22px', boxShadow: '0 4px 18px rgba(0,0,0,0.3)', opacity: stat.live ? 1 : 0.7 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ad-text)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-dim)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Books */}
        <div style={{ background: 'var(--ad-panel)', borderRadius: 16, border: '1px solid var(--ad-border)', padding: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Buku Terbaru</h2>
            <Link href="/admin/books" style={{ fontSize: 12, color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentBooks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ad-muted)', textAlign: 'center', padding: '20px 0' }}>Belum ada buku.</p>
          ) : recentBooks.map((b: typeof recentBooks[number], i: number) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < recentBooks.length - 1 ? '1px solid var(--ad-border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ad-text)' }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ad-dim)', marginTop: 2 }}>{b.author}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: b.subscriptionRequired === 'FREE' ? 'rgba(0,201,167,0.1)' : 'rgba(245,158,11,0.1)', color: b.subscriptionRequired === 'FREE' ? '#00c9a7' : '#B45309' }}>
                {b.subscriptionRequired}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div style={{ background: 'var(--ad-panel)', borderRadius: 16, border: '1px solid var(--ad-border)', padding: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Pengguna Terbaru</h2>
            <Link href="/admin/users" style={{ fontSize: 12, color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{ color: 'var(--ad-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Belum ada pengguna.</div>
          ) : recentUsers.map((u: typeof recentUsers[number], i: number) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < recentUsers.length - 1 ? 12 : 0, marginBottom: i < recentUsers.length - 1 ? 12 : 0, borderBottom: i < recentUsers.length - 1 ? '1px solid var(--ad-border)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#004D4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {(u.name?.[0] ?? u.email[0]).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--ad-text)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name ?? '(Tanpa nama)'}</div>
                <div style={{ fontSize: 11, color: 'var(--ad-muted)', marginTop: 1 }}>{u.email}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: u.role === 'ADMIN' ? 'rgba(167,139,250,0.14)' : 'var(--ad-panel-raised)', color: u.role === 'ADMIN' ? '#A78BFA' : 'var(--ad-dim)', flexShrink: 0 }}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link href="/admin/books/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00C9A7', color: '#00181A', fontWeight: 700, padding: '11px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
          + Tambah Buku
        </Link>
        <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ad-panel)', color: 'var(--ad-text)', fontWeight: 700, padding: '11px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none', border: '1px solid var(--ad-border)' }}>
          Kelola Pengguna
        </Link>
      </div>
    </div>
  )
}
