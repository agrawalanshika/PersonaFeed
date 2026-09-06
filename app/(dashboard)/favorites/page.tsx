import { Star } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Content you favorite from your feed will be saved here, grouped by
        news, movies, and social posts. Favoriting is wired up in Phase 10.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
        <Star size={28} className="text-muted" aria-hidden="true" />
        <p className="text-sm font-medium">No favorites yet</p>
        <p className="max-w-xs text-sm text-muted">
          Once favoriting is live, saved items will show up in this space.
        </p>
      </div>
    </div>
  );
}
