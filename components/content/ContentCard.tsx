"use client";

import { Heart, Star } from "lucide-react";
import type { ContentItem } from "@/types/content";
import Badge from "@/components/ui/Badge";

type ContentCardProps = {
  item: ContentItem;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export default function ContentCard({
  item,
  isFavorited = false,
  onToggleFavorite,
}: ContentCardProps) {
  // Falls back to a placeholder image (seeded by id, so it's stable and
  // different per card) whenever the source didn't provide a real image.
  const imageSrc = item.image || `https://picsum.photos/seed/${item.id}/600/400`;

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
      <div className="relative flex h-56 items-center justify-center bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable-domain content images */}
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-contain"
        />

        <button
          type="button"
          onClick={() => onToggleFavorite?.(item.id)}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-muted hover:text-danger"
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={isFavorited ? "fill-danger text-danger" : ""}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge tone="accent">{item.type}</Badge>
          {item.rating !== undefined && (
            <Badge tone="highlight">
              <Star size={12} aria-hidden="true" />
              {item.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-1 text-xs text-muted">
          <span>{item.author ? `${item.author} · ${item.source}` : item.source}</span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center justify-center rounded-md bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent hover:opacity-80"
        >
          {item.actionLabel}
        </a>
      </div>
    </article>
  );
}
