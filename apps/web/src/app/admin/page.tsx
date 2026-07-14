import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [totalBooks, totalUsers, premiumBooks, freeBooks] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.book.count({ where: { NOT: { subscriptionRequired: 'FREE' } } }),
    prisma.book.count({ where: { subscriptionRequired: 'FREE' } }),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const recentBooks = await prisma.book.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, author: true, subscriptionRequired: true, genre: true },
  })

  const stats = [
    { label: 'Total Buku', value: totalBooks.toLocaleString('id-ID'), icon: '📚', sub: `${premiumBooks} premium · ${freeBooks} gratis`, live: true },
    { label: 'Total Pengguna', value: totalUsers.toLocaleString('id-ID'), icon: '👥', sub: 'Terdaftar di platform', live: true },
    { label: 'Total Pendapatan', value: 'Rp —', icon: '💰', sub: 'Belum tersedia (Phase 6)', live: false },
    { label: 'Sesi Aktif', value: '—', icon: '📈', sub: 'Belum tersedia (Phase 6)', live: false },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A2332', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#6B7A8D', marginTop: 6, fontSize: 14 }}>Ringkasan performa platform BUKOO.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', opacity: stat.live ? 1 : 0.7 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1A2332', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7A8D', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#AAB4C0', marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Books */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A2332', margin: 0 }}>Buku Terbaru</h2>
            <Link href="/admin/books" style={{ fontSize: 12, color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentBooks.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAB4C0', textAlign: 'center', padding: '20px 0' }}>Belum ada buku.</p>
          ) : recentBooks.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < recentBooks.length - 1 ? 12 : 0, marginBottom: i < recentBooks.length - 1 ? 12 : 0, borderBottom: i < recentBooks.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
              <div style={{ width: 36, height: 52, background: '#F0F2F5', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1A2332', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                <div style={{ fontSize: 11, color: '#8896A5', marginTop: 2 }}>{b.author}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: b.subscriptionRequired !== 'FREE' ? 'rgba(245,158,11,0.1)' : 'rgba(0,201,167,0.1)', color: b.subscriptionRequired !== 'FREE' ? '#B45309' : '#00856F', flexShrink: 0 }}>
                {b.subscriptionRequired !== 'FREE' ? b.subscriptionRequired : 'FREE'}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1A2332', margin: 0 }}>Pengguna Terbaru</h2>
            <Link href="/admin/users" style={{ fontSize: 12, color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAB4C0', textAlign: 'center', padding: '20px 0' }}>Belum ada pengguna.</p>
          ) : recentUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < recentUsers.length - 1 ? 12 : 0, marginBottom: i < recentUsers.length - 1 ? 12 : 0, borderBottom: i < recentUsers.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#004D4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {(u.name?.[0] ?? u.email[0]).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1A2332', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name ?? '(Tanpa nama)'}</div>
                <div style={{ fontSize: 11, color: '#8896A5', marginTop: 1 }}>{u.email}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: u.role === 'ADMIN' ? 'rgba(168,85,247,0.12)' : '#F0F2F5', color: u.role === 'ADMIN' ? '#7C3AED' : '#6B7A8D', flexShrink: 0 }}>
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
        <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1A2332', fontWeight: 700, padding: '11px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none', border: '1px solid #E8ECF0' }}>
          Kelola Pengguna
        </Link>
      </div>
    </div>
  )
}
