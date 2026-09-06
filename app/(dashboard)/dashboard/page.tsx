export default function DashboardPage() {
  const placeholderSlots = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        This is where your personalized feed will appear — a mix of news,
        movie recommendations, and social content based on your interests.
        Real cards arrive in Phase 9; this is layout only.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderSlots.map((slot) => (
          <div
            key={slot}
            className="flex h-40 flex-col justify-between rounded-md border border-border bg-surface p-4"
          >
            <span className="text-xs text-muted">Content slot {slot}</span>
            <span className="text-sm text-muted">Feed card placeholder</span>
          </div>
        ))}
      </div>
    </div>
  );
}
