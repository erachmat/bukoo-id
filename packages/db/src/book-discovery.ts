/**
 * Store web discovery activity as daily aggregates. Only a signed-in app-CTA
 * click keeps one account/book timestamp, which is needed for read attribution.
 */
export type BookDiscoveryEventType = 'detail_view' | 'app_cta_click';

export async function recordBookDiscoveryEvent(
  database: D1Database,
  input: {
    bookId: string;
    eventType: BookDiscoveryEventType;
    accountId: string | null;
    /** Server time. The browser never supplies an event timestamp. */
    receivedAt: string;
  },
): Promise<boolean> {
  const book = await database
    .prepare(
      `SELECT id FROM books
        WHERE id = ? AND is_published = 1 AND archived_at IS NULL`,
    )
    .bind(input.bookId)
    .first<{ id: string }>();
  if (!book) return false;

  const counterColumn =
    input.eventType === 'detail_view'
      ? input.accountId
        ? 'signed_in_detail_views'
        : 'anonymous_detail_views'
      : input.accountId
        ? 'signed_in_app_cta_clicks'
        : 'anonymous_app_cta_clicks';
  const metricDate = input.receivedAt.slice(0, 10);
  const statements = [
    database
      .prepare(
        `INSERT INTO book_discovery_daily_metrics (
           book_id, metric_date, ${counterColumn}, created_at, updated_at
         ) VALUES (?, ?, 1, ?, ?)
         ON CONFLICT(book_id, metric_date) DO UPDATE SET
           ${counterColumn} = book_discovery_daily_metrics.${counterColumn} + 1,
           updated_at = excluded.updated_at`,
      )
      .bind(input.bookId, metricDate, input.receivedAt, input.receivedAt),
  ];

  if (input.eventType === 'app_cta_click' && input.accountId) {
    statements.push(
      database
        .prepare(
          `INSERT INTO book_discovery_cta_last_clicks (
             account_id, book_id, last_clicked_at
           ) VALUES (?, ?, ?)
           ON CONFLICT(account_id, book_id) DO UPDATE SET
             last_clicked_at = CASE
               WHEN excluded.last_clicked_at > book_discovery_cta_last_clicks.last_clicked_at
               THEN excluded.last_clicked_at
               ELSE book_discovery_cta_last_clicks.last_clicked_at
             END`,
        )
        .bind(input.accountId, input.bookId, input.receivedAt),
    );
  }

  await database.batch(statements);
  return true;
}
