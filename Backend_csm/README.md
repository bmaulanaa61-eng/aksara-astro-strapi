# Backend_csm — Strapi v5

CMS for the Aksara website. See the [root README](../README.md) for the project overview.

## Scripts

| Command | What it does |
|---|---|
| `npm run develop` | Dev server with auto-reload, admin at http://localhost:1337/admin |
| `npm run build` | Build the admin panel |
| `npm run start` | Production server (requires `build` first) |
| `npx tsc --noEmit` | Typecheck |

## Configuration

All configuration comes from environment variables; `.env.example` is the contract. PostgreSQL is the only supported database.

## Content API

The Public role is read-only (`find` / `findOne`). Permissions are seeded idempotently on every boot from `src/index.ts`, so they are reproducible from the repo rather than clicked together in the admin.
