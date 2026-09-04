# KarovShelf — beta tester welcome message

Copy-paste ready. Send this (WhatsApp or email) alongside each new tester's
login email + PIN when you create their account. Written in your own voice —
edit freely.

---

Welcome to KarovShelf! 📚

A few quick things before you start:

**How it works.** Go to **https://karovshelf.vercel.app** and log in with
the email + PIN I gave you, then go to **Upload** and take a few photos of
your bookshelves — step back and get the *whole* shelf in frame rather than
close-ups, with decent lighting. That's what lets the scanner actually read
the spines.

A few tips that make a real difference to how well it reads:
- **Straighten the shelf first.** Books can lean any which way (upright,
  sideways, stacked flat) — that's fine — just make sure every spine is
  actually visible and not hidden behind another book.
- **Take the photo in decent light and hold the camera steady** so the
  spine text isn't blurry — that's the single biggest thing that trips up
  the scanner.
- **Take the photo with your phone's normal camera first, then crop it down
  to just the shelf of books** before uploading (cut out the wall, floor,
  other furniture) — a tighter, book-only photo reads much better than a
  wide shot with a lot of empty space around the shelf.
- Once your photos are ready, **upload them all together as one batch**
  rather than one at a time.

**What happens next.** I read through each batch by hand (with AI helping),
so it's not instant — usually within a day or two, sometimes longer if I'm
swamped. You'll see your batch's status on the Upload page while you wait.

**Nothing is public until you say so.** Every book that gets scanned lands in
**My Library** as a private draft only you can see. You review each one, fix
anything that's wrong, and only the ones you mark **Shareable** ever show up
when a neighbour searches.

**Your contact info stays private too.** Your WhatsApp number is only shown
to someone once you've accepted *their specific* borrow request — never
before that, and never to anyone else.

**Heads up — this is a small, early pilot.** You might hit rough edges,
especially with dense or unusual shelves (lots of duplicate copies of the
same book, or specialty/Judaica editions can occasionally take longer to
process). Let me know if something looks wrong and I'll take a look.

---

## Notes for future updates to this message

- **Wait-time framing** ("usually within a day or two") is a real operating
  commitment, not just copy — keep it honest as the actual turnaround
  changes. If a self-serve/faster processing path is ever built (see
  `PROJECT_SUMMARY.md` §10, item #3 in the adoption-review list), update this
  before it goes stale.
- **The privacy claims here are backed by real fixes**, not just UI
  convention: `profiles.contact_note` reveal-on-accept is enforced by RLS
  (`profile_contacts` table, fixed 2026-09-03 — see `PROJECT_SUMMARY.md`
  §10), not just app-level display logic. Safe to keep stating this plainly.
- **The Judaica/duplicate-shelf caveat** references two real findings from
  a live test (repetition-loop false-positive on bulk-duplicate shelves;
  low catalogue match rate on specialty editions — see `PROJECT_SUMMARY.md`
  §10). If those get fixed, this caveat can soften or drop.
- **The photo-taking tips (straighten/light/crop/batch-upload)** were added
  2026-09-04 from Elliot's own hands-on experience processing real batches
  manually via Claude, not guessed - a tightly cropped, well-lit, in-focus
  photo genuinely reads better, and the stylized-cover mystery book that
  came up more than once during real processing (never confidently
  transcribable) is exactly the kind of case a clearer photo would help
  with.
