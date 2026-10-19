import type { Core } from '@strapi/strapi';

const LOCALES = [
  { code: 'id', name: 'Indonesian (id)' },
  { code: 'en', name: 'English (en)' },
] as const;

/**
 * Ensure id + en exist and id is the default locale.
 * Idempotent: safe to run on every boot.
 */
export async function ensureLocales(strapi: Core.Strapi): Promise<void> {
  const localeService = strapi.plugin('i18n').service('locales');

  for (const locale of LOCALES) {
    const existing = await localeService.findByCode(locale.code);
    if (!existing) {
      await localeService.create(locale);
      strapi.log.info(`[aksara] locale ditambahkan: ${locale.code}`);
    }
  }

  const currentDefault = await localeService.getDefaultLocale();
  if (currentDefault !== 'id') {
    await localeService.setDefaultLocale({ code: 'id' });
    strapi.log.info(`[aksara] default locale diganti ${currentDefault ?? '(kosong)'} → id`);
  }
}
