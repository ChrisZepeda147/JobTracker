/** Client-side experience requirement check (mirrors Python experience_filter). */

const EXPERIENCE_PATTERNS: RegExp[] = [
  /(\d{1,2})\s*\+?\s*years?\s+of\s+(?:[\w\s,./-]{0,60})?(?:experience|exp\.?)\b/i,
  /(?:minimum|min\.?|at least|least)\s+(\d{1,2})\s*\+?\s*years?\b/i,
  /(\d{1,2})\s*[-–]\s*\d{1,2}\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,40})?(?:experience|exp\.?)\b/i,
  /(\d{1,2})\s*\+?\s*years?\s+(?:of\s+)?(?:professional|software|relevant|industry|work)\b/i,
  /(\d{1,2})\s*\+?\s*years?\s+(?:in|with)\s+(?:[\w\s,./-]{1,40})\b/i,
  /(\d{1,2})\+\s*(?:years?|yrs?)\b/i,
  /(?:experience|qualifications|requirements)\s*[:\-]\s*(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i,
  /(\d{1,2})\s*to\s*\d{1,2}\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp\.?)\b/i,
];

const TITLE_IMPLICIT_YOE: { pattern: RegExp; years: number }[] = [
  { pattern: /\b(?:principal|distinguished)\b/i, years: 10 },
  { pattern: /\bstaff\b/i, years: 8 },
  { pattern: /\b(?:senior|sr\.?)\b/i, years: 5 },
];

const MAX_REASONABLE_YOE = 25;
const MAX_HAYSTACK_CHARS = 50_000;
const MAX_MATCHES_PER_PATTERN = 50;

function normalizeExperienceText(text: string): string {
  return text.replace(/\\\+/g, "+").replace(/\\-/g, "-").replace(/\\\*/g, "*").replace(/\\_/g, "_");
}

function globalPattern(pattern: RegExp): RegExp {
  return pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
}

export function extractRequiredYears(text: string): number | null {
  if (!text.trim()) return null;

  const normalized = normalizeExperienceText(text.slice(0, MAX_HAYSTACK_CHARS));
  const found: number[] = [];

  for (const pattern of EXPERIENCE_PATTERNS) {
    const matcher = globalPattern(pattern);
    let matchCount = 0;
    for (const match of normalized.matchAll(matcher)) {
      const years = Number.parseInt(match[1] ?? "", 10);
      if (years >= 1 && years <= MAX_REASONABLE_YOE) {
        found.push(years);
      }
      matchCount += 1;
      if (matchCount >= MAX_MATCHES_PER_PATTERN) {
        break;
      }
    }
  }

  if (found.length === 0) return null;
  return Math.max(...found);
}

function inferRequiredYearsFromTitle(title: string): number | null {
  const inferred: number[] = [];
  for (const rule of TITLE_IMPLICIT_YOE) {
    if (rule.pattern.test(title)) {
      inferred.push(rule.years);
    }
  }
  if (inferred.length === 0) return null;
  return Math.max(...inferred);
}

export function extractRequiredYearsForJob(job: {
  title: string;
  description?: string | null;
}): number | null {
  const haystack = normalizeExperienceText(
    [job.title, job.description ?? ""].filter(Boolean).join("\n"),
  );
  const fromText = extractRequiredYears(haystack);
  const fromTitle = inferRequiredYearsFromTitle(job.title);
  const candidates = [fromText, fromTitle].filter((value): value is number => value != null);
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

export function isExperienceOverPreference(
  job: { title: string; description?: string | null },
  maxPreferredYears: number | null | undefined,
): boolean {
  if (maxPreferredYears == null) return false;
  const required = extractRequiredYearsForJob(job);
  if (required == null) return false;
  return required > maxPreferredYears;
}

