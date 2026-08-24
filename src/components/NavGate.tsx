"use client";

import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";

export default function NavGate({
  displayName,
  children,
}: {
  displayName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/login");

  if (hideNav) return <>{children}</>;

  return (
    <>
      <SiteNav displayName={displayName} />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </>
  );
}
