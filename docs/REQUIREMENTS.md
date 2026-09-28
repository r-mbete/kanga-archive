# Kanga Archive: v1 Requirements

Status: Draft 2 · Owner: Ruby Mbete · Last updated: 2026-09-28

## 1. Overview

A kanga is a rectangular printed cotton cloth worn across the East African coast. Every kanga has three parts: the *pindo* (border), the *mji* (centre), and the *jina*, a Swahili saying printed along the cloth. The saying is the kanga's voice. It carries advice, affection or a pointed message to whoever sees it, so the pattern and the message are one object.

Kanga Archive is an interactive archive of these designs, their sayings and what they mean. It is first a portfolio piece. It should show care in visual design, interaction and engineering in a small, finished product.

## 2. Goals and non-goals

**Goals**

- A browsing experience that feels as considered as the cloth itself.
- Fast search across sayings in both Swahili and English.
- Accessible to everyone, and fast on a slow mobile connection.
- Code, structure and tests that hold up when a reviewer reads the repo.

**Non-goals for v1**

- User accounts or sign-in.
- Uploads or public submissions.
- An admin UI. Content comes from a committed seed script.
- Payments or a shop.
- Languages other than Swahili and English.

## 3. Users

| Persona | Need | Time on site |
| --- | --- | --- |
| **Recruiter / hiring manager** (primary) | See quickly that the product is polished and the code is solid. | 2–5 minutes |
| **Curious visitor** | Browse beautiful kangas and learn what the sayings mean. | 5–15 minutes |

## 4. User stories

1. As a visitor, I can browse a grid of kangas so I get a sense of the collection at a glance.
2. As a visitor, I can filter by colour, motif and theme so I can narrow the collection to what interests me.
3. As a visitor, I can search in Swahili or English so I can find a saying I half remember.
4. As a visitor, I can open a kanga to see its saying, translation and meaning in full.
5. As a visitor, I can share a link to a kanga or to a filtered view, and it opens exactly what I saw.
6. As a visitor, I can jump to a random kanga so I can wander.
7. As a recruiter, I can reach the About page and the source code from any page.

## 5. Functional requirements (v1)

### Archive grid (stories 1, 2)

- A responsive grid of kanga cards. Each card shows the image and the *jina* in Swahili.
- Paginated, with 24 per page. Page numbers stay in the URL (`?page=2`).
- The default order, used whenever there is no search query, is the *jina* in alphabetical order (`saying_sw`, then `slug` to break ties). This is the "archive order" used elsewhere in this document.
- Only published kangas appear.
- Empty and no-results states have their own copy.

### Search (story 3)

- One search box that matches the Swahili saying, the English translation and the meaning.
- Backed by Postgres full-text search. Swahili is indexed with the `simple` configuration, since Postgres has no Swahili stemmer, and English with `english`.
- Results are ranked by relevance, with matches weighted by field: the saying (A), the translation (B), then the meaning (C). A match in the saying outranks one in the meaning. The query is kept in the URL (`?q=haba`).
- Results update as the visitor types, debounced by about 250 ms.

### Filters (story 2)

- **Colour:** a fixed palette of about ten named colour families (for example red, indigo, yellow, green, black, white), shown as swatches. Each kanga is mapped to one or more families in the seed data. Its exact hex values are kept separately for drawing the image and accenting the detail page, and are not used for filtering.
- **Motif:** for example floral, geometric, fruit, bird, object.
- **Theme:** for example love, advice, marriage, patience, community, a warning.
- **Era** (decade) and **region** (for example Mombasa, Zanzibar, Dar es Salaam).
- Filters combine with search. All filter state lives in the query string.
- A clear-all control.

### Kanga detail page (stories 4, 5)

- Route: `/kanga/[slug]`, for example `/kanga/haba-na-haba-hujaza-kibaba`.
- Shows:
  - a large image, with its credit and licence,
  - the *jina* in Swahili (`lang="sw"`),
  - the English translation,
  - the meaning and when the saying is used,
  - the era, region and tags,
  - up to four related kangas that share tags.
- Each detail page has its own `<title>`, meta description and Open Graph image.
- Previous and next links follow the archive order (alphabetical by *jina*), whatever filters the visitor came from. The detail URL carries no filter state, so a shared link always opens the same page.
- An unpublished or unknown slug returns a 404.

### Random kanga (story 6)

- `/random` redirects to a random published kanga.

### About (story 7)

- `/about`: what a kanga is, the project's intent, credits, and links to the repo and the portfolio.

## 6. Data model

```
kanga
  id               uuid, primary key
  slug             text, unique
  saying_sw        text, not null    -- the jina
  translation_en   text, not null
  meaning          text              -- what it says between the lines
  context          text              -- when and to whom it is worn or given
  era              text              -- e.g. "1970s"
  region           text
  image_url        text, not null
  image_alt        text, not null
  image_credit     text, not null    -- e.g. "Generated", "Photo: Ruby Mbete", "British Museum"
  image_licence    text, not null    -- e.g. "CC BY-NC-SA 4.0", "All rights reserved, used with permission"
  image_source_url text              -- object page or permission record; null for generated images
  dominant_colours text[]            -- exact hex values, for drawing and accents
  colour_families  text[], not null  -- filter values from the fixed palette, e.g. {'red','indigo'}
  published        boolean, not null, default true
  search           tsvector, generated:
                     setweight(to_tsvector('simple', saying_sw), 'A')
                     || setweight(to_tsvector('english', translation_en), 'B')
                     || setweight(to_tsvector('english', coalesce(meaning, '')), 'C')
  created_at       timestamptz, not null, default now()
  updated_at       timestamptz, not null, default now()   -- set by the seed script on change

tag
  id     uuid, primary key
  kind   text, not null   -- 'motif' | 'theme'
  name   text, not null
  slug   text, unique
  unique (kind, name)

kanga_tag
  kanga_id  uuid, foreign key → kanga
  tag_id    uuid, foreign key → tag
  primary key (kanga_id, tag_id)
```

