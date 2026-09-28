import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseUrl } from "./env";
import * as schema from "./schema";
import { seedKangas } from "./seed-data";
import { seed } from "./seed-lib";

async function main() {
  const pool = new Pool({ connectionString: databaseUrl({ direct: true }) });
  try {
    const summary = await seed(drizzle(pool, { schema }), seedKangas);
    for (const warning of summary.warnings) console.warn(`warning: ${warning}`);
    console.log(
      `Seeded ${seedKangas.length} kangas: ${summary.inserted} inserted, ${summary.updated} updated, ` +
        `${summary.unchanged} unchanged, ${summary.deleted} deleted.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
