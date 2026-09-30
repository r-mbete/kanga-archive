# Kanga Archive

An interactive archive of kanga designs, their Swahili sayings (_jina_) and what they mean. See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for the v1 scope.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · ESLint + Prettier · Vitest · GitHub Actions. PostgreSQL on Neon with Drizzle ORM.

## Setup

Requires Node 24.21.0 (pinned in `.nvmrc`, so local and CI use the same npm). With nvm: `nvm use`.

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, needed from M1
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                 | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the dev server                                         |
| `npm run build`        | Production build                                             |
| `npm run lint`         | ESLint                                                       |
| `npm run format`       | Format with Prettier                                         |
| `npm run format:check` | Check formatting                                             |
| `npm run typecheck`    | Generate Next route types, then `tsc --noEmit`               |
| `npm test`             | Run Vitest once                                              |
| `npm run db:generate`  | Write a migration after changing `src/db/schema.ts`          |
| `npm run db:migrate`   | Apply migrations to the database in `DATABASE_URL`           |
| `npm run db:seed`      | Sync the database with `src/db/seed-data.ts` (safe to rerun) |
| `npm run db:studio`    | Browse the database in Drizzle Studio                        |

CI runs lint, format check, typecheck, tests and build on every PR and on pushes to `main`.

## Structure

```
drizzle/        generated SQL migrations (never edit by hand)
src/
  app/          routes: /, /archive, /kanga/[slug]
  components/   shared UI (kanga card, pagination, site header)
  db/           Drizzle schema, client, seed data and the seed script
  lib/kangas/   queries and archive helpers
public/kangas/  kanga photographs, referenced from seed-data.ts
```

The database tests run the real migrations against an in-memory Postgres (PGlite), so `npm test` needs no database. `npm run build` does: it prerenders the home and detail pages from the database in `DATABASE_URL`. CI starts a throwaway Postgres, then migrates and seeds it before building.

To add a photograph, put it in `public/kangas/` and give the entry a `photo` in `src/db/seed-data.ts` with its alt text, credit and licence. Kangas without one show a placeholder.
