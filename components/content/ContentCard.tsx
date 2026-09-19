"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { ContentItem } from "@/types/content";
import Badge from "@/components/ui/Badge";

type ContentCardProps = {
  item: ContentItem;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  /** Optional stagger index for the entrance animation (capped internally)
   * and to decide eager vs. lazy image loading (first row loads eagerly). */
  index?: number;
};

function ContentCard({
  item,
  isFavorited = false,
  onToggleFavorite,
  index = 0,
}: ContentCardProps) {
  // Placeholder is seeded by id, so it's stable and different per card.
  const fallbackSrc = `https://picsum.photos/seed/${item.id}/600/400`;
  // Tracked in state (not just item.image || fallback) so a real URL that
  // *fails to load* — e.g. a news site blocking hotlinking — still falls
  // back to the placeholder instead of showing a broken-image icon.
  const [imgSrc, setImgSrc] = useState(item.image || fallbackSrc);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -3 }}
      className="flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-48 bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable-domain content images */}
        <img
          src={imgSrc}
          alt=""
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImgSrc(fallbackSrc)}
        />

        <motion.button
          type="button"
          onClick={() => onToggleFavorite?.(item.id)}
          whileTap={{ scale: 0.8 }}
          animate={isFavorited ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-muted hover:text-danger"
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={isFavorited ? "fill-danger text-danger" : ""}
          />
        </motion.button>
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
    </motion.article>
  );
}

export default memo(ContentCard);
