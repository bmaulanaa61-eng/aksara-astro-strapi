import type { Locale } from './ai-engine';

export const targetLocale = (locale: Locale): Locale => (locale === 'id' ? 'en' : 'id');

export function hasTranslationContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  const seo = entry.seo as Record<string, unknown> | undefined;
  return [entry.title, entry.summary, entry.content, seo?.metaTitle, seo?.metaDescription]
    .some((field) => typeof field === 'string' && field.trim().length > 0);
}

export function needsOverwrite(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') {
    return Object.values(value).some(needsOverwrite);
  }
  return false;
}
