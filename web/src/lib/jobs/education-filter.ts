/** Hard CS-degree requirement detection (mirrors job_engine.education_filter). */

const CS_DEGREE_REQUIRED = [
  /\b(?:bachelor(?:'s)?|b\.s\.|bs)\b[^.\n]{0,80}\b(?:in|of)\b[^.\n]{0,40}\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b/i,
  /\bdegree\s+in\s+(?:computer science|comp\.?\s*sci\.?|\bcs\b)\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i,
  /\b(?:computer science|comp\.?\s*sci\.?|\bcs\b)\s+degree\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i,
  /\bcs\s+major\b[^.\n]{0,40}\b(?:required|must|mandatory)\b/i,
];

const SOFT_EDUCATION =
  /\b(?:preferred|plus|nice to have|or equivalent|equivalent experience|or related(?:\s+field)?|related field|strongly preferred|is a plus)\b/i;

export function requiresCsDegree(job: {
  title?: string | null;
  description?: string | null;
}): boolean {
  const haystack = [job.title, job.description].filter(Boolean).join("\n");
  if (!haystack.trim()) return false;

  for (const pattern of CS_DEGREE_REQUIRED) {
    const match = pattern.exec(haystack);
    if (!match) continue;
    const start = Math.max(0, match.index - 40);
    const end = match.index + match[0].length + 80;
    const window = haystack.slice(start, end);
    if (SOFT_EDUCATION.test(window)) continue;
    return true;
  }
  return false;
}

export function isEducationBlocked(job: {
  title: string;
  description?: string | null;
  user_state?: { education_status?: "pass" | "rejected" | null };
}): boolean {
  if (job.user_state?.education_status === "rejected") {
    return true;
  }
  return requiresCsDegree(job);
}
