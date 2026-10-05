import { effectiveJobSalary } from "@/lib/jobs/salary-from-text";

/** Client-side salary overlap check (mirrors Python salary_filter.ranges_overlap). */

export type SalaryPrefs = {
  min: number | null;
  max: number | null;
};

export function belowSalaryFloor(
  jobMin: number | null | undefined,
  jobMax: number | null | undefined,
  userMin: number | null | undefined,
): boolean {
  if (userMin == null) return false;
  const top = jobMax ?? jobMin ?? null;
  return top != null && top < userMin;
}

export function salaryRangesOverlap(
  jobMin: number | null | undefined,
  jobMax: number | null | undefined,
  userMin: number | null | undefined,
  userMax: number | null | undefined,
): boolean {
  const effectiveJobMin = jobMin ?? jobMax ?? null;
  const effectiveJobMax = jobMax ?? jobMin ?? null;
  if (effectiveJobMin === null && effectiveJobMax === null) {
    return true;
  }

  const floor = userMin ?? 0;
  const ceiling = userMax ?? Number.POSITIVE_INFINITY;

  const jMin = effectiveJobMin ?? effectiveJobMax!;
  const jMax = effectiveJobMax ?? effectiveJobMin!;

  return !(jMax < floor || jMin > ceiling);
}

export function isSalaryOutOfRange(
  job: {
    title?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    description?: string | null;
  },
  prefs: SalaryPrefs,
): boolean {
  if (prefs.min == null && prefs.max == null) {
    return false;
  }
  const { min: jobMin, max: jobMax } = effectiveJobSalary(job);
  if (jobMin == null && jobMax == null) {
    return false;
  }
  if (belowSalaryFloor(jobMin, jobMax, prefs.min)) {
    return true;
  }
  return !salaryRangesOverlap(jobMin, jobMax, prefs.min, prefs.max);
}

export function salaryPrefsFromPreferences(
  prefs: { salary_min?: number | null; salary_max?: number | null } | null | undefined,
): SalaryPrefs {
  return {
    min: prefs?.salary_min ?? null,
    max: prefs?.salary_max ?? null,
  };
}
