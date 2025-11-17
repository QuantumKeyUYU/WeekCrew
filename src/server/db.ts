// src/server/db.ts
import { Pool } from "pg";

export type DbStatus = "not-configured" | "ready";

function hasPgEnv() {
  return Boolean(
    process.env.PGHOST &&
      process.env.PGDATABASE &&
      process.env.PGUSER &&
      process.env.PGPASSWORD
  );
}

const isConfigured = hasPgEnv();

// один общий пул соединений (чтобы не плодить коннекты при hot-reload)
let pool: Pool | null = null;

if (isConfigured) {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

  const config = {
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: Number(PGPORT || 5432),
    ssl: { rejectUnauthorized: false },
  };

  const g = global as any;

  if (!g.__weekcrewPool) {
    g.__weekcrewPool = new Pool(config);
  }

  pool = g.__weekcrewPool as Pool;
}

export const dbStatus: DbStatus = isConfigured ? "ready" : "not-configured";

export function ensureDbConfigured(): asserts pool is Pool {
  if (!isConfigured || !pool) {
    throw new Error("LIVE_BACKEND_NOT_CONFIGURED");
  }
}

export const db = {
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    ensureDbConfigured();
    const client = await pool!.connect();
    try {
      const res = await client.query(sql, params as any[]);
      return res.rows as T[];
    } finally {
      client.release();
    }
  },
};
