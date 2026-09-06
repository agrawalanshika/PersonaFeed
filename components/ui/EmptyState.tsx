import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Button from "@/components/ui/Button";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
      <Icon size={28} className="text-muted" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
