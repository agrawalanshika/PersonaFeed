import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Raw TMDB movie shape — normalized into ContentItem in Phase 7. */
export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
}

interface TmdbResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
}

export const tmdbApi = createApi({
  reducerPath: "tmdbApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/tmdb" }),
  endpoints: (builder) => ({
    getTrendingMovies: builder.query<TmdbResponse, { page?: number } | void>({
      query: (arg) => ({
        url: "",
        params: { type: "trending", page: arg?.page ?? 1 },
      }),
    }),
    getMoviesByGenre: builder.query<
      TmdbResponse,
      { genre: string; page?: number }
    >({
      query: ({ genre, page = 1 }) => ({
        url: "",
        params: { type: "discover", genre, page },
      }),
    }),
    searchMovies: builder.query<
      TmdbResponse,
      { query: string; page?: number }
    >({
      query: ({ query, page = 1 }) => ({
        url: "",
        params: { type: "search", q: query, page },
      }),
    }),
  }),
});

export const {
  useGetTrendingMoviesQuery,
  useGetMoviesByGenreQuery,
  useSearchMoviesQuery,
} = tmdbApi;
