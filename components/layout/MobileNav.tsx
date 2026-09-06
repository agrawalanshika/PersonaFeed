"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex h-16 items-center justify-around border-t border-border bg-surface md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium ${
              isActive ? "text-accent" : "text-muted"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
