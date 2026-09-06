import type { ContentItem } from "@/types/content";

/**
 * TEMPORARY — Phase 3 demo data only.
 * Replaced by the real personalized feed engine in Phase 8.
 */
export const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: "news-1",
    type: "news",
    title: "Global chip shortage eases as new fabs come online",
    description:
      "Analysts say supply is finally catching up with demand after two years of delays across the electronics industry.",
    source: "TechWire",
    author: "J. Fallon",
    url: "#",
    actionLabel: "Read More",
  },
  {
    id: "movie-1",
    type: "movie",
    title: "Horizon Drift",
    description:
      "A stranded crew must repair their ship before the atmosphere runs out, in this tense sci-fi thriller.",
    source: "TMDB",
    rating: 7.8,
    url: "#",
    actionLabel: "View Movie",
  },
  {
    id: "social-1",
    type: "social",
    title: "Thread: 10 lessons from building a design system",
    description:
      "A widely shared thread breaking down component architecture decisions from a senior frontend engineer.",
    source: "Threadly",
    author: "@devnotes",
    url: "#",
    actionLabel: "View Post",
  },
  {
    id: "news-2",
    type: "news",
    title: "Local startups see record funding this quarter",
    description:
      "Seed-stage investment in the region hit a new high, led by climate-tech and health-tech companies.",
    source: "Business Daily",
    author: "R. Menon",
    url: "#",
    actionLabel: "Read More",
  },
  {
    id: "movie-2",
    type: "movie",
    title: "The Quiet Hour",
    description:
      "A slow-burn drama about a family confronting old secrets over one long weekend.",
    source: "TMDB",
    rating: 8.4,
    url: "#",
    actionLabel: "View Movie",
  },
  {
    id: "social-2",
    type: "social",
    title: "Photo dump from the weekend hike 🏔️",
    description:
      "A popular post from the outdoors community, shared widely for its trail photography.",
    source: "Threadly",
    author: "@trailmix",
    url: "#",
    actionLabel: "View Post",
  },
];
