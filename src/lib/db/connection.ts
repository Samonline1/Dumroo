import "./load-env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let pgDbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let clientInstance: postgres.Sql | null = null;

function sanitizePostgresUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    // Pooler parameter
    url.searchParams.delete("pgbouncer");
    return url.toString();
  } catch {
    return rawUrl.replace(/[?&]pgbouncer=true(&|$)/, "").replace(/\?$/, "");
  }
}

export function getPostgresDb(isMigration = false) {
  if (pgDbInstance && clientInstance && !isMigration) {
    return { db: pgDbInstance, client: clientInstance };
  }

  const rawUrl = isMigration
    ? process.env.DIRECT_URL || process.env.DATABASE_URL
    : process.env.DATABASE_URL || process.env.DIRECT_URL;

  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL is not defined in .env.local for PostgreSQL provider."
    );
  }

  const cleanUrl = sanitizePostgresUrl(rawUrl);

  const client = postgres(cleanUrl, {
    max: isMigration ? 1 : 10,
    prepare: false, // Pooler compatibility
    ssl: cleanUrl.includes("localhost") ? false : "require",
  });

  const db = drizzle(client, { schema });

  if (!isMigration) {
    clientInstance = client;
    pgDbInstance = db;
  }

  return { db, client };
}

export function getDb() {
  return getPostgresDb().db;
}
