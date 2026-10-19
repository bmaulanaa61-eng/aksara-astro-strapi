# Backend_csm — Strapi v5

CMS for the Aksara website. See the [root README](../README.md) for the project overview.

## Scripts

| Command | What it does |
|---|---|
| `npm run develop` | Dev server with auto-reload, admin at http://localhost:1337/admin |
| `npm run build` | Build the admin panel |
| `npm run lint` | Lint the TypeScript codebase |
| `npm test` | Run the AI helper unit tests |
| `npm run start` | Production server (requires `build` first) |
| `npx tsc --noEmit` | Typecheck |

## Configuration

All configuration comes from environment variables; `.env.example` is the contract. PostgreSQL is the only supported database.

## Content model and APIs

The bilingual model uses Indonesian (`id`) as the default locale and English (`en`) as its paired localization. It includes `Global`, `Page`, `Service`, `Project`, `Article`, `Author`, `Tag`, and `Redirection`; the homepage is the `Page` whose slug is `home`.

Realistic ID/EN demo content is seeded idempotently on boot. The Public role is read-only (`find` / `findOne`), with permissions seeded from code rather than clicked together in the admin. REST is available under `/api/*`; the optional GraphQL interface is available at `/graphql`.

## AI Assistant

The Article edit view includes five manual actions: summary, SEO metadata, existing-tag suggestions, cover alt text using vision input, and an `id` ↔ `en` translation draft. Results are always editor-reviewed: populated fields require confirmation before replacement, translations remain drafts, and no action publishes content.

Configure any OpenAI-compatible provider with `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`. Optional `AI_FALLBACK_MODEL`, `AI_VISION_MODEL`, `AI_TIMEOUT_MS`, and `AI_MAX_CHARS` values are documented in `.env.example`. With required values empty, the panel stays visible and reports that AI is not configured.

Example Gemini-compatible configuration:

```env
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_API_KEY=<your-gemini-api-key>
AI_MODEL=gemini-2.5-flash
AI_FALLBACK_MODEL=gemini-2.5-flash-lite
AI_VISION_MODEL=gemini-2.5-flash
```
