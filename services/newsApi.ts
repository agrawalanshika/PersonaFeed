import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Raw News API article shape — normalized into ContentItem in Phase 7. */
export interface NewsApiArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  author: string | null;
  source: { name: string };
  publishedAt: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export const newsApi = createApi({
  reducerPath: "newsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/news" }),
  endpoints: (builder) => ({
    getTopHeadlines: builder.query<
      NewsApiResponse,
      { category?: string; page?: number } | void
    >({
      query: (arg) => {
        const { category, page = 1 } = arg ?? {};
        const params: Record<string, string | number> = {
          type: "top-headlines",
          page,
        };
        if (category) params.category = category;
        return { url: "", params };
      },
    }),
    searchNews: builder.query<
      NewsApiResponse,
      { query: string; page?: number }
    >({
      query: ({ query, page = 1 }) => ({
        url: "",
        params: { type: "search", q: query, page },
      }),
    }),
  }),
});

export const { useGetTopHeadlinesQuery, useSearchNewsQuery } = newsApi;
