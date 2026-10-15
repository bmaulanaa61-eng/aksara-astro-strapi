# Aksara

Headless CMS + marketing website for **Aksara**, a fictional digital agency, built to production standards as a portfolio project.

- **Strapi v5** manages agency content (pages, services, case studies, articles) and ships an **AI Assistant** inside the admin panel that drafts summaries, SEO metadata, tag suggestions and image alt text — always reviewed and editable by the editor.
- **Astro** renders the public website as a static site.

> Aksara is a fictional company. Names, clients and case studies on the demo site are illustrative.

## Status

Work in progress. Milestones:

| | Milestone | State |
|---|---|---|
| M0 | Foundation: repo, Docker Compose, CI | in progress |
| M1 | Agency content model + seed data | planned |
| M2 | AI Assistant in the Strapi admin | planned |
| M3 | Astro website | planned |
| M4 | Deploy (Cloudflare Pages) + CD | planned |
| M5 | Polish: Lighthouse, Playwright, demo video | planned |

## Repository layout

```
.
├── Backend_csm/        Strapi v5 (TypeScript) — CMS + AI Assistant
├── Frontend_astro/     Astro — public website (M3)
├── docker-compose.yml  PostgreSQL + Strapi for local review
└── .github/            CI workflow, PR template
```

## Run it locally

### Option A — Docker (recommended for reviewers)

Requires Docker Desktop.

```bash
cp Backend_csm/.env.example Backend_csm/.env   # fill in the secrets (see comments in the file)
docker compose up --build
```

Open http://localhost:1337/admin and create the first admin user.

### Option B — Node + your own PostgreSQL

Requires Node 24.19 and PostgreSQL 14+.

```bash
cd Backend_csm
cp .env.example .env    # point DATABASE_* at your PostgreSQL
npm ci
npm run develop         # http://localhost:1337/admin
```

## Key decisions

- **PostgreSQL only.** No SQLite fallback; missing database env fails at boot.
- **Public API is read-only.** The Public role gets `find`/`findOne` only, seeded from code in `src/index.ts`, and CI asserts that writes return `403`.
- **AI is editor-triggered.** No lifecycle hooks or cron: the editor presses a button in the admin, can review and edit the result, and AI never overwrites without confirmation. Any OpenAI-compatible endpoint works via `AI_*` env vars.
- **Static website.** The site is built from a content snapshot so it stays fast and free to host without a running backend.

## Contributing workflow

Branch from `main`, open a pull request, keep CI green, use [Conventional Commits](https://www.conventionalcommits.org/) for titles. Never commit `.env`.
