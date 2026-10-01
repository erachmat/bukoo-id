import { DashboardShell } from '../(protected)/dashboard-shell';

export default function PublisherDashboardLoading() {
  return (
    <DashboardShell user={{}} activeTab="performa">
      <div className="pds-dashboard-loading" aria-busy="true" aria-live="polite">
        <p className="pds-dashboard-loading-status" role="status">Memuat insight performa buku…</p>
        <div className="pds-kpi-row pds-figma-kpis" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => <div className="pds-loading-block pds-loading-kpi" key={index} />)}
        </div>
        <div className="pds-panel pds-loading-panel" aria-hidden="true">
          <div className="pds-loading-block pds-loading-line" />
          <div className="pds-loading-block pds-loading-table" />
        </div>
        <div className="pds-panel pds-loading-panel" aria-hidden="true">
          <div className="pds-loading-block pds-loading-line" />
          <div className="pds-loading-block pds-loading-card" />
        </div>
      </div>
    </DashboardShell>
  );
}
