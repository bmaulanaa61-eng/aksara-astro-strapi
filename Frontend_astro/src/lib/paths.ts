import { getContent } from './strapi';
import { routes } from './i18n';
import type { Locale } from './types';

type Kind = 'page' | 'service' | 'project' | 'article' | 'tag';

export function entryPath(locale: Locale, kind: Kind, slug: string): string {
  const base = routes[locale];
  if (kind === 'page') return locale === 'id' ? `/${slug}` : `/en/${slug}`;
  if (kind === 'service') return `${base.services}/${slug}`;
  if (kind === 'project') return `${base.work}/${slug}`;
  if (kind === 'article') return `${base.insights}/${slug}`;
  return `${base.insights}/tag/${slug}`;
}

export function alternateEntryPath(locale: Locale, kind: Kind, documentId: string, fallback: string): string {
  const target: Locale = locale === 'id' ? 'en' : 'id';
  const content = getContent(target);
  const collection = kind === 'page' ? content.pages : kind === 'service' ? content.services : kind === 'project' ? content.projects : kind === 'article' ? content.articles : content.tags;
  const paired = collection.find((entry) => entry.documentId === documentId);
  return paired ? entryPath(target, kind, paired.slug) : fallback;
}
