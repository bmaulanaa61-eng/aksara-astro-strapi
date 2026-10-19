import { seo } from './seed-utils';

export function homePageId(
  serviceList: string[],
  projectId: string,
  articleId: string
) {
  return {
    title: 'Beranda',
    sections: [
      {
        __component: 'sections.hero',
        eyebrow: 'Studio web fiktif',
        heading: 'Website agency yang jujur soal stack dan batasan hosting',
        subheading:
          'Aksara adalah proyek portofolio: Strapi lokal, situs Astro static, konten bilingual ID/EN.',
        primaryCta: {
          label: 'Lihat layanan',
          url: '/layanan',
          style: 'primary',
          openInNewTab: false,
        },
        secondaryCta: {
          label: 'Baca wawasan',
          url: '/wawasan',
          style: 'secondary',
          openInNewTab: false,
        },
      },
      {
        __component: 'sections.services-grid',
        heading: 'Layanan',
        intro:
          'Tiga paket yang cukup untuk mendemokan model konten tanpa melebar ke page builder tanpa batas.',
        services: serviceList,
        limit: 3,
      },
      {
        __component: 'sections.featured-projects',
        heading: 'Proyek unggulan',
        intro: 'Case study fiktif yang menjelaskan keputusan teknis, bukan klaim hasil klien.',
        projects: [projectId],
        limit: 1,
      },
      {
        __component: 'sections.stats',
        heading: 'Fakta proyek',
        items: [
          { value: '2', label: 'Locale konten', context: 'Indonesia default, Inggris sekunder' },
          { value: '8', label: 'Section Page', context: 'Dynamic zone terbatas di schema' },
          {
            value: '0',
            label: 'Server CMS online',
            context: 'Strapi tetap lokal; situs dari snapshot',
          },
        ],
      },
      {
        __component: 'sections.latest-articles',
        heading: 'Wawasan terbaru',
        intro: 'Catatan editorial tentang alur konten dan build static.',
        articles: [articleId],
        limit: 1,
      },
      {
        __component: 'sections.faq',
        heading: 'Pertanyaan umum',
        items: [
          {
            question: 'Apakah Aksara perusahaan nyata?',
            answer:
              '<p>Bukan. Aksara adalah studio fiktif untuk portofolio lamaran. Label ini juga muncul di footer situs.</p>',
          },
          {
            question: 'Mengapa Strapi tidak di-deploy?',
            answer:
              '<p>Agar hosting tetap gratis tanpa kartu kredit. Website dibangun dari snapshot konten; CMS cukup berjalan di laptop atau Docker Compose.</p>',
          },
        ],
      },
      {
        __component: 'sections.cta',
        heading: 'Clone dan coba stack-nya',
        body: 'Pakai Docker Compose dari README untuk menjalankan Strapi + PostgreSQL dengan seed data.',
        primaryCta: {
          label: 'Buka repositori',
          url: 'https://github.com/bmaulanaa61-eng/aksara-astro-strapi',
          style: 'primary',
          openInNewTab: true,
        },
      },
    ],
    seo: seo(
      'Aksara — beranda',
      'Beranda studio web fiktif Aksara: layanan, proyek demo, dan wawasan bilingual.'
    ),
  };
}
