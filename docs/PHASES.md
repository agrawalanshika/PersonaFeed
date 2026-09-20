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

## Phase 12 — Global Search + Debouncing ✅
`/search` is real: a controlled input debounced 400ms via the new
`hooks/useDebouncedValue.ts`, filter tabs (All/News/Movies/Social), and
searches News API + TMDB + Mastodon in parallel — each skipped via RTK
Query's `skip` option when its filter isn't active, so switching to the
"News" tab doesn't keep firing movie/social requests on every keystroke.
Proper states: initial "start typing" prompt, loading spinner, error with
retry, and a real "no results found" (distinct from the initial-empty
case). Header's search box is now a working link to this page instead of
a "coming soon" placeholder.

**Note:** `TrendingSection` (Phase 11) was generalized and renamed to
`ContentSection` (added `emptyTitle`/`emptyDescription` props) so both
Trending and Search reuse the same section component instead of two
near-duplicates.

## Phase 13 — Pagination / Infinite Scroll ✅
`hooks/usePaginatedItems.ts` reveals items 9 at a time instead of
rendering the full list at once, and resets to page 1 whenever the
underlying item list actually changes (new preferences, new search) — the
reset happens during render per React's documented pattern for "adjusting
state when a prop changes," not inside an effect. `LoadMoreSentinel` is an
invisible element using `IntersectionObserver` that triggers loading the
next page as it scrolls into view; `PaginationFooter` pairs that with a
manual "Load more" button (keyboard/no-scroll-friendly) and a "You've
reached the end" note once exhausted. Wired into both Dashboard and
Search. **Design note:** this is client-side reveal pagination over
already-fetched data, not incremental API calls per page — the feed
engine already fetches everything for the selected preferences up front,
so paginating the render avoids extra network requests rather than adding
them, while still solving the actual UX problem (not rendering huge
datasets at once).

