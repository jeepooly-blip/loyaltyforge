"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-espresso text-cream" : "text-espresso/70 hover:bg-espresso/10"
      )}
    >
      {label}
    </Link>
  );
}
