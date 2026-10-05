"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  DAILY_APPLICATION_GOAL,
  dateKeyFor,
  daysInMonth,
  firstWeekdayOfMonth,
  monthLabel,
} from "@/lib/jobs/application-stats";
import { cn } from "@/lib/utils/cn";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ApplicationGoalCalendarProps = {
  dailyCounts: Map<string, number>;
  goalCompletedDays: Set<string>;
  todayKey: string;
};

export function ApplicationGoalCalendar({
  dailyCounts,
  goalCompletedDays,
  todayKey,
}: ApplicationGoalCalendarProps) {
  const today = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    return { year: y, monthIndex: m - 1, day: d };
  }, [todayKey]);

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(today.monthIndex);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonthIndex + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonthIndex(next.getMonth());
  }

  const totalDays = daysInMonth(viewYear, viewMonthIndex);
  const leadingBlanks = firstWeekdayOfMonth(viewYear, viewMonthIndex);

  const monthDays = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const dateKey = dateKeyFor(viewYear, viewMonthIndex, day);
    const count = dailyCounts.get(dateKey) ?? 0;
    const goalMet = goalCompletedDays.has(dateKey);
    const isToday = dateKey === todayKey;
    return { day, dateKey, count, goalMet, isToday };
  });

  const starsThisMonth = monthDays.filter((d) => d.goalMet).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Goal calendar</p>
          <p className="text-xs text-muted">
            {DAILY_APPLICATION_GOAL}+ applications per day earns a star
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-zinc-100 hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium">
            {monthLabel(viewYear, viewMonthIndex)}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-zinc-100 hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <div key={`blank-${index}`} className="aspect-square" />
        ))}
        {monthDays.map(({ day, dateKey, count, goalMet, isToday }) => (
          <div
            key={dateKey}
            title={
              count > 0
                ? `${count} applied${goalMet ? " — goal reached!" : ""}`
                : "No applications"
            }
            className={cn(
              "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs",
              isToday && "ring-2 ring-accent ring-offset-1",
              goalMet ? "bg-amber-50 text-amber-950" : count > 0 ? "bg-zinc-50" : "bg-transparent",
            )}
          >
            <span className={cn("font-medium", isToday && "text-accent")}>{day}</span>
            {goalMet ? (
              <Star className="mt-0.5 h-3 w-3 fill-amber-400 text-amber-500" aria-hidden />
            ) : count > 0 ? (
              <span className="mt-0.5 text-[10px] text-muted">{count}</span>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        {starsThisMonth} star{starsThisMonth === 1 ? "" : "s"} in {monthLabel(viewYear, viewMonthIndex)}
      </p>
    </div>
  );
}
