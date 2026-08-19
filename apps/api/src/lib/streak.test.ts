import { describe, it, expect } from 'vitest';
import { computeCurrentStreak } from './streak.js';

/** Date string `offsetDays` before today (UTC). */
function daysAgo(offsetDays: number): string {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() - offsetDays);
  return t.toISOString().slice(0, 10);
}

describe('computeCurrentStreak', () => {
  it('counts consecutive goal-met days ending today', () => {
    expect(
      computeCurrentStreak([
        { date: daysAgo(0), goalMet: true },
        { date: daysAgo(1), goalMet: true },
        { date: daysAgo(2), goalMet: true },
      ]),
    ).toBe(3);
  });

  it('returns 0 when today has a record but the goal was not met', () => {
    expect(computeCurrentStreak([{ date: daysAgo(0), goalMet: false }])).toBe(0);
  });

  it('starts from yesterday when today has no record yet', () => {
    expect(
      computeCurrentStreak([
        { date: daysAgo(1), goalMet: true },
        { date: daysAgo(2), goalMet: true },
      ]),
    ).toBe(2);
  });

  it('stops counting at a gap (missing day)', () => {
    expect(
      computeCurrentStreak([
        { date: daysAgo(0), goalMet: true },
        { date: daysAgo(2), goalMet: true }, // daysAgo(1) missing
      ]),
    ).toBe(1);
  });

  it('returns 0 for no records', () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it('does not start from yesterday if yesterday also has no record', () => {
    expect(
      computeCurrentStreak([
        { date: daysAgo(2), goalMet: true }, // today + yesterday missing
      ]),
    ).toBe(0);
  });
});
