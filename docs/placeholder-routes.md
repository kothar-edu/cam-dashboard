# Dashboard Routes — Complete

All routes previously listed here now render real typed pages (no `PlaceholderPage`).

## Implemented

| Route | Page |
|-------|------|
| `/dashboard/teams/new` | `TeamFormPage` |
| `/dashboard/teams/:id` | `TeamDetailPage` (GET/PATCH `/api/game/teams/{id}/`) |
| `/dashboard/tournaments/new`, `/:id` | `TournamentFormPage` |
| `/dashboard/players/new`, `/:id` | `PlayerFormPage` |
| `/dashboard/players/:id/stats` | `PlayerStatsPage` |
| `/dashboard/fixtures/new` | `FixtureFormPage` |
| `/dashboard/fixtures/new/bulk` | `BulkFixtureFormPage` |
| `/dashboard/fixtures/:id` | `FixtureFormPage` |
| `/dashboard/scorecards/:id` | `ScorecardDetailPage` (live batting/bowling editor) |
| `/dashboard/posts/new`, `/:id` | `PostFormPage` |
| `/dashboard/sponsors/new`, `/:id` | `SponsorFormPage` |
| `/dashboard/voting` | `VotingListPage` |
| `/dashboard/voting/new`, `/:id` | `VotingFormPage` |
| Settings → Create admin | `SettingsPage` tab (optional document uploads) |
| Tenants admin assignment | Email lookup via `GET /api/user/lookup/` |

## Notes

- **Voting**: Dashboard admin manages `nominee-voting-player` nominations and shows vote standings from the `voting` newsfeed API. End-user ballot casting stays in the mobile app — intentionally different from the legacy mock poll UI.

Plan: `docs/superpowers/plans/2026-07-16-dashboard-deferred-routes.md`
