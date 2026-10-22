import type { JobPreferences } from "@/lib/types/database";

export function isStrictFiltering(preferences: JobPreferences | null | undefined): boolean {
  if (!preferences) return true;
  return preferences.strict_filtering !== false;
}
