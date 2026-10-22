import { queueReevaluateStoredJobs } from "@/lib/jobs/maintenance";

export type ReevaluateResult = {
  mode: "background" | "immediate" | "queued";
  refiltered?: number;
  rescored?: number;
  message: string;
};

type ReevaluateOptions = {
  /** Wait for worker to finish (Jobs page button). Default false = return immediately. */
  wait?: boolean;
};

/** Local dev: background worker via API, or sync when wait=true. Production: queue for worker. */
export async function reevaluateStoredJobs(
  userId: string,
  options: ReevaluateOptions = {},
): Promise<ReevaluateResult> {
  const wait = options.wait ?? false;
  const url = wait ? "/api/jobs/reevaluate?sync=1" : "/api/jobs/reevaluate";

  try {
    const res = await fetch(url, { method: "POST" });
    if (res.status === 501) {
      await queueReevaluateStoredJobs(userId);
      return {
        mode: "queued",
        message:
          "Re-evaluation queued. Start the job worker (npm run search or search:worker) to apply updates.",
      };
    }
    if (res.status === 202) {
      const data = (await res.json()) as { message?: string };
      return {
        mode: "background",
        message:
          data.message ??
          "Re-evaluation started in the background. Refresh Jobs in a few minutes.",
      };
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Re-evaluate failed (${res.status})`);
    }
    const data = (await res.json()) as { refiltered: number; rescored: number };
    return {
      mode: "immediate",
      refiltered: data.refiltered,
      rescored: data.rescored,
      message: `Updated ${data.refiltered} job filter(s) and re-scored ${data.rescored} job(s). Refresh complete.`,
    };
  } catch (err) {
    if (err instanceof TypeError) {
      await queueReevaluateStoredJobs(userId);
      return {
        mode: "queued",
        message: "Re-evaluation queued (could not reach local API).",
      };
    }
    throw err;
  }
}
