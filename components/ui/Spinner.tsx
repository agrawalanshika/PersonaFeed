import { Loader2 } from "lucide-react";

type SpinnerProps = {
  size?: number;
  label?: string;
};

export default function Spinner({ size = 20, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-muted">
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </span>
  );
}
