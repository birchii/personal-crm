// Builds the Postgres connection string from .env.
// DATABASE_URL wins if set; otherwise it is assembled from the same
// POSTGRES_* variables that docker-compose.yml uses.
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
      "Database is not configured: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB in .env",
    );
  }
  const host = process.env.POSTGRES_HOST ?? "127.0.0.1";
  const port = process.env.POSTGRES_PORT ?? "5432";
  const user = encodeURIComponent(POSTGRES_USER);
  const password = encodeURIComponent(POSTGRES_PASSWORD);
  return `postgres://${user}:${password}@${host}:${port}/${POSTGRES_DB}`;
}
