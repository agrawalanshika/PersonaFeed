import type { ContentItem } from "@/types/content";
import type { NewsApiArticle } from "@/services/newsApi";
import type { TmdbMovie } from "@/services/tmdbApi";
import type { MastodonStatus } from "@/services/socialApi";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

export function normalizeNews(
  articles: NewsApiArticle[],
  category?: string,
): ContentItem[] {
  return articles
    .filter((article) => Boolean(article.title) && article.title !== "[Removed]")
    .map((article) => ({
      id: article.url,
      type: "news",
      title: article.title,
      description: article.description ?? "No description available.",
      image: article.urlToImage ?? undefined,
      author: article.author ?? undefined,
      source: article.source.name,
      url: article.url,
      actionLabel: "Read More",
      publishedAt: article.publishedAt,
      tags: category ? [category] : undefined,
    }));
}

export function normalizeMovie(
  movies: TmdbMovie[],
  genre?: string,
): ContentItem[] {
  return movies.map((movie) => {
    // Backdrops are landscape (matches news/social card shape); poster is
    // portrait and only used as a fallback when no backdrop exists.
    const image = movie.backdrop_path
      ? `${TMDB_BACKDROP_BASE}${movie.backdrop_path}`
      : movie.poster_path
        ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
        : undefined;

    return {
      id: `movie-${movie.id}`,
      type: "movie",
      title: movie.title,
      description: movie.overview || "No synopsis available.",
      image,
      source: "TMDB",
      rating: movie.vote_average,
      url: `https://www.themoviedb.org/movie/${movie.id}`,
      actionLabel: "View Movie",
      publishedAt: movie.release_date,
      tags: genre ? [genre] : undefined,
    };
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function normalizeSocial(posts: MastodonStatus[]): ContentItem[] {
  return posts.map((post) => {
    const text = stripHtml(post.content) || "View this post on Mastodon.";
    const image = post.media_attachments?.[0]?.preview_url;

    return {
      id: post.id,
      type: "social",
      title: text.length > 60 ? `${text.slice(0, 60)}…` : text,
      description: text,
      image,
      author: post.account.display_name || post.account.username,
      source: `@${post.account.username}`,
      url: post.url,
      actionLabel: "View Post",
      publishedAt: post.created_at,
      tags: post.tags.map((tag) => tag.name),
    };
  });
}
