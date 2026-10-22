"""Small samples of rejected/kept jobs for filter tuning."""

from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass, field

from job_engine.models import RawJob

logger = logging.getLogger("job_engine.rejection_audit")

_MAX_SAMPLES = 5


@dataclass
class RejectionAudit:
    samples: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))

    def add(self, bucket: str, job: RawJob, detail: str) -> None:
        rows = self.samples[bucket]
        if len(rows) >= _MAX_SAMPLES:
            return
        title = (job.title or "").strip()[:80]
        company = (job.company or "").strip()[:40]
        rows.append(f'{title} @ {company} → {detail}')

    def log_samples(self, log: logging.Logger | None = None) -> None:
        target = log or logger
        for bucket, rows in sorted(self.samples.items()):
            for line in rows:
                target.info("[FILTER AUDIT] %s: %s", bucket, line)
