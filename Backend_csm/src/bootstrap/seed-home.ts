import type { Core } from '@strapi/strapi';
import { homePageEn } from './seed-home-en';
import { homePageId } from './seed-home-id';
import { upsertLocalized } from './seed-utils';

export async function seedHomePage(
  strapi: Core.Strapi,
  serviceIds: Record<string, string>,
  projectId: string,
  articleId: string
) {
  const serviceList = Object.values(serviceIds);

  await upsertLocalized(
    strapi,
    'api::page.page',
    'home',
    homePageId(serviceList, projectId, articleId),
    homePageEn(serviceList, projectId, articleId),
    true
  );

  const homes = await strapi.documents('api::page.page').findMany({
    locale: 'id',
    filters: { slug: { $eq: 'home' } },
  });
  if (homes.length > 1) {
    strapi.log.warn(
      `[aksara] ditemukan ${homes.length} entri Page slug=home (id) — periksa admin`
    );
  }
}

export async function seedRedirection(strapi: Core.Strapi) {
  const rows = await strapi.documents('api::redirection.redirection').findMany({
    locale: 'id',
    filters: { fromPath: { $eq: '/blog' } },
    limit: 1,
  });

  if (rows[0]) return;

  const created = await strapi.documents('api::redirection.redirection').create({
    data: {
      fromPath: '/blog',
      toPath: '/wawasan',
      statusCode: 301,
      isActive: true,
    },
    locale: 'id',
  });

  await strapi.documents('api::redirection.redirection').update({
    documentId: created.documentId,
    data: {
      fromPath: '/blog',
      toPath: '/en/insights',
      statusCode: 301,
      isActive: true,
    },
    locale: 'en',
  });

  strapi.log.info('[aksara] seed create api::redirection.redirection /blog');
}
