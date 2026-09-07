import type { ContentItem } from "@/types/content";
import type { NewsApiArticle } from "@/services/newsApi";
import type { TmdbMovie } from "@/services/tmdbApi";
import type { RedditPost } from "@/services/socialApi";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

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
  return movies.map((movie) => ({
    id: `movie-${movie.id}`,
    type: "movie",
    title: movie.title,
    description: movie.overview || "No synopsis available.",
    image: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined,
    source: "TMDB",
    rating: movie.vote_average,
    url: `https://www.themoviedb.org/movie/${movie.id}`,
    actionLabel: "View Movie",
    publishedAt: movie.release_date,
    tags: genre ? [genre] : undefined,
  }));
}

export function normalizeSocial(posts: RedditPost[]): ContentItem[] {
  return posts.map((post) => {
    // Reddit escapes "&" as "&amp;" in preview URLs.
    const previewImage = post.preview?.images?.[0]?.source?.url?.replace(
      /&amp;/g,
      "&",
    );
    const thumbnail = post.thumbnail?.startsWith("http")
      ? post.thumbnail
      : undefined;

    return {
      id: post.id,
      type: "social",
      title: post.title,
      description: post.selftext
        ? post.selftext.slice(0, 200)
        : "View the discussion on Reddit.",
      image: previewImage ?? thumbnail,
      author: `u/${post.author}`,
      source: `r/${post.subreddit}`,
      url: `https://www.reddit.com${post.permalink}`,
      actionLabel: "View Post",
      publishedAt: new Date(post.created_utc * 1000).toISOString(),
      tags: [post.subreddit],
    };
  });
}
