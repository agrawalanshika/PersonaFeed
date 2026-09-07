import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE = "https://www.reddit.com";
// Reddit blocks generic/missing User-Agents — a descriptive one is required.
const USER_AGENT = "PersonaFeed/1.0 (educational project; contact u/agrawalanshika)";

// Maps our content-interest categories to real subreddits.
const CATEGORY_SUBREDDITS: Record<string, string> = {
  technology: "technology",
  sports: "sports",
  finance: "finance",
  science: "science",
  entertainment: "entertainment",
  business: "business",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "trending";
  const category = searchParams.get("category")?.toLowerCase();
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") ?? "10";

  const isSearch = type === "search";
  const subreddit =
    (category && CATEGORY_SUBREDDITS[category]) || "technology";

  const upstream = isSearch
    ? new URL(`${REDDIT_BASE}/search.json`)
    : new URL(`${REDDIT_BASE}/r/${subreddit}/hot.json`);

  upstream.searchParams.set("limit", limit);
  if (isSearch) {
    upstream.searchParams.set("q", query || "");
  }

  try {
    const response = await fetch(upstream.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `Reddit request failed (${response.status})`, detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach Reddit.", detail: (error as Error).message },
      { status: 502 },
    );
  }
}
