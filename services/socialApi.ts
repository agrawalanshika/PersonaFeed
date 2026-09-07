import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Raw Mastodon status shape — normalized into ContentItem in Phase 7. */
export interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  url: string;
  account: {
    username: string;
    display_name: string;
  };
  media_attachments: { type: string; preview_url: string; url: string }[];
  tags: { name: string }[];
}

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/social" }),
  endpoints: (builder) => ({
    getTrendingSocialPosts: builder.query<
      MastodonStatus[],
      { category?: string } | void
    >({
      query: (arg) => {
        const params: Record<string, string> = { type: "trending" };
        if (arg?.category) params.category = arg.category;
        return { url: "", params };
      },
    }),
    searchSocialPosts: builder.query<MastodonStatus[], { query: string }>({
      query: ({ query }) => ({
        url: "",
        params: { type: "search", q: query },
      }),
    }),
  }),
});

export const { useGetTrendingSocialPostsQuery, useSearchSocialPostsQuery } =
  socialApi;
