"use client";

import Link from "next/link";
import { Menu, Search, Settings, Sun, Moon, Monitor } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, type Theme } from "@/store/slices/uiSlice";

type HeaderProps = {
  title: string;
  onMenuClick: () => void;
};

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];
const THEME_ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};
const THEME_LABEL: Record<Theme, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const ThemeIcon = THEME_ICON[theme];

  const cycleTheme = () => {
    const nextIndex = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length;
    dispatch(setTheme(THEME_CYCLE[nextIndex]));
  };

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

      <Link
        href="/search"
        className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted transition-colors hover:bg-accent-soft/40 sm:flex"
      >
        <Search size={16} aria-hidden="true" />
        <span>Search...</span>
      </Link>

      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Theme: ${THEME_LABEL[theme]}. Click to change.`}
        title={THEME_LABEL[theme]}
        className="rounded-md p-2 text-muted hover:bg-accent-soft/60 hover:text-foreground"
      >
        <ThemeIcon size={20} aria-hidden="true" />
      </button>

      <Link
        href="/settings"
        aria-label="Settings"
        className="rounded-md p-2 text-muted hover:bg-accent-soft/60 hover:text-foreground"
      >
        <Settings size={20} aria-hidden="true" />
      </Link>
    </header>
  );
}
