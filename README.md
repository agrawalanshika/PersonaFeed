# Personalized Content Dashboard

A unified, personalized content feed (news + movie recommendations + social
content) built with Next.js, TypeScript, Redux Toolkit, and RTK Query.

This project is being built incrementally, phase by phase. See
`docs/PHASES.md` for a full log of what's implemented so far.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Redux Toolkit + RTK Query
- Framer Motion (animations)
- dnd-kit (drag-and-drop)
- lucide-react (icons)
- News API + TMDB API + Reddit (OAuth) for social content
- Vitest + React Testing Library (unit/integration tests) — added Phase 20-21
- Playwright (E2E tests) — added Phase 22

## Status
**Phase 7 of 29 complete.** See `docs/PHASES.md` for the full breakdown.

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # then fill in your API keys — see below
npm run dev
```

Open http://localhost:3000.

## Environment Variables
See `.env.local.example` for the full list. Setup instructions:

**News API** — sign up free at https://newsapi.org/, copy your API key into
`NEWS_API_KEY`.

**TMDB API** — sign up free at https://www.themoviedb.org/, go to
Settings → API, copy your API key (v3 auth) into `TMDB_API_KEY`.

**Reddit (OAuth)** — social content uses Reddit's official API, which
requires a free "script" app rather than an API key:
1. Go to https://www.reddit.com/prefs/apps while logged into Reddit
2. Click "create app" (or "create another app") at the bottom
3. Choose the **script** type
4. Name it anything (e.g. "PersonaFeed"); for "redirect uri" enter
   `http://localhost:3000` (required by the form, unused for script apps)
5. Click "create app"
6. Under the app name you'll see a short string — that's your
   `REDDIT_CLIENT_ID`
7. The field labeled "secret" is your `REDDIT_CLIENT_SECRET`
8. Paste both into `.env.local`

## Project Structure
```
app/
  api/          Server-side Route Handlers (news, tmdb, social)  (Phase 6)
  (dashboard)/  The 5 main routes (dashboard, favorites, etc.)   (Phase 2)
components/
  layout/       Sidebar, Header, MobileNav                       (Phase 2)
  ui/           Reusable design-system components                (Phase 3)
  content/      ContentCard, NewsCard, MovieCard, SocialCard      (Phase 3)
  providers/    Redux StoreProvider                               (Phase 4)
store/
  slices/       preferences, favorites, feed, ui                 (Phase 4+)
services/       RTK Query API adapters (news, tmdb, social)       (Phase 6)
lib/            normalize.ts, storage.ts, preferences-options.ts  (Phase 5-7)
types/          Shared types incl. ContentItem                    (Phase 7)
docs/           PHASES.md — running implementation log
```
(`tests/unit`, `tests/integration`, `tests/e2e` are added in Phases 20-22.)
