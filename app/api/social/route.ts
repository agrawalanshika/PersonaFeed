import { NextRequest, NextResponse } from "next/server";

const MASTODON_BASE = "https://mastodon.social/api/v1";

// Maps our content-interest categories to Mastodon hashtags.
const CATEGORY_TAGS: Record<string, string> = {
  technology: "technology",
  sports: "sports",
  finance: "finance",
  science: "science",
  entertainment: "entertainment",
  business: "business",
};

function sanitizeTag(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "") || "technology";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "trending";
  const category = searchParams.get("category")?.toLowerCase();
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") ?? "10";

  const isSearch = type === "search";
  // Mastodon's public API has no unauthenticated full-text search, so
  // "search" here treats the query as a hashtag — a reasonable stand-in
  // until Phase 12 builds full search UX.
  const tag = isSearch
    ? sanitizeTag(query || "")
    : (category && CATEGORY_TAGS[category]) || "technology";

  const upstream = new URL(`${MASTODON_BASE}/timelines/tag/${tag}`);
  upstream.searchParams.set("limit", limit);

  try {
    const response = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `Mastodon request failed (${response.status})`, detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach Mastodon.", detail: (error as Error).message },
      { status: 502 },
    );
  }
}
