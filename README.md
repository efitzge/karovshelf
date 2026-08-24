# KarovShelf

Neighbourhood book-sharing web app: upload shelf photos, review the AI-catalogued
drafts, search neighbours' shareable libraries, and request to borrow.

Next.js 15 (App Router) + TypeScript + Tailwind + Supabase (Auth, Postgres, Storage).
No signup flow by design - accounts are created by the site owner via the Supabase
dashboard, and sign in with email + a short PIN (Supabase password auth).

Scanning itself (photos -> catalogued books) happens outside this repo, in the
separate Python pipeline. Uploading a batch here only queues it
(`scan_batches.status = 'uploaded'`) - the site owner runs the scanner on their
own machine when convenient, and the resulting drafts show up in **My Library**
for review.

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
