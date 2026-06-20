![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## RS School React course project

Next.js App Router Pokedex browser (branch **`nextjs-ssr`**).

**Live demo:** https://cheerful-eclair-bec58d.netlify.app/en?page=1

**PokeAPI** — paginated search, server-rendered results, details panel, selected items CSV download, i18n (`en` / `ru`), theme toggle.

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_QUERY_CACHE_TTL_MS` | TanStack Query cache TTL (ms) | `300000` |
| `NEXT_PUBLIC_BASE_PATH` | Base path for subpath deploy (e.g. GitHub Pages) | empty |

### Deployment

This app needs a **Next.js server runtime** — it is not a static SPA.

| Requirement | Implementation |
|-------------|----------------|
| SSR home results | `src/app/[locale]/page.tsx` fetches on each request |
| Server action search | `submitPokemonSearch` in `src/app/[locale]/actions.ts` |
| CSV download API | `POST /api/selected-pokemon.csv` route handler |
| Locale routing | `src/middleware.ts` (next-intl) |

**GitHub Pages is not suitable** for the full RS School Next.js task. Pages hosts static files only; a static export build fails:

```text
Server Actions are not supported with static export.
```

**Production deploy:** [Netlify](https://cheerful-eclair-bec58d.netlify.app/en?page=1) (`netlify.toml`, branch `nextjs-ssr`).

**Self-host or other Next.js runtime** (e.g. [Vercel](https://vercel.com)):

```bash
npm ci
npm run build
npm run start
```

Set `NEXT_PUBLIC_BASE_PATH` only when the app is served from a subpath (not needed on Vercel project root).

`NEXT_STATIC_EXPORT=1` may be used locally to verify export limits; it breaks server actions, API routes, and runtime SSR.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run test` | Unit tests |
| `npm run lint` | ESLint |
