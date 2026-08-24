import Link from "next/link";
import { signOut } from "@/app/actions";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/library", label: "My Library" },
  { href: "/search", label: "Search" },
  { href: "/requests", label: "Requests" },
  { href: "/profile", label: "Profile" },
];

export default function SiteNav({ displayName }: { displayName?: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-4 border-b border-neutral-200 bg-background/90 px-4 py-3 text-sm backdrop-blur-sm dark:border-neutral-800">
      <span className="font-semibold">KarovShelf</span>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
          {l.label}
        </Link>
      ))}
      <span className="flex-1" />
      {displayName && (
        <span className="text-neutral-500">{displayName}</span>
      )}
      <form action={signOut}>
        <button type="submit" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          Sign out
        </button>
      </form>
    </nav>
  );
}
