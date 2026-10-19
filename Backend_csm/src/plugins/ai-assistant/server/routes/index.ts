export const routes = {
  admin: {
    type: 'admin',
    routes: [
      { method: 'GET', path: '/config', handler: 'ai.config', config: { policies: [] } },
      { method: 'POST', path: '/summary', handler: 'ai.summary', config: { policies: [] } },
      { method: 'POST', path: '/seo', handler: 'ai.seo', config: { policies: [] } },
      { method: 'POST', path: '/tags', handler: 'ai.tags', config: { policies: [] } },
      { method: 'POST', path: '/alt-text', handler: 'ai.altText', config: { policies: [] } },
      { method: 'POST', path: '/translation', handler: 'ai.translation', config: { policies: [] } },
    ],
  },
};
