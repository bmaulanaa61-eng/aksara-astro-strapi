import type { Core } from '@strapi/strapi';

/**
 * Aksi yang boleh diakses Public — HANYA baca.
 * create/update/delete SENGAJA tidak diberikan (celah keamanan).
 */
const PUBLIC_READ_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::tag.tag.find',
  'api::tag.tag.findOne',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  /**
   * Seed permission Public secara idempoten.
   * Dijalankan di bootstrap supaya konfigurasi reproducible dari repo,
   * bukan hasil klik manual di admin panel.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const publicRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('[aksara] role "public" tidak ditemukan — seed permission dilewati');
        return;
      }

      let granted = 0;

      for (const action of PUBLIC_READ_ACTIONS) {
        const existing = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: publicRole.id } });

        if (existing) continue;

        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });

        granted += 1;
        strapi.log.info(`[aksara] public permission ditambahkan: ${action}`);
      }

      strapi.log.info(
        `[aksara] permission public read-only siap (${granted} baru, ${PUBLIC_READ_ACTIONS.length - granted} sudah ada)`
      );
    } catch (err) {
      // Jangan gagalkan boot hanya karena seed permission.
      strapi.log.error('[aksara] gagal seed permission public', err);
    }
  },
};
