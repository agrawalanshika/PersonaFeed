import { Search } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Global search across news, movies, and social content — with
        debouncing — is built in Phase 12. This page marks its layout.
      </p>

      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3">
        <Search size={18} className="text-muted" aria-hidden="true" />
        <span className="text-sm text-muted">Search input will go here</span>
      </div>

      <EmptyState
        title="Nothing to show yet"
        description="Results will appear here once search is connected."
      />
    </div>
  );
}
