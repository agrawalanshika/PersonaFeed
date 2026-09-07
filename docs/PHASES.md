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

---

## Not yet built (upcoming phases)
8. Personalized feed engine (replaces `lib/sample-content.ts`, uses `normalize*()` + preferences)
9. Interactive content cards (favorite/CTA fully wired to real data)
10. Favorites (persisted, dedicated view)
11. Trending
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
