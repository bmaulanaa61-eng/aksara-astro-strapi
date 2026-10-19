import type { Core } from '@strapi/strapi';
import { seo, upsertLocalized } from './seed-utils';

export async function seedAuthor(strapi: Core.Strapi) {
  return upsertLocalized(
    strapi,
    'api::author.author',
    'aksara-editorial',
    {
      name: 'Aksara Editorial',
      role: 'Tim editorial',
      bio: 'Menulis catatan praktik seputar website agency, CMS headless, dan alur konten bilingual.',
    },
    {
      name: 'Aksara Editorial',
      role: 'Editorial team',
      bio: 'Writes practical notes on agency websites, headless CMS, and bilingual content workflows.',
    },
    false
  );
}

export async function seedTags(strapi: Core.Strapi) {
  const tags = [
    { slug: 'astro', id: { name: 'Astro' }, en: { name: 'Astro' } },
    { slug: 'strapi', id: { name: 'Strapi' }, en: { name: 'Strapi' } },
    { slug: 'seo', id: { name: 'SEO' }, en: { name: 'SEO' } },
  ];

  const ids: Record<string, string> = {};
  for (const tag of tags) {
    ids[tag.slug] = await upsertLocalized(
      strapi,
      'api::tag.tag',
      tag.slug,
      tag.id,
      tag.en,
      false
    );
  }
  return ids;
}

export async function seedServices(strapi: Core.Strapi) {
  const services = [
    {
      slug: 'desain-web',
      order: 1,
      icon: 'design',
      id: {
        title: 'Desain web',
        summary: 'Tata visual yang jelas untuk company profile dan landing page agency.',
        body: '<p>Fokus pada hierarki tipografi, kontras yang nyaman dibaca, dan komponen yang bisa dipakai ulang di beberapa halaman.</p>',
        seo: seo(
          'Desain web — Aksara',
          'Layanan desain web untuk situs agency dengan fokus keterbacaan dan konsistensi visual.'
        ),
      },
      en: {
        title: 'Web design',
        summary: 'Clear visual systems for agency company profiles and landing pages.',
        body: '<p>Focus on typographic hierarchy, comfortable contrast, and components reused across pages.</p>',
        seo: seo('Web design — Aksara', 'Web design for agency sites with readable type and consistent visuals.'),
      },
    },
    {
      slug: 'pengembangan-astro-strapi',
      order: 2,
      icon: 'engineering',
      id: {
        title: 'Pengembangan Astro + Strapi',
        summary: 'Website static dari snapshot konten CMS, dengan model data yang bisa di-query dengan jelas.',
        body: '<p>Stack Astro untuk situs publik dan Strapi untuk editorial. Konten diekspor ke snapshot agar CI bisa membangun tanpa server CMS online.</p>',
        seo: seo(
          'Pengembangan Astro + Strapi — Aksara',
          'Integrasi Astro dan Strapi untuk website static yang diisi dari CMS lokal.'
        ),
      },
      en: {
        title: 'Astro + Strapi development',
        summary: 'Static websites fed by a CMS content snapshot, with a query-friendly data model.',
        body: '<p>Astro for the public site and Strapi for editorial work. Content is exported to a snapshot so CI can build without an online CMS.</p>',
        seo: seo(
          'Astro + Strapi development — Aksara',
          'Astro and Strapi integration for static sites powered by a local CMS.'
        ),
      },
    },
    {
      slug: 'konten-bilingual',
      order: 3,
      icon: 'content',
      id: {
        title: 'Konten bilingual ID/EN',
        summary: 'Struktur locale, slug lokal, dan SEO multibahasa sejak model konten.',
        body: '<p>Locale default Indonesia, pasangan Inggris terhubung sebagai localization. Canonical dan hreflang disiapkan di lapisan website.</p>',
        seo: seo(
          'Konten bilingual ID/EN — Aksara',
          'Pemodelan konten bilingual Indonesia dan Inggris untuk situs agency.'
        ),
      },
      en: {
        title: 'Bilingual ID/EN content',
        summary: 'Locale structure, localized slugs, and multilingual SEO from the content model onward.',
        body: '<p>Indonesian is the default locale; English entries link as localizations. Canonical and hreflang are handled in the website layer.</p>',
        seo: seo(
          'Bilingual ID/EN content — Aksara',
          'Bilingual Indonesian and English content modeling for agency sites.'
        ),
      },
    },
  ];

  const ids: Record<string, string> = {};
  for (const service of services) {
    ids[service.slug] = await upsertLocalized(
      strapi,
      'api::service.service',
      service.slug,
      { ...service.id, order: service.order, icon: service.icon },
      { ...service.en, order: service.order, icon: service.icon },
      true
    );
  }
  return ids;
}
