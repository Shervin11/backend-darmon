import { Logger } from '@nestjs/common';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from './schema';

export { schema };

/** Works the same over node-postgres (production) and PGlite (dev/tests). */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const DB = Symbol('DB');

const MIGRATIONS = path.join(__dirname, '..', '..', 'drizzle');

/**
 * DATABASE_URL set   → PostgreSQL server (production).
 * otherwise          → embedded PGlite stored in PGLITE_DIR (default ./data/pglite), or in memory when `memory` is true.
 * Pending migrations are applied on start.
 */
// Drivers are loaded lazily (require keeps it CommonJS-compatible for Jest) so only the one in use is loaded
/* eslint-disable @typescript-eslint/no-require-imports */
export async function createDatabase({ memory = false } = {}): Promise<{
  db: Database;
  close: () => Promise<void>;
}> {
  const logger = new Logger('Database');
  const url = memory ? undefined : process.env.DATABASE_URL;

  if (url) {
    const { Pool } = require('pg') as typeof import('pg');
    const { drizzle } =
      require('drizzle-orm/node-postgres') as typeof import('drizzle-orm/node-postgres');
    const { migrate } =
      require('drizzle-orm/node-postgres/migrator') as typeof import('drizzle-orm/node-postgres/migrator');
    const pool = new Pool({ connectionString: url });
    const db = drizzle({ client: pool, schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    logger.log('Connected to PostgreSQL');
    return { db: db as unknown as Database, close: () => pool.end() };
  }

  const { PGlite } =
    require('@electric-sql/pglite') as typeof import('@electric-sql/pglite');
  const { drizzle } =
    require('drizzle-orm/pglite') as typeof import('drizzle-orm/pglite');
  const { migrate } =
    require('drizzle-orm/pglite/migrator') as typeof import('drizzle-orm/pglite/migrator');
  const dir = memory
    ? undefined
    : process.env.PGLITE_DIR || path.join(process.cwd(), 'data', 'pglite');
  if (dir) fs.mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  if (!memory)
    logger.warn(
      `DATABASE_URL is not set — using embedded PGlite in ${dir} (development only)`,
    );
  return { db: db as unknown as Database, close: () => client.close() };
}
/* eslint-enable @typescript-eslint/no-require-imports */
