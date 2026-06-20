![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## RS School React course project

Next.js App Router Pokedex browser (branch **`nextjs-ssr`**).

**PokeAPI** — paginated search, server-rendered results, details panel, selected items CSV download, i18n (`en` / `ru`), theme toggle.

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_QUERY_CACHE_TTL_MS` | TanStack Query cache TTL (ms) | `300000` |
| `NEXT_PUBLIC_BASE_PATH` | Base path for subpath deploy (e.g. GitHub Pages) | empty |

Set `NEXT_STATIC_EXPORT=1` for static export build only (no server actions / SSR at runtime).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run test` | Unit tests |
| `npm run lint` | ESLint |
