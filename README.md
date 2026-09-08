# JobTracker

Personal job search pipeline: scrape job boards, filter and score matches against your profile, and manage applications in a Next.js web app backed by Supabase.

## Stack

- **Python worker** — scrapes LinkedIn, Indeed, ZipRecruiter, Built In; normalizes, filters, and scores jobs
- **Next.js web app** (`web/`) — dashboard, job board, preferences, resume/profile management
- **Supabase** — jobs storage, search queue, per-user job states

## Quick start

```bash
# Python
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env   # fill in Supabase + optional AI keys

# Web
npm run install:web
copy web\.env.local.example web\.env.local

# Run web + worker together
npm run search
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run search` | Next.js dev server + job worker |
| `npm run dev` | Web app only |
| `npm run search:rescore` | Re-score all stored jobs (local scorer) |
| `npm run search:once` | Process one queued search request |

## Database

Apply SQL migrations in order from the repo root (`schema.sql`, `schema_web.sql`, `schema_jobs_*.sql`) in the Supabase SQL editor.

## Secrets

Never commit `.env` or `web/.env.local`. The worker requires `SUPABASE_SERVICE_KEY`; the browser uses only the publishable/anon key.
