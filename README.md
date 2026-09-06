# Personalized Content Dashboard

A unified, personalized content feed (news + movie recommendations + social
content) built with Next.js, TypeScript, Redux Toolkit, and RTK Query.

This project is being built incrementally, phase by phase. See
`docs/PHASES.md` (added as phases progress) for what's implemented so far.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Redux Toolkit + RTK Query
- Framer Motion (animations)
- dnd-kit (drag-and-drop)
- lucide-react (icons)
- News API + TMDB API + mock social data
- Vitest + React Testing Library (unit/integration tests) — added Phase 20-21
- Playwright (E2E tests) — added Phase 22

## Status
**Phase 1 of 29 complete** — project initialization and tooling.

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # then fill in your API keys
npm run dev
```

Open http://localhost:3000.

## Environment Variables
See `.env.local.example`. Required for later phases:
- `NEWS_API_KEY` — https://newsapi.org/
- `TMDB_API_KEY` — https://www.themoviedb.org/settings/api

## Project Structure
```
app/            Next.js routes (App Router)
components/
  layout/       Sidebar, Header, MobileNav        (Phase 2)
  ui/           Reusable design-system components  (Phase 3)
  content/      NewsCard, MovieCard, SocialCard     (Phase 9)
store/
  slices/       preferences, favorites, feed, ui    (Phase 4+)
services/       API adapters (news, tmdb, social)    (Phase 6)
types/          Shared types incl. ContentItem       (Phase 7)
lib/            Utilities (normalization, debounce)  (Phase 6-8)
tests/
  unit/         Vitest unit tests                    (Phase 20)
  integration/  Integration tests                    (Phase 21)
  e2e/          Playwright E2E tests                 (Phase 22)
```
