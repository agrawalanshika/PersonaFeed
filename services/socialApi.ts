import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Raw Reddit post shape — normalized into ContentItem in Phase 7. */
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  ups: number;
  created_utc: number;
  permalink: string;
  thumbnail: string;
  preview?: {
    images: { source: { url: string } }[];
  };
}

interface RedditListingResponse {
  data: {
    children: { data: RedditPost }[];
  };
}

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/social" }),
  endpoints: (builder) => ({
    getTrendingSocialPosts: builder.query<
      RedditPost[],
      { category?: string } | void
    >({
      query: (arg) => {
        const params: Record<string, string> = { type: "trending" };
        if (arg?.category) params.category = arg.category;
        return { url: "", params };
      },
      transformResponse: (response: RedditListingResponse) =>
        response.data.children.map((child) => child.data),
    }),
    searchSocialPosts: builder.query<RedditPost[], { query: string }>({
      query: ({ query }) => ({
        url: "",
        params: { type: "search", q: query },
      }),
      transformResponse: (response: RedditListingResponse) =>
        response.data.children.map((child) => child.data),
    }),
  }),
});

export const { useGetTrendingSocialPostsQuery, useSearchSocialPostsQuery } =
  socialApi;
