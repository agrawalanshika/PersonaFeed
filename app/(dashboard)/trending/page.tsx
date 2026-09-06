const SECTIONS = [
  { label: "Trending news", detail: "Top stories across your interests" },
  { label: "Trending movies", detail: "Popular titles on TMDB right now" },
  { label: "Trending social posts", detail: "What's getting attention today" },
];

export default function TrendingPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Real trending data from News API, TMDB, and mock social content is
        wired up in Phase 11. These sections mark where each will live.
      </p>

      <div className="flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <div
            key={section.label}
            className="rounded-md border border-border bg-surface p-4"
          >
            <h2 className="text-sm font-semibold">{section.label}</h2>
            <p className="mt-1 text-sm text-muted">{section.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
