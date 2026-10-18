import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = (process.env.STRAPI_URL || 'http://127.0.0.1:1337').replace(/\/$/, '');
const headers = process.env.STRAPI_API_TOKEN ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } : {};
const locales = ['id', 'en'];

async function request(path, params = {}) {
  const url = new URL(`${base}/api/${path}`);
  for (const [key, value] of Object.entries({ ...params, 'pagination[pageSize]': '100' })) url.searchParams.set(key, value);
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const body = await response.json();
  return body.data;
}

const media = (item) => item ? { url: item.url.startsWith('http') ? item.url : `${base}${item.url}`, alternativeText: item.alternativeText || '', width: item.width, height: item.height } : null;
const seo = (item = {}) => ({ metaTitle: item.metaTitle || '', metaDescription: item.metaDescription || '', metaRobots: item.metaRobots || 'index,follow', canonicalURL: item.canonicalURL || undefined });
const relationIds = (items = []) => items.map((item) => item.documentId);
const normalizeSection = (section) => {
  if (section.__component === 'sections.services-grid') return { ...section, serviceIds: relationIds(section.services), services: undefined };
  if (section.__component === 'sections.featured-projects') return { ...section, projectIds: relationIds(section.projects), projects: undefined };
  if (section.__component === 'sections.latest-articles') return { ...section, articleIds: relationIds(section.articles), articles: undefined };
  if (section.__component === 'sections.hero') return { ...section, image: media(section.image) };
  return section;
};

async function exportLocale(locale) {
  const common = { locale, status: 'published', populate: '*' };
  const [global, pages, services, projects, articles, tags] = await Promise.all([
    request('global', { locale, populate: '*' }), request('pages', common), request('services', common),
    request('projects', common), request('articles', common), request('tags', { locale, populate: '*' }),
  ]);
  return {
    global: { siteName: global.siteName, tagline: global.tagline, primaryNav: global.primaryNav, footerNav: global.footerNav || [], footerNote: global.footerNote, defaultSeo: seo(global.defaultSeo) },
    pages: pages.map((x) => ({ documentId: x.documentId, slug: x.slug, title: x.title, sections: (x.sections || []).map(normalizeSection), seo: seo(x.seo) })),
    services: services.map((x) => ({ documentId: x.documentId, slug: x.slug, title: x.title, summary: x.summary, body: x.body, icon: x.icon, order: x.order, seo: seo(x.seo) })).sort((a,b) => a.order-b.order),
    projects: projects.map((x) => ({ documentId: x.documentId, slug: x.slug, title: x.title, client: x.client, summary: x.summary, body: x.body, year: x.year, featured: x.featured, facts: x.facts || [], serviceIds: relationIds(x.services), cover: media(x.cover), seo: seo(x.seo) })),
    articles: articles.map((x) => ({ documentId: x.documentId, slug: x.slug, title: x.title, summary: x.summary, content: x.content, publishedAt: x.publishedAt, cover: media(x.cover), seo: seo(x.seo), author: x.author ? { documentId: x.author.documentId, slug: x.author.slug, name: x.author.name, role: x.author.role, bio: x.author.bio, avatar: media(x.author.avatar) } : undefined, tags: (x.tags || []).map((tag) => ({ documentId: tag.documentId, slug: tag.slug, name: tag.name })), aiSummaryStatus: x.aiSummaryStatus })),
    tags: tags.map((x) => ({ documentId: x.documentId, slug: x.slug, name: x.name })),
  };
}

const snapshot = { generatedAt: new Date().toISOString(), locales: Object.fromEntries(await Promise.all(locales.map(async (locale) => [locale, await exportLocale(locale)]))) };
await writeFile(resolve('src/data/content.snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Exported ${locales.join('/')} content from ${base}`);
