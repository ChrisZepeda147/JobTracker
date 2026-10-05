export const DAILY_APPLICATION_GOAL = 10;

/** YYYY-MM-DD in the given or local timezone. */
export function localDateKey(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    ...(timeZone ? { timeZone } : {}),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildDailyApplicationCounts(
  appliedAtValues: (string | null | undefined)[],
  timeZone?: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const raw of appliedAtValues) {
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = localDateKey(date, timeZone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function goalCompletedDates(
  dailyCounts: Map<string, number>,
  goal = DAILY_APPLICATION_GOAL,
): Set<string> {
  const completed = new Set<string>();
  for (const [day, count] of dailyCounts) {
    if (count >= goal) completed.add(day);
  }
  return completed;
}

export function countForDate(dailyCounts: Map<string, number>, dateKey: string): number {
  return dailyCounts.get(dateKey) ?? 0;
}

/** Consecutive calendar days where the daily goal was met (counts through today when earned). */
export function currentGoalStreak(completedDays: Set<string>, todayKey: string): number {
  let cursor = parseDateKey(todayKey);
  if (!completedDays.has(todayKey)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (true) {
    const key = localDateKey(cursor);
    if (!completedDays.has(key)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** 0 = Sunday … 6 = Saturday */
export function firstWeekdayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

export function dateKeyFor(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${month}-${dayText}`;
}
