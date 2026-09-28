# Kanga Archive

An interactive archive of kanga designs, their Swahili sayings (_jina_) and what they mean. See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for the v1 scope.

## Stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · ESLint + Prettier · Vitest · GitHub Actions. PostgreSQL on Neon with Drizzle arrives in M1.

## Setup

Requires Node 24.21.0 (pinned in `.nvmrc`, so local and CI use the same npm). With nvm: `nvm use`.

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, needed from M1
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                 | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the dev server                           |
| `npm run build`        | Production build                               |
| `npm run lint`         | ESLint                                         |
| `npm run format`       | Format with Prettier                           |
| `npm run format:check` | Check formatting                               |
| `npm run typecheck`    | Generate Next route types, then `tsc --noEmit` |
| `npm test`             | Run Vitest once                                |

CI runs lint, format check, typecheck, tests and build on every PR and on pushes to `main`.

## Structure

```
src/
  app/    routes, layout, global styles and theme tokens
  lib/    framework-free logic, unit-tested alongside (*.test.ts)
```
