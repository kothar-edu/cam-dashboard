# Remaining Dashboard Placeholder Routes

These routes are registered in `src/App.tsx` and render `PlaceholderPage`. They are
**out of scope** for the dashboard revamp epic (SP1–SP6). List pages and tenant-scoped
admin actions are shipped; detail/create/edit flows are future work.

## Cricket entities

| Route pattern | Intended feature | Backend API status |
|---------------|------------------|-------------------|
| `/dashboard/teams/new` | Create team form | `POST /api/game/teams/` exists |
| `/dashboard/teams/:id` | Team detail/edit | `GET/PATCH /api/game/teams/{id}/` exists |
| `/dashboard/tournaments/new` | Create tournament | `POST /api/game/tournament/` exists |
| `/dashboard/tournaments/:id` | Tournament detail/groups | `GET/PATCH` + group endpoints exist |
| `/dashboard/players/new` | Create player | `POST /api/game/player/` exists |
| `/dashboard/players/:id` | Player profile edit | `GET/PATCH /api/game/player/{id}/` exists |
| `/dashboard/players/:id/stats` | Player statistics view | Stats endpoints exist |
| `/dashboard/fixtures/new` | Create fixture | `POST /api/game/match/` exists |
| `/dashboard/fixtures/new/bulk` | CSV bulk upload | Legacy bulk UI removed; needs rebuild |
| `/dashboard/fixtures/:id` | Fixture edit | `GET/PATCH /api/game/match/{id}/` exists |
| `/dashboard/scorecards/:id` | Live scorecard editor | Scoring APIs exist (complex UI) |

## Content

| Route pattern | Intended feature | Backend API status |
|---------------|------------------|-------------------|
| `/dashboard/posts/new` | Create post | `POST newsfeed/api/v1/post/` exists |
| `/dashboard/posts/:id` | Edit post | `GET/PATCH` exists |
| `/dashboard/sponsors/new` | Create sponsor | `POST /api/game/sponsor/` exists |
| `/dashboard/sponsors/:id` | Edit sponsor | `GET/PATCH` exists |

## Voting

| Route pattern | Intended feature | Notes |
|---------------|------------------|-------|
| `/dashboard/voting` | Poll list | Was 100% mock in legacy app |
| `/dashboard/voting/new` | Create poll | No typed API client yet |
| `/dashboard/voting/:id` | Edit poll | No typed API client yet |

## Also deferred (no placeholder route)

- **Settings → Create admin tab**: `UserRegisterAdminSerializer` requires full player
  profile fields; not suitable for a minimal admin-creation form without backend changes.

## Priority recommendation for a follow-up epic

1. Team/tournament/player detail forms (highest admin traffic)
2. Fixture create/edit + bulk upload
3. Post/sponsor editors
4. Scorecard editor (may share patterns with livescore-admin)
5. Voting polls (needs API discovery + new typed client)
