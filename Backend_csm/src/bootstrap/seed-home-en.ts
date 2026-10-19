import { seo } from './seed-utils';

export function homePageEn(
  serviceList: string[],
  projectId: string,
  articleId: string
) {
  return {
    title: 'Home',
    sections: [
      {
        __component: 'sections.hero',
        eyebrow: 'Fictional web studio',
        heading: 'An agency site that is honest about stack and hosting limits',
        subheading:
          'Aksara is a portfolio project: local Strapi, a static Astro site, and bilingual ID/EN content.',
        primaryCta: {
          label: 'View services',
          url: '/en/services',
          style: 'primary',
          openInNewTab: false,
        },
        secondaryCta: {
          label: 'Read insights',
          url: '/en/insights',
          style: 'secondary',
          openInNewTab: false,
        },
      },
      {
        __component: 'sections.services-grid',
        heading: 'Services',
        intro:
          'Three offerings that demonstrate the content model without becoming an unbounded page builder.',
        services: serviceList,
        limit: 3,
      },
      {
        __component: 'sections.featured-projects',
        heading: 'Featured work',
        intro: 'A fictional case study that explains technical choices, not client outcome claims.',
        projects: [projectId],
        limit: 1,
      },
      {
        __component: 'sections.stats',
        heading: 'Project facts',
        items: [
          {
            value: '2',
            label: 'Content locales',
            context: 'Indonesian default, English secondary',
          },
          { value: '8', label: 'Page sections', context: 'Bounded dynamic zone in the schema' },
          {
            value: '0',
            label: 'Online CMS servers',
            context: 'Strapi stays local; the site uses a snapshot',
          },
        ],
      },
      {
        __component: 'sections.latest-articles',
        heading: 'Latest insights',
        intro: 'Editorial notes on content workflow and static builds.',
        articles: [articleId],
        limit: 1,
      },
      {
        __component: 'sections.faq',
        heading: 'FAQ',
        items: [
          {
            question: 'Is Aksara a real company?',
            answer:
              '<p>No. Aksara is a fictional studio for a job-application portfolio. The same label appears in the site footer.</p>',
          },
          {
            question: 'Why is Strapi not deployed?',
            answer:
              '<p>To keep hosting free without a credit card. The website builds from a content snapshot; the CMS only needs to run on a laptop or via Docker Compose.</p>',
          },
        ],
      },
      {
        __component: 'sections.cta',
        heading: 'Clone and try the stack',
        body: 'Use Docker Compose from the README to run Strapi + PostgreSQL with seed data.',
        primaryCta: {
          label: 'Open repository',
          url: 'https://github.com/bmaulanaa61-eng/aksara-astro-strapi',
          style: 'primary',
          openInNewTab: true,
        },
      },
    ],
    seo: seo(
      'Aksara — home',
      'Home of the fictional Aksara web studio: services, demo work, and bilingual insights.'
    ),
  };
}
