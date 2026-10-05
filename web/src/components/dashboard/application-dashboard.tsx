"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, Star, Target, TrendingUp } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationGoalCalendar } from "@/components/dashboard/application-goal-calendar";
import {
  buildDailyApplicationCounts,
  currentGoalStreak,
  DAILY_APPLICATION_GOAL,
  goalCompletedDates,
  localDateKey,
} from "@/lib/jobs/application-stats";
import { cn } from "@/lib/utils/cn";

type ApplicationDashboardProps = {
  appliedAtTimestamps: string[];
};

export function ApplicationDashboard({ appliedAtTimestamps }: ApplicationDashboardProps) {
  const todayKey = useMemo(() => localDateKey(new Date()), []);
  const dailyCounts = useMemo(
    () => buildDailyApplicationCounts(appliedAtTimestamps),
    [appliedAtTimestamps],
  );
  const goalDays = useMemo(() => goalCompletedDates(dailyCounts), [dailyCounts]);
  const todayCount = dailyCounts.get(todayKey) ?? 0;
  const totalApplied = appliedAtTimestamps.length;
  const progressPct = Math.min(100, Math.round((todayCount / DAILY_APPLICATION_GOAL) * 100));
  const goalMetToday = todayCount >= DAILY_APPLICATION_GOAL;
  const streak = currentGoalStreak(goalDays, todayKey);
  const totalStars = goalDays.size;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
        <Card className="relative overflow-hidden border-accent/20 bg-gradient-to-br from-indigo-50 via-white to-white">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10" />
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-accent" />
              Today&apos;s applications
            </CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {todayCount}
              <span className="text-lg font-normal text-muted"> / {DAILY_APPLICATION_GOAL}</span>
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  goalMetToday ? "bg-amber-400" : "bg-accent",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-sm text-muted">
              {goalMetToday ? (
                <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  Daily goal reached — star earned!
                </span>
              ) : todayCount === 0 ? (
                "Mark jobs as Yes Applied on the Jobs page to count toward today."
              ) : (
                `${DAILY_APPLICATION_GOAL - todayCount} more to hit today's goal.`
              )}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              Total applied
            </CardDescription>
            <CardTitle className="text-4xl tabular-nums">{totalApplied}</CardTitle>
          </CardHeader>
          <Link href="/jobs" className="text-sm font-medium text-accent hover:underline">
            View applied jobs →
          </Link>
        </Card>

        <Card className="sm:col-span-2 border-amber-100 bg-gradient-to-r from-amber-50/80 to-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardHeader className="mb-0">
              <CardDescription className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Momentum
              </CardDescription>
              <CardTitle className="text-2xl">
                {streak > 0 ? `${streak}-day streak` : "Start a streak"}
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 text-right sm:pb-0 sm:pr-6">
              <p className="text-3xl font-semibold tabular-nums text-amber-600">{totalStars}</p>
              <p className="text-xs text-muted">goal days starred (all time)</p>
            </div>
          </div>
        </Card>
      </div>

      <ApplicationGoalCalendar
        dailyCounts={dailyCounts}
        goalCompletedDays={goalDays}
        todayKey={todayKey}
      />
    </div>
  );
}
