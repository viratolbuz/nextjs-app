# Environment Setup (This Project)

This project now supports environment-based data behavior for development and production without changing UI output.

## New Environment Files

- `.env.development`
- `.env.production`

Added variables:

- `NEXT_PUBLIC_ENV`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_USE_DUMMY_DATA`

Existing variables (like `NEXT_PUBLIC_APP_URL`) are still supported and were not removed.

## Config Layer Added

- `config/env.ts`
- `src/config/env.ts` (re-export for compatibility with `src`-style imports if needed)

`config/env.ts` exports:

- `isDev`
- `isProd`
- `USE_DUMMY`
- `API_URL`

Fallback behavior:

- If env values are missing, safe defaults are used.
- `NEXT_PUBLIC_APP_URL` remains supported as a fallback for URL resolution.
- `USE_DUMMY` defaults to `true` in development to preserve current UI behavior.

## Data + Service Wiring in This Codebase

### Dummy data modularization

Added:

- `data/dummy/core.ts`
- `data/dummy/charts.ts`
- `data/dummy/platforms.ts`
- `data/index.ts`

These modules map the existing `data/mockData.ts` structures into a modular dummy-data layer without changing the underlying data content.

### Service layer for data access

Added:

- `services/appData.service.ts`

Behavior:

- If `USE_DUMMY=true`: returns current dummy data.
- If `USE_DUMMY=false`: routes through API placeholders (currently returns fallback data to avoid UI break until backend endpoints are wired).

## Where Environment/Data Are Used

### Existing env usage preserved

- `services/inviteStore.ts` uses `NEXT_PUBLIC_APP_URL` for invite/signup link origin handling.
- `store/userStore.ts` uses `NEXT_PUBLIC_APP_URL` fallback handling for signup links.

### Components moved to service-backed data imports

- `components/dashboard/KpiCards.tsx`
- `components/dashboard/ChartSection.tsx`
- `components/dashboard/InfoGrids.tsx`
- `components/pages/Users.tsx`
- `components/pages/Projects.tsx`
- `components/pages/Platforms.tsx`
- `components/pages/ProjectDetail.tsx`
- `components/pages/PerformanceEntry.tsx`
- `components/pages/ProjectReports.tsx`
- `components/pages/PlatformReports.tsx`
- `components/pages/TeamReports.tsx`
- `components/pages/Roles.tsx`
- `components/pages/Integrations.tsx`
- `components/shared/SwitchUserDropdown.tsx`

## Netlify Notes

Set these variables in Netlify Site Settings -> Environment Variables:

- `NEXT_PUBLIC_ENV=production`
- `NEXT_PUBLIC_API_URL=<your production API base URL>`
- `NEXT_PUBLIC_USE_DUMMY_DATA=false` (or `true` to keep dummy mode)
- `NEXT_PUBLIC_APP_URL=<your production frontend URL>` (already used in invite/signup link flow)

No hardcoded environment-sensitive URLs were added in components.

## Running This Project

- Development:
  - Use `.env.development`
  - `NEXT_PUBLIC_USE_DUMMY_DATA=true`
  - `npm run dev`

- Production-like locally:
  - Use `.env.production` values
  - `NEXT_PUBLIC_USE_DUMMY_DATA=false` (currently API placeholders with safe fallback)
  - `npm run build && npm run start`
