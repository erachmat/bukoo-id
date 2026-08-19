/**
 * Pure streak computation for reading goals.
 *
 * Days are represented as UTC `YYYY-MM-DD` strings (matching how the API stores
 * `reading_streaks.date`). A day counts toward the streak only when a record
 * exists AND `goalMet` is true.
 */

export interface StreakRowLike {
  date: string; // YYYY-MM-DD (UTC)
  goalMet: boolean;
}

/**
 * Consecutive-day reading streak ending today — or yesterday if today has no
 * record yet. Only days that have a record AND goalMet === true count.
 */
export function computeCurrentStreak(rows: StreakRowLike[]): number {
  const metByDate = new Map<string, boolean>();
  for (const row of rows) {
    // Keep the first occurrence per date (the query feeds rows desc-ordered,
    // but a date should have at most one row anyway).
    if (!metByDate.has(row.date)) metByDate.set(row.date, row.goalMet);
  }

  const cursor = new Date(); // UTC today
  if (!metByDate.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  for (;;) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (metByDate.get(dateStr) !== true) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
