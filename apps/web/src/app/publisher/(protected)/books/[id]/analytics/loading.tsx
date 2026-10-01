export default function PublisherBookAnalyticsLoading() {
  return (
    <section className="pds-panel" aria-busy="true" aria-live="polite">
      <div className="pds-panel-title">Memuat analitik buku</div>
      <p style={{ color: 'var(--pds-muted)' }}>
        Memuat aktivitas baca dan funnel penemuan web…
      </p>
    </section>
  );
}
