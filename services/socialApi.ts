import { createApi } from "@reduxjs/toolkit/query/react";
import { fakeBaseQuery } from "@reduxjs/toolkit/query";

/** Raw mock social post shape — normalized into ContentItem in Phase 7. */
export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  image: string;
  likes: number;
  postedAt: string;
  tags: string[];
}

const MOCK_POSTS: SocialPost[] = [
  {
    id: "social-1",
    author: "Dev Notes",
    handle: "@devnotes",
    content: "10 lessons from building a design system from scratch this year.",
    image: "https://picsum.photos/seed/social-1/600/400",
    likes: 482,
    postedAt: "2026-09-01T10:00:00Z",
    tags: ["technology", "business"],
  },
  {
    id: "social-2",
    author: "Trail Mix",
    handle: "@trailmix",
    content: "Photo dump from the weekend hike \u{1F3D4}\uFE0F — best views in months.",
    image: "https://picsum.photos/seed/social-2/600/400",
    likes: 1210,
    postedAt: "2026-09-02T14:30:00Z",
    tags: ["entertainment"],
  },
  {
    id: "social-3",
    author: "Market Pulse",
    handle: "@marketpulse",
    content: "Quarterly earnings season kicks off next week — here's what to watch.",
    image: "https://picsum.photos/seed/social-3/600/400",
    likes: 356,
    postedAt: "2026-09-03T08:15:00Z",
    tags: ["finance", "business"],
  },
  {
    id: "social-4",
    author: "Lab Notes",
    handle: "@labnotes",
    content: "New study on battery chemistry could double EV range by 2030.",
    image: "https://picsum.photos/seed/social-4/600/400",
    likes: 890,
    postedAt: "2026-09-03T16:45:00Z",
    tags: ["science", "technology"],
  },
  {
    id: "social-5",
    author: "Courtside",
    handle: "@courtside",
    content: "That fourth-quarter comeback last night was one for the history books.",
    image: "https://picsum.photos/seed/social-5/600/400",
    likes: 2043,
    postedAt: "2026-09-04T02:00:00Z",
    tags: ["sports"],
  },
  {
    id: "social-6",
    author: "Screen Time",
    handle: "@screentime",
    content: "This year's festival lineup just leaked and it's stacked.",
    image: "https://picsum.photos/seed/social-6/600/400",
    likes: 675,
    postedAt: "2026-09-04T11:20:00Z",
    tags: ["entertainment"],
  },
];

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getTrendingSocialPosts: builder.query<SocialPost[], void>({
      async queryFn() {
        const data = await delay(MOCK_POSTS);
        return { data };
      },
    }),
    searchSocialPosts: builder.query<SocialPost[], { query: string }>({
      async queryFn({ query }) {
        const needle = query.toLowerCase();
        const filtered = MOCK_POSTS.filter(
          (post) =>
            post.content.toLowerCase().includes(needle) ||
            post.tags.some((tag) => tag.includes(needle)),
        );
        const data = await delay(filtered);
        return { data };
      },
    }),
  }),
});

export const { useGetTrendingSocialPostsQuery, useSearchSocialPostsQuery } =
  socialApi;
