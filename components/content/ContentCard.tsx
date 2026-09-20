
"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  MoreVertical,
  EyeOff,
  Eye,
  CalendarDays,
} from "lucide-react";

import type { ContentItem } from "@/types/content";
import Badge from "@/components/ui/Badge";

type ContentCardProps = {
  item: ContentItem;
  isFavorited?: boolean;
  isHidden?: boolean;
  onToggleFavorite?: (id: string) => void;
  onHide?: (id: string) => void;
  onUnhide?: (id: string) => void;
  onFeedback?: (message: string) => void;
  index?: number;
};

function ContentCard({
  item,
  isFavorited = false,
  isHidden = false,
  onToggleFavorite,
  onHide,
  onUnhide,
  onFeedback,
  index = 0,
}: ContentCardProps) {
  const fallbackSrc = `https://picsum.photos/seed/${item.id}/600/400`;

  const [imgSrc, setImgSrc] = useState(
    item.image || fallbackSrc,
  );

  const [menuOpen, setMenuOpen] = useState(false);

  function handleFavorite() {
    onToggleFavorite?.(item.id);

    onFeedback?.(
      isFavorited
        ? "♡ Removed from favorites"
        : "♡ Added to favorites",
    );
  }

  function handleHide() {
    onHide?.(item.id);
    setMenuOpen(false);
    onFeedback?.("✓ Post hidden");
  }

  function handleUnhide() {
    onUnhide?.(item.id);
    setMenuOpen(false);
    onFeedback?.("✓ Post restored");
  }

  // Convert date into relative time
  function formatPublishedDate(date?: string) {
    if (!date) return "Date unavailable";

    const publishedDate = new Date(date);

    if (Number.isNaN(publishedDate.getTime())) {
      return "Date unavailable";
    }

    const now = new Date();

    const differenceInSeconds = Math.floor(
      (now.getTime() - publishedDate.getTime()) / 1000,
    );

    // Future dates
    if (differenceInSeconds < 0) {
      return "Published just now";
    }

    const minutes = Math.floor(differenceInSeconds / 60);
    const hours = Math.floor(differenceInSeconds / 3600);
    const days = Math.floor(differenceInSeconds / 86400);
    const weeks = Math.floor(differenceInSeconds / 604800);
    const months = Math.floor(differenceInSeconds / 2592000);
    const years = Math.floor(differenceInSeconds / 31536000);

    if (differenceInSeconds < 60) {
      return "Published just now";
    }

    if (minutes < 60) {
      return `Published ${minutes} ${
        minutes === 1 ? "min" : "mins"
      } ago`;
    }

    if (hours < 24) {
      return `Published ${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `Published ${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    if (weeks < 5) {
      return `Published ${weeks} ${
        weeks === 1 ? "week" : "weeks"
      } ago`;
    }

    if (months < 12) {
      return `Published ${months} ${
        months === 1 ? "month" : "months"
      } ago`;
    }

    return `Published ${years} ${
      years === 1 ? "year" : "years"
    } ago`;
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.03, 0.3),
      }}
      whileHover={{ y: -3 }}
      className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image Section */}
      <div className="relative h-48 shrink-0 bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt=""
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setImgSrc(fallbackSrc)}
        />

        {/* Favorite Button */}
        <motion.button
          type="button"
          onClick={handleFavorite}
          whileTap={{ scale: 0.8 }}
          animate={
            isFavorited
              ? { scale: [1, 1.25, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.3 }}
          aria-pressed={isFavorited}
          aria-label={
            isFavorited
              ? "Remove from favorites"
              : "Add to favorites"
          }
          className="absolute right-12 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-muted hover:text-danger"
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={
              isFavorited
                ? "fill-danger text-danger"
                : ""
            }
          />
        </motion.button>

        {/* Three-Dot Menu */}
        <div className="absolute right-2 top-2">
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="More options"
            aria-expanded={menuOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-muted hover:text-foreground"
          >
            <MoreVertical size={16} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-40 rounded-md border border-border bg-surface p-1 shadow-lg">
              {isHidden ? (
                <button
                  type="button"
                  onClick={handleUnhide}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-background"
                >
                  <Eye size={15} />
                  Show post
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleHide}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-background"
                >
                  <EyeOff size={15} />
                  Hide post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Badges */}
        <div className="flex min-h-6 items-center gap-2">
          <Badge tone="accent">{item.type}</Badge>

          {item.rating !== undefined && (
            <Badge tone="highlight">
              <Star size={12} aria-hidden="true" />
              {item.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold">
          {item.title}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 min-h-10 flex-1 text-sm text-muted">
          {item.description}
        </p>

        {/* Published Relative Time */}
        <div className="flex min-h-5 items-center gap-1 text-xs text-muted">
          <CalendarDays size={13} aria-hidden="true" />

          <span>
            {formatPublishedDate(item.publishedAt)}
          </span>
        </div>

        {/* Author and Source */}
        <div className="flex min-h-8 items-center justify-between pt-1 text-xs text-muted">
          <span className="line-clamp-2">
            {item.author
              ? `${item.author} · ${item.source}`
              : item.source}
          </span>
        </div>

        {/* CTA Button */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex min-h-9 items-center justify-center rounded-md bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent hover:opacity-80"
        >
          {item.actionLabel}
        </a>
      </div>
    </motion.article>
  );
}

export default memo(ContentCard);