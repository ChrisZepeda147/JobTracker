/** Client-side compensation parsing from job descriptions (mirrors worker parsers). */

const LINKEDIN_K_YR_RANGE =
  /\$?\s*(\d[\d,]*(?:\.\d+)?)\s*[kK]\s*\/?\s*yr\s*[-–—]\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*[kK]\s*\/?\s*yr/i;
const LINKEDIN_FULL_YR_RANGE =
  /\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*\/?\s*yr\s*[-–—]\s*\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\s*\/?\s*yr/i;
const SALARY_HINT = /(salary|compensation|pay|range|\$\s*\d)/i;
const SALARY_IN_TEXT =
  /\$?\s*(\d[\d,]*(?:\.\d+)?)\s*([kK])?\s*(?:\s*(?:-|–|—|to)\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*([kK])?)?\s*(?:per\s+year|\/yr|\/year|yearly|annually|annual|\/mo|monthly|a\s+year)?/gi;

function parseMoney(raw: string, hasK: boolean): number | null {
  const cleaned = raw.replace(/,/g, "");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return null;
  if (hasK || value < 1000) {
    return value * 1000;
  }
  return value;
}

function sanitizeRange(
  min: number | null,
  max: number | null,
): { min: number | null; max: number | null } {
  if (min != null && (min < 25_000 || min > 400_000)) min = null;
  if (max != null && (max < 25_000 || max > 400_000)) max = null;
  if (min != null && max != null && min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}

export function extractCompensationFromText(text: string | null | undefined): {
  min: number | null;
  max: number | null;
} {
  if (!text?.trim()) return { min: null, max: null };

  let match = text.match(LINKEDIN_FULL_YR_RANGE);
  if (match) {
    const min = Number.parseFloat(match[1].replace(/,/g, ""));
    const max = Number.parseFloat(match[2].replace(/,/g, ""));
    return sanitizeRange(min, max);
  }

  match = text.match(LINKEDIN_K_YR_RANGE);
  if (match) {
    const min = parseMoney(match[1], true);
    const max = parseMoney(match[2], true);
    return sanitizeRange(min, max);
  }

  if (!SALARY_HINT.test(text)) {
    return { min: null, max: null };
  }

  let bestMin: number | null = null;
  let bestMax: number | null = null;
  let bestScore = -1;

  for (const m of text.matchAll(SALARY_IN_TEXT)) {
    const min = parseMoney(m[1], Boolean(m[2]));
    const max = m[3] ? parseMoney(m[3], Boolean(m[4])) : min;
    if (min == null) continue;
    const hi = max ?? min;
    if (min < 15_000 || hi > 1_000_000) continue;
    const score = (min + hi) / 2;
    if (score > bestScore) {
      bestScore = score;
      bestMin = min;
      bestMax = hi;
    }
  }

  return sanitizeRange(bestMin, bestMax);
}

export function effectiveJobSalary(job: {
  title?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string | null;
}): { min: number | null; max: number | null } {
  const storedMin = job.salary_min ?? null;
  const storedMax = job.salary_max ?? null;
  if (storedMin != null || storedMax != null) {
    return { min: storedMin, max: storedMax };
  }
  const body = [job.title, job.description].filter(Boolean).join("\n");
  return extractCompensationFromText(body);
}
