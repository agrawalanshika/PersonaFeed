import { Star } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Content you favorite from your feed will be saved here, grouped by
        news, movies, and social posts. Favoriting is wired up in Phase 10.
      </p>

      <EmptyState
        icon={Star}
        title="No favorites yet"
        description="Once favoriting is live, saved items will show up in this space."
      />
    </div>
  );
}
