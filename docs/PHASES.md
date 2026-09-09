# Phase Log — Personalized Content Dashboard

Tracks what's actually been implemented, phase by phase. Updated at the end
of every phase — this is the source of truth for project status, not the
original roadmap (which describes the plan, not what's done).

---

## Phase 1 — Project Initialization ✅
Next.js (App Router) + TypeScript + Tailwind CSS + ESLint scaffolded.
Installed: Redux Toolkit, react-redux, Framer Motion, dnd-kit, lucide-react.
Added `.env.local.example`, `.gitignore`, folder architecture, git init.

## Phase 2 — Application Shell ✅
Built `Sidebar`, `Header`, `MobileNav`, `DashboardShell` (mobile drawer
state). Route group `app/(dashboard)` with skeleton pages for `/dashboard`,
`/favorites`, `/trending`, `/search`, `/settings`. Root `/` redirects to
`/dashboard`. Design tokens (colors, borders, focus states) added to
`globals.css`.

## Phase 3 — Design System & Reusable Components ✅
`components/ui/`: Button, Card, Badge, Avatar, Modal, Dropdown, Skeleton,
Spinner, ErrorState, EmptyState.
`components/content/`: ContentCard (shared shell), NewsCard, MovieCard,
SocialCard (thin wrappers).
Draft `types/content.ts` (`ContentItem` — finalized in Phase 7).
`lib/sample-content.ts` — temporary hardcoded demo data (removed in Phase 8).
Dashboard page renders real ContentCards; Favorites/Search use EmptyState.
Cleaned up empty placeholder folders (`services/`, `store/slices/`,
`tests/`) until their real phase adds code.

## Phase 4 — Redux Toolkit Foundation ✅
`store/index.ts` (`makeStore` factory), `store/hooks.ts` (typed
`useAppDispatch`/`useAppSelector`), four slices: `preferences`, `favorites`,
`feed`, `ui`. `StoreProvider` wired into root layout. Dashboard's favorite
toggle connected to real (not-yet-persisted) Redux state as a working
end-to-end demo.

## Phase 5 — User Preferences & Persistence ✅
`lib/preferences-options.ts` (interest + movie genre lists), `lib/storage.ts`
(localStorage helpers). Settings page is now interactive — chips dispatch
`toggleInterest`/`toggleMoviePreference`. `StoreProvider` restores
preferences from localStorage on mount and persists on every change.

## Phase 6 — API Service Layer ✅
Route Handlers `app/api/news/route.ts` and `app/api/tmdb/route.ts` proxy
News API and TMDB server-side, so `NEWS_API_KEY`/`TMDB_API_KEY` never reach
the browser and News API's client-side CORS restriction is avoided.
`services/newsApi.ts`, `services/tmdbApi.ts` (RTK Query, hitting our own
`/api/*` routes), `services/socialApi.ts` (mock data, no external call,
`fakeBaseQuery`). All three wired into the store (`configureStore`
middleware). Temporary `ApiConnectivityCheck` on the Trending page proves
each adapter returns real data — removed in Phase 11.

## Phase 7 — Data Normalization ✅
`types/content.ts` finalized: added `publishedAt` and `tags` (beyond the
original draft) to support chronological sorting and interest matching in
Phase 8. `lib/normalize.ts` — `normalizeNews()`, `normalizeMovie()`,
`normalizeSocial()`, each converting one raw API shape into `ContentItem[]`.
News normalization filters out `[Removed]` articles (a known News API
artifact for takedown articles). The Trending page's temporary check now
runs the full pipeline — raw API response → normalize → `ContentCard` —
proving all three adapters produce genuinely renderable, unified data.

**Update:** mock social data was replaced with Reddit's public JSON API
(no auth needed) — `app/api/social/route.ts` proxies `reddit.com/r/<sub>/hot.json`
server-side (Reddit requires a descriptive User-Agent, set there),
`services/socialApi.ts` now calls that real endpoint, `normalizeSocial()`
maps real Reddit post fields (title, author, subreddit, preview image,
permalink) instead of hardcoded mock data. `services/socialApi.ts`'s
`SocialPost` type and `lib/sample-content.ts`'s hand-written mock posts are
gone from the social pipeline (sample-content.ts itself still backs the
Dashboard's demo cards until Phase 8).

**Update 2:** the unauthenticated Reddit JSON endpoints started returning
403s in practice (Reddit's bot detection blocks non-browser requests to
`*.json` inconsistently). Migrated `app/api/social/route.ts` to Reddit's
official OAuth client-credentials flow instead — fetches and caches a
bearer token server-side (`REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`,
requires a free Reddit "script" app, see README), then calls
`oauth.reddit.com` instead of the public JSON mirror. More reliable than
the unauthenticated route.

**Update 3:** Reddit's own app-creation page (`reddit.com/prefs/apps`)
requires a Google reCAPTCHA that failed to render/respond for the user
(likely network/extension-level blocking of Google's recaptcha domains,
unrelated to this codebase) — made getting Reddit credentials
impractical. Replaced Reddit entirely with **Mastodon's public timeline
API** (`mastodon.social/api/v1/timelines/tag/<hashtag>`) — genuinely
zero setup: no account, no API key, no CAPTCHA, no OAuth.
`services/socialApi.ts` now defines `MastodonStatus`; `normalizeSocial()`
strips HTML from post content and maps account/media/tag fields.
Categories map to hashtags instead of subreddits. Search is implemented
as a hashtag lookup (Mastodon's public API has no unauthenticated
full-text search) — a reasonable placeholder until Phase 12 builds real
search UX.

## Phase 8 — Personalized Feed Engine ✅
`lib/feed.ts` — `getFeedCategories()`/`getFeedGenres()` (fall back to a
sensible default before the user picks anything in Settings) and
`mergeFeedItems()` (dedupes by id). `hooks/useFeed.ts` — the actual engine:
for each selected interest, fires one News API call and one Mastodon call;
for each selected movie genre, one TMDB call (genre names mapped to TMDB's
numeric IDs via `MOVIE_GENRE_TMDB_IDS`); all three run in parallel via RTK
Query's `initiate()`/`unwrap()` (needed since the number of queries is
dynamic — a fixed number of React hooks can't represent "one call per
selected interest"). Results are normalized, merged, and stored in
`feedSlice`. Dashboard page now renders the real feed with loading/error/
empty states instead of hardcoded data — `lib/sample-content.ts` is deleted.

**Updates (post-Phase-8 refinement, driven by user testing):**
- Movie card images switched from TMDB's portrait `poster_path` to the
  landscape `backdrop_path` — matches the aspect of news/social cards, so
  nothing gets cropped or letterboxed.
- `normalizeSocial()` also checks Mastodon's link-preview `card.image`
  (present on most link-share posts) before falling back to a placeholder,
  since most posts have no directly attached photo.
- `ContentCard` now has an `onError` handler on its `<img>` — a real image
  URL that fails to actually load (e.g. hotlink-blocked) falls back to the
  placeholder instead of showing a broken-image icon.
- `mergeFeedItems()` evolved through three iterations: plain chronological
  sort (clustered by source — News/TMDB/Mastodon have very different
  recency scales) → fixed round-robin interleave (too predictable) →
  final **wave-based** approach: rank each type newest-first internally,
  group same-rank items across types into a "wave," shuffle only within
  each wave, concatenate waves in order. Recent content surfaces near the
  top; type order within any wave is randomized rather than fixed.

## Phase 9 — Interactive Content Cards ✅
Audited against the spec (image, title, description, source, metadata,
type-specific CTA, favorite button) — **already fully satisfied** by work
done in Phases 3, 4, and 8: `ContentCard` has all of the above, the
favorite button dispatches real Redux state, and CTAs are already
type-specific ("Read More" / "View Movie" / "View Post"). No new code
needed — this phase was completed incrementally rather than as one block.

## Phase 10 — Favorites ✅
`lib/storage.ts` gained `loadFavorites()`/`saveFavorites()` (same pattern
as Phase 5's preferences persistence). `favoritesSlice` gained a
`setFavorites` reducer for hydration. `StoreProvider` now restores
favorites from localStorage on mount and persists them on every change,
alongside preferences. `/favorites` is a real page now — no longer a
static empty state: groups saved items by News/Movies/Social (sections
with nothing saved just don't render), shows a real empty state only when
there are zero favorites total, and lets you unfavorite directly from
this page (same `toggleFavorite` dispatch used everywhere else).

## Phase 11 — Trending ✅
`/trending` is now real, not placeholder boxes. `components/content/TrendingSection.tsx`
handles loading/error/empty/grid per section, used three times. Data
sources: News API's top-headlines with no category filter (broadest
"what's happening" rather than interest-scoped), TMDB's existing
`trending/movie/week` (was already a genuine trending endpoint, no change
needed), and — new — Mastodon's real public `/api/v1/trends/statuses`
endpoint instead of the hashtag-timeline approach used for personalization
(`app/api/social/route.ts` now branches: category given → hashtag
timeline for personalization, no category → genuine trends for this
page). Favoriting works the same way here as everywhere else. The
temporary `ApiConnectivityCheck` component (Phase 6-7's proof-of-concept)
is deleted.

---

## Not yet built (upcoming phases)
12. Global search + debouncing
13. Pagination / infinite scroll
14. Drag-and-drop feed ordering
15. Dark mode (explicit toggle + persistence)
16. Animations & micro-interactions
17. Loading/error/empty states audit
18. Accessibility audit
19. Performance optimization
20-22. Unit / integration / E2E testing
23. Bonus features
24. Security audit
25. Final UI/UX polish
26. Deployment
27. README finalization
28. Demo video
29. Final submission audit
