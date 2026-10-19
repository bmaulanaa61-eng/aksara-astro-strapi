import type { Core } from '@strapi/strapi';
import { ensureLocales } from './bootstrap/ensure-locales';
import { seedContent } from './bootstrap/seed-content';
import { seedPublicPermissions } from './bootstrap/seed-permissions';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Locale id/en, Public read-only permissions, and idempotent demo seed.
   * Failures are logged but must not prevent boot (CI smoke still needs /_health).
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await ensureLocales(strapi);
      await seedPublicPermissions(strapi);
      await seedContent(strapi);
    } catch (err) {
      strapi.log.error('[aksara] bootstrap seed gagal', err);
    }
  },
};
