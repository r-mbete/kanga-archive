import { existsSync } from "node:fs";

// Next loads .env.local itself; scripts and drizzle-kit need it loaded here.
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

/** The Neon connection string; `direct` prefers the unpooled one that migrations and transactions need. */
export function databaseUrl({ direct = false } = {}): string {
  const url =
    (direct && process.env.DATABASE_URL_UNPOOLED) || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return url;
}
