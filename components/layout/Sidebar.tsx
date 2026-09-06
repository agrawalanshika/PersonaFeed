"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

type SidebarProps = {
  /** When true, renders as a slide-in drawer (mobile). Otherwise a static column. */
  variant?: "static" | "drawer";
  onNavigate?: () => void;
};

export default function Sidebar({ variant = "static", onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={
        variant === "static"
          ? "hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface"
          : "flex h-full w-64 flex-col bg-surface"
      }
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
          PC
        </span>
        <span className="text-sm font-semibold tracking-tight">
          Personalized Content
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-accent-soft/60 hover:text-foreground"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border px-5 py-4 text-xs text-muted">
        Phase 2 · shell only — data is placeholder
      </div>
    </nav>
  );
}
