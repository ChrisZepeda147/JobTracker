/** Mirrors job_engine/management_filter.py (IC-focused strict search). */

const STRICT_TITLE_REJECT: RegExp[] = [
  /\bengineering\s+manager\b/i,
  /\bsoftware\s+engineering\s+manager\b/i,
  /\bdevelopment\s+manager\b/i,
  /\bdirector\s+of\s+engineering\b/i,
  /\bhead\s+of\s+engineering\b/i,
  /\bvp\s+(?:of\s+)?engineering\b/i,
  /\bstaff\s+engineer\b/i,
  /\bprincipal\s+engineer\b/i,
  /\bsenior\s+software\s+engineer\b/i,
  /\bsenior\s+engineer\b/i,
  /\blead\s+software\s+engineer\b/i,
  /\blead\s+engineer\b/i,
  /\b(?:sr\.?|senior)\s+(?:swe|sde|software\s+developer)\b/i,
];

const MANAGEMENT_REQUIREMENT: RegExp[] = [
  /\d{1,2}\s*\+?\s*years?\s+of\s+engineering\s+management/i,
  /\bengineering\s+management\s+experience\b/i,
  /\bpeople\s+management\s+experience\b/i,
  /\b(?:as\s+a\s+|serve\s+as\s+a\s+)?people\s+manager\b/i,
  /\bmanaged\s+a\s+team\s+of\s+(?:[\w\s,./-]{0,40})?(?:engineers|developers)\b/i,
  /\d{1,2}\s*\+?\s*years?\s+(?:of\s+)?(?:[\w\s,./-]{0,30})?managing\s+(?:a\s+team\s+of\s+)?(?:engineers|developers)\b/i,
];

const COLLABORATION_LINE =
  /\b(?:work\s+with|collaborate\s+with|partner\s+with|report\s+to|support\s+the)\s+[\w\s,./-]{0,60}(?:manager|managers|leadership)\b/i;

function lineIsCollaborationOnly(line: string): boolean {
  const stripped = line.trim();
  if (!stripped || !COLLABORATION_LINE.test(stripped)) return false;
  return !MANAGEMENT_REQUIREMENT.some((pattern) => pattern.test(stripped));
}

export function findManagementRequirement(text: string): string | null {
  if (!text.trim()) return null;
  for (const line of text.split("\n")) {
    if (lineIsCollaborationOnly(line)) continue;
    for (const pattern of MANAGEMENT_REQUIREMENT) {
      const match = line.match(pattern);
      if (match) return match[0].trim();
    }
  }
  for (const pattern of MANAGEMENT_REQUIREMENT) {
    const match = text.match(pattern);
    if (!match) continue;
    const index = match.index ?? 0;
    const snippet = text.slice(Math.max(0, index - 80), index + match[0].length + 40);
    if (COLLABORATION_LINE.test(snippet) && !/experience/i.test(snippet)) continue;
    return match[0].trim();
  }
  return null;
}

export function isManagementBlocked(job: { title: string; description?: string | null }): boolean {
  const haystack = [job.title, job.description ?? ""].filter(Boolean).join("\n");
  return findManagementRequirement(haystack) !== null;
}

export function isStrictSeniorityTitleBlocked(title: string): boolean {
  return STRICT_TITLE_REJECT.some((pattern) => pattern.test(title));
}