Indexes:

- GIN on `kanga.search`.
- GIN on `kanga.colour_families`.
- B-tree on `kanga_tag.tag_id`.
- B-tree on `(kanga.saying_sw, kanga.slug)` for the archive order.
- `era` and `region` are not indexed. With 20–30 rows a sequential scan is faster than an index lookup. Add indexes if the collection grows past a few thousand.

## 7. Seed data

- 20–30 entries, each with a real methali and an accurate translation and meaning. Each translation is checked against at least one published source, which is noted in the seed file.
- Images are generated SVG kanga layouts (*pindo*, *mji* and *jina* band) built from each entry's colours, or clearly labelled placeholders.
- **No unlicensed photographs.** Real photos come later, once licensing is sorted out.
- Every image records its credit and licence, and the detail page shows them under the image.
- The seed script is committed and idempotent: `npm run db:seed`.

## 8. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | Lighthouse ≥ 95 on every category, mobile. LCP < 2.5 s on 4G. |
| Rendering | Detail pages, `/`, `/about` and the unfiltered first page of `/archive` are statically generated with ISR. Any `/archive` request with a query, filter or page number renders on the server per request, since query strings cannot be prerendered. |
| Images | Served through `next/image`, with explicit sizes and no layout shift. |
| Accessibility | WCAG 2.2 AA. Everything works by keyboard, with visible focus. Swahili text has `lang="sw"`. Every image has alt text. |
| Motion | All motion is decorative and turns off under `prefers-reduced-motion`. |
| Responsive | Designed mobile first, from 320 px to wide desktop. |
| SEO | Sitemap, robots.txt, canonical URLs, and Open Graph for each kanga. |

## 9. Design direction

- Visually related to the portfolio at [rubymbete-portfolio.vercel.app](https://rubymbete-portfolio.vercel.app/):
  - Newsreader for display text,
  - IBM Plex Mono for labels,
  - Inter for body text,
  - the same editorial grid.
- The base palette is Espresso `#2F1B1A`, Wine `#640017`, Olive `#5A5E27` and Cream `#EFEFC9`. Cream is the only text colour; wine and olive are surfaces and decoration, since neither reaches 3:1 against espresso. Each kanga's own colours bring accents to its detail page.
- The *jina* is the typographic hero on every page, with the cloth second.
- Detail pages echo the kanga's structure: a border frame (*pindo*), a centre (*mji*), and the saying set as a band.

## 10. Tech stack and architecture

- **Framework:** Next.js (App Router), TypeScript.
- **Styling:** Tailwind CSS.
- **Database:** PostgreSQL on Neon.
- **ORM and migrations:** Drizzle ORM with drizzle-kit.
- **Hosting:** Vercel. Every push to `main` deploys, and every PR gets a preview.

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page: a featured kanga and an entry into the archive |
| `/archive` | Grid with search, filters and pagination |
| `/kanga/[slug]` | Detail page |
| `/random` | Redirects to a random kanga |
| `/about` | About the project |

### Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |

## 11. Quality

- ESLint and Prettier. TypeScript `strict` mode.
- **Vitest:** unit tests for query-string parsing, filter building and slug generation.
- **Playwright:** smoke tests for browsing, searching, filtering, opening a detail page and the random redirect.
- **GitHub Actions:** lint, typecheck, unit tests and build on every PR.
- README with setup steps, scripts and architecture notes.

## 12. Milestones

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | Scaffold | Next.js app deployed to Vercel, with CI green. |
| M1 | Data | Schema migrated on Neon and the seed script loads 20+ kangas. |
| M2 | Browse | Archive grid and detail pages render from the database. |
| M3 | Find | Search, filters and `/random` work, with URL state. |
| M4 | Polish | OG images, accessibility pass, Lighthouse ≥ 95, and the project linked from the portfolio's Work section. |

## 13. Future ideas (post-v1)

- An admin CMS for adding and editing kangas.
- Public submissions with moderation.
- Automatic colour-palette extraction from uploaded photos.
- A "kanga of the day".
- Recorded audio pronunciation of each *jina*.
- Real photographs, licensed or taken by the author.

## 14. Open questions

- Where will real photographs come from, and under what licence? Current plan, in order of preference: the author's own photographs of kangas they or their family own, crediting the maker where known; sellers or collectors who give written permission; museum open-access collections, checking the licence per object; Wikimedia Commons as a fallback, checking the licence per file.
- Which references should be used to check translations and meanings?
- Should the project have a custom domain, or stay on `*.vercel.app`?

## 15. Revision history

| Draft | Date | Changes |
| --- | --- | --- |
| 1 | 2026-09-25 | First version. |
| 2 | 2026-09-28 | New palette (espresso, wine, olive, cream). Image credit and licence columns. Defined archive order, used by pagination and previous/next links. `published` and `updated_at` columns. Search weights by field. Colour filter uses a fixed palette of colour families. `unique (kind, name)` on tags. Rendering split between static and per-request pages. Note on why `era` and `region` are not indexed. |
