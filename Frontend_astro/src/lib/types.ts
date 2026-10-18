export type Locale = 'id' | 'en';
export type Seo = { metaTitle: string; metaDescription: string; metaRobots?: string; canonicalURL?: string };
export type Link = { label: string; url: string; openInNewTab?: boolean };
export type Button = Link & { style?: 'primary' | 'secondary' };
export type Media = { url: string; alternativeText?: string; width?: number; height?: number } | null;

export type Service = { documentId: string; slug: string; title: string; summary: string; body: string; icon: string; order: number; seo: Seo };
export type Project = { documentId: string; slug: string; title: string; client: string; summary: string; body: string; year: number; featured: boolean; facts: { label: string; value: string }[]; serviceIds: string[]; cover: Media; seo: Seo };
export type Tag = { documentId: string; slug: string; name: string };
export type Author = { documentId: string; slug: string; name: string; role?: string; bio?: string; avatar: Media };
export type Article = { documentId: string; slug: string; title: string; summary?: string; content: string; publishedAt: string; cover: Media; seo: Seo; author?: Author; tags: Tag[]; aiSummaryStatus: 'pending' | 'generated' | 'failed' | 'manual' };

export type HeroSection = { __component: 'sections.hero'; eyebrow?: string; heading: string; subheading?: string; primaryCta?: Button; secondaryCta?: Button; image?: Media };
export type ServicesSection = { __component: 'sections.services-grid'; heading: string; intro?: string; serviceIds: string[]; limit: number };
export type ProjectsSection = { __component: 'sections.featured-projects'; heading: string; intro?: string; projectIds: string[]; limit: number };
export type ArticlesSection = { __component: 'sections.latest-articles'; heading: string; intro?: string; articleIds: string[]; limit: number };
export type RichTextSection = { __component: 'sections.rich-text'; heading?: string; body: string };
export type StatsSection = { __component: 'sections.stats'; heading?: string; items: { value: string; label: string; context?: string }[] };
export type CtaSection = { __component: 'sections.cta'; heading: string; body?: string; primaryCta: Button; secondaryCta?: Button };
export type FaqSection = { __component: 'sections.faq'; heading: string; intro?: string; items: { question: string; answer: string }[] };
export type PageSection = HeroSection | ServicesSection | ProjectsSection | ArticlesSection | RichTextSection | StatsSection | CtaSection | FaqSection;
export type Page = { documentId: string; slug: string; title: string; sections: PageSection[]; seo: Seo };
export type Global = { siteName: string; tagline: string; primaryNav: Link[]; footerNav: Link[]; footerNote: string; defaultSeo: Seo };
export type LocaleContent = { global: Global; pages: Page[]; services: Service[]; projects: Project[]; articles: Article[]; tags: Tag[] };
export type ContentSnapshot = { generatedAt: string; locales: Record<Locale, LocaleContent> };
