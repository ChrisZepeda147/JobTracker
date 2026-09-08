"use client";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, formatSource } from "@/lib/jobs/format";
import type { JobSearchRequest } from "@/lib/types/jobs";

function statusLabel(status: JobSearchRequest["status"]) {
  switch (status) {
    case "pending":
      return "Queued";
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
  }
}

function statusVariant(status: JobSearchRequest["status"]): "default" | "accent" | "muted" {
  if (status === "completed") return "accent";
  if (status === "failed") return "default";
  return "muted";
}

function titleSummary(request: JobSearchRequest) {
  if (request.rescore_only) return "Rescore existing jobs";
  const titles = request.titles?.length ? request.titles : request.query ? [request.query] : [];
  if (titles.length === 0) return "Job search";
  if (titles.length === 1) return titles[0];
  return `${titles[0]} + ${titles.length - 1} more`;
}

type JobSearchHistoryProps = {
  requests: JobSearchRequest[];
  loading?: boolean;
};

export function JobSearchHistory({ requests, loading }: JobSearchHistoryProps) {
  return (
    <section className="mt-10 border-t border-border pt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Recent searches</h2>
        <p className="mt-1 text-sm text-muted">Queued searches and their results.</p>
      </div>

      {loading ? <p className="text-sm text-muted">Loading searches...</p> : null}

      {!loading && requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-zinc-50 px-6 py-8 text-center text-sm text-muted">
          No searches yet. Use Search Jobs above to queue your first run.
        </div>
      ) : null}

      {!loading && requests.length > 0 ? (
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {requests.map((request) => {
            const location = request.location_zip
              ? `Zip ${request.location_zip}`
              : request.location || "Any location";
            const sources = (request.sources ?? [])
              .map((source) => formatSource(source))
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={request.id}
                className="rounded-lg border border-border bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{titleSummary(request)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {location}
                      {sources ? ` · ${sources}` : ""}
                    </p>
                  </div>
                  <Badge variant={statusVariant(request.status)}>{statusLabel(request.status)}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>{formatRelativeTime(request.created_at) ?? "Recently"}</span>
                  {request.status === "completed" ? (
                    <span>
                      {request.rescore_only
                        ? `${request.new_jobs_found} job(s) rescored`
                        : `${request.new_jobs_found} new · ${request.jobs_found} valid total`}
                    </span>
                  ) : null}
                  {request.status === "failed" && request.error ? (
                    <span className="text-red-600">{request.error}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
