/** Case-insensitive excluded keyword matching (mirrors Python keyword_filter). */

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileKeywordPattern(keyword: string): RegExp {
  const trimmed = keyword.trim();
  const lower = trimmed.toLowerCase();
  const escaped = escapeRegex(trimmed);
  if (lower.length <= 4 && /^[a-z]+$/i.test(lower)) {
    return new RegExp(`\\b${escaped}(?:uate|uation|s)?\\b`, "i");
  }
  return new RegExp(`\\b${escaped}\\b`, "i");
}

export function matchesExcludedKeywords(
  job: { title: string; company?: string; description?: string | null },
  keywords: string[],
): string | null {
  const seen = new Set<string>();
  const haystack = [job.title, job.company ?? "", job.description ?? ""].filter(Boolean).join("\n");
  if (!haystack.trim()) {
    return null;
  }

  for (const raw of keywords) {
    const keyword = raw.trim();
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (compileKeywordPattern(keyword).test(haystack)) {
      return keyword;
    }
  }
  return null;
}

export function isKeywordExcluded(
  job: { title: string; company?: string; description?: string | null },
  keywords: string[],
): boolean {
  return matchesExcludedKeywords(job, keywords) !== null;
}
