import type { StrapiApp } from '@strapi/strapi/admin';
import type { ContentManagerPlugin } from '@strapi/content-manager/strapi-admin';
import { AiAssistantPanel } from './components/AiAssistantPanel';

export default {
  config: { locales: ['id', 'en'] },
  bootstrap(app: StrapiApp) {
    const contentManager = app.getPlugin('content-manager').apis as unknown as ContentManagerPlugin;
    contentManager.addEditViewSidePanel([AiAssistantPanel]);
  },
};
