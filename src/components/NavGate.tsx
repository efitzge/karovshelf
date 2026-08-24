"use client";

import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";

const PAGE_BACKGROUNDS: { prefix: string; className: string }[] = [
  { prefix: "/login", className: "page-login" },
  { prefix: "/upload", className: "page-upload" },
  { prefix: "/library", className: "page-library" },
  { prefix: "/search", className: "page-search" },
  { prefix: "/requests", className: "page-requests" },
  { prefix: "/profile", className: "page-profile" },
];

function pageBackgroundClass(pathname: string) {
  return PAGE_BACKGROUNDS.find((p) => pathname.startsWith(p.prefix))?.className ?? "page-home";
}

export default function NavGate({
  displayName,
  children,
}: {
  displayName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/login");
  const bgClass = pageBackgroundClass(pathname);

  if (hideNav) {
    return <div className={`page-shell ${bgClass}`}>{children}</div>;
  }

  return (
    <div className={`page-shell ${bgClass}`}>
      <SiteNav displayName={displayName} />
      <main className="mx-auto my-6 max-w-3xl rounded-2xl bg-background/95 px-4 py-6 shadow-sm">
        {children}
      </main>
    </div>
  );
}
