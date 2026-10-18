import snapshot from '../data/content.snapshot.json';
import type { ContentSnapshot, Locale, LocaleContent } from './types';

const content = snapshot as unknown as ContentSnapshot;

export function getContent(locale: Locale): LocaleContent {
  return content.locales[locale];
}

export function getGeneratedAt(): string {
  return content.generatedAt;
}

export function getHome(locale: Locale) {
  const home = getContent(locale).pages.find((page) => page.slug === 'home');
  if (!home) throw new Error(`Missing home page for locale ${locale}`);
  return home;
}
