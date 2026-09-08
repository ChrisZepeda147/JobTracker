"use client";

import { SKIP_REASONS, type SkipReasonId } from "@/lib/jobs/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SkipReasonDialogProps = {
  jobTitle: string;
  onConfirm: (reason: SkipReasonId, notes: string) => void;
  onCancel: () => void;
};

export function SkipReasonDialog({ jobTitle, onConfirm, onCancel }: SkipReasonDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-lg">
        <h3 className="text-base font-semibold">Why skip this job?</h3>
        <p className="mt-1 text-sm text-muted line-clamp-2">{jobTitle}</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const reason = (form.elements.namedItem("skip_reason") as HTMLSelectElement).value as SkipReasonId;
            const notes = (form.elements.namedItem("skip_notes") as HTMLTextAreaElement).value;
            onConfirm(reason, notes);
          }}
        >
          <div>
            <Label htmlFor="skip_reason">Reason</Label>
            <select
              id="skip_reason"
              name="skip_reason"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              defaultValue=""
            >
              <option value="" disabled>
                Select a reason
              </option>
              {SKIP_REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="skip_notes">Notes (optional)</Label>
            <Textarea id="skip_notes" name="skip_notes" rows={3} placeholder="Any extra detail..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Skip job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
