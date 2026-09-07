import type { ContentItem } from "@/types/content";
import type { NewsApiArticle } from "@/services/newsApi";
import type { TmdbMovie } from "@/services/tmdbApi";
import type { SocialPost } from "@/services/socialApi";

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

export function normalizeSocial(posts: SocialPost[]): ContentItem[] {
  return posts.map((post) => ({
    id: post.id,
    type: "social",
    title:
      post.content.length > 60 ? `${post.content.slice(0, 60)}…` : post.content,
    description: post.content,
    author: post.author,
    source: post.handle,
    url: `https://threadly.example/post/${post.id}`,
    actionLabel: "View Post",
    publishedAt: post.postedAt,
    tags: post.tags,
  }));
}