**Update:** the first version only paginated through one already-fetched
batch — hitting "the end" meant there genuinely was no more data in
memory, not that the source had run out. Upgraded to real infinite
scroll for the Dashboard: `useFeed` now tracks a page number per selected
category/genre and, once the local buffer is exhausted, actually fetches
the *next page* from News API and TMDB (both support real pagination) via
a new `loadMoreFeed()`, appending through `appendFeedItems` (dedupes
against what's already loaded). `PaginationFooter` shows a genuine
"Loading more..." state while that fetch is in flight. Mastodon's public
API has no page-number pagination for hashtag timelines, so social
content is still a one-time pull per load — bumped its default pool size
(10→20) to partly compensate; this is a documented limitation, not an
oversight. Search still uses one-shot local pagination only (not yet
upgraded to real network paging).

## Phase 14 — Drag-and-Drop Feed Ordering ✅
`components/content/SortableContentGrid.tsx` (dnd-kit's `DndContext` +
`SortableContext`, pointer sensor with a 5px activation threshold so a
plain click on the favorite heart or CTA button still works instead of
being swallowed as a drag, plus a keyboard sensor for accessibility) lets
you drag any Dashboard card to reorder the feed. `lib/storage.ts` gained
`loadFeedOrder()`/`saveFeedOrder()` — persisting only the array of ids
(not full item snapshots), since feed content is live and gets refetched,
not a fixed personal list like Favorites. `lib/feed.ts`'s new
`applySavedOrder()` reapplies that saved sequence over freshly-fetched
items on the next load (items matching a saved id keep their position;
anything new — likely, since news/social content changes — gets appended
after). Reordering is scoped to Dashboard only, not Trending/Search,
since those are transient result lists rather than "your feed."

## Phase 15 — Dark Mode ✅
Explicit toggle + persistence, not just OS detection. `globals.css`
switched from a `@media (prefers-color-scheme: dark)` block to a `.dark`
class selector, so JS is now authoritative over which palette applies —
"system" mode still respects the OS preference, just resolved in JS via
`matchMedia` rather than pure CSS. `lib/storage.ts` gained
`loadTheme()`/`saveTheme()`. `StoreProvider` hydrates the saved theme on
mount, applies/removes the `.dark` class on `<html>` whenever `ui.theme`
changes, and listens for live OS-level theme changes while "system" is
selected. Two places to control it: a quick sun/moon/monitor icon in the
`Header` that cycles Light → Dark → System, and a full "Appearance"
section on the Settings page with the same three options spelled out. A
subtle `background-color`/`color` transition was added to `body` for a
less jarring switch (full animation polish is Phase 16).

## Phase 16 — Animations & Micro-interactions ✅
Used `framer-motion` (installed since Phase 1, unused until now) across
the spec's checklist, kept short (150-250ms) and subtle per "professional,
not flashy":
- **Card entrance** — `ContentCard` fades/slides in on mount, staggered
  slightly by index so a grid feels sequential rather than popping in at
  once (capped delay so long lists don't get sluggish).
- **Card hover** — a small lift (`y: -3`) plus shadow on hover.
- **Favorite animation** — the heart button scales down on tap (press
  feedback) and pops when toggled on.
- **Skeleton loading** — `SkeletonCard`/`SkeletonGrid` (the `Skeleton`
  primitive from Phase 3 was built but never used until now) replaces
  spinners for full-grid loading states on Dashboard, Search, and
  Trending — better perceived performance than a generic spinner.
- **Modal animation** — fade + scale enter/exit via `AnimatePresence`
  (Modal itself isn't wired into any feature yet, but is now
  animation-complete for whenever it is).
- **Sidebar animation** — the mobile drawer now slides in/out instead of
  appearing instantly.
- **Page transitions** — main content area fades subtly on route change.
- **Smooth drag interactions** — already covered by dnd-kit's built-in
  transform/transition in Phase 14; no change needed here.

## Phase 17 — Loading/Error/Empty States Audit ✅
A real audit, not a rubber stamp — most states were already built
incrementally, but this pass found and fixed a genuine bug: `useFeed` and
Search both used `Promise.all` across their parallel API calls, meaning
**one failed source blanked the entire result set** even when others
succeeded (e.g. TMDB hiccups → News API results you'd have gotten
disappear too). Switched both to `Promise.allSettled`; a full error now
only shows when *every* active source fails, and Search shows a subtle
"some results couldn't be loaded" note when only some fail. Added
`refetchFeed()` so the Dashboard's full-failure error state has a working
retry button (it didn't before). New `OfflineBanner` distinguishes "you
have no network connection" from "an API is down" — genuinely different
situations that were previously indistinguishable to the user.

## Phase 18 — Accessibility Audit ✅
A real audit with computed evidence, not eyeballing. Checked the spec's
list item by item:
- **Contrast** — computed actual WCAG relative-luminance ratios for every
  text/background color pair in both themes (a script, not a guess).
  Found two real failures: light theme's rating-badge text (3.33:1) and
  dark theme's selected-chip text (3.83:1), both below the required
  4.5:1 for normal-size text. Fixed both (now 5.02:1 and 6.54:1) and
  verified the new values don't regress any of the other already-passing
  pairs (button text actually improved as a side effect).
- **Keyboard navigation** — mobile drawer now closes on Escape (it only
  supported backdrop-click/X-button before; Modal already had Escape).
  `Modal` gained proper dialog focus management: moves focus to its close
  button on open, restores focus to whatever triggered it on close — the
  standard accessible-dialog pattern, previously missing.
- **Skip link** — added a "Skip to main content" link, visible on
  keyboard focus, so keyboard users don't have to tab through the full
  sidebar on every single page.
- **Heading hierarchy** — Dashboard and Search jumped from the page's
  `<h1>` (in Header) straight to each card's `<h3>`, skipping `<h2>`.
  Added visually-hidden `<h2>`s to fix the skip without changing anything
  visually. Favorites and Trending already had real, visible `<h2>`
  section headers, so no fix was needed there.
- **Focus indicators, aria-labels, semantic HTML, alt text** — checked
  and already in good shape from earlier phases (global focus-visible
  outline since Phase 2, aria-pressed/aria-label on icon buttons since
  Phase 3-4, semantic `<nav>`/`<header>`/`<main>`/`<article>` throughout,
  dnd-kit's built-in keyboard support and ARIA for the sortable grid since
  Phase 14). Card thumbnails intentionally use `alt=""` — this is the
  correct WCAG pattern (not an oversight) when an image is immediately
  followed by adjacent text conveying the same identity (the card title).

## Phase 19 — Performance Optimization ✅
Found and fixed a real re-render bug, not just theoretical polish:
`Dashboard`, `Trending`, and `Search` all built `favoriteIds` by calling
`new Set(state.favorites.items.map(...))` **directly inside**
`useAppSelector`. Since that allocates a brand-new object on every call,
and `useSelector`'s default equality check is reference equality, this
forced all three pages to re-render on **every single Redux store
update** — a theme toggle, a feed load, anything — not just when
favorites actually changed. New shared `useFavoriteIds()` hook selects
the raw `favorites.items` array first (a stable reference unless favorites
genuinely change) and only rebuilds the `Set` via `useMemo` when that
reference changes. `ContentCard` is now wrapped in `React.memo` as
defense-in-depth on top of that fix. Card images gained `loading="lazy"`
(eager for the first row, so above-the-fold content doesn't flash in) and
`decoding="async"` — previously every image in a feed loaded eagerly
regardless of scroll position, wasteful once infinite scroll (Phase 13)
can produce dozens of cards. Debounced search (Phase 12), client-side
pagination (Phase 13), and RTK Query's built-in request caching (Phase 6)
were already in place and needed no changes.

## Phase 20 — Unit Testing ✅
Vitest + React Testing Library, `tests/unit/` recreated with real
content. **70 tests across 8 files**, `npm test` (`npm run test:watch`
for dev). Coverage:
- **Reducers** — all four slices (`preferencesSlice`, `favoritesSlice`,
  `feedSlice`, `uiSlice`), including `appendFeedItems`' dedup logic
  tested against the exact duplicate-boosted-post bug fixed earlier
  (same story, different id, different casing — correctly collapsed to
  one; same title across *different* content types correctly kept
  separate).
- **Normalization** — all three adapters, covering the real edge cases
  hit in production along the way: `[Removed]` News API articles,
  TMDB's backdrop-over-poster fallback chain, HTML-stripped Mastodon
  content, and the link-preview-card image fallback.
- **Feed business logic** — cold-start defaults, the wave-based merge/
  dedup/shuffle (recency ordering verified, not just "it runs"), and
  `applySavedOrder`'s reorder/append/stale-id-ignore behavior.
- **Debounce hook** — fake-timer-based, checking actual timing (doesn't
  fire early, does fire exactly at the delay, and rapid changes reset
  the timer rather than stacking) instead of just asserting it
  "eventually" returns the right value.
- **localStorage persistence** — round-trip correctness for all four
  stored values, plus corrupted-JSON and wrong-shape handling for each.

## Phase 21 — Integration Testing ✅
**21 tests across 4 files** in `tests/integration/`, testing components
rendering *together* with real data — not isolated logic:
- **`ContentSection`** — the full loading → error → empty → success
  state machine (directly matching the spec's own examples: API response
  → Feed → Cards, API error → ErrorState, no results → EmptyState), plus
  clicking a card's favorite button and verifying the correct item is
  passed up.
- **`SettingsPage`** and **`FavoritesPage`** — tested against a *real*
  Redux store (a new `renderWithStore` helper wraps components in the
  actual `Provider` + `makeStore()`, not a mock). Clicking a preference
  chip genuinely dispatches through `preferencesSlice` and the UI
  re-renders from real state; removing a favorite via its heart button
  genuinely updates `favoritesSlice` and the empty state appears when
  the list empties out.
- **`PaginationFooter`** — its three mutually exclusive states (button /
  loading spinner / reached-the-end note) and the button click.

Added an `IntersectionObserver` stub to `vitest.setup.ts` — jsdom
doesn't implement it, and `LoadMoreSentinel` (used by `PaginationFooter`)
depends on it.

---

## Upcoming phases
22. Deployment
