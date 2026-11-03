# KarovShelf

A book-sharing web app for neighbours in Modi'in. You photograph your shelves, review the catalogue the scanner drafts, choose which books to share, and search what your neighbours are willing to lend. Borrowing runs through a request, accept, and contact-reveal flow, so a lender's contact details stay hidden until they accept a request. I built it to make a neighbourhood's home libraries usable without anyone having to type in a book list.

<!-- Screenshot placeholder: save docs/screenshot-search.png, then replace this comment with:
![Screenshot: neighbourhood search results](docs/screenshot-search.png) -->

**Live:** [karovshelf.vercel.app](https://karovshelf.vercel.app) (invite-only beta; accounts are created by the site owner)

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind
- Supabase: Auth (email + PIN), Postgres with row-level security, private Storage for shelf photos
- Vercel hosting
- Built with Claude Code
- Shelf scanning is a separate Python project: [karovshelf-pipeline](https://github.com/efitzge/karovshelf-pipeline)

## What it does

- Multi-photo shelf upload with batch history
- Library review: correct, delete, or bulk-confirm drafted books, and fix genre or category
- Per-book share controls; only confirmed, shared books are searchable
- Neighbourhood search across everyone's shared books
- Borrow requests with accept/decline and contact reveal on acceptance

All data access goes through Postgres row-level security scoped to the signed-in user. The browser only ever holds the public anon key.

## Local setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

More detail: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). The beta welcome message for new testers is in [BETA_WELCOME.md](BETA_WELCOME.md).
