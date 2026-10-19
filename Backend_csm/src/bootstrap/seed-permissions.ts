import type { Core } from '@strapi/strapi';

/**
 * Public role may only find/findOne on public content types.
 * Redirection is readable (path maps for the static site) but never writable.
 */
const PUBLIC_READ_ACTIONS = [
  'api::global.global.find',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::service.service.find',
  'api::service.service.findOne',
  'api::project.project.find',
  'api::project.project.findOne',
  'api::article.article.find',
  'api::article.article.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::tag.tag.find',
  'api::tag.tag.findOne',
  'api::redirection.redirection.find',
  'api::redirection.redirection.findOne',
];

export async function seedPublicPermissions(strapi: Core.Strapi): Promise<void> {
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

    await strapi.db.query('plugin::users-permissions.permission').create({
      data: { action, role: publicRole.id },
    });

    granted += 1;
    strapi.log.info(`[aksara] public permission ditambahkan: ${action}`);
  }

  strapi.log.info(
    `[aksara] permission public read-only siap (${granted} baru, ${PUBLIC_READ_ACTIONS.length - granted} sudah ada)`
  );
}
