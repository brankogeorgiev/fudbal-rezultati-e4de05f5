## Goal

Add a landing page (season grid) at `/`. Selecting a season enters the existing app scoped to that season's date range. Admins can create/edit/delete seasons.

## Data model

New table `public.seasons`:
- `id` uuid pk
- `name` text (e.g. "2025/26")
- `start_date` date
- `end_date` date
- `created_at`, `updated_at`

Constraints: `end_date >= start_date`. RLS: everyone can read; only admins can write (mirrors matches/players policies).

Auto-seed one season covering existing matches: **"Season 1", 2026-01-15 → 2026-07-09** (min/max of imported match_date). Existing matches keep their `match_date`; filtering by date range assigns them automatically. No `season_id` column on matches — a match belongs to the season whose date range contains `match_date`.

## Routing

```
/                              Landing (season grid)
/s/:seasonId                   Results (current Index)
/s/:seasonId/match/:id         MatchDetails
/s/:seasonId/players           Players
/s/:seasonId/player/:id        PlayerDetails
/s/:seasonId/statistics        Statistics
/s/:seasonId/exports           Exports (admin)
/admin/users                   unchanged
/admin/seasons                 new — CRUD for seasons (admin)
```

`BottomNav` and internal navigations rebuild links using the current `seasonId` from `useParams`. Header adds a "Change season" button that returns to `/`.

## Season scoping

New hook `useSeason()` reads `seasonId` from the URL, fetches the season row, exposes `{ id, name, startDate, endDate }`.

Data hooks accept an optional season (or read it via `useSeason`) and filter server-side by `match_date >= start AND match_date <= end`:

- `useMatches` — filter matches by season date range.
- `useMatchGoals` / `useMatchPlayers` — no change (scoped by matchId).
- `usePlayers` (Players page) — return only players who appear in `match_players` for matches in the season's range. Global `usePlayersAll` remains for the AddResult dialog dropdown so admins can still pick any player.
- `Statistics` — all queries filter by the season's match date range.
- `Exports` — the Excel generation query filters to the season's range; filename includes season name. The cleanup job (delete >3 months old) is unchanged.

## Landing page

Grid of season cards ordered by `start_date DESC`:
- Season name, formatted date range, match count (from a lightweight aggregate query), and a small "Current" badge if `today` is within range.
- Admin sees a "Manage seasons" and "+ New season" action.

## Admin seasons page

Simple table + dialog form (name + two date pickers using shadcn Calendar per project convention). Create / edit / delete. Deleting a season does not touch matches — matches remain and simply fall out of scope. Warn admins if they set a range overlapping another season.

## Files

New:
- `supabase/migrations/...` create `seasons` table, RLS, GRANTs, `updated_at` trigger; INSERT seed row.
- `src/hooks/useSeasons.ts` — list/create/update/delete.
- `src/hooks/useSeason.ts` — current season from URL.
- `src/pages/Landing.tsx` — season grid.
- `src/pages/AdminSeasons.tsx` — CRUD.
- `src/components/SeasonCard.tsx`, `SeasonDialog.tsx`.

Edited:
- `src/App.tsx` — new route tree.
- `src/components/BottomNav.tsx`, `src/components/Header.tsx` — season-aware links + "change season".
- `src/hooks/useMatches.ts`, `usePlayers.ts` — accept date-range filter.
- `src/pages/Index.tsx`, `MatchDetails.tsx`, `Players.tsx`, `PlayerDetails.tsx`, `Statistics.tsx`, `Exports.tsx` — read `seasonId`, pass into queries, update internal `Link`/`navigate` calls.
- `src/i18n/translations.ts` — add season strings (mk/en).

Migration ships first for approval, then code follows.
