import type { Locale } from './types';

export const copy = {
  id: { services: 'Layanan', work: 'Proyek', insights: 'Wawasan', readMore: 'Baca selengkapnya', allServices: 'Semua layanan', allWork: 'Semua proyek', allInsights: 'Semua wawasan', summary: 'Ringkasan', aiReviewed: 'Dibuat dengan AI, ditinjau editor', minutes: 'menit baca', contents: 'Daftar isi', related: 'Wawasan terkait', by: 'Oleh', published: 'Terbit', back: 'Kembali ke beranda', notFound: 'Halaman tidak ditemukan', notFoundBody: 'Alamat ini tidak tersedia atau sudah berpindah.', language: 'English', localeName: 'Bahasa Indonesia' },
  en: { services: 'Services', work: 'Work', insights: 'Insights', readMore: 'Read more', allServices: 'All services', allWork: 'All work', allInsights: 'All insights', summary: 'Summary', aiReviewed: 'Created with AI, reviewed by an editor', minutes: 'min read', contents: 'On this page', related: 'Related insights', by: 'By', published: 'Published', back: 'Back to home', notFound: 'Page not found', notFoundBody: 'This address is unavailable or has moved.', language: 'Indonesia', localeName: 'English' },
} as const;

export const routes = {
  id: { home: '/', services: '/layanan', work: '/proyek', insights: '/wawasan' },
  en: { home: '/en/', services: '/en/services', work: '/en/work', insights: '/en/insights' },
} as const;

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}
