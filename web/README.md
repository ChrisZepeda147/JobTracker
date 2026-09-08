# JobTracker Web

Next.js dashboard for managing candidate context stored in Supabase.

The Python CLI in the repo root continues to run independently. This app does not
trigger scraping or AI scoring yet.

## Setup

1. Apply the web schema migration in Supabase (if not already applied):

   Run `schema_web.sql` from the repo root in the Supabase SQL editor.

   Also run `schema_jobs_ui.sql` for the Jobs page (search requests + application tracking).

2. Enable email/password auth in Supabase:

   Authentication → Providers → Email

3. Configure redirect URLs (required for email confirmation):

   Authentication → URL Configuration

   - **Site URL:** `http://localhost:3000` (or your LAN IP for phone testing)
   - **Redirect URLs:** add both:
     - `http://localhost:3000/auth/callback`
     - `http://YOUR_LAN_IP:3000/auth/callback` (e.g. `http://192.168.68.64:3000/auth/callback`)

   **Phone tip:** `localhost` in the email link only works on the same computer.
   To confirm on your phone, open the app at `http://YOUR_LAN_IP:3000` on your phone
   (same Wi‑Fi), sign up there, or set `NEXT_PUBLIC_SITE_URL` to that address before signing up on desktop.

4. Copy env file and fill in your publishable key:

   ```powershell
   cd web
   copy .env.local.example .env.local
   ```

   Use the same project URL and **publishable/anon** key as the Python app.
   Do **not** put `SUPABASE_SERVICE_KEY` in any `NEXT_PUBLIC_` variable.

4. Install and run:

   From the **repo root** (easiest):

   ```powershell
   cd C:\Users\chris\JobTracker
   npm run dev
   ```

   Or from `web/` directly:

   ```powershell
   cd web
   npm install
   npm run dev
   ```

   Or double-click / run `start-web.ps1` from the repo root.

   Open http://localhost:3000

## Pages

- `/sign-in`, `/sign-up` — Supabase Auth
- `/dashboard` — overview and recent jobs placeholder
- `/profile` — candidate profile
- `/resumes` — multiple resumes, one active
- `/projects` — portfolio projects
- `/job-preferences` — search filters and salary targets
- `/jobs` — browse jobs, track applications, queue searches
- `/settings` — account

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres (RLS)
