/** Detect remote-labeled postings that the body says are hybrid/onsite (mirrors worker). */

const WORKPLACE_TYPE_RE = /workplace\s*type\s*:\s*(remote|hybrid|on[-\s]?site)/i;
const HYBRID_RE = /\bhybrid\b/i;
const ONSITE_RE = /\b(on[- ]?site|in[- ]?office|in person)\b/i;
const IN_OFFICE_DAYS_RE = /\b\d+\s+days?\s+(?:a\s+week\s+)?(?:in|on)[- ]?(?:the\s+)?(?:office|site)\b/i;
const ARRANGEMENT_LINE_RE =
  /^\s*(remote|hybrid|on[- ]?site|onsite|in[- ]?office|in office)\s*$/im;
const BROAD_LOC_RE =
  /^(?:united states(?:\s+of\s+america)?|usa|u\.?s\.?a?\.?|us|america|remote)$/i;

function arrangementFromLines(description: string | null | undefined): string | null {
  if (!description) return null;
  for (const line of description.split(/\r?\n/).slice(0, 30)) {
    const match = ARRANGEMENT_LINE_RE.exec(line.trim());
    if (!match) continue;
    return match[1].toLowerCase();
  }
  return null;
}

export function remotePostingContradicted(job: {
  title?: string;
  location?: string;
  description?: string | null;
}): boolean {
  const location = (job.location ?? "").trim();
  const haystack = `${job.description ?? ""}\n${location}`.slice(0, 12000);

  const workplace = WORKPLACE_TYPE_RE.exec(haystack);
  if (workplace) {
    const token = workplace[1].toLowerCase();
    if (token.includes("hybrid") || token.includes("site")) return true;
  }

  if (IN_OFFICE_DAYS_RE.test(haystack)) return true;

  const lineMode = arrangementFromLines(job.description);
  if (lineMode === "hybrid" || lineMode === "onsite" || lineMode === "on-site") {
    return true;
  }

  const broad = !location || BROAD_LOC_RE.test(location) || /^remote\s*[-–—]/i.test(location);
  if (broad) {
    const head = haystack.slice(0, 4000);
    if (HYBRID_RE.test(head)) return true;
    if (ONSITE_RE.test(head)) return true;
  }

  return false;
}
