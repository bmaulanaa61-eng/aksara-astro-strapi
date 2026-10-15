import type { Core } from '@strapi/strapi';

/**
 * PostgreSQL only. There is deliberately no SQLite fallback: a missing or
 * misspelled env var must fail loudly at boot instead of silently starting
 * Strapi against an empty local file.
 */
const REQUIRED_WITHOUT_URL = [
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USERNAME',
  'DATABASE_PASSWORD',
] as const;

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client !== 'postgres') {
    throw new Error(`Unsupported DATABASE_CLIENT "${client}". Aksara runs on PostgreSQL only.`);
  }

  const connectionString = env('DATABASE_URL') || undefined;

  if (!connectionString) {
    const missing = REQUIRED_WITHOUT_URL.filter((key) => !env(key));
    if (missing.length > 0) {
      throw new Error(
        `Missing database env: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`
      );
    }
  }

  const postgres: Core.Config.Database['connection'] = {
    client: 'postgres',
    connection: {
      connectionString,
      // Presence is validated above; defaults only satisfy the type when DATABASE_URL is used.
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', ''),
      user: env('DATABASE_USERNAME', ''),
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
