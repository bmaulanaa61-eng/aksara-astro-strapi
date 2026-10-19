import type { Core } from '@strapi/strapi';

export type LocaleCode = 'id' | 'en';
export type SeedUid =
  | 'api::author.author'
  | 'api::tag.tag'
  | 'api::service.service'
  | 'api::project.project'
  | 'api::article.article'
  | 'api::page.page';

/**
 * Reusable seeding crosses several generated content-type signatures.
 * Keep the escape hatch local; callers still accept only the explicit SeedUid union.
 */
function documents(strapi: Core.Strapi, uid: SeedUid): any {
  return strapi.documents(uid);
}

export const seo = (metaTitle: string, metaDescription: string) => ({
  metaTitle,
  metaDescription,
  metaRobots: 'index,follow' as const,
});

export async function findBySlug(
  strapi: Core.Strapi,
  uid: SeedUid,
  slug: string,
  locale: LocaleCode
) {
  const rows = await documents(strapi, uid).findMany({
    locale,
    filters: { slug: { $eq: slug } },
    limit: 1,
  });
  return rows[0] ?? null;
}

/** Create id locale then en localization; skip when already present. */
export async function upsertLocalized(
  strapi: Core.Strapi,
  uid: SeedUid,
  slug: string,
  idData: Record<string, unknown>,
  enData: Record<string, unknown>,
  publish: boolean
) {
  const existingId = await findBySlug(strapi, uid, slug, 'id');
  const existingEnBySlug = await findBySlug(strapi, uid, slug, 'en');
  let documentId = existingId?.documentId as string | undefined;

  if (!documentId) {
    const created = await documents(strapi, uid).create({
      data: { ...idData, slug },
      locale: 'id',
      ...(publish ? { status: 'published' as const } : {}),
    });
    documentId = created.documentId;
    strapi.log.info(`[aksara] seed create ${uid} slug=${slug} locale=id`);
  }

  let existingEn = await documents(strapi, uid).findOne({
    documentId: documentId!,
    locale: 'en',
  });

  if (!existingEn) {
    if (existingEnBySlug && existingEnBySlug.documentId !== documentId) {
      // Migrate data created by the pre-link M1 seed. Remove the old draft /
      // published rows for that standalone document, then recreate EN under ID.
      await strapi.db.query(uid).deleteMany({
        where: { documentId: existingEnBySlug.documentId, locale: 'en' },
      });
      existingEn = await documents(strapi, uid).update({
        documentId,
        data: { ...enData, slug },
        locale: 'en',
        ...(publish ? { status: 'published' as const } : {}),
      });
      strapi.log.info(`[aksara] seed link ${uid} slug=${slug} locale=en`);
    } else {
      // update() creates the missing locale version under the existing documentId.
      existingEn = await documents(strapi, uid).update({
        documentId,
        data: { ...enData, slug },
        locale: 'en',
        ...(publish ? { status: 'published' as const } : {}),
      });
      strapi.log.info(`[aksara] seed create ${uid} slug=${slug} locale=en`);
    }
  }

  if (publish && existingEn && !existingEn.publishedAt) {
    await documents(strapi, uid).publish({ documentId: documentId!, locale: 'en' });
  }

  if (publish && existingId && !existingId.publishedAt) {
    await documents(strapi, uid).publish({ documentId: documentId!, locale: 'id' });
  }

  return documentId!;
}
