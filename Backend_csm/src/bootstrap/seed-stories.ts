import type { Core } from '@strapi/strapi';
import { seo, upsertLocalized } from './seed-utils';

export async function seedProjects(
  strapi: Core.Strapi,
  serviceIds: Record<string, string>
) {
  const related = [
    serviceIds['pengembangan-astro-strapi'],
    serviceIds['konten-bilingual'],
  ].filter(Boolean);

  return upsertLocalized(
    strapi,
    'api::project.project',
    'studio-aksara-demo',
    {
      title: 'Situs demo studio Aksara',
      client: 'Aksara (portfolio project)',
      summary:
        'Company profile fiktif yang memakai Strapi lokal, snapshot konten, dan situs Astro static.',
      body: '<p>Proyek ini menunjukkan content model bilingual, permission Public read-only, dan alur CI yang membangun website dari snapshot — bukan dari CMS yang harus online.</p>',
      year: 2026,
      featured: true,
      facts: [
        { label: 'Stack', value: 'Astro + Strapi 5 + PostgreSQL' },
        { label: 'Locale', value: 'id (default), en' },
        { label: 'Hosting situs', value: 'Cloudflare Pages (rencana M4)' },
      ],
      services: related,
      seo: seo(
        'Situs demo studio Aksara',
        'Case study portofolio: company profile fiktif dengan Strapi lokal dan Astro static.'
      ),
    },
    {
      title: 'Aksara studio demo site',
      client: 'Aksara (portfolio project)',
      summary:
        'A fictional company profile using local Strapi, a content snapshot, and a static Astro site.',
      body: '<p>This project demonstrates a bilingual content model, read-only Public permissions, and a CI flow that builds the website from a snapshot — not from an always-on CMS.</p>',
      year: 2026,
      featured: true,
      facts: [
        { label: 'Stack', value: 'Astro + Strapi 5 + PostgreSQL' },
        { label: 'Locales', value: 'id (default), en' },
        { label: 'Site hosting', value: 'Cloudflare Pages (planned in M4)' },
      ],
      services: related,
      seo: seo(
        'Aksara studio demo site',
        'Portfolio case study: fictional company profile with local Strapi and static Astro.'
      ),
    },
    true
  );
}

export async function seedArticles(
  strapi: Core.Strapi,
  authorId: string,
  tagIds: Record<string, string>
) {
  const tags = [tagIds.astro, tagIds.strapi, tagIds.seo].filter(Boolean);

  return upsertLocalized(
    strapi,
    'api::article.article',
    'mengapa-snapshot-konten',
    {
      title: 'Mengapa website Astro memakai snapshot konten Strapi',
      summary:
        'CI tidak bisa mengakses Strapi di laptop. Snapshot JSON membuat build tetap otomatis tanpa server CMS online.',
      content:
        '<p>Untuk portofolio Aksara, Strapi tetap lokal. Website dibangun dari file JSON hasil export supaya GitHub Actions tidak bergantung pada mesin pengembang yang menyala.</p><p>Saat pengembangan lokal, Astro masih boleh membaca Strapi langsung. Yang penting: kontrak data antara CMS dan halaman tetap sama.</p>',
      author: authorId,
      tags,
      aiSummaryStatus: 'manual',
      aiSeoStatus: 'manual',
      aiTagsStatus: 'manual',
      aiAltTextStatus: 'pending',
      aiTranslationStatus: 'pending',
      seo: seo(
        'Snapshot konten Strapi untuk Astro',
        'Alasan memakai snapshot JSON agar CI bisa build website tanpa Strapi online.'
      ),
    },
    {
      title: 'Why the Astro site uses a Strapi content snapshot',
      summary:
        'CI cannot reach Strapi on a laptop. A JSON snapshot keeps builds automated without an online CMS.',
      content:
        '<p>For the Aksara portfolio, Strapi stays local. The website builds from exported JSON so GitHub Actions does not depend on a developer machine being online.</p><p>During local development, Astro may still read Strapi directly. The important part is that the data contract between CMS and pages stays the same.</p>',
      author: authorId,
      tags,
      aiSummaryStatus: 'manual',
      aiSeoStatus: 'manual',
      aiTagsStatus: 'manual',
      aiAltTextStatus: 'pending',
      aiTranslationStatus: 'pending',
      seo: seo(
        'Strapi content snapshots for Astro',
        'Why a JSON snapshot lets CI build the site without an online Strapi instance.'
      ),
    },
    true
  );
}
