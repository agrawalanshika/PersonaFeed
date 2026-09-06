const CATEGORIES = [
  "Technology",
  "Sports",
  "Finance",
  "Science",
  "Entertainment",
  "Business",
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Pick the interests that shape your personalized feed. Selection,
        persistence, and Redux wiring are built in Phase 5 — these are static
        placeholders for now.
      </p>

      <div>
        <h2 className="text-sm font-semibold">Content interests</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <span
              key={category}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
