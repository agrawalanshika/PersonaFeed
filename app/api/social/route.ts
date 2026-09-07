import { NextRequest, NextResponse } from "next/server";

const REDDIT_OAUTH_BASE = "https://oauth.reddit.com";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
// Reddit requires a descriptive User-Agent on every request, OAuth or not.
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

interface CachedToken {
  value: string;
  expiresAt: number;
}

// Cached at module scope so it persists across requests within the same
// server process — Reddit tokens last ~1 hour, so this avoids
// re-authenticating on every single feed request.
let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET are not configured on the server.",
    );
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Reddit auth failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  cachedToken = {
    value: data.access_token,
    // Refresh a minute early to avoid edge-case expiry mid-request.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

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
    ? new URL(`${REDDIT_OAUTH_BASE}/search`)
    : new URL(`${REDDIT_OAUTH_BASE}/r/${subreddit}/hot`);

  upstream.searchParams.set("limit", limit);
  if (isSearch) {
    upstream.searchParams.set("q", query || "");
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": USER_AGENT,
      },
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
