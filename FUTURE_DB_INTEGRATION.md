# Future DB Integration Plan (Current Architecture)

This document maps future backend/database integration points based on the current PMS Next.js project structure.

## Current State

- UI pages are in `components/pages/*`
- Dashboard blocks are in `components/dashboard/*`
- App routing is in `app/(main)/*`
- Current dummy data source is `data/mockData.ts` (now accessed via `services/appData.service.ts`)
- Local user lifecycle is handled by:
  - `store/userStore.ts` (zustand persistence)
  - `services/inviteStore.ts` (invite/signup simulation bridge)
  - `services/auth.service.ts`

## Services to Replace With Real APIs

The following service paths are the best integration points:

- `services/appData.service.ts`
  - Replace placeholder branches with real API calls using `API_URL`.
  - Suggested endpoints:
    - `GET /users`
    - `GET /projects`
    - `GET /platforms`
    - `GET /performance`
    - `GET /roles`
    - `GET /notifications`
    - `GET /dashboard/charts`
    - `GET /projects/charts`
    - `GET /platforms/charts`

- `services/api/*` (already present)
  - `users.api.ts`, `projects.api.ts`, `platforms.api.ts`
  - Can become canonical typed API clients and be called from `appData.service.ts`.

- `services/inviteStore.ts`
  - Move invite token generation/validation and signup persistence from localStorage to backend tables.

- `store/userStore.ts`
  - Keep UI state, but replace persistent identity source from localStorage with server responses.

## Auth Integration (Based on Current Flow)

Current flow already supports:

- login + role-based behavior
- proxy user switching pattern
- invite/signup token links

To add secure auth:

1. Replace demo credential checks in `store/userStore.ts` and `services/auth.service.ts` with backend auth endpoints.
2. Keep `jwt.service.ts` token helpers and align payload with backend-issued JWT claims.
3. Add refresh-token rotation endpoint and store short-lived access token.
4. Keep role gating logic intact (`PermissionGate`, `usePermissions`) and source permission matrix from backend roles endpoint.

## Data Model Suggestions Aligned to Existing UI

Based on existing `types/index.ts` and page usage, backend tables/entities should minimally cover:

- users
- roles + permissions
- projects
- platforms
- performance_entries
- notifications
- invites
- registered_users (or users with invite/onboarding status)

No UI schema change is required if response payloads match current type shapes.

## Scaling Path for This Project

1. Keep `services/appData.service.ts` as the environment switchboard.
2. Move chart aggregates server-side for large data volumes.
3. Introduce pagination/filter query params for projects/users/platforms list pages.
4. Migrate localStorage-driven flows (`inviteStore`, `userStore`) to server persistence gradually:
   - read-through fallback
   - write to API
   - deprecate local keys after migration window
5. Add request caching and stale-while-revalidate where lists/charts are heavy.

This path keeps current UI and component structure stable while incrementally moving to production backend architecture.
