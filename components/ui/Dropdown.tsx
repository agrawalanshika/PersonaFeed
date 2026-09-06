"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  label: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
};

export default function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div ref={containerRef} className="relative inline-block text-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-foreground hover:bg-accent-soft/60"
      >
        {selectedLabel}
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 min-w-full rounded-md border border-border bg-surface py-1 shadow-sm"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left hover:bg-accent-soft/60 ${
                  option.value === value ? "text-accent" : "text-foreground"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
