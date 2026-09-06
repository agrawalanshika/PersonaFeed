"use client";

import { Menu, Search, Settings } from "lucide-react";

type HeaderProps = {
  title: string;
  onMenuClick: () => void;
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-md p-2 text-muted hover:bg-accent-soft/60 hover:text-foreground md:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <h1 className="flex-1 truncate text-lg font-semibold tracking-tight">
        {title}
      </h1>

      <div className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted sm:flex">
        <Search size={16} aria-hidden="true" />
        <span>Search coming in Phase 12</span>
      </div>

      <button
        type="button"
        aria-label="Account settings"
        className="rounded-md p-2 text-muted hover:bg-accent-soft/60 hover:text-foreground"
      >
        <Settings size={20} aria-hidden="true" />
      </button>
    </header>
  );
}
