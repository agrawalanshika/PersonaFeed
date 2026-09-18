import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "trending";
  const query = searchParams.get("q");
  const genre = searchParams.get("genre");
  const page = searchParams.get("page") ?? "1";

  const path =
    type === "search"
      ? "/search/movie"
      : type === "discover"
        ? "/discover/movie"
        : "/trending/movie/week";

  const upstream = new URL(`${TMDB_BASE}${path}`);
  upstream.searchParams.set("api_key", apiKey);
  upstream.searchParams.set("page", page);
  if (type === "search") upstream.searchParams.set("query", query || "");
  if (type === "discover" && genre) upstream.searchParams.set("with_genres", genre);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(upstream.toString(), {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `TMDB request failed (${response.status})`, detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "TMDB request timed out — this can happen when TMDB is unreachable from your network."
          : "Failed to reach TMDB.",
        detail: (error as Error).message,
      },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
