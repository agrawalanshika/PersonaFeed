import ContentCard from "@/components/content/ContentCard";
import { SAMPLE_CONTENT } from "@/lib/sample-content";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        This is a preview of the design system on real card layouts. The
        content below is sample data — the personalized feed engine (Phase 8)
        will replace it with live News API, TMDB, and social results.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_CONTENT.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
