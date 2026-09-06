"use client";

import { Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleInterest, toggleMoviePreference } from "@/store/slices/preferencesSlice";
import { INTEREST_OPTIONS, MOVIE_GENRE_OPTIONS } from "@/lib/preferences-options";

function PreferenceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-muted hover:bg-accent-soft/40"
      }`}
    >
      {selected && <Check size={14} aria-hidden="true" />}
      {label}
    </button>
  );
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const interests = useAppSelector((state) => state.preferences.interests);
  const moviePreferences = useAppSelector(
    (state) => state.preferences.moviePreferences,
  );

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-sm text-muted">
        Pick the interests that shape your personalized feed. Your choices
        are saved automatically and will still be here next time you visit —
        the feed itself starts using them in Phase 8.
      </p>

      <div>
        <h2 className="text-sm font-semibold">Content interests</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((category) => (
            <PreferenceChip
              key={category}
              label={category}
              selected={interests.includes(category)}
              onClick={() => dispatch(toggleInterest(category))}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Movie preferences</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOVIE_GENRE_OPTIONS.map((genre) => (
            <PreferenceChip
              key={genre}
              label={genre}
              selected={moviePreferences.includes(genre)}
              onClick={() => dispatch(toggleMoviePreference(genre))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
