# Aksara public website

Static bilingual Astro frontend for the fictional Aksara studio. Content comes from `src/data/content.snapshot.json`, so production builds do not require a running CMS.

## Commands

```bash
npm ci
npm run dev
npm run check
npm run build
```

## Typography

`Newsreader` (headings) and `DM Sans` (body) are self-hosted from `public/fonts` as latin-subset variable woff2 files, so builds make no third-party font requests. Both families are licensed under the SIL Open Font License 1.1; see <https://github.com/googlefonts/dm-sans> and <https://github.com/productiontype/Newsreader>.

## Refresh content from Strapi

Start Strapi with the seeded content, copy `.env.example` to `.env`, then run:

```bash
npm run content:export
```

The command loads `.env` through Node's `--env-file-if-exists` flag. `STRAPI_URL` and the optional `STRAPI_API_TOKEN` are read only by the Node export script and are never exposed as `PUBLIC_*` variables. Review and commit the changed snapshot so CI and Cloudflare Pages build deterministically.
