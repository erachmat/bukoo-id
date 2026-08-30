import { getDb } from '@/lib/db'
import { users as usersTable, subscriptions } from '@bukoo/db'
import { desc, eq } from 'drizzle-orm'
import { UserRoleSelect } from './_components/user-role-select'
import { DeleteUserButton } from './_components/delete-user-button'

export const dynamic = 'force-dynamic'

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:           { bg: 'rgba(168,85,247,0.12)', color: '#A78BFA' },
  PUBLISHER:       { bg: 'rgba(245,158,11,0.12)', color: 'var(--ad-amber-lt)' },
  CONTENT_MANAGER: { bg: 'rgba(59,130,246,0.12)', color: '#1D4ED8' },
  USER:            { bg: 'rgba(0,201,167,0.1)',   color: '#00c9a7' },
}

export default async function AdminUsersPage() {
  const db = getDb()
  // Drizzle: select users with their subscription (left join)
  const usersWithSubs = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
      subscriptionStatus: subscriptions.status,
      subscriptionPlanId: subscriptions.planId,
    })
    .from(usersTable)
    .leftJoin(subscriptions, eq(subscriptions.userId, usersTable.id))
    .orderBy(desc(usersTable.createdAt))

  // Map to the shape the JSX below expects
  const users = usersWithSubs.map((u: typeof usersWithSubs[number]) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    subscription: u.subscriptionStatus ? { status: u.subscriptionStatus, planId: u.subscriptionPlanId ?? '' } : null,
  }))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Manajemen Pengguna</h1>
        <p style={{ color: 'var(--ad-dim)', marginTop: 6, fontSize: 14 }}>{users.length} pengguna terdaftar</p>
      </div>

      <div style={{ background: 'var(--ad-panel)', borderRadius: 16, border: '1px solid var(--ad-border)', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ad-bg)', borderBottom: '1px solid var(--ad-border)' }}>
              {['Nama & Email', 'Role', 'Langganan', 'Bergabung', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--ad-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--ad-muted)', fontSize: 14 }}>Belum ada pengguna.</td>
              </tr>
            )}
            {users.map((user: typeof users[number], i: number) => {
              const rc = ROLE_COLORS[user.role] ?? ROLE_COLORS.USER
              return (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--ad-border)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#004D4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>
                        {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--ad-text)', fontSize: 14 }}>{user.name ?? '(Tanpa nama)'}</div>
                        <div style={{ fontSize: 12, color: 'var(--ad-muted)', marginTop: 1 }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--ad-panel-raised)', color: 'var(--ad-dim)' }}>
                      {user.subscription && (user.subscription.status === 'ACTIVE' || user.subscription.status === 'TRIALING')
                        ? user.subscription.planId.replace('plan_', '').toUpperCase()
                        : 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--ad-muted)' }}>
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <DeleteUserButton userId={user.id} userName={user.name ?? user.email} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
