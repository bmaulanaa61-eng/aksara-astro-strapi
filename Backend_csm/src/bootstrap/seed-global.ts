import type { Core } from '@strapi/strapi';
import { seo } from './seed-utils';

export async function seedGlobal(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::global.global').findFirst({ locale: 'id' });

  const idData = {
    siteName: 'Aksara',
    tagline: 'Studio web fiktif untuk portofolio Astro + Strapi',
    primaryNav: [
      { label: 'Layanan', url: '/layanan', openInNewTab: false },
      { label: 'Proyek', url: '/proyek', openInNewTab: false },
      { label: 'Wawasan', url: '/wawasan', openInNewTab: false },
    ],
    footerNav: [
      {
        label: 'Portofolio pemilik',
        url: 'https://datalabs-systems.web.app',
        openInNewTab: true,
      },
    ],
    footerNote:
      'Proyek portofolio. Aksara adalah perusahaan fiktif — bukan badan usaha nyata.',
    defaultSeo: seo(
      'Aksara — studio web fiktif',
      'Company profile bilingual dan blog Insights, dikelola dengan Strapi dan dibangun sebagai situs Astro static.'
    ),
  };

  const enData = {
    siteName: 'Aksara',
    tagline: 'A fictional web studio for an Astro + Strapi portfolio',
    primaryNav: [
      { label: 'Services', url: '/en/services', openInNewTab: false },
      { label: 'Work', url: '/en/work', openInNewTab: false },
      { label: 'Insights', url: '/en/insights', openInNewTab: false },
    ],
    footerNav: [
      {
        label: 'Owner portfolio',
        url: 'https://datalabs-systems.web.app',
        openInNewTab: true,
      },
    ],
    footerNote: 'Portfolio project. Aksara is a fictional company — not a real business.',
    defaultSeo: seo(
      'Aksara — fictional web studio',
      'A bilingual company profile and Insights blog managed in Strapi and built as a static Astro site.'
    ),
  };

  if (!existing) {
    const created = await strapi.documents('api::global.global').create({
      data: idData,
      locale: 'id',
    });
    await strapi.documents('api::global.global').update({
      documentId: created.documentId,
      data: enData,
      locale: 'en',
    });
    strapi.log.info('[aksara] seed create api::global.global');
    return;
  }

  const existingEn = await strapi.documents('api::global.global').findFirst({ locale: 'en' });
  if (!existingEn) {
    await strapi.documents('api::global.global').update({
      documentId: existing.documentId,
      data: enData,
      locale: 'en',
    });
    strapi.log.info('[aksara] seed create api::global.global locale=en');
  }
}
