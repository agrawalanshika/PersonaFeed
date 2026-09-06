import { NextRequest, NextResponse } from "next/server";

const NEWS_API_BASE = "https://newsapi.org/v2";

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NEWS_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "top-headlines";
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const page = searchParams.get("page") ?? "1";

  const isSearch = type === "search";
  const upstream = new URL(
    `${NEWS_API_BASE}/${isSearch ? "everything" : "top-headlines"}`,
  );
  upstream.searchParams.set("apiKey", apiKey);
  upstream.searchParams.set("page", page);
  upstream.searchParams.set("pageSize", "20");

  if (isSearch) {
    upstream.searchParams.set("q", query || "latest");
    upstream.searchParams.set("language", "en");
    upstream.searchParams.set("sortBy", "publishedAt");
  } else {
    upstream.searchParams.set("country", "us");
    if (category) upstream.searchParams.set("category", category.toLowerCase());
  }

  try {
    const response = await fetch(upstream.toString(), {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `News API request failed (${response.status})`, detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach News API.", detail: (error as Error).message },
      { status: 502 },
    );
  }
}
