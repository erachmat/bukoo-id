import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { publisherSubmissions } from "@bukoo/db";
import { desc } from "drizzle-orm";
import { AdminReviewActions } from "./AdminReviewButtons";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== "ADMIN") {
    redirect("/admin");
  }

  const db = getDb();
  const submissions = await db
    .select()
    .from(publisherSubmissions)
    .orderBy(desc(publisherSubmissions.createdAt));

  return (
    <div className="admin-page" style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Tinjauan Pengajuan Penerbit</h1>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
        Kelola pengajuan judul dari penerbit — setujui, tolak, atau minta perubahan.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Judul</th>
            <th style={{ padding: 12 }}>Penulis</th>
            <th style={{ padding: 12 }}>Tahun</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}>Pengajuan</th>
            <th style={{ padding: 12 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Belum ada pengajuan menunggu.
              </td>
            </tr>
          ) : (
            submissions.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{s.title}</td>
                <td style={{ padding: 12 }}>{s.author}</td>
                <td style={{ padding: 12 }}>{s.publishedYear ?? '—'}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    background: s.status === 'PUBLISHED' ? '#E8F8F0' : s.status === 'REJECTED' ? '#FEF2F2' : '#FFF7E6',
                    color: s.status === 'PUBLISHED' ? '#27AE60' : s.status === 'REJECTED' ? '#E05A3A' : '#B7791F',
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: 12, color: "#888", fontSize: 12 }}>
                  {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('id-ID') : '—'}
                </td>
                <td style={{ padding: 12 }}>
                  <AdminReviewActions submissionId={s.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}