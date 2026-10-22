/** Case-insensitive excluded keyword matching (mirrors Python keyword_filter). */



const TITLE_LEVEL_KEYWORDS = new Set(["ii", "iii", "iv"]);



const GRAD_PREF_TRIGGERS = new Set([

  "grad",

  "graduate",

  "graduation",

  "undergrad",

]);



const GRAD_TITLE_PHRASES: { label: string; pattern: RegExp }[] = [

  { label: "New Grad", pattern: /\bnew\s+grad\b/i },

  { label: "New Graduate", pattern: /\bnew\s+graduate\b/i },

  { label: "Recent Graduate", pattern: /\brecent\s+graduate\b/i },

  { label: "University Graduate", pattern: /\buniversity\s+graduate\b/i },

  { label: "Undergrad", pattern: /\bundergrad\b/i },

  { label: "Graduate", pattern: /\bgraduate\b/i },

];



const GRADUATION_TITLE = /\bgraduation\b/i;



function escapeRegex(value: string): string {

  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}



function compileGeneralKeyword(keyword: string): RegExp {

  const trimmed = keyword.trim();

  return new RegExp(`\\b${escapeRegex(trimmed)}\\b`, "i");

}



function gradFilterEnabled(keywords: string[]): boolean {

  return keywords.some((raw) => GRAD_PREF_TRIGGERS.has(raw.trim().toLowerCase()));

}



function findGradTitleMatch(title: string): string | null {

  for (const { label, pattern } of GRAD_TITLE_PHRASES) {

    if (pattern.test(title)) return label;

  }

  return null;

}



function jobKeywordHaystack(job: {

  title: string;

  company?: string;

  description?: string | null;

}): string {

  return [job.title, job.company ?? "", job.description ?? ""].filter(Boolean).join("\n");

}



export function matchesExcludedKeywords(

  job: { title: string; company?: string; description?: string | null },

  keywords: string[],

): string | null {

  const title = job.title ?? "";



  if (title.trim() && gradFilterEnabled(keywords)) {

    const gradHit = findGradTitleMatch(title);

    if (gradHit) return gradHit;

  }



  const seen = new Set<string>();



  for (const raw of keywords) {

    const keyword = raw.trim();

    if (!keyword) continue;

    const key = keyword.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);



    if (GRAD_PREF_TRIGGERS.has(key)) {

      if (key === "graduation" && title.trim() && GRADUATION_TITLE.test(title)) {

        return keyword;

      }

      continue;

    }



    if (TITLE_LEVEL_KEYWORDS.has(key)) {

      if (title.trim() && compileGeneralKeyword(keyword).test(title)) {

        return keyword;

      }

      continue;

    }



    const haystack = jobKeywordHaystack(job);

    if (!haystack.trim()) continue;

    if (compileGeneralKeyword(keyword).test(haystack)) {

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


