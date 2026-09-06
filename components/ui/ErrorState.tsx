import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-danger-soft bg-danger-soft/40 py-12 text-center">
      <AlertTriangle size={24} className="text-danger" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
