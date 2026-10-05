"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatAppliedAt,
  formatSalaryRange,
  formatSource,
  formatWorkLocationLine,
} from "@/lib/jobs/format";
import { formatListingAge } from "@/lib/jobs/listing-age";
import { effectiveJobSalary } from "@/lib/jobs/salary-from-text";
import { cn } from "@/lib/utils/cn";
import type { JobRecord } from "@/lib/types/jobs";

type JobCardProps = {
  job: JobRecord;
  highlighted?: boolean;
  justApplied?: boolean;
  onApply: (job: JobRecord) => void;
  onMarkApplied: (job: JobRecord) => void;
  onApplyLater: (job: JobRecord) => void;
  onSkip: (job: JobRecord) => void;
};

export function JobCard({
  job,
  highlighted = false,
  justApplied = false,
  onApply,
  onMarkApplied,
  onApplyLater,
  onSkip,
}: JobCardProps) {
  const comp = effectiveJobSalary(job);
  const salaryFromText =
    job.salary_min == null && job.salary_max == null && (comp.min != null || comp.max != null);
  const salary = formatSalaryRange(comp.min, comp.max);
  const posted = formatListingAge(job);
  const source = formatSource(job.site);
  const workLocation = formatWorkLocationLine(
    job,
    job.user_state?.commute_miles,
    job.user_state?.work_arrangement,
  );
  const status = job.user_state?.status ?? "new";
  const needsDecision = status === "opened";
  const appliedAt = status === "applied" ? formatAppliedAt(job.user_state?.applied_at) : null;

  return (
    <Card
      id={`job-${job.id}`}
      className={cn(
        "scroll-mt-24 p-5 transition-all duration-500",
        highlighted && "ring-2 ring-accent ring-offset-2",
        justApplied && "border-accent/40 bg-indigo-50/80 shadow-md shadow-indigo-100",
      )}
    >
      {/* 1. Title / company */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
          <p className="mt-0.5 text-sm font-medium text-zinc-700">{job.company || "Unknown company"}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 self-start">
          {job.user_state?.is_stretch ? (
            <Badge variant="muted" className="text-xs">
              Stretch
            </Badge>
          ) : null}
          {job.match_score != null ? (
            <Badge variant="accent" className="text-sm">
              {job.match_score}% match
            </Badge>
          ) : null}
        </div>
      </div>

      {/* 2. Salary / location / meta */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {salary ? (
          <span>
            {salary}
            {salaryFromText ? " (from listing)" : ""}
          </span>
        ) : (
          <span className="text-zinc-500">Pay not listed</span>
        )}
        <span>{workLocation}</span>
        {source ? <span>{source}</span> : null}
        {posted ? <span>Posted {posted}</span> : null}
        {job.experience_requirement ? <span>{job.experience_requirement}</span> : null}
      </div>

      {/* 4. Fit explanation */}
      {job.fit_reason ? (
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">{job.fit_reason}</p>
      ) : null}

      {job.missing_skills && job.missing_skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.missing_skills.map((skill) => (
            <Badge key={skill} variant="muted">
              Missing: {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* 5. Actions */}
      <div className="mt-4 border-t border-border pt-4">
        {needsDecision ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Did you apply to this job?</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onMarkApplied(job)}>Yes, Applied</Button>
              <Button variant="secondary" onClick={() => onApplyLater(job)}>
                Apply Later
              </Button>
              <Button variant="ghost" onClick={() => onSkip(job)}>
                No, Not a Fit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {status !== "applied" && status !== "skipped" ? (
                <Button onClick={() => onApply(job)}>
                  <ExternalLink className="h-4 w-4" />
                  Apply
                </Button>
              ) : null}
              {status === "new" || status === "recommended" ? (
                <Button variant="secondary" onClick={() => onApplyLater(job)}>
                  Apply Later
                </Button>
              ) : null}
              {status !== "skipped" && status !== "applied" ? (
                <Button variant="ghost" onClick={() => onSkip(job)}>
                  Skip
                </Button>
              ) : null}
              {job.job_url ? (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 self-center text-sm text-accent hover:underline"
                >
                  View posting
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
            {appliedAt ? (
              <p className="ml-auto shrink-0 text-xs text-muted">Applied {appliedAt}</p>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
