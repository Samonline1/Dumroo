import "./load-env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getPostgresDb } from "./connection";
import path from "path";

async function runMigrate() {
  console.log("Running PostgreSQL migrations to Supabase...");
  const { db, client } = getPostgresDb(true);
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");

  await migrate(db, { migrationsFolder });
  await client.end();
  console.log("PostgreSQL migrations completed successfully.");
}

runMigrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
