# Dashboard Routes — Complete

All routes previously listed here now render real typed pages (no `PlaceholderPage`).

## Implemented

| Route | Page |
|-------|------|
| `/dashboard/teams/new` | `TeamFormPage` |
| `/dashboard/teams/:id` | `TeamDetailPage` (read-only; backend has no team retrieve) |
| `/dashboard/tournaments/new`, `/:id` | `TournamentFormPage` |
| `/dashboard/players/new`, `/:id` | `PlayerFormPage` |
| `/dashboard/players/:id/stats` | `PlayerStatsPage` |
| `/dashboard/fixtures/new` | `FixtureFormPage` |
| `/dashboard/fixtures/new/bulk` | `BulkFixtureFormPage` |
| `/dashboard/fixtures/:id` | `FixtureFormPage` |
| `/dashboard/scorecards/:id` | `ScorecardDetailPage` |
| `/dashboard/posts/new`, `/:id` | `PostFormPage` |
| `/dashboard/sponsors/new`, `/:id` | `SponsorFormPage` |
| `/dashboard/voting` | `VotingListPage` |
| `/dashboard/voting/new`, `/:id` | `VotingFormPage` |
| Settings → Create admin | `SettingsPage` tab |
| Tenants admin assignment | Email lookup via `GET /api/user/lookup/` |

## Known gaps

- **Team edit**: `TeamViewSet` exposes list + create only (superuser create). Detail page is read-only from list data.
- **Scorecard editor**: Shows fixture lineups from API; live lineup mutation UI (batting/bowling update endpoints) not ported — legacy scorecard editor was mocked.
- **Create admin documents**: Image uploads (ID card, payslip) omitted in dashboard form; optional on `UserRegisterAdminSerializer`.
- **Voting**: Uses real `nominee-voting-player` + `voting` newsfeed APIs (tournament player nominations), not the legacy mock poll model.

Plan: `docs/superpowers/plans/2026-07-16-dashboard-deferred-routes.md`
