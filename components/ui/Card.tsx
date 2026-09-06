import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-surface ${className}`}
      {...props}
    />
  );
}
