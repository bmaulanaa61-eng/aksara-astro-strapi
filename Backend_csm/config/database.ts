import type { Core } from '@strapi/strapi';

/**
 * PostgreSQL only — there is deliberately no SQLite fallback.
 *
 * Do not throw on missing env here: `strapi build` also loads this file, and at
 * image build time the database env is intentionally absent (it is injected at
 * run time). A missing value still fails loudly at boot as a connection error.
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client !== 'postgres') {
    throw new Error(`Unsupported DATABASE_CLIENT "${client}". Aksara runs on PostgreSQL only.`);
  }

  const postgres: Core.Config.Database['connection'] = {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL') || undefined,
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'aksara_cms'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false) && {
        key: env('DATABASE_SSL_KEY', undefined),
        cert: env('DATABASE_SSL_CERT', undefined),
        ca: env('DATABASE_SSL_CA', undefined),
        capath: env('DATABASE_SSL_CAPATH', undefined),
        cipher: env('DATABASE_SSL_CIPHER', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
      schema: env('DATABASE_SCHEMA', 'public'),
    },
    pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
  };

  return {
    connection: {
      ...postgres,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

export default config;
