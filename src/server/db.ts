export type DbStatus = "not-configured" | "not-implemented" | "ready";

function hasPgEnv() {
  return Boolean(
    process.env.PGHOST &&
      process.env.PGDATABASE &&
      process.env.PGUSER &&
      process.env.PGPASSWORD
  );
}

export const dbStatus: DbStatus = hasPgEnv() ? "not-implemented" : "not-configured";

/**
 * Вызовем перед любыми реальными запросами к БД.
 * Сейчас просто кидает понятную ошибку.
 */
export function ensureDbConfigured(): never {
  if (!hasPgEnv()) {
    throw new Error("LIVE_BACKEND_NOT_CONFIGURED");
  }
  throw new Error("LIVE_BACKEND_NOT_IMPLEMENTED");
}

/**
 * Заглушка будущего db-клиента.
 * Позже сюда приедет Neon/Postgres.
 */
export const db = {
  async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
    void _sql;
    void _params;
    ensureDbConfigured();
  },
};
