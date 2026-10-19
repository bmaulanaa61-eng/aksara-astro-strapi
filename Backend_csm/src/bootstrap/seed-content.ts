import type { Core } from '@strapi/strapi';
import { seedAuthor, seedServices, seedTags } from './seed-catalog';
import { seedGlobal } from './seed-global';
import { seedHomePage, seedRedirection } from './seed-home';
import { seedArticles, seedProjects } from './seed-stories';

/** Idempotent bilingual demo content for M1. */
export async function seedContent(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('[aksara] seed step: author');
  const authorId = await seedAuthor(strapi);
  strapi.log.info('[aksara] seed step: tags');
  const tagIds = await seedTags(strapi);
  strapi.log.info('[aksara] seed step: services');
  const serviceIds = await seedServices(strapi);
  strapi.log.info('[aksara] seed step: project');
  const projectId = await seedProjects(strapi, serviceIds);
  strapi.log.info('[aksara] seed step: article');
  const articleId = await seedArticles(strapi, authorId, tagIds);

  strapi.log.info('[aksara] seed step: global');
  await seedGlobal(strapi);
  strapi.log.info('[aksara] seed step: home');
  await seedHomePage(strapi, serviceIds, projectId, articleId);
  strapi.log.info('[aksara] seed step: redirection');
  await seedRedirection(strapi);

  strapi.log.info('[aksara] seed konten ID/EN selesai (idempoten)');
}
