# KarovShelf web app: development notes

Live at [karovshelf.vercel.app](https://karovshelf.vercel.app).

Neighbourhood book-sharing web app for Modiin: users upload shelf photos,
review drafted catalogues, choose which books to share, search neighbours'
shareable libraries, and request to borrow.

Next.js 15 (App Router) + TypeScript + Tailwind + Supabase (Auth, Postgres, Storage).
No signup flow by design - accounts are created by the site owner via the Supabase
dashboard, and sign in with email + a short PIN (Supabase password auth).

Scanning itself happens outside this repo, in `E:\Code\karovshelf-pipeline`. Uploading a
batch here creates `scan_batches.status = 'uploaded'`; the current operating
default is for the site owner to process that batch manually with Claude via
the Python project's `manual_batch.py` workflow. The Ollama worker remains a
fallback and benchmark option. Resulting drafts appear in **My Library** for
the owner to review and confirm before any book becomes searchable.

Implemented features include multi-photo upload/history, private photo access,
library review/correction/deletion/shareability controls, Grid/Table views,
bulk confirmation and genre/category correction, neighbourhood search, and the
request → accept/decline → contact-reveal borrowing handoff.

For the full operating history, data model, and current known issues, see the
pipeline's private operating notes (not in this repo).

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY
npm run dev
```

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Both are safe to expose client-side - all data access goes through Postgres RLS
policies scoped to the signed-in user, not a service-role key.
