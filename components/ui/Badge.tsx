import type { HTMLAttributes } from "react";

type BadgeTone = "default" | "accent" | "highlight" | "success" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: "bg-background text-muted border border-border",
  accent: "bg-accent-soft text-accent",
  highlight: "bg-highlight/15 text-highlight",
  success: "bg-success/15 text-success",
  danger: "bg-danger-soft text-danger",
};

export default function Badge({
  tone = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
